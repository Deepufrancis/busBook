import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-blue-600 drop-shadow-lg">404</h1>
        </div>

        <h2 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
          
          <button
            onClick={() => navigate("/user")}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Home
          </button>
        </div>

        <div className="mt-12 text-6xl">🚌</div>
        <p className="text-sm text-gray-500 mt-4">BusBook - Your trusted bus booking platform</p>
      </div>
    </div>
  );
}
