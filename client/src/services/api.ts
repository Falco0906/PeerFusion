// client/src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  try {
    const token = (typeof window !== "undefined") ? localStorage.getItem("token") : null;
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) { /* ignore */ }
  return config;
});

// Global response handling (401 => clear token)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // optional: redirect to login (consumer can react to auth change)
      }
    }
    return Promise.reject(err);
  }
);

export default api;
