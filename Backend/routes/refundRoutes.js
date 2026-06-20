import express from "express";
import {
  requestRefund,
  getAllRefundRequests,
  processRefund,
} from "../controllers/refundController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// User requests refund
router.post(
  "/request",
  protect,
  authorizeRoles("user", "organizer", "admin"),
  requestRefund
);

// Admin - get all refund requests
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllRefundRequests
);

// Admin - approve/reject refund
router.put(
  "/:paymentId",
  protect,
  authorizeRoles("admin"),
  processRefund
);

export default router;