import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { startBusCleanupScheduler } from "./utils/busCleanup.js";
import busRoutes from "./routes/busRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Dynamic CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL || "",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost during development
      if (origin.includes("localhost")) return callback(null, true);
      
      // Allow configured frontend URL
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      // Allow requests from same domain (for served SPA)
      if (origin.includes("render.com") || origin.includes("busbook")) return callback(null, true);
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Connect DB
connectDB();

// Start bus cleanup scheduler
startBusCleanupScheduler();

// API Routes
app.use("/api/buses", busRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// Serve frontend static files
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

// SPA fallback: serve index.html for all non-API routes using middleware
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
