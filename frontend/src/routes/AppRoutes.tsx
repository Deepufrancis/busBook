import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import AdminHome from "../pages/AdminHome";
import AddBus from "../pages/AddBus";
import BusesList from "../pages/BusesList";
import ViewBookings from "../pages/ViewBookings";
import UserHome from "../pages/UserHome";
import BusSearch from "../pages/BusSearch";
import BookSeat from "../pages/BookSeat";
import Bookings from "../pages/Bookings";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-bus"
          element={
            <ProtectedRoute requiredRole="admin">
              <AddBus />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buses"
          element={
            <ProtectedRoute requiredRole="admin">
              <BusesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-bookings"
          element={
            <ProtectedRoute requiredRole="admin">
              <ViewBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-bookings/:busId"
          element={
            <ProtectedRoute requiredRole="admin">
              <ViewBookings />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/user"
          element={
            <ProtectedRoute requiredRole="user">
              <UserHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userhome"
          element={
            <ProtectedRoute requiredRole="user">
              <UserHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <BusSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:busId"
          element={
            <ProtectedRoute>
              <BookSeat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
