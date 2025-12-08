export const getAuthToken = () => localStorage.getItem("token");
export const getUserId = () => localStorage.getItem("userId");
export const getUserName = () => localStorage.getItem("name");
export const getUserEmail = () => localStorage.getItem("email");
export const getUserRole = () => localStorage.getItem("role");
export const isLoggedIn = () => !!getAuthToken();
export const isAdmin = () => getUserRole() === "admin";
export const isUser = () => getUserRole() === "user";
