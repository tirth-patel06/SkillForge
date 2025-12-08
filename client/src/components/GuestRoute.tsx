// client/src/components/GuestRoute.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Props = { children: React.ReactNode };

export default function GuestRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !user) return;

    const target =
      user.role === "STUDENT"
        ? "/student/dashboard"
        : user.role === "MENTOR"
        ? "/mentor/dashboard"
        : "/admin/dashboard";

        console.log("user.role:", user.role);

    // 🔐 Avoid redirecting to the same page again and again
    if (pathname !== target) {
      router.replace(target);
    }
  }, [loading, user, router, pathname]);
  console.log("GuestRoute user.role:", user?.role);

  if (loading) return <div>Loading...</div>;
  if (user) return null; // we already triggered redirect

  return <>{children}</>;
}