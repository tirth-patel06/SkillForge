"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { meApi } from "@/api/auth";

export default function GithubCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token && process.env.NODE_ENV !== "production") {
          localStorage.setItem("token", token);
        }

        const user = await meApi(); // returns user
        setUser(user);

        const target =
          user.role === "MENTOR"
            ? "/mentor/dashboard"
            : user.role === "STUDENT"
            ? "/student/dashboard"
            : user.role === "ADMIN"
            ? "/admin/dashboard"
            : "/";

        router.replace(target);
      } catch (err) {
        console.error("GitHub callback failed", err);
        router.replace("/auth");
      }
    })();
  }, [router, setUser]);

  return <div>Finishing GitHub login…</div>;
}
