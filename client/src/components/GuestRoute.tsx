"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Props = { children: React.ReactNode };

export default function GuestRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // if auth resolved and user exists, redirect to dashboard
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading) return <div>Loading...</div>;

  // if user exists we already triggered redirect — render nothing
  if (user) return null;

  return <>{children}</>;
}