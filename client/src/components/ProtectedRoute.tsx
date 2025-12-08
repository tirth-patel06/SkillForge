// client/src/components/ProtectedRoute.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/api/auth";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: Role[]; // optional role filter
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not logged in → go to /auth (but don't re-redirect /auth to itself)
    if (!user) {
      if (pathname !== "/auth") {
        router.replace("/auth");
      }
      return;
    }

    // Logged in but wrong role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const target =
        user.role === "STUDENT"
          ? "/student/dashboard"
          : user.role === "MENTOR"
          ? "/mentor/dashboard"
          : "/admin/dashboard";

      // only redirect if not already at target
      if (pathname !== target) {
        router.replace(target);
      }
    }
  }, [loading, user, allowedRoles, router, pathname]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return children;
};

export default ProtectedRoute;
