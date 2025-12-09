import express from "express";
import {
  getBusById,
  getBuses,
  getMyBuses,
  addBus,
  lockSeats,
  unlockSeats,
  confirmBooking,
  releaseExpiredLocks,
  cleanupExpiredBuses
} from "../controllers/busController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Get buses
router.get("/", getBuses);

// Get buses created by the current admin
router.get("/mine", authMiddleware, getMyBuses);

// Get single bus
router.get("/:id", getBusById);

// Add bus
router.post("/", authMiddleware, addBus);

// Lock seats temporarily
router.post("/lock/:id", lockSeats);

// Unlock seats when user cancels selection/payment
router.post("/unlock/:id", unlockSeats);

// Confirm booking (after payment)
router.post("/confirm/:id", confirmBooking);

// Clear expired seat locks
router.patch("/release-locks/:id", releaseExpiredLocks);

// Manual cleanup of expired buses (admin)
router.delete("/cleanup/expired", cleanupExpiredBuses);

export default router;
