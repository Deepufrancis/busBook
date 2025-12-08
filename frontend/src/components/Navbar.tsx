import { Link, useNavigate, useLocation } from "react-router-dom";
import { ApiService } from "../utils/api";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role"); // "admin" or "user"
  const name = localStorage.getItem("name");
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    ApiService.logout();
    setMobileMenuOpen(false);
    setShowLogoutModal(false);
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="w-full bg-blue-600 text-white px-4 md:px-6 py-3 shadow">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <h1 
          className="font-bold text-lg md:text-xl cursor-pointer hover:text-blue-100 transition" 
          onClick={() => {
            navigate("/");
            closeMobileMenu();
          }}
        >
          BusBook
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {!isAuthPage && (
            <>
              {role === "admin" ? (
                <>
                  <Link to="/admin" className="hover:text-blue-100 transition">Dashboard</Link>
                  <Link to="/add-bus" className="hover:text-blue-100 transition">Add Bus</Link>
                </>
              ) : role === "user" ? (
                <>
                  <Link to="/userhome" className="hover:text-blue-100 transition">Home</Link>
                  <Link to="/search" className="hover:text-blue-100 transition">Search</Link>
                  <Link to="/bookings" className="hover:text-blue-100 transition">My Bookings</Link>
                </>
              ) : null}

              {name && <span className="font-medium">{name}</span>}

              <button
                onClick={handleLogoutClick}
                className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-200 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        {!isAuthPage && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1 focus:outline-none"
          >
            <span className={`h-0.5 w-6 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`h-0.5 w-6 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`h-0.5 w-6 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {!isAuthPage && mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-blue-500 pt-4">
          {role === "admin" ? (
            <>
              <Link 
                to="/admin" 
                className="block px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link 
                to="/add-bus" 
                className="block px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={closeMobileMenu}
              >
                Add Bus
              </Link>
            </>
          ) : role === "user" ? (
            <>
              <Link 
                to="/userhome" 
                className="block px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/search" 
                className="block px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={closeMobileMenu}
              >
                Search
              </Link>
              <Link 
                to="/bookings" 
                className="block px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={closeMobileMenu}
              >
                My Bookings
              </Link>
            </>
          ) : null}

          {name && (
            <div className="px-4 py-2 text-sm font-medium text-blue-100">
              Logged in as: {name}
            </div>
          )}

          <button
            onClick={handleLogoutClick}
            className="w-full bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200 transition font-semibold"
          >
            Logout
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to logout from BusBook?</p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
