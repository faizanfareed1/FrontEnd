// src/config/api.ts
import axios, { InternalAxiosRequestConfig, AxiosHeaders } from "axios";

// ------------------------
// Environment / Base URL
// ------------------------
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper to build full URLs
export const apiUrl = (path: string) => `${API_URL}${path}`;

// ------------------------
// Axios instance
// ------------------------
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to attach auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");

      if (token) {
        // Ensure headers exist as AxiosHeaders
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }

        // Type-safe setting of Authorization header
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------
// Exports
// ------------------------
export default api;
