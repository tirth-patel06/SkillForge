import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, // send cookies
});

// attach JWT from localStorage if present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    console.log("📋 localStorage.getItem('token'):", token ? "✓ found" : "✗ NOT found");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("📤 Sending request with Authorization header to:", config.url);
    } else {
      console.log("⚠️ No token in localStorage for request to:", config.url);
    }
  }
  return config;
});

