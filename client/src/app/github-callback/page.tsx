// client/src/app/github-callback/page.tsx
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

        if (token) {
          localStorage.setItem("token", token);
        }

        const user = await meApi(); // your meApi returns user
        setUser(user);

        // ✅ ROLE-BASED REDIRECT
        if (user.role === "MENTOR") {
          router.replace("/mentor/dashboard");
        } 
        if (user.role === "STUDENT") {
          router.replace("/student/dashboard");
        } 
        if (user.role === "ADMIN") {
          router.replace("/admin/dashboard");
        } 
        else {
          router.replace("student/dashboard");
        }
      } catch (err) {
        console.error("GitHub callback failed", err);
        router.replace("/auth");
      }
    })();
  }, [router, setUser]);

  return <div>Finishing GitHub login...</div>;
}
