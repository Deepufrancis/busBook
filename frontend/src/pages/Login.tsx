import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const passwordStrong = (pwd: string) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pwd);
  const passwordStrengthLabel = (pwd: string) => {
    const hasLetter = /[A-Za-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const score = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length + (pwd.length >= 8 ? 1 : 0);
    if (!pwd) return { text: "", className: "" };
    if (score >= 4) return { text: "Strong", className: "text-green-600" };
    if (score >= 3) return { text: "Medium", className: "text-yellow-600" };
    return { text: "Weak", className: "text-red-600" };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      await ApiService.login(formData.email, formData.password);
      const role = localStorage.getItem("role");
      navigate(role === "admin" ? "/admin" : "/user");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async () => {
    setError("");
    setInfo("");
    if (!forgotEmail) {
      setError("Enter your email to receive OTP");
      return;
    }
    setLoading(true);
    try {
      await ApiService.requestPasswordReset(forgotEmail);
      setInfo("Reset OTP sent to your email. Check inbox/spam.");
    } catch (err: any) {
      setError(err.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotReset = async () => {
    setError("");
    setInfo("");
    if (!forgotEmail || !forgotOtp || !newPassword) {
      setError("Email, OTP, and new password are required");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }
    if (!passwordStrong(newPassword)) {
      setError("Password must be 6+ chars with a letter, a number, and a special character.");
      return;
    }
    setLoading(true);
    try {
      await ApiService.resetPasswordWithOtp(forgotEmail, forgotOtp, newPassword);
      setInfo("Password reset successful. You can now login.");
      setShowForgot(false);
      setFormData({ email: forgotEmail, password: "" });
    } catch (err: any) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">Login</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {info && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{info}</div>}
        
        {!showForgot && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        )}

        {showForgot && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">OTP</label>
              <input
                type="text"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                placeholder="Enter OTP"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                  placeholder="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {newPassword && (
                <p className={`text-xs mt-1 font-semibold ${passwordStrengthLabel(newPassword).className}`}>
                  Strength: {passwordStrengthLabel(newPassword).text}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-600"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">Password must be 6+ chars with a letter, a number, and a special character.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleForgotRequest}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                type="button"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <button
                onClick={handleForgotReset}
                disabled={loading}
                className="flex-1 bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                type="button"
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-700 mt-4">
          {showForgot ? (
            <button
              onClick={() => setShowForgot(false)}
              className="text-blue-600 font-bold hover:underline"
            >
              Back to Login
            </button>
          ) : (
            <>
              <span>Forgot password? </span>
              <button
                onClick={() => setShowForgot(true)}
                className="text-blue-600 font-bold hover:underline"
              >
                Reset via OTP
              </button>
              <br />
              <span>Don't have an account? </span>
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-600 font-bold hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
