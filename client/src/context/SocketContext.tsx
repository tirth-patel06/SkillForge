"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext"; // adjust if needed

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth(); // must contain user.id

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(
        process.env.NEXT_PUBLIC_API_URL!.replace("/api", ""),
        {
          withCredentials: true,
        }
      );
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ✅ JOIN USER ROOM
  useEffect(() => {
    if (!user?.id || !socketRef.current) return;

    socketRef.current.emit("join:user", user.id);
  }, [user?.id]);

  // ✅ LISTEN FOR CONTRIBUTION UPDATES
  useEffect(() => {
    if (!socketRef.current) return;
    console.log("🔥 contribution:update received");
    const handler = () => {
      window.dispatchEvent(new Event("contribution-refresh"));
    };

    socketRef.current.on("contribution:update", handler);

    return () => {
      socketRef.current?.off("contribution:update", handler);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}
