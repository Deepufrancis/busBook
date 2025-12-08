import mongoose, { Schema, Document } from "mongoose";

export interface ISeatLock {
  seatNumber: number;
  lockedAt: Date;
  expiresAt: Date;
  passengerName?: string;
  passengerEmail?: string;
}

export interface IBus extends Document {
  busName: string;
  source: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  seatsBooked: number[];
  seatLocks: ISeatLock[];
}

const seatLockSchema = new Schema<ISeatLock>({
  seatNumber: { type: Number, required: true },
  lockedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  passengerName: { type: String },
  passengerEmail: { type: String }
});

const busSchema = new Schema<IBus>(
  {
    busName: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    price: { type: Number, required: true },
    totalSeats: { type: Number, required: true },

    seatsBooked: { type: [Number], default: [] },

    seatLocks: { type: [seatLockSchema], default: [] }
  },
  { timestamps: true }
);

export const Bus = mongoose.model<IBus>("Bus", busSchema);
