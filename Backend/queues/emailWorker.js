import { Worker } from "bullmq";
import { bullmqRedisOptions } from "../config/redis.js";
import {
  sendBookingConfirmationEmail,
  sendRefundConfirmationEmail,
} from "../services/emailService.js";

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    if (job.name === "bookingConfirmation") {
      await sendBookingConfirmationEmail(job.data);
      console.log(`Booking confirmation email sent to ${job.data.to}`);
    } else if (job.name === "refundConfirmation") {
      await sendRefundConfirmationEmail(job.data);
      console.log(`Refund confirmation email sent to ${job.data.to}`);
    }
  },
  { connection: bullmqRedisOptions }
);

emailWorker.on("completed", (job) => {
  console.log(` Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(` Job ${job.id} failed: ${err.message}`);
});

export default emailWorker;