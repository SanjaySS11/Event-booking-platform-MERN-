import express from "express";
import {
  createOrder,
  verifyPayment,
  getPaymentDetails,
} from "../controllers/paymentController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create payment order
router.post(
  "/create-order",
  protect,
  authorizeRoles("user", "organizer", "admin"),
  createOrder
);

// Verify payment webhook (public - called by Razorpay)
router.post("/webhook", verifyPayment);

// Get payment details
router.get(
  "/:bookingId",
  protect,
  authorizeRoles("user", "organizer", "admin"),
  getPaymentDetails
);

export default router;