import { Bus } from "../models/Bus.js";

/**
 * Remove buses with dates in the past
 * This function deletes all buses where the date is before today
 */
export const removeExpiredBuses = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Find all buses with dates in the past (string comparison works fine for YYYY-MM-DD format)
    const result = await Bus.deleteMany({
      date: { $lt: todayString }
    } as any);

    if (result.deletedCount > 0) {
      console.log(`[BusCleanup] Removed ${result.deletedCount} expired buses at ${new Date().toISOString()}`);
    }

    return result.deletedCount;
  } catch (error) {
    console.error("[BusCleanup] Error removing expired buses:", error);
    return 0;
  }
};

/**
 * Start the scheduled cleanup job
 * Runs every hour to remove expired buses
 * Can be customized to run at different intervals
 */
export const startBusCleanupScheduler = () => {
  // Run immediately on startup
  removeExpiredBuses();

  // Run every hour (3600000 milliseconds)
  const cleanupInterval = setInterval(() => {
    removeExpiredBuses();
  }, 3600000); // 1 hour

  // Optional: Also run at midnight daily for a full cleanup
  scheduleAtMidnight();

  console.log("[BusCleanup] Scheduler started - will clean expired buses hourly and at midnight");

  // Return the interval ID so it can be cleared if needed
  return cleanupInterval;
};

/**
 * Schedule a daily cleanup at midnight
 */
const scheduleAtMidnight = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const timeUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    removeExpiredBuses();
    // Reschedule for next day
    setInterval(() => {
      removeExpiredBuses();
    }, 86400000); // 24 hours
  }, timeUntilMidnight);
};

/**
 * Manual trigger to remove expired buses
 * Can be called from admin endpoints
 */
export const triggerBusCleanup = async () => {
  return await removeExpiredBuses();
};
