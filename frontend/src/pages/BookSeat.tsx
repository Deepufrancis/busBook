import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function BookSeat() {
  const { busId: paramBusId } = useParams();
  const navigate = useNavigate();
  const [busId, setBusId] = useState<string | null>(paramBusId || null);
  const [availableBuses, setAvailableBuses] = useState<any[]>([]);
  const [busesLoading, setBusesLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [error, setError] = useState("");
  const [bus, setBus] = useState<any>(null);
  const [seatLocks, setSeatLocks] = useState<{ seatNumber: number }[]>([]);
  const [seatPrice, setSeatPrice] = useState<number>(500);
  const [totalSeats, setTotalSeats] = useState<number>(50);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Fetch all available buses
  useEffect(() => {
    const fetchAllBuses = async () => {
      try {
        setBusesLoading(true);
        const { ApiService } = await import("../utils/api");
        const buses = await ApiService.getBuses();
        setAvailableBuses(buses);
      } catch (err: any) {
        console.error("Failed to load buses:", err);
      } finally {
        setBusesLoading(false);
      }
    };

    fetchAllBuses();
  }, []);

  // Fetch selected bus details
  useEffect(() => {
    const fetchBus = async () => {
      if (!busId) return;
      try {
        const { ApiService } = await import("../utils/api");
        const data = await ApiService.getBus(busId);
        setBus(data);
        setSeatLocks(data.seatLocks || []);
        setTotalSeats(data.totalSeats || 50);
        setSeatPrice(data.price || 500);
      } catch (err: any) {
        setError(err.message || "Failed to load bus info");
      }
    };

    fetchBus();
  }, [busId]);

  const handleSeatClick = (seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passengerName || !passengerEmail || selectedSeats.length === 0) {
      setError("Please fill all fields and select at least one seat");
      return;
    }

    // Show payment modal instead of directly booking
    setShowPaymentModal(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    setPaymentLoading(true);
    try {
      const { ApiService } = await import("../utils/api");
      const totalPrice = selectedSeats.length * seatPrice;

      // Process payment with mock card details
      const paymentResponse = await ApiService.processPayment({
        amount: totalPrice,
        cardNumber: "4532123456789010",
        expiryDate: "12/25",
        cvv: "123",
        cardholderName: "Demo User",
      });

      // Payment successful, now proceed with booking
      const userId = localStorage.getItem("userId") || "";
      
      // First, lock the seats for 5 minutes
      await ApiService.lockSeats(busId || "", selectedSeats, passengerName, passengerEmail);
      // Refresh locks for UI feedback
      if (busId) {
        const fresh = await ApiService.getBus(busId);
        setSeatLocks(fresh.seatLocks || []);
      }
      
      // Then, confirm the booking
      await ApiService.confirmBooking(busId || "", selectedSeats, passengerName, passengerEmail);
      
      // Finally, create booking record with transaction ID
      await ApiService.createBooking({
        busId: busId || "",
        userId,
        passengerName,
        passengerEmail,
        seats: selectedSeats,
        totalPrice,
        transactionId: paymentResponse?.transactionId || "N/A"
      });
      
      // Small delay to ensure booking is saved
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh seat info
      if (busId) {
        const fresh = await ApiService.getBus(busId);
        setSeatLocks(fresh.seatLocks || []);
      }
      
      // Store booking details and show confirmation modal
      setBookingDetails({
        passengerName,
        passengerEmail,
        seats: selectedSeats,
        totalPrice,
        seatPrice
      });
      setShowPaymentModal(false);
      setShowConfirmationModal(true);
    } catch (err: any) {
      setPaymentError(err.message || "Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">Book Your Bus Ticket</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {/* Bus Selection Dropdown */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select a Bus</h2>
          
          {busesLoading ? (
            <div className="text-center py-8 text-gray-600">Loading available buses...</div>
          ) : availableBuses.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No buses available</div>
          ) : (
            <div className="space-y-3">
              {availableBuses.map((b) => (
                <button
                  key={b._id}
                  onClick={() => {
                    setBusId(b._id);
                    setSelectedSeats([]);
                    setError("");
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition text-left ${
                    busId === b._id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-white hover:border-blue-400"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Bus Name</p>
                      <p className="text-lg font-bold text-gray-900">{b.busName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Route</p>
                      <p className="text-gray-900 font-semibold">{b.source} → {b.destination}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Timing</p>
                      <p className="text-gray-900 font-semibold">{b.departureTime} - {b.arrivalTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-semibold uppercase">Price per Seat</p>
                      <p className="text-2xl font-bold text-green-600">₹{b.price}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Date: {new Date(b.date).toLocaleDateString()} | Available: {(b.totalSeats || 50) - (b.seatsBooked?.length || 0)} seats
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Seat Selection Section - Only show if a bus is selected */}
        {busId && bus && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Seat Layout</h2>

            <div className="grid grid-cols-10 gap-2 mb-6">
              {Array.from({ length: totalSeats }, (_, i) => i + 1).map((seat) => {
                const isBooked = bus?.seatsBooked?.includes(seat);
                const isLocked = seatLocks?.some((l: any) => l.seatNumber === seat);
                const isSelected = selectedSeats.includes(seat);

                const base = "p-2 text-sm font-bold rounded transition";
                const className = isBooked
                  ? `${base} bg-red-500 text-white cursor-not-allowed`
                  : isLocked
                    ? `${base} bg-yellow-400 text-gray-900 cursor-not-allowed`
                    : isSelected
                      ? `${base} bg-green-600 text-white`
                      : `${base} bg-gray-300 text-gray-800 hover:bg-blue-400`;

                return (
                  <button
                    key={seat}
                    onClick={() => {
                      if (isBooked || isLocked) return;
                      handleSeatClick(seat);
                    }}
                    disabled={isBooked || isLocked}
                    className={className}
                    type="button"
                  >
                    {seat}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 justify-center flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-400 rounded"></div>
                <span>Locked (temp)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Booking Details</h2>

            <form onSubmit={handleBooking}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Passenger Name</label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                  placeholder="Enter name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                  placeholder="Enter email"
                />
              </div>

              <div className="mb-4 p-3 bg-gray-100 rounded">
                <p className="text-gray-700 mb-2">
                  <span className="font-bold">Seats Selected:</span> {selectedSeats.length}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-bold">Price per Seat:</span> ₹{seatPrice}
                </p>
                <p className="text-lg font-bold text-blue-600">
                  Total: ₹{selectedSeats.length * seatPrice}
                </p>
              </div>

              <button
                type="submit"
                disabled={selectedSeats.length === 0}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
        )}

        {/* No Bus Selected Message */}
        {!busId && (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-gray-600 text-lg">Please select a bus above to view available seats</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <h2 className="text-2xl font-bold">Payment</h2>
              <p className="text-blue-100 mt-2">Complete your booking with secure payment</p>
            </div>
            
            <div className="p-6">
              {paymentError && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                  {paymentError}
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg mb-6 border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold mb-2">Order Summary</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Seats: {selectedSeats.join(", ")}</span>
                    <span>{selectedSeats.length} × ₹{seatPrice}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 font-bold text-lg flex justify-between text-gray-900">
                    <span>Total Amount:</span>
                    <span>₹{selectedSeats.length * seatPrice}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2">Cardholder Name</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-semibold">
                    Demo User
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mock payment - pre-filled</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold text-sm mb-2">Card Number</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-mono font-semibold tracking-wider">
                    4532 1234 5678 9010
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mock payment - pre-filled</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold text-sm mb-2">Expiry (MM/YY)</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-mono font-semibold text-center">
                      12/25
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Mock payment - pre-filled</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold text-sm mb-2">CVV</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-mono font-semibold text-center">
                      •••
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Mock payment - pre-filled</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-700">
                  <p className="font-semibold mb-1">🔒 Secure Payment</p>
                  <p>This is a mock payment for demo purposes. No real charges will be made.</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentError("");
                    }}
                    className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    disabled={paymentLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    {paymentLoading ? "Processing..." : "Pay ₹" + (selectedSeats.length * seatPrice)}
                  </button>
                </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

      {/* Booking Confirmation Modal */}
      {showConfirmationModal && bookingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center">
              <div className="mb-4 text-5xl">✓</div>
              <h2 className="text-3xl font-bold">Booking Confirmed!</h2>
              <p className="text-green-100 mt-2">Your booking has been successfully processed</p>
            </div>
            
            <div className="p-6">
              {/* Booking Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg mb-6 border border-gray-200 space-y-3">
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Passenger Name</p>
                  <p className="text-gray-900 font-bold text-lg">{bookingDetails.passengerName}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Email</p>
                  <p className="text-gray-900 font-semibold">{bookingDetails.passengerEmail}</p>
                </div>
                
                <div className="border-t border-gray-300 pt-3">
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Seats Booked</p>
                  <div className="flex flex-wrap gap-2">
                    {bookingDetails.seats.map((seat: number) => (
                      <span key={seat} className="bg-blue-600 text-white font-bold px-3 py-1 rounded">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Price per Seat:</span>
                    <span>₹{bookingDetails.seatPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Quantity:</span>
                    <span>{bookingDetails.seats.length} seat(s)</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold text-lg text-green-600">
                    <span>Total Amount:</span>
                    <span>₹{bookingDetails.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-6">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Confirmation email</span> has been sent to <span className="font-semibold">{bookingDetails.passengerEmail}</span>
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  navigate("/bookings");
                }}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        );
      }
