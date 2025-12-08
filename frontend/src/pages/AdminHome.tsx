import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Add Bus</h2>
            <p className="text-gray-700 mb-4">Add a new bus to the system</p>
            <button
              onClick={() => navigate("/add-bus")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Add Bus
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Manage Buses</h2>
            <p className="text-gray-700 mb-4">View and manage all buses</p>
            <button
              onClick={() => navigate("/buses")}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              View Buses
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">View Bookings</h2>
            <p className="text-gray-700 mb-4">View all seat bookings</p>
            <button
              onClick={() => navigate("/view-bookings")}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              View Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
