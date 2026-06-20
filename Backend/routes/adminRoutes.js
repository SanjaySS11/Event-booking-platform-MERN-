import express from "express";
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  moderateEvent,
  getPlatformAnalytics,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// All admin routes are restricted to admin role only
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/users/:id", protect, authorizeRoles("admin"), updateUserStatus);
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);

router.put(
  "/events/:id/moderate",
  protect,
  authorizeRoles("admin"),
  moderateEvent
);

router.get(
  "/analytics",
  protect,
  authorizeRoles("admin"),
  getPlatformAnalytics
);

export default router;
