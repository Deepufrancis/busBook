import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Bus {
  _id: string;
  busName: string;
  source: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  seatsBooked: number[];
  createdBy?: { name?: string; email?: string };
}

export default function BusSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchData, setSearchData] = useState({
    source: searchParams.get("source") || "",
    destination: searchParams.get("destination") || "",
    date: searchParams.get("date") || "",
  });
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // Load all buses on component mount or if query parameters are present
  useEffect(() => {
    const loadBuses = async () => {
      setLoading(true);
      setError("");
      
      try {
        const { ApiService } = await import("../utils/api");
        
        // If query parameters exist, search with them; otherwise load all buses
        if (searchParams.get("source") || searchParams.get("destination") || searchParams.get("date")) {
          setSearched(true);
          const data = await ApiService.getBuses(
            searchParams.get("source") || undefined,
            searchParams.get("destination") || undefined,
            searchParams.get("date") || undefined
          );
          setBuses(data);
        } else {
          // Load all buses
          setSearched(false);
          const data = await ApiService.getBuses();
          setBuses(data);
        }
      } catch (err: any) {
        console.error("Error loading buses:", err);
        setError(err.message || "Error loading buses. Please try again.");
        setBuses([]);
      } finally {
        setLoading(false);
      }
    };

    loadBuses();
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // At least one field must be filled
    if (!searchData.source && !searchData.destination && !searchData.date) {
      setError("Please enter at least one search criteria");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { ApiService } = await import("../utils/api");
      const data = await ApiService.getBuses(
        searchData.source || undefined,
        searchData.destination || undefined,
        searchData.date || undefined
      );
      setBuses(data);
    } catch (err: any) {
      console.error("Error searching buses:", err);
      setError(err.message || "Error searching buses. Please try again.");
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">Search Buses</h1>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">From</label>
                <input
                  type="text"
                  name="source"
                  value={searchData.source}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                  placeholder="Source (optional)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">To</label>
                <input
                  type="text"
                  name="destination"
                  value={searchData.destination}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                  placeholder="Destination (optional)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={searchData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center">
              * Enter at least one search criteria to filter buses
            </div>
          </form>
        </div>

        {/* Buses List - Show all buses or search results */}
        <div>
          {loading ? (
            <p className="text-center text-gray-600 text-lg py-12">Loading buses...</p>
          ) : buses.length > 0 ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {searched ? "Search Results" : "All Available Buses"}
                </h2>
                <p className="text-gray-600 mt-2">
                  {searched 
                    ? `Found ${buses.length} bus${buses.length !== 1 ? 'es' : ''} matching your criteria`
                    : `Showing ${buses.length} bus${buses.length !== 1 ? 'es' : ''} available for booking`
                  }
                </p>
              </div>
              
              <div className="space-y-4">
                {buses.map((bus) => {
                  const availableSeats = Math.max(0, bus.totalSeats - (bus.seatsBooked?.length || 0));
                  return (
                    <div key={bus._id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{bus.busName}</h3>
                          <p className="text-gray-600">{bus.source} → {bus.destination}</p>
                          <p className="text-sm text-gray-500 mt-1">Service Provider: {bus.createdBy?.name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-700">
                            <span className="font-bold">Departs:</span> {new Date(bus.departureTime).toLocaleString()}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-bold">Arrives:</span> {new Date(bus.arrivalTime).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-700"><span className="font-bold">Available Seats:</span> {availableSeats}</p>
                          <p className="text-gray-700"><span className="font-bold">Price:</span> ₹{bus.price}</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => navigate(`/book/${bus._id}`)}
                            className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition-colors"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center bg-white p-8 rounded-lg shadow-lg">
              <p className="text-gray-600 text-lg">
                {searched ? "No buses found matching your criteria" : "No buses available at the moment"}
              </p>
              {searched && (
                <button
                  onClick={() => {
                    setSearchData({ source: "", destination: "", date: "" });
                    setSearched(false);
                    setLoading(true);
                  }}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  View All Buses
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
