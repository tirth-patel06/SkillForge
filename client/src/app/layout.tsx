import "./globals.css";
import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "SkillForge",
  description: "Mentor platform",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
