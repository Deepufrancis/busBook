import nodemailer from "nodemailer";

// Debug: Check if environment variables are loaded
console.log("[emailService] Initializing email service...");
console.log("[emailService] EMAIL_USER:", process.env.EMAIL_USER ? "✓ Set" : "✗ Not set");
console.log("[emailService] EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✓ Set (length: " + process.env.EMAIL_PASSWORD.length + ")" : "✗ Not set");

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("[emailService] ✗ SMTP Connection Error:", error.message);
    console.error("[emailService] Please check EMAIL_USER and EMAIL_PASSWORD in .env file");
    console.error("[emailService] Current EMAIL_USER:", process.env.EMAIL_USER);
  } else {
    console.log("[emailService] ✓ SMTP Connection verified successfully");
  }
});

interface BookingDetails {
  bookingId: string;
  passengerName: string;
  passengerEmail: string;
  busName: string;
  source: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  totalPrice: number;
  transactionId: string;
}

/**
 * Send booking confirmation email with ticket details
 */
export const sendBookingConfirmationEmail = async (
  bookingDetails: BookingDetails
): Promise<void> => {
  const {
    bookingId,
    passengerName,
    passengerEmail,
    busName,
    source,
    destination,
    date,
    departureTime,
    arrivalTime,
    seats,
    totalPrice,
    transactionId,
  } = bookingDetails;

  try {
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background-color: white; padding: 20px; border-radius: 0 0 8px 8px; }
            .ticket-section { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; border-radius: 4px; }
            .ticket-header { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
            .ticket-detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .ticket-detail:last-child { border-bottom: none; }
            .ticket-label { font-weight: bold; color: #1f2937; }
            .ticket-value { color: #4b5563; }
            .seats-container { background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 10px; }
            .seat-badge { display: inline-block; background-color: #2563eb; color: white; padding: 4px 12px; margin: 4px 4px 4px 0; border-radius: 4px; font-weight: bold; }
            .total-section { background-color: #ecfdf5; padding: 15px; border-radius: 4px; margin: 15px 0; text-align: center; }
            .total-amount { font-size: 24px; font-weight: bold; color: #059669; }
            .confirmation-id { background-color: #fef3c7; padding: 12px; border-radius: 4px; margin: 15px 0; text-align: center; }
            .confirmation-label { font-size: 12px; color: #78350f; }
            .confirmation-value { font-size: 16px; font-weight: bold; color: #d97706; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Booking Confirmed</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Your ticket is ready!</p>
            </div>

            <div class="content">
              <p>Dear <strong>${passengerName}</strong>,</p>
              <p>Your bus booking has been confirmed successfully. Below are your ticket details:</p>

              <div class="ticket-section">
                <div class="ticket-header">🚌 Journey Details</div>
                <div class="ticket-detail">
                  <span class="ticket-label">Bus Name:</span>
                  <span class="ticket-value">${busName}</span>
                </div>
                <div class="ticket-detail">
                  <span class="ticket-label">Route:</span>
                  <span class="ticket-value">${source} → ${destination}</span>
                </div>
                <div class="ticket-detail">
                  <span class="ticket-label">Travel Date:</span>
                  <span class="ticket-value">${date}</span>
                </div>
                <div class="ticket-detail">
                  <span class="ticket-label">Departure Time:</span>
                  <span class="ticket-value">${departureTime}</span>
                </div>
                <div class="ticket-detail">
                  <span class="ticket-label">Estimated Arrival:</span>
                  <span class="ticket-value">${arrivalTime}</span>
                </div>
              </div>

              <div class="ticket-section">
                <div class="ticket-header">💺 Seat Information</div>
                <div class="seats-container">
                  ${seats.map((seat) => `<span class="seat-badge">${seat}</span>`).join("")}
                </div>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #dbeafe;">
                  <strong>Total Seats:</strong> ${seats.length}
                </div>
              </div>

              <div class="total-section">
                <div style="font-size: 14px; color: #047857; margin-bottom: 5px;">Total Amount Paid</div>
                <div class="total-amount">₹ ${totalPrice}</div>
              </div>

              <div class="confirmation-id">
                <div class="confirmation-label">Booking Reference ID</div>
                <div class="confirmation-value">${bookingId}</div>
              </div>

              <div class="confirmation-id">
                <div class="confirmation-label">Transaction ID</div>
                <div class="confirmation-value">${transactionId}</div>
              </div>

              <h3 style="color: #1f2937; margin-top: 20px;">Important Information:</h3>
              <ul style="color: #4b5563; padding-left: 20px;">
                <li>Please arrive at the boarding point 15 minutes before departure.</li>
                <li>Keep your booking reference ID for check-in at the bus counter.</li>
                <li>Carry a valid ID proof for verification.</li>
                <li>In case of cancellation, you can cancel up to 24 hours before departure for a refund.</li>
              </ul>

              <p style="margin-top: 20px; color: #4b5563;">
                If you have any questions or need to cancel this booking, please visit your bookings page or contact our customer support.
              </p>

              <div class="footer">
                <p><strong>BusBook</strong> - Your Trusted Bus Booking Platform</p>
                <p>© ${new Date().getFullYear()} BusBook. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"BusBook" <${process.env.EMAIL_USER}>`,
      to: passengerEmail,
      subject: `Booking Confirmed - BusBook Ticket [${bookingId}]`,
      html: emailContent,
    });

    console.log("[emailService] ticket email send to:", passengerEmail);
    console.log("[emailService] Booking ID:", bookingId);
    console.log("[emailService] Passenger Name:", passengerName);
    console.log("[emailService] Route:", source, "→", destination);
    console.log("[emailService] Travel Date:", date);
  } catch (error) {
    console.error("[emailService] ✗ Failed to send confirmation email to:", passengerEmail);
    console.error("[emailService] Error Details:", error);
    // Don't throw error - payment was successful, email is optional
  }
};

/**
 * Send booking cancellation email
 */
export const sendCancellationEmail = async (
  passengerEmail: string,
  passengerName: string,
  bookingId: string,
  busName: string,
  refundAmount: number
): Promise<void> => {
  try {
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
            .header { background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background-color: white; padding: 20px; border-radius: 0 0 8px 8px; }
            .details-section { background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 15px 0; border-radius: 4px; }
            .details-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #fee2e2; }
            .details-item:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #1f2937; }
            .value { color: #4b5563; }
            .refund-section { background-color: #ecfdf5; padding: 15px; border-radius: 4px; margin: 15px 0; text-align: center; }
            .refund-amount { font-size: 24px; font-weight: bold; color: #059669; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancelled</h1>
            </div>

            <div class="content">
              <p>Dear <strong>${passengerName}</strong>,</p>
              <p>Your booking has been successfully cancelled. Here are the cancellation details:</p>

              <div class="details-section">
                <div class="details-item">
                  <span class="label">Booking Reference ID:</span>
                  <span class="value">${bookingId}</span>
                </div>
                <div class="details-item">
                  <span class="label">Bus Name:</span>
                  <span class="value">${busName}</span>
                </div>
                <div class="details-item">
                  <span class="label">Cancellation Date:</span>
                  <span class="value">${new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div class="refund-section">
                <div style="font-size: 14px; color: #047857; margin-bottom: 5px;">Refund Amount</div>
                <div class="refund-amount">₹ ${refundAmount}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #047857;">The refund will be credited to your original payment method within 5-7 business days.</p>
              </div>

              <p style="color: #4b5563; margin-top: 20px;">
                If you need to book another journey, please visit BusBook and search for available buses.
              </p>

              <div class="footer">
                <p><strong>BusBook</strong> - Your Trusted Bus Booking Platform</p>
                <p>© ${new Date().getFullYear()} BusBook. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"BusBook" <${process.env.EMAIL_USER}>`,
      to: passengerEmail,
      subject: `Booking Cancelled - Refund Confirmation [${bookingId}]`,
      html: emailContent,
    });

    console.log("[emailService] ✓ Cancellation email sent successfully to:", passengerEmail);
    console.log("[emailService] Booking ID:", bookingId);
    console.log("[emailService] Refund Amount:", refundAmount);
  } catch (error) {
    console.error("[emailService] ✗ Failed to send cancellation email to:", passengerEmail);
    console.error("[emailService] Error Details:", error);
  }
};

/**
 * Send OTP email for signup/verification/reset flows
 */
export const sendOtpEmail = async (
  recipientEmail: string,
  recipientName: string,
  otp: string,
  purpose: "signup" | "reset"
): Promise<void> => {
  try {
    const subject =
      purpose === "signup"
        ? "Verify your BusBook account"
        : "Reset your BusBook password";

    const heading = purpose === "signup" ? "Verify Your Email" : "Password Reset OTP";
    const subText =
      purpose === "signup"
        ? "Use this code to verify your BusBook account."
        : "Use this code to reset your BusBook password.";

    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; background: #f9fafb; margin: 0; padding: 0; }
            .container { max-width: 560px; margin: 0 auto; padding: 24px; }
            .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; }
            .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 20px 24px; }
            .header h1 { margin: 0; font-size: 22px; }
            .content { padding: 24px; }
            .otp-box { background: #f3f4f6; border: 1px dashed #2563eb; border-radius: 10px; padding: 16px; text-align: center; }
            .otp { font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1e3a8a; }
            .note { font-size: 13px; color: #6b7280; margin-top: 12px; }
            .footer { padding: 16px 24px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; background: #f9fafb; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <h1>${heading}</h1>
                <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Hi ${recipientName || "there"}, ${subText}</p>
              </div>
              <div class="content">
                <p style="margin-bottom: 12px;">Enter this One-Time Password (OTP):</p>
                <div class="otp-box">
                  <div class="otp">${otp}</div>
                  <div class="note">This code expires in 10 minutes.</div>
                </div>
              </div>
              <div class="footer">
                <p>BusBook – Secure access to your account</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"BusBook" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject,
      html: emailContent,
    });

    console.log("[emailService] OTP email sent to:", recipientEmail, "purpose:", purpose);
  } catch (error) {
    console.error("[emailService] Failed to send OTP email to:", recipientEmail, "purpose:", purpose, "error:", error);
  }
};
