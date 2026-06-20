import Event from "../models/Event.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadImage } from "../services/cloudinaryService.js";
import fs from "fs";

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (organizer, admin)
export const createEvent = async (req, res, next) => {
  let {
    title,
    description,
    category,
    venue,
    date,
    pricing,
    totalSeats,
    seats,
  } = req.body;

  if (!title || !description || !category || !venue || !date || !totalSeats) {
    return next(new ApiError(400, "Please provide all required fields"));
  }

  // Parse JSON strings if sent via form-data
  if (typeof venue === "string") venue = JSON.parse(venue);
  if (typeof pricing === "string") pricing = JSON.parse(pricing);
  if (typeof seats === "string") seats = JSON.parse(seats);

  let imageUrl = "";

  // If image file was uploaded, send it to Cloudinary
  if (req.file) {
    imageUrl = await uploadImage(req.file.path, "events");
    // Delete temp file after upload
    fs.unlinkSync(req.file.path);
  }

  const event = await Event.create({
    title,
    description,
    category,
    venue,
    date,
    pricing,
    totalSeats,
    availableSeats: totalSeats,
    seats,
    image: imageUrl,
    organizer: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(201, event, "Event created successfully")
  );
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req, res, next) => {
  const { category, city, search, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { status: "published" };

  if (category) query.category = category;
  if (city) query["venue.city"] = { $regex: city, $options: "i" };
  if (search) query.title = { $regex: search, $options: "i" };

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Event.countDocuments(query);

  const events = await Event.find(query)
    .populate("organizer", "name email")
    .skip(skip)
    .limit(Number(limit))
    .sort({ date: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        events,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
      "Events fetched successfully"
    )
  );
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate(
    "organizer",
    "name email"
  );

  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  return res.status(200).json(
    new ApiResponse(200, event, "Event fetched successfully")
  );
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (organizer, admin)
export const updateEvent = async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  // Check if user is the organizer or admin
  if (
    event.organizer.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ApiError(403, "Not authorized to update this event"));
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedEvent, "Event updated successfully")
  );
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (organizer, admin)
export const deleteEvent = async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ApiError(404, "Event not found"));
  }

  // Check if user is the organizer or admin
  if (
    event.organizer.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new ApiError(403, "Not authorized to delete this event"));
  }

  await Event.findByIdAndDelete(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, null, "Event deleted successfully")
  );
};