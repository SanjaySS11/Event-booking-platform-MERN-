import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // Set user and token after login/register
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  // Load auth state from localStorage (on app start)
  loadAuth: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token && user) {
        set({ user: JSON.parse(user), token, isAuthenticated: true });
      }
    }
  },

  // Clear auth state on logout
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;