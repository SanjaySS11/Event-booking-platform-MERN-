import User from "../models/User.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
export const getAllUsers = async (req, res, next) => {
  const { role, page = 1, limit = 10 } = req.query;

  const query = {};
  if (role) query.role = role;

  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .select("-password")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
      "Users fetched successfully"
    )
  );
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id
// @access  Private (admin)
export const updateUserStatus = async (req, res, next) => {
  const { isActive, role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  if (isActive !== undefined) user.isActive = isActive;
  if (role) user.role = role;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, user, "User updated successfully")
  );
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
export const deleteUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  await User.findByIdAndDelete(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, null, "User deleted successfully")
  );
};

// @desc    Moderate event (approve/reject/cancel)
// @route   PUT /api/admin/events/:id/moderate
// @access  Private (admin)
export const moderateEvent = async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ["draft", "published", "cancelled", "completed"];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, "Invalid status"));
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  event.status = status;
  await event.save();

  return res.status(200).json(
    new ApiResponse(200, event, "Event moderated successfully")
  );
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (admin)
export const getPlatformAnalytics = async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalOrganizers = await User.countDocuments({ role: "organizer" });
  const totalEvents = await Event.countDocuments();
  const publishedEvents = await Event.countDocuments({ status: "published" });
  const totalBookings = await Booking.countDocuments({
    bookingStatus: "confirmed",
  });

  const revenueResult = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  const totalRevenue =
    revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  const pendingRefunds = await Payment.countDocuments({
    refundStatus: "pending",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalOrganizers,
        totalEvents,
        publishedEvents,
        totalBookings,
        totalRevenue,
        pendingRefunds,
      },
      "Analytics fetched successfully"
    )
  );
};