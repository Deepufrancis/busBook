const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface ApiError {
  message: string;
  status: number;
}

export class ApiService {
  private static getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static async handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
      throw {
        message: data.message || "An error occurred",
        status: response.status,
      } as ApiError;
    }
    return data;
  }

  // Auth endpoints
  static async signup(name: string, email: string, password: string, role: string = "user") {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    return this.handleResponse(response);
  }

  static async verifySignupOtp(email: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return this.handleResponse(response);
  }

  static async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Include cookies in request
      body: JSON.stringify({ email, password }),
    });
    const data = await this.handleResponse(response);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("role", data.user.role || "user");
      // Refresh token is stored in httpOnly cookie by the backend
    }
    return data;
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    // Clear refresh token cookie by calling logout endpoint
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(err => console.error("Logout error:", err));
  }

  static async requestPasswordReset(email: string) {
    const response = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  static async resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return this.handleResponse(response);
  }

  // Bus endpoints
  static async getBus(busId: string) {
    const response = await fetch(`${API_BASE_URL}/buses/${busId}`, {
      headers: this.getAuthHeader(),
    });
    return this.handleResponse(response);
  }

  static async getBuses(source?: string, destination?: string, date?: string) {
    const params = new URLSearchParams();
    if (source) params.append("source", source);
    if (destination) params.append("destination", destination);
    if (date) params.append("date", date);

    const response = await fetch(
      `${API_BASE_URL}/buses?${params.toString()}`,
      {
        headers: this.getAuthHeader(),
      }
    );
    return this.handleResponse(response);
  }

  static async getMyBuses() {
    const response = await fetch(`${API_BASE_URL}/buses/mine`, {
      headers: this.getAuthHeader(),
    });
    return this.handleResponse(response);
  }

  static async addBus(busData: {
    busName: string;
    source: string;
    destination: string;
    date: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    totalSeats: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/buses`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(busData),
    });
    return this.handleResponse(response);
  }

  // Seat locking and booking
  static async lockSeats(busId: string, seats: number[], passengerName?: string, passengerEmail?: string) {
    const response = await fetch(`${API_BASE_URL}/buses/lock/${busId}`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ seats, passengerName, passengerEmail }),
    });
    return this.handleResponse(response);
  }

  static async unlockSeats(busId: string, seats: number[]) {
    const response = await fetch(`${API_BASE_URL}/buses/unlock/${busId}`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ seats }),
    });
    return this.handleResponse(response);
  }

  static async confirmBooking(
    busId: string,
    seats: number[],
    passengerName: string,
    passengerEmail: string
  ) {
    const response = await fetch(`${API_BASE_URL}/buses/confirm/${busId}`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({
        seats,
        passengerName,
        passengerEmail,
      }),
    });
    return this.handleResponse(response);
  }

  // Booking endpoints
  static async createBooking(bookingData: {
    busId: string;
    userId: string;
    passengerName: string;
    passengerEmail: string;
    seats: number[];
    totalPrice: number;
    transactionId?: string;
  }) {
    console.log("[API] createBooking called with:", bookingData);
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(bookingData),
    });
    const result = await this.handleResponse(response);
    console.log("[API] createBooking response:", result);
    return result;
  }

  static async getUserBookings(userId: string) {
    console.log("[API] getUserBookings called with userId:", userId);
    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
      headers: this.getAuthHeader(),
    });
    const result = await this.handleResponse(response);
    console.log("[API] getUserBookings response:", result);
    return result;
  }

  static async getBusBookings(busId: string) {
    console.log("[API] getBusBookings called with busId:", busId);
    const response = await fetch(`${API_BASE_URL}/bookings/bus/${busId}`, {
      headers: this.getAuthHeader(),
    });
    const result = await this.handleResponse(response);
    console.log("[API] getBusBookings response:", result);
    return result;
  }

  static async cancelBooking(bookingId: string) {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });
    return this.handleResponse(response);
  }

  // Payment endpoints
  static async processPayment(paymentData: {
    bookingId?: string;
    amount: number;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }) {
    console.log("[API] processPayment called with:", { ...paymentData, cardNumber: "****" });
    const response = await fetch(`${API_BASE_URL}/payments/process`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(paymentData),
    });
    const result = await this.handleResponse(response);
    console.log("[API] processPayment response:", result);
    return result;
  }
}
