import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Private routes
router.post(
  "/",
  protect,
  authorizeRoles("organizer", "admin"),
  upload.single("image"),
  createEvent
);
router.put(
  "/:id",
  protect,
  authorizeRoles("organizer", "admin"),
  updateEvent
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("organizer", "admin"),
  deleteEvent
);

export default router;