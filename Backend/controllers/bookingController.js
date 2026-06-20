import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  lockMultipleSeats,
  unlockMultipleSeats,
  isSeatLocked,
} from "../services/redisService.js";
import crypto from "crypto";

// @desc    Create a booking (lock seats)
// @route   POST /api/bookings/create
// @access  Private (user)
export const createBooking = async (req, res, next) => {
  const { eventId, seats } = req.body;

  if (!eventId || !seats || seats.length === 0) {
    return next(new ApiError(400, "Please provide eventId and seats"));
  }

  // Find event
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  // Check if event is published
  if (event.status !== "published") {
    return next(new ApiError(400, "Event is not available for booking"));
  }

  // Check if enough seats are available
  if (event.availableSeats < seats.length) {
    return next(new ApiError(400, "Not enough seats available"));
  }

  // Extract seat numbers
  const seatNumbers = seats.map((seat) => seat.seatNumber);

  // Check if any seat is already booked in DB
  const bookedSeats = event.seats.filter(
    (seat) =>
      seatNumbers.includes(seat.seatNumber) && seat.isBooked === true
  );

  if (bookedSeats.length > 0) {
    return next(
      new ApiError(
        400,
        `Seats ${bookedSeats.map((s) => s.seatNumber).join(", ")} are already booked`
      )
    );
  }

  // Check if any seat is locked in Redis
  for (const seatNumber of seatNumbers) {
    const locked = await isSeatLocked(eventId, seatNumber);
    if (locked) {
      return next(
        new ApiError(400, `Seat ${seatNumber} is temporarily locked by another user`)
      );
    }
  }

  // Lock all seats in Redis
  const allLocked = await lockMultipleSeats(
    eventId,
    seatNumbers,
    req.user._id.toString()
  );

  if (!allLocked) {
    return next(
      new ApiError(400, "Some seats are already locked, please try again")
    );
  }

  // Calculate total amount
  const totalAmount = seats.reduce((acc, seat) => acc + seat.price, 0);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Create booking with pending status
  const booking = await Booking.create({
    user: req.user._id,
    event: eventId,
    seats,
    totalAmount,
    paymentStatus: "pending",
    bookingStatus: "pending",
    verificationToken,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        booking,
        message: "Seats locked for 10 minutes. Please complete payment.",
      },
      "Booking created successfully"
    )
  );
};

// @desc    Confirm booking after payment
// @route   POST /api/bookings/confirm
// @access  Private (user)
export const confirmBooking = async (req, res, next) => {
  const { bookingId } = req.body;

  // Find booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new ApiError(404, "Booking not found"));
  }

  // Check if booking belongs to user
  if (booking.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, "Not authorized to confirm this booking"));
  }

  // Check if payment is completed
  if (booking.paymentStatus !== "completed") {
    return next(new ApiError(400, "Payment not completed yet"));
  }

  // Update booking status
  booking.bookingStatus = "confirmed";
  await booking.save();

  // Update event seats
  const event = await Event.findById(booking.event);
  const seatNumbers = booking.seats.map((seat) => seat.seatNumber);

  event.seats = event.seats.map((seat) => {
    if (seatNumbers.includes(seat.seatNumber)) {
      seat.isBooked = true;
      seat.isLocked = false;
    }
    return seat;
  });

  event.availableSeats -= booking.seats.length;
  await event.save();

  // Unlock seats from Redis (now permanently booked in DB)
  await unlockMultipleSeats(booking.event.toString(), seatNumbers);

  return res.status(200).json(
    new ApiResponse(200, booking, "Booking confirmed successfully")
  );
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (user)
export const getMyBookings = async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("event", "title date venue image")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, bookings, "Bookings fetched successfully")
  );
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (user)
export const getBookingById = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("event", "title date venue image")
    .populate("user", "name email");

  if (!booking) {
    return next(new ApiError(404, "Booking not found"));
  }

  // Check if booking belongs to user or admin
  if (
    booking.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ApiError(403, "Not authorized to view this booking"));
  }

  return res.status(200).json(
    new ApiResponse(200, booking, "Booking fetched successfully")
  );
};