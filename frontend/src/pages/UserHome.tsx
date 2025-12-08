import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function UserHome() {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");

    // At least one field must be filled
    if (!source && !destination && !date) {
      setSearchError("Please enter at least one search criteria");
      return;
    }

    // Navigate to search page with query parameters
    const params = new URLSearchParams();
    if (source) params.append("source", source);
    if (destination) params.append("destination", destination);
    if (date) params.append("date", date);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center text-white mb-12">
          <h1 className="text-5xl font-bold mb-4">Welcome to BusBook</h1>
          <p className="text-xl mb-8">Book your bus tickets easily and conveniently</p>
        </div>

        {/* Search Section */}
        <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Available Buses</h2>

          {searchError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {searchError}
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Source Input */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Starting Place</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g., New York"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Destination Input */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Boston"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Travel Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
                >
                  Search Buses
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center">
              * Enter at least one search criteria (starting place, destination, or date)
            </div>
          </form>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">View All Buses</h2>
            <p className="text-gray-600 mb-6">Browse all available buses without filters</p>
            <button
              onClick={() => navigate("/search")}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700"
            >
              Browse Buses
            </button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Bookings</h2>
            <p className="text-gray-600 mb-6">View and manage your bookings</p>
            <button
              onClick={() => navigate("/bookings")}
              className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700"
            >
              View Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
