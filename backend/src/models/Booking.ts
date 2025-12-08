import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  busId: string;
  userId: string;
  passengerName: string;
  passengerEmail: string;
  seats: number[];
  totalPrice: number;
  transactionId?: string;
  busDetails: {
    busName: string;
    source: string;
    destination: string;
    date: string;
    departureTime: string;
    arrivalTime: string;
  };
  createdAt: Date;
  status: "confirmed" | "cancelled";
}

const bookingSchema = new Schema<IBooking>(
  {
    busId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    passengerName: { type: String, required: true },
    passengerEmail: { type: String, required: true },
    seats: { type: [Number], required: true },
    totalPrice: { type: Number, required: true },
    transactionId: { type: String },
    busDetails: {
      busName: { type: String, required: true },
      source: { type: String, required: true },
      destination: { type: String, required: true },
      date: { type: String, required: true },
      departureTime: { type: String, required: true },
      arrivalTime: { type: String, required: true }
    },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" }
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
