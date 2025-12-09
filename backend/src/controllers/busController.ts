import type { Request, Response } from "express";
import { Bus } from "../models/Bus.js";
import { triggerBusCleanup } from "../utils/busCleanup.js";
import type { AuthRequest } from "../middlewares/auth.js";

/**
 * GET /api/buses/:id
 * Fetch single bus with fresh lock state
 */
export const getBusById = async (req: Request, res: Response) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate("createdBy", "name email")
      .lean();

    if (!bus) return res.status(404).json({ error: "Bus not found" });

    // Drop expired locks before returning
    const filteredLocks = (bus.seatLocks || []).filter(lock => lock.expiresAt > new Date());

    // Persist cleaned locks if any removed
    if (bus.seatLocks && filteredLocks.length !== bus.seatLocks.length) {
      await Bus.updateOne(
        { _id: bus._id },
        { $set: { seatLocks: filteredLocks } }
      );
    }

    bus.seatLocks = filteredLocks;

    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bus" });
  }
};

/**
 * GET /api/buses
 * Search buses or fetch all
 */
export const getBuses = async (req: Request, res: Response) => {
  try {
    const { source, destination, date } = req.query;

    const query: any = {};
    if (source) query.source = source;
    if (destination) query.destination = destination;
    if (date) query.date = date;

    const buses = await Bus.find(query)
      .populate("createdBy", "name email")
      .lean();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buses" });
  }
};

/**
 * POST /api/buses
 * Create a new bus
 */
export const addBus = async (req: AuthRequest, res: Response) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user?._id
    };
    const bus = await Bus.create(payload);
    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: "Failed to add bus" });
  }
};

/**
 * GET /api/buses/mine
 * Fetch buses created by the authenticated admin
 */
export const getMyBuses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const buses = await Bus.find({ createdBy: req.user._id })
      .populate("createdBy", "name email")
      .lean();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buses" });
  }
};

/**
 * POST /api/buses/lock/:id
 * Lock seats for 5 minutes
 */
export const lockSeats = async (req: Request, res: Response) => {
  try {
    const { seats, passengerName, passengerEmail } = req.body;
    const bus = await Bus.findById(req.params.id);

    if (!bus) return res.status(404).json({ error: "Bus not found" });

    // Remove expired locks
    bus.seatLocks = bus.seatLocks.filter(
      lock => lock.expiresAt > new Date()
    );

    // Check for conflicts (booked or already locked)
    const conflict = seats.some((s: number) =>
      bus.seatsBooked.includes(s) ||
      bus.seatLocks.some(lock => lock.seatNumber === s)
    );

    if (conflict)
      return res.status(400).json({ error: "Seat already locked or booked" });

    // Create locks (store who locked for traceability)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    seats.forEach((s: number) => {
      bus.seatLocks.push({
        seatNumber: s,
        lockedAt: now,
        expiresAt,
        passengerName,
        passengerEmail
      });
    });

    await bus.save();

    res.json({
      message: "Seats locked for 5 minutes",
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to lock seats" });
  }
};

/**
 * POST /api/buses/unlock/:id
 * Release temporary locks for specific seats
 */
export const unlockSeats = async (req: Request, res: Response) => {
  try {
    const { seats } = req.body as { seats: number[] };
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: "No seats provided to unlock" });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ error: "Bus not found" });

    const before = bus.seatLocks.length;
    bus.seatLocks = bus.seatLocks.filter(lock => !seats.includes(lock.seatNumber));
    const removed = before - bus.seatLocks.length;

    await bus.save();

    res.json({ message: "Seat locks released", removed });
  } catch (error) {
    res.status(500).json({ error: "Failed to unlock seats" });
  }
};

/**
 * POST /api/buses/confirm/:id
 * Final confirmation → seats become booked
 */
export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const { seats } = req.body;
    const bus = await Bus.findById(req.params.id);

    if (!bus) return res.status(404).json({ error: "Bus not found" });

    // Remove expired locks first
    const now = new Date();
    bus.seatLocks = bus.seatLocks.filter(lock => lock.expiresAt > now);

    // Check if the seats are locked by user
    const missingLock = seats.some(
      (s: number) => !bus.seatLocks.some(lock => lock.seatNumber === s)
    );

    if (missingLock)
      return res.status(400).json({ error: "Some seats were not locked" });

    // Book seats
    bus.seatsBooked.push(...seats);

    // Remove the locks for these seats
    bus.seatLocks = bus.seatLocks.filter(
      lock => !seats.includes(lock.seatNumber)
    );

    await bus.save();

    res.json({ message: "Booking confirmed", bus });
  } catch (error) {
    res.status(500).json({ error: "Booking confirmation failed" });
  }
};

/**
 * PATCH /api/buses/release-locks/:id
 * Clean expired locks
 */
export const releaseExpiredLocks = async (req: Request, res: Response) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ error: "Bus not found" });

    const before = bus.seatLocks.length;

    bus.seatLocks = bus.seatLocks.filter(
      lock => lock.expiresAt > new Date()
    );

    await bus.save();

    res.json({
      message: "Expired locks released",
      removed: before - bus.seatLocks.length
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to release locks" });
  }
};

/**
 * DELETE /api/buses/cleanup/expired
 * Manual trigger to remove expired buses (admin only)
 */
export const cleanupExpiredBuses = async (req: Request, res: Response) => {
  try {
    const deletedCount = await triggerBusCleanup();
    res.json({
      success: true,
      message: `Removed ${deletedCount} expired buses`,
      deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to cleanup expired buses" });
  }
};
