import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddBus() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    source: "",
    destination: "",
    departure: "",
    arrival: "",
    seats: "",
    price: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.source || !formData.destination || !formData.price) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const { ApiService } = await import("../utils/api");
      await ApiService.addBus({
        busName: formData.name,
        source: formData.source,
        destination: formData.destination,
        date: formData.departure.split("T")[0],
        departureTime: formData.departure,
        arrivalTime: formData.arrival,
        price: parseInt(formData.price),
        totalSeats: parseInt(formData.seats),
      });
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to add bus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">Add New Bus</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Bus Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
              placeholder="Enter bus name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Source</label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                placeholder="Starting point"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                placeholder="End point"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Departure Time</label>
              <input
                type="datetime-local"
                name="departure"
                value={formData.departure}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Arrival Time</label>
              <input
                type="datetime-local"
                name="arrival"
                value={formData.arrival}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Total Seats</label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                placeholder="e.g., 50"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Price per Seat</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                placeholder="e.g., 500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Adding..." : "Add Bus"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="flex-1 bg-gray-400 text-white font-bold py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
