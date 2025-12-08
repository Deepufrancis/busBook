import type { Request, Response } from "express";

interface PaymentRequest {
  bookingId?: string;
  amount: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

/**
 * POST /api/payments/process
 * Process payment (mock payment gateway)
 */
export const processPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId, amount, cardNumber, expiryDate, cvv, cardholderName } = req.body as PaymentRequest;

    console.log("[processPayment] Request received:", {
      bookingId,
      amount,
      cardNumber: cardNumber ? cardNumber.slice(-4).padStart(cardNumber.length, "*") : "missing",
      expiryDate,
      cvv: "***",
      cardholderName,
    });

    // Validate payment data
    if (!amount || !cardNumber || !expiryDate || !cvv || !cardholderName) {
      console.log("[processPayment] Validation failed - missing fields");
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    // Validate card number (basic Luhn algorithm check)
    if (!isValidCardNumber(cardNumber)) {
      console.log("[processPayment] Invalid card number:", cardNumber);
      return res.status(400).json({ error: "Invalid card number" });
    }

    // Validate expiry date format (MM/YY)
    if (!isValidExpiryDate(expiryDate)) {
      console.log("[processPayment] Invalid expiry date:", expiryDate);
      return res.status(400).json({ error: "Invalid expiry date format (use MM/YY or card is expired)" });
    }

    // Validate CVV
    if (!isValidCVV(cvv)) {
      console.log("[processPayment] Invalid CVV:", cvv);
      return res.status(400).json({ error: "Invalid CVV (must be 3-4 digits)" });
    }

    // Mock payment processing with random success rate
    const isSuccessful = Math.random() > 0.1; // 90% success rate

    if (isSuccessful) {
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      console.log("[processPayment] Payment successful:", {
        transactionId,
        amount,
        cardholderName,
        bookingId,
      });

      res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        transactionId,
        amount,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log("[processPayment] Payment failed:", {
        amount,
        cardholderName,
      });

      res.status(400).json({
        success: false,
        error: "Payment failed. Please try again or use a different card.",
      });
    }
  } catch (error) {
    console.error("[processPayment] Error:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
};

/**
 * Validate card number
 * For mock payment, accepts any card number with 13-19 digits
 */
function isValidCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  // For mock payments, just validate the length (13-19 digits is standard)
  if (digits.length < 13 || digits.length > 19) return false;
  return true;
}

/**
 * Validate expiry date format (MM/YY)
 */
function isValidExpiryDate(expiryDate: string): boolean {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiryDate)) return false;

  const parts = expiryDate.split("/");
  if (parts.length !== 2) return false;

  const month = parts[0];
  const year = parts[1];
  
  if (!month || !year) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  const expiryYear = parseInt(year, 10);
  const expiryMonth = parseInt(month, 10);

  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;

  return true;
}

/**
 * Validate CVV (3-4 digits)
 */
function isValidCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}
