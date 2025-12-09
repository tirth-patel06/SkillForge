import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, // send cookies
});

// attach JWT from localStorage if present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Prefer cookies for auth, only use localStorage if cookie is missing
    const hasCookie = document.cookie && document.cookie.includes("token");
    const token = localStorage.getItem("token");
    if (!hasCookie && token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("📤 Sending request with Authorization header to:", config.url);
    } else if (hasCookie) {
      console.log("🍪 Auth cookie present, not setting Authorization header for:", config.url);
    } else {
      console.log("⚠️ No token/cookie for request to:", config.url);
    }
  }
  return config;
});

