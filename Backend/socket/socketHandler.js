const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(` User connected: ${socket.id}`);

    // User joins an event room to receive seat updates for that event
    socket.on("joinEvent", (eventId) => {
      socket.join(`event:${eventId}`);
      console.log(`User ${socket.id} joined event room: ${eventId}`);
    });

    // User leaves event room
    socket.on("leaveEvent", (eventId) => {
      socket.leave(`event:${eventId}`);
      console.log(`User ${socket.id} left event room: ${eventId}`);
    });

    // Seat locked - broadcast to everyone in event room
    socket.on("seatLocked", ({ eventId, seatNumber, userId }) => {
      io.to(`event:${eventId}`).emit("seatStatusUpdate", {
        seatNumber,
        status: "locked",
        userId,
      });
    });

    // Seat unlocked - broadcast to everyone in event room
    socket.on("seatUnlocked", ({ eventId, seatNumber }) => {
      io.to(`event:${eventId}`).emit("seatStatusUpdate", {
        seatNumber,
        status: "available",
      });
    });

    // Seat booked permanently - broadcast to everyone in event room
    socket.on("seatBooked", ({ eventId, seatNumber }) => {
      io.to(`event:${eventId}`).emit("seatStatusUpdate", {
        seatNumber,
        status: "booked",
      });
    });

    socket.on("disconnect", () => {
      console.log(` User disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;