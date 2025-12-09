// client/src/lib/socket.ts
"use client";

import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket"],
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
