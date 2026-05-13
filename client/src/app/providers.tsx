// client/src/app/providers.tsx
"use client";

import { AuthProvider } from "@/context/AuthContext";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
