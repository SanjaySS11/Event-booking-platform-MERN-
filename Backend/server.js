import "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import "./config/redis.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import refundRoutes from "./routes/refundRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import socketHandler from "./socket/socketHandler.js";
import "./queues/emailWorker.js";

// Connect to MongoDB
connectDB();

// Create express app
const app = express();

// Create HTTP server (needed for Socket.io)
const httpServer = createServer(app);

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Make io accessible in controllers via req.app.get("io")
app.set("io", io);

// Initialize socket handlers
socketHandler(io);

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all api routes
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Event Ticket Platform API is running..." });
});

// Global error handler (always last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});