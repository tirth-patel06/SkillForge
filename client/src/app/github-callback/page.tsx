"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // adjust alias if needed
import { meApi } from "@/api/auth";

export default function GithubCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (token) {
          localStorage.setItem("token", token);
          // optionally set Authorization header globally if needed
        }
        const res = await meApi();
        setUser(res.data.user);
      } catch (err) {
        console.error("GitHub callback failed", err);
      } finally {
        setDone(true);
        router.replace("/dashboard");
      }
    })();
  }, [router, setUser]);

  return <div>{done ? "Redirecting..." : "Finishing GitHub login..."}</div>;
}