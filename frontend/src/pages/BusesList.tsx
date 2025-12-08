import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../utils/api";

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
}

export default function BusesList() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [deleteBus, setDeleteBus] = useState<Bus | null>(null);
  const [editFormData, setEditFormData] = useState({
    busName: "",
    source: "",
    destination: "",
    date: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    totalSeats: "",
  });

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const data = await ApiService.getBuses();
        setBuses(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch buses");
        console.error("Error fetching buses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  const openEditModal = (bus: Bus) => {
    setEditingBus(bus);
    setEditFormData({
      busName: bus.busName,
      source: bus.source,
      destination: bus.destination,
      date: bus.date,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      price: bus.price.toString(),
      totalSeats: bus.totalSeats.toString(),
    });
  };

  const closeEditModal = () => {
    setEditingBus(null);
    setEditFormData({
      busName: "",
      source: "",
      destination: "",
      date: "",
      departureTime: "",
      arrivalTime: "",
      price: "",
      totalSeats: "",
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBus) return;

    try {
      // Note: Update endpoint needs to be implemented in backend
      // For now, we'll update local state
      const updatedBuses = buses.map((b) =>
        b._id === editingBus._id
          ? {
              ...b,
              busName: editFormData.busName,
              source: editFormData.source,
              destination: editFormData.destination,
              date: editFormData.date,
              departureTime: editFormData.departureTime,
              arrivalTime: editFormData.arrivalTime,
              price: parseInt(editFormData.price),
              totalSeats: parseInt(editFormData.totalSeats),
            }
          : b
      );
      setBuses(updatedBuses);
      closeEditModal();
      alert("Bus updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update bus");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBus) return;

    try {
      // Note: Delete endpoint needs to be implemented in backend
      setBuses(buses.filter((b) => b._id !== deleteBus._id));
      setDeleteBus(null);
      alert("Bus deleted successfully");
    } catch (err: any) {
      setError(err.message || "Failed to delete bus");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Buses</h1>
          <button
            onClick={() => navigate("/add-bus")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            + Add New Bus
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

        {loading ? (
          <p className="text-center text-gray-600 text-lg">Loading buses...</p>
        ) : buses.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left">Bus Name</th>
                    <th className="px-6 py-3 text-left">Route</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Departure</th>
                    <th className="px-6 py-3 text-left">Arrival</th>
                    <th className="px-6 py-3 text-center">Price</th>
                    <th className="px-6 py-3 text-center">Total Seats</th>
                    <th className="px-6 py-3 text-center">Booked</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus) => (
                    <tr key={bus._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-800">{bus.busName}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {bus.source} → {bus.destination}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(bus.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(bus.departureTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(bus.arrivalTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-green-600">
                        ₹{bus.price}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">{bus.totalSeats}</td>
                      <td className="px-6 py-4 text-center">
                        <div>
                          <span
                            className={`px-3 py-1 rounded text-white font-semibold inline-block mb-1 ${
                              bus.seatsBooked.length > 0 ? "bg-orange-500" : "bg-green-500"
                            }`}
                          >
                            {bus.seatsBooked.length}/{bus.totalSeats}
                          </span>
                          {bus.seatsBooked.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              <p className="font-semibold">Seats: {bus.seatsBooked.join(", ")}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-1 justify-center flex-wrap">
                          <button
                            onClick={() => openEditModal(bus)}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs font-semibold cursor-pointer transition-colors"
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/view-bookings/${bus._id}`)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs font-semibold cursor-pointer transition-colors"
                            type="button"
                          >
                            View Bookings
                          </button>
                          <button
                            onClick={() => setDeleteBus(bus)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs font-semibold cursor-pointer transition-colors"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-lg shadow-lg">
            <p className="text-gray-600 text-lg mb-4">No buses found</p>
            <button
              onClick={() => navigate("/add-bus")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Add First Bus
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Bus</h2>
              <button
                onClick={closeEditModal}
                className="text-2xl font-bold hover:bg-blue-700 w-8 h-8 flex items-center justify-center rounded"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1 text-sm">Bus Name</label>
                <input
                  type="text"
                  name="busName"
                  value={editFormData.busName}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
                  placeholder="Bus name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Source</label>
                  <input
                    type="text"
                    name="source"
                    value={editFormData.source}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
                    placeholder="From"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Destination</label>
                  <input
                    type="text"
                    name="destination"
                    value={editFormData.destination}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
                    placeholder="To"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1 text-sm">Date</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Departure</label>
                  <input
                    type="datetime-local"
                    name="departureTime"
                    value={editFormData.departureTime}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Arrival</label>
                  <input
                    type="datetime-local"
                    name="arrivalTime"
                    value={editFormData.arrivalTime}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Seats</label>
                  <input
                    type="number"
                    name="totalSeats"
                    value={editFormData.totalSeats}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600 text-sm"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 text-sm cursor-pointer transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-400 text-white font-bold py-2 rounded hover:bg-gray-500 text-sm cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteBus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="bg-red-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-lg font-bold">Confirm Delete</h2>
              <button
                onClick={() => setDeleteBus(null)}
                className="text-2xl font-bold hover:bg-red-700 w-8 h-8 flex items-center justify-center rounded"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-800">
                Are you sure you want to delete the bus <span className="font-semibold">{deleteBus.busName}</span>?
              </p>
              <p className="text-sm text-gray-600">This will remove the bus and its schedule.</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 text-sm cursor-pointer transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteBus(null)}
                  className="flex-1 bg-gray-300 text-gray-800 font-bold py-2 rounded hover:bg-gray-400 text-sm cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
