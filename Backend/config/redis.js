import Redis from "ioredis";

// Regular Redis connection (for seat locking, caching)
const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log(" Redis Connected Successfully");
});

redis.on("error", (error) => {
  console.error(` Redis Connection Error: ${error.message}`);
});

// Separate Redis connection for BullMQ (requires maxRetriesPerRequest: null)
export const bullmqRedisOptions = {
  host: new URL(process.env.REDIS_URL).hostname,
  port: new URL(process.env.REDIS_URL).port,
  maxRetriesPerRequest: null,
};

export default redis;