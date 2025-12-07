// client/src/pages/GithubCallback.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { meApi } from "../api/auth";

const GithubCallback: React.FC = () => {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (token) {
          localStorage.setItem("token", token);
        }
        const res = await meApi();
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setDone(true);
        router.replace("/dashboard");
      }
    })();
  }, [router, setUser]);

  if (!done && !user) return <div>Finishing GitHub login...</div>;
  return null; // we've redirected
};

export default GithubCallback;
