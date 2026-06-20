import redis from "../config/redis.js";

const LOCK_EXPIRY = 600; // 10 minutes in seconds

// Lock a seat for a user
export const lockSeat = async (eventId, seatNumber, userId) => {
  const key = `seat:${eventId}:${seatNumber}`;
  
  // NX = Only set if key doesn't exist (prevents overwriting)
  // EX = Expiry in seconds
  const result = await redis.set(key, userId, "NX", "EX", LOCK_EXPIRY);
  
  return result === "OK"; // Returns true if locked, false if already locked
};

// Unlock a seat
export const unlockSeat = async (eventId, seatNumber) => {
  const key = `seat:${eventId}:${seatNumber}`;
  await redis.del(key);
};

// Check if seat is locked
export const isSeatLocked = async (eventId, seatNumber) => {
  const key = `seat:${eventId}:${seatNumber}`;
  const result = await redis.get(key);
  return result !== null; // Returns true if locked
};

// Get who locked the seat
export const getSeatLockOwner = async (eventId, seatNumber) => {
  const key = `seat:${eventId}:${seatNumber}`;
  return await redis.get(key);
};

// Lock multiple seats at once
export const lockMultipleSeats = async (eventId, seatNumbers, userId) => {
  const results = await Promise.all(
    seatNumbers.map((seatNumber) => lockSeat(eventId, seatNumber, userId))
  );

  // Check if all seats were locked successfully
  const allLocked = results.every((result) => result === true);

  // If not all locked, unlock the ones that were locked
  if (!allLocked) {
    const lockedSeats = seatNumbers.filter((_, index) => results[index]);
    await Promise.all(
      lockedSeats.map((seatNumber) => unlockSeat(eventId, seatNumber))
    );
  }

  return allLocked;
};

// Unlock multiple seats at once
export const unlockMultipleSeats = async (eventId, seatNumbers) => {
  await Promise.all(
    seatNumbers.map((seatNumber) => unlockSeat(eventId, seatNumber))
  );
};