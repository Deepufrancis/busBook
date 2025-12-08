import express from "express";
import {
  createBooking,
  getUserBookings,
  getBusBookings,
  getAllBookings,
  cancelBooking
} from "../controllers/bookingController.js";

const router = express.Router();

// Get all bookings (for debugging)
router.get("/", getAllBookings);

// Create a booking
router.post("/", createBooking);

// Get user's bookings
router.get("/user/:userId", getUserBookings);

// Get bookings for a specific bus (admin)
router.get("/bus/:busId", getBusBookings);

// Cancel a booking
router.delete("/:id", cancelBooking);

export default router;
