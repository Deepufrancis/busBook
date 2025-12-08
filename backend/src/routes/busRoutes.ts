import express from "express";
import {
  getBusById,
  getBuses,
  addBus,
  lockSeats,
  confirmBooking,
  releaseExpiredLocks,
  cleanupExpiredBuses
} from "../controllers/busController.js";

const router = express.Router();

// Get buses
router.get("/", getBuses);

// Get single bus
router.get("/:id", getBusById);

// Add bus
router.post("/", addBus);

// Lock seats temporarily
router.post("/lock/:id", lockSeats);

// Confirm booking (after payment)
router.post("/confirm/:id", confirmBooking);

// Clear expired seat locks
router.patch("/release-locks/:id", releaseExpiredLocks);

// Manual cleanup of expired buses (admin)
router.delete("/cleanup/expired", cleanupExpiredBuses);

export default router;
