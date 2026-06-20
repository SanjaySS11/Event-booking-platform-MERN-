import { Queue } from "bullmq";
import { bullmqRedisOptions } from "../config/redis.js";

export const emailQueue = new Queue("emailQueue", {
  connection: bullmqRedisOptions,
});

// Add booking confirmation email to queue
export const queueBookingConfirmationEmail = async (data) => {
  await emailQueue.add("bookingConfirmation", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  });
};

// Add refund confirmation email to queue
export const queueRefundConfirmationEmail = async (data) => {
  await emailQueue.add("refundConfirmation", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  });
};