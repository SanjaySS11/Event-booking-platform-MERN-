import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Event from "../models/Event.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Request a refund
// @route   POST /api/refunds/request
// @access  Private (user)
export const requestRefund = async (req, res, next) => {
  const { bookingId, reason } = req.body;

  if (!bookingId || !reason) {
    return next(new ApiError(400, "Please provide bookingId and reason"));
  }

  // Find booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new ApiError(404, "Booking not found"));
  }

  // Check if booking belongs to user
  if (booking.user.toString() !== req.user._id.toString()) {
    return next(new ApiError(403, "Not authorized to request refund for this booking"));
  }

  // Check if booking is confirmed and paid
  if (booking.paymentStatus !== "completed") {
    return next(new ApiError(400, "Cannot refund a booking that is not paid"));
  }

  // Check if already refunded
  if (booking.paymentStatus === "refunded") {
    return next(new ApiError(400, "Booking already refunded"));
  }

  // Find payment record
  const payment = await Payment.findOne({ booking: bookingId });
  if (!payment) {
    return next(new ApiError(404, "Payment record not found"));
  }

  // Update payment with refund request
  payment.refundStatus = "pending";
  await payment.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { bookingId, reason, refundStatus: "pending" },
      "Refund request submitted successfully. Awaiting admin approval."
    )
  );
};

// @desc    Get all refund requests (admin)
// @route   GET /api/refunds
// @access  Private (admin)
export const getAllRefundRequests = async (req, res, next) => {
  const refunds = await Payment.find({ refundStatus: { $ne: "none" } })
    .populate("booking")
    .populate("user", "name email")
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, refunds, "Refund requests fetched successfully")
  );
};

// @desc    Approve or reject refund (admin)
// @route   PUT /api/refunds/:paymentId
// @access  Private (admin)
export const processRefund = async (req, res, next) => {
  const { action } = req.body; // "approve" or "reject"

  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) {
    return next(new ApiError(404, "Payment not found"));
  }

  if (payment.refundStatus !== "pending") {
    return next(new ApiError(400, "No pending refund request for this payment"));
  }

  if (action === "approve") {
    payment.refundStatus = "processed";
    payment.refundAmount = payment.amount;
    payment.status = "refunded";
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.booking);
    booking.paymentStatus = "refunded";
    booking.bookingStatus = "cancelled";
    await booking.save();

    // Release seats back to event
    const event = await Event.findById(booking.event);
    const seatNumbers = booking.seats.map((seat) => seat.seatNumber);

    event.seats = event.seats.map((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.isBooked = false;
      }
      return seat;
    });

    event.availableSeats += booking.seats.length;
    await event.save();

    return res.status(200).json(
      new ApiResponse(200, payment, "Refund approved and processed successfully")
    );
  } else if (action === "reject") {
    payment.refundStatus = "none";
    await payment.save();

    return res.status(200).json(
      new ApiResponse(200, payment, "Refund request rejected")
    );
  } else {
    return next(new ApiError(400, "Invalid action. Use 'approve' or 'reject'"));
  }
};