"use client";

import { io, Socket } from "socket.io-client";

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// 🔥 strip /api for socket connection
const SOCKET_URL = RAW_API_URL.replace(/\/api$/, "");

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true, // safe default
    });

    socket.on("connect", () => {
      console.log("🔌 client socket connected", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ client socket connect_error:", err.message);
    });
  }

  return socket;
}
