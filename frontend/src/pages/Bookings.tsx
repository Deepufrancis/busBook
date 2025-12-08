import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Booking {
  _id: string;
  passengerName: string;
  passengerEmail: string;
  seats: number[];
  totalPrice: number;
  status: string;
  createdAt: string;
  busDetails: {
    busName: string;
    source: string;
    destination: string;
    date: string;
    departureTime: string;
  };
}

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { ApiService } = await import("../utils/api");
        const userId = localStorage.getItem("userId") || "";
        console.log("Fetching bookings for userId:", userId);
        const data = await ApiService.getUserBookings(userId);
        console.log("Fetched bookings:", data);
        setBookings(data);
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError(err.message || "Error fetching bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;

    setCancelling(true);
    try {
      const { ApiService } = await import("../utils/api");
      await ApiService.cancelBooking(bookingToCancel._id);
      setBookings(bookings.filter((b) => b._id !== bookingToCancel._id));
      setShowCancelModal(false);
      setBookingToCancel(null);
    } catch (err: any) {
      setError(err.message || "Error cancelling booking");
      setShowCancelModal(false);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">My Bookings</h1>
          <button
            onClick={() => navigate("/search")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Search Buses
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {loading ? (
          <p className="text-center text-gray-600 text-lg">Loading bookings...</p>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-600">Bus</h3>
                    <p className="text-gray-800 font-semibold">{booking.busDetails.busName}</p>
                    <p className="text-gray-600 text-sm">{booking.busDetails.source} → {booking.busDetails.destination}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-600">Date & Time</h3>
                    <p className="text-gray-800">{booking.busDetails.date}</p>
                    <p className="text-gray-600 text-sm">{booking.busDetails.departureTime}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-600">Seats</h3>
                    <p className="text-gray-800 font-semibold">{booking.seats.join(", ")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-600">Total Price</h3>
                    <p className="text-lg font-bold text-blue-600">₹{booking.totalPrice}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-600">Status</h3>
                    <p className={`font-bold text-sm ${booking.status === "confirmed" ? "text-green-600" : "text-red-600"}`}>
                      {booking.status}
                    </p>
                  </div>
                </div>

                {booking.status === "confirmed" && (
                  <button
                    onClick={() => handleCancel(booking)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <p className="text-gray-600 text-lg mb-4">No bookings found</p>
            <button
              onClick={() => navigate("/search")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Book a Bus
            </button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
              <h2 className="text-2xl font-bold">Cancel Booking</h2>
              <p className="text-red-100 mt-2">Are you sure you want to cancel this booking?</p>
            </div>

            <div className="p-6">
              {/* Booking Details Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Bus</p>
                  <p className="text-gray-900 font-bold text-lg">{bookingToCancel.busDetails.busName}</p>
                  <p className="text-gray-600 text-sm">{bookingToCancel.busDetails.source} → {bookingToCancel.busDetails.destination}</p>
                </div>

                <div className="border-t border-gray-300 pt-3">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Journey Date & Time</p>
                  <p className="text-gray-900 font-semibold">{bookingToCancel.busDetails.date}</p>
                  <p className="text-gray-600 text-sm">Departure: {bookingToCancel.busDetails.departureTime}</p>
                </div>

                <div className="border-t border-gray-300 pt-3">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-2">Booked Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {bookingToCancel.seats.map((seat) => (
                      <span key={seat} className="bg-blue-600 text-white font-bold px-3 py-1 rounded">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-3">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Refund Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{bookingToCancel.totalPrice}</p>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-6">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">Warning:</span> This action cannot be undone. Your booking will be permanently cancelled and the amount will be refunded to your original payment method.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setBookingToCancel(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={confirmCancel}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
