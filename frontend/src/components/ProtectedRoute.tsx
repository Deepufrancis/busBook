import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuthToken, getUserRole } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check auth immediately (localStorage is synchronous)
    const token = getAuthToken();
    const role = getUserRole();

    if (!token) {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    if (requiredRole && role !== requiredRole) {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [requiredRole]);

  // Show loading only during initial check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authorized
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
