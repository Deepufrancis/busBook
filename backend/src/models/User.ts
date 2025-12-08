import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  isVerified: boolean;
  emailOTP?: string;
  emailOTPExpires?: Date;
  resetOTP?: string;
  resetOTPExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    emailOTP: { type: String },
    emailOTPExpires: { type: Date },
    resetOTP: { type: String },
    resetOTPExpires: { type: Date }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
