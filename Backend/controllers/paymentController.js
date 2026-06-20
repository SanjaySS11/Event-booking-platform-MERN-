import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateQRCode } from "../services/qrService.js";
import { unlockMultipleSeats } from "../services/redisService.js";
import Event from "../models/Event.js";
import { queueBookingConfirmationEmail } from "../queues/emailQueue.js";
import User from "../models/User.js";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (user)
export const createOrder = async (req, res, next) => {
  const { bookingId } = req.body;

  // Find booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new ApiError(404, "Booking not found"));
  }

  // Check if booking belongs to user
  if (booking.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, "Not authorized to pay for this booking"));
  }

  // Check if booking is pending
  if (booking.paymentStatus !== "pending") {
    return next(new ApiError(400, "Booking payment already processed"));
  }

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: booking.totalAmount * 100, // Razorpay expects amount in paise
    currency: "INR",
    receipt: bookingId,
  });

  // Create payment record
  await Payment.create({
    booking: bookingId,
    user: req.user._id,
    transactionId: order.id,
    orderId: order.id,
    amount: booking.totalAmount,
    currency: "INR",
    status: "created",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId,
      },
      "Payment order created successfully"
    )
  );
};

// @desc    Verify payment webhook
// @route   POST /api/payments/webhook
// @access  Public (Razorpay webhook)
export const verifyPayment = async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    return next(new ApiError(400, "Invalid payment signature"));
  }

  // Find booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new ApiError(404, "Booking not found"));
  }

  // Update payment status
  await Payment.findOneAndUpdate(
    { orderId: razorpay_order_id },
    {
      status: "completed",
      transactionId: razorpay_payment_id,
    }
  );

  // Generate QR code
  const qrCode = await generateQRCode({
    bookingId: booking._id.toString(),
    eventId: booking.event.toString(),
    userId: booking.user.toString(),
    seats: booking.seats,
    verificationToken: booking.verificationToken,
  });

  // Update booking status
  booking.paymentStatus = "completed";
  booking.bookingStatus = "confirmed";
  booking.qrCode = qrCode;
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

  // Unlock seats from Redis
  await unlockMultipleSeats(booking.event.toString(), seatNumbers);

  // Queue confirmation email (async, doesn't block response)
  const user = await User.findById(booking.user);
  const eventDetails = await Event.findById(booking.event);

  await queueBookingConfirmationEmail({
    to: user.email,
    userName: user.name,
    eventTitle: eventDetails.title,
    eventDate: eventDetails.date,
    seats: booking.seats,
    totalAmount: booking.totalAmount,
    qrCode: booking.qrCode,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { booking },
      "Payment verified and booking confirmed successfully"
    )
  );
};

// @desc    Get payment details
// @route   GET /api/payments/:bookingId
// @access  Private (user)
export const getPaymentDetails = async (req, res, next) => {
  const payment = await Payment.findOne({
    booking: req.params.bookingId,
  }).populate("booking");

  if (!payment) {
    return next(new ApiError(404, "Payment not found"));
  }

  return res.status(200).json(
    new ApiResponse(200, payment, "Payment details fetched successfully")
  );
};