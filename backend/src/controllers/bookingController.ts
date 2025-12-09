import type { Request, Response } from "express";
import { Booking } from "../models/Booking.js";
import { Bus } from "../models/Bus.js";

/**
 * POST /api/bookings
 * Create a booking after seat confirmation
 */
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { busId, userId, passengerName, passengerEmail, seats, totalPrice, transactionId } = req.body;
    
    console.log("[createBooking] Request received:", { busId, userId, passengerName, passengerEmail, seats, totalPrice, transactionId });

    // Get bus details
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ error: "Bus not found" });

    const booking = await Booking.create({
      busId,
      userId,
      passengerName,
      passengerEmail,
      seats,
      totalPrice,
      transactionId,
      busDetails: {
        busName: bus.busName,
        source: bus.source,
        destination: bus.destination,
        date: bus.date,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime
      }
    });
    
    console.log("[createBooking] Booking created successfully:", { id: booking._id, busId: booking.busId, userId: booking.userId, status: booking.status });

    res.status(201).json(booking);
  } catch (error) {
    console.error("[createBooking] Error:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

/**
 * GET /api/bookings/user/:userId
 * Get all bookings for a user
 */
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const bookings = await Booking.find({ userId: userId, status: "confirmed" } as any).sort({
      createdAt: -1
    });
    res.json(bookings);
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

/**
 * GET /api/bookings/bus/:busId
 * Get all bookings for a specific bus (admin view)
 */
export const getBusBookings = async (req: Request, res: Response) => {
  try {
    const busId = req.params.busId;
    console.log(`[getBusBookings] Searching for bookings with busId: ${busId}`);
    
    // First, get all bookings to debug
    const allBookings = await Booking.find({});
    console.log(`[getBusBookings] Total bookings in DB: ${allBookings.length}`);
    allBookings.forEach(b => {
      console.log(`  - Booking: busId=${b.busId}, userId=${b.userId}, status=${b.status}`);
    });
    
    const bookings = await Booking.find({ busId: busId, status: "confirmed" } as any).sort({
      createdAt: -1
    });
    
    console.log(`[getBusBookings] Found ${bookings.length} confirmed bookings for busId: ${busId}`);
    res.json(bookings);
  } catch (error) {
    console.error("Get bus bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bus bookings" });
  }
};

/**
 * GET /api/bookings
 * Get all bookings (for debugging/admin)
 */
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({}).sort({
      createdAt: -1
    });
    res.json(bookings);
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 */
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Remove seats from bus seatsBooked array
    await Bus.findByIdAndUpdate(
      booking.busId,
      { $pull: { seatsBooked: { $in: booking.seats } } }
    );

    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};
