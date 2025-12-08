import express from "express";
import { processPayment } from "../controllers/paymentController.js";

const router = express.Router();

// Process payment
router.post("/process", processPayment);

export default router;
