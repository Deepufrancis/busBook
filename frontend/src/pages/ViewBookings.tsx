import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

interface Bus {
  _id: string;
  busName: string;
  source: string;
  destination: string;
  date: string;
  departureTime: string;
  totalSeats: number;
  seatsBooked: number[];
}

export default function ViewBookings() {
  const navigate = useNavigate();
  const { busId: paramBusId } = useParams<{ busId?: string }>();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState(paramBusId || "");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [busesLoading, setBusesLoading] = useState(true);
  const [error, setError] = useState("");
  const [seatModalBooking, setSeatModalBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const { ApiService } = await import("../utils/api");
        const data = await ApiService.getBuses();
        setBuses(data);
        // If a busId is provided in route, auto-fetch its bookings
        if (paramBusId) {
          console.log("Fetching bookings for busId:", paramBusId);
          setSelectedBusId(paramBusId);
          const bookingsData = await ApiService.getBusBookings(paramBusId);
          console.log("Fetched bus bookings:", bookingsData);
          setBookings(bookingsData);
        }
      } catch (err: any) {
        console.error("Error fetching buses/bookings:", err);
        setError(err.message || "Error fetching buses");
      } finally {
        setBusesLoading(false);
      }
    };

    fetchBuses();
  }, [paramBusId]);

  const handleBusSelect = async (busId: string) => {
    setSelectedBusId(busId);
    setBookings([]);
    setLoading(true);
    setError("");

    try {
      const { ApiService } = await import("../utils/api");
      console.log("Fetching bookings for busId:", busId);
      const data = await ApiService.getBusBookings(busId);
      console.log("Fetched bookings data:", data);
      setBookings(data);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Error fetching bookings for this bus");
    } finally {
      setLoading(false);
    }
  };

  const selectedBus = buses.find((b) => b._id === selectedBusId);

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">View Bookings</h1>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Back to Admin
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {busesLoading ? (
          <p className="text-center text-gray-600">Loading buses...</p>
        ) : (
          <>
            {/* Bus Selection */}
            <div className="bg-white p-8 rounded-xl shadow-md mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Buses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {buses.map((bus) => (
                  <button
                    key={bus._id}
                    onClick={() => handleBusSelect(bus._id)}
                    className={`p-5 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                      selectedBusId === bus._id
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-white"
                    }`}
                    type="button"
                  >
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{bus.busName}</h3>
                    <p className="text-sm text-gray-700 mb-1 font-medium">
                      {bus.source} → {bus.destination}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">{bus.date} at {bus.departureTime}</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      bus.seatsBooked.length > 0 
                        ? "bg-orange-100 text-orange-700" 
                        : "bg-green-100 text-green-700"
                    }`}>
                      {bus.seatsBooked.length}/{bus.totalSeats} seats
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings for Selected Bus */}
            {selectedBusId && (
              <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Bookings for <span className="text-blue-600">{selectedBus?.busName}</span>
                </h2>

                {loading ? (
                  <p className="text-center text-gray-500 py-8">Loading bookings...</p>
                ) : bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold">Passenger</th>
                          <th className="px-5 py-3 text-left font-semibold">Booking Ref ID</th>
                          <th className="px-5 py-3 text-left font-semibold">Email</th>
                          <th className="px-5 py-3 text-left font-semibold">Seats</th>
                          <th className="px-5 py-3 text-left font-semibold">Total Price</th>
                          <th className="px-5 py-3 text-left font-semibold">Booked On</th>
                          <th className="px-5 py-3 text-left font-semibold">Status</th>
                          <th className="px-5 py-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking, idx) => (
                          <tr key={booking._id} className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b border-gray-200 hover:bg-blue-50 transition-colors`}>
                            <td className="px-5 py-4 text-gray-900 font-semibold">
                              {booking.passengerName}
                            </td>
                            <td className="px-5 py-4 text-gray-700 font-mono text-xs break-all">
                              {booking._id}
                            </td>
                            <td className="px-5 py-4 text-gray-700">{booking.passengerEmail}</td>
                            <td className="px-5 py-4 text-gray-900 font-medium">{booking.seats.join(", ")}</td>
                            <td className="px-5 py-4 text-blue-700 font-bold text-lg">₹{booking.totalPrice}</td>
                            <td className="px-5 py-4 text-gray-700">
                              {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <button
                                onClick={() => setSeatModalBooking(booking)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer"
                                type="button"
                              >
                                View Seats
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-12 text-lg">No bookings for this bus yet</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Seat Details Modal */}
      {seatModalBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold">Booking Details</h3>
              <button
                onClick={() => setSeatModalBooking(null)}
                className="text-2xl font-bold hover:bg-blue-800 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                type="button"
              >
                ×
              </button>
            </div>
            <div className="p-7 space-y-4">
              <div className="space-y-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Booking Ref ID</p>
                <p className="text-gray-900 font-mono text-xs break-all">{seatModalBooking._id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Passenger Name</p>
                <p className="text-gray-900 font-semibold text-lg">{seatModalBooking.passengerName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Email Address</p>
                <p className="text-gray-900 text-sm">{seatModalBooking.passengerEmail}</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Bus</p>
                <p className="text-gray-900 font-semibold">{seatModalBooking.busDetails.busName}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Seat Numbers</p>
                <p className="text-gray-900 font-bold text-lg">{seatModalBooking.seats.join(", ")}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-600">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Total Amount</p>
                <p className="text-green-700 font-bold text-2xl">₹{seatModalBooking.totalPrice}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setSeatModalBooking(null)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
