import express from "express";
import {
  createBooking,
  confirmBooking,
  getMyBookings,
  getBookingById,
} from "../controllers/bookingController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// All booking routes are private
router.post(
  "/create",
  protect,
  authorizeRoles("user", "organizer", "admin"),
  createBooking
);

router.post(
  "/confirm",
  protect,
  authorizeRoles("user", "organizer", "admin"),
  confirmBooking
);

router.get(
  "/my-bookings",
  protect,
  authorizeRoles("user", "organizer", "admin"),
  getMyBookings
);

router.get(
  "/:id",
  protect,
  authorizeRoles("user", "organizer", "admin"),
  getBookingById
);

export default router;