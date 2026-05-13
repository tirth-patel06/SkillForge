import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, // send cookies
});

const debugApi = process.env.NEXT_PUBLIC_DEBUG_API === "true";

// attach JWT from localStorage if present
api.interceptors.request.use((config) => {
  if (config.headers) {
    delete config.headers["cache-control"];
    delete config.headers["Cache-Control"];
    delete config.headers["pragma"];
    delete config.headers["Pragma"];
  }
  if (typeof window !== "undefined") {
    // Prefer cookies for auth, only use localStorage if cookie is missing
    const hasCookie = document.cookie && document.cookie.includes("token");
    const token = localStorage.getItem("token");
    if (!hasCookie && token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (debugApi) {
        console.log("[api] Sending Authorization header to:", config.url);
      }
    } else if (hasCookie) {
      if (debugApi) {
        console.log("[api] Auth cookie present for:", config.url);
      }
    } else {
      if (debugApi) {
        console.log("[api] No token/cookie for:", config.url);
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (debugApi) {
      const status = error?.response?.status;
      const url = error?.config?.url;
      const data = error?.response?.data;
      console.log("[api] Error:", { url, status, data });
    }
    return Promise.reject(error);
  }
);

