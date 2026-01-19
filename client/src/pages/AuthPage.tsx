// client/src/pages/AuthPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GuestRoute from "@/components/GuestRoute";
import {
  Role,
  loginApi,
  registerApi,
  verifyEmailApi,
} from "../api/auth";

const roleLabels: Record<Role, string> = {
  STUDENT: "Student",
  MENTOR: "Alumni / Mentor",
  ADMIN: "Professor",
};

const AuthPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to dashboard (client-side)
  useEffect(() => {
  if (!user) return;

  if (user.role === "STUDENT") {
    router.replace("/student/dashboard");
  } else if (user.role === "MENTOR") {
    router.replace("/mentor/dashboard");
  } else if (user.role === "ADMIN") {
    router.replace("/admin/dashboard");
  }
}, [user, router]);


  // while redirecting don't render the page
  if (user) return null; // already redirecting

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("STUDENT");
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await registerApi({
          email: form.email,
          password: form.password,
          name: form.name,
          role,
        });
        setInfo("OTP sent to your email.");
        setOtpMode(true);
      } else {
        const res = await loginApi({
          email: form.email,
          password: form.password,
          role,
        });
        
        setUser(res.data.user);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await verifyEmailApi({ email: form.email, otp });
      
      setUser(res.data.user);
      setInfo("Email verified!");
      alert("Verified ✅"); // popup
    } catch (err) {
      const error = err as any;
      setError(error?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const githubUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;


  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1 style={{ textAlign: "center" }}>Login / Signup</h1>

      {/* role tabs */}
      <div style={{ display: "flex", margin: "16px 0" }}>
        {(Object.keys(roleLabels) as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            style={{
              flex: 1,
              padding: 8,
              border:
                r === role ? "2px solid #333" : "1px solid lightgray",
              fontWeight: r === role ? "bold" : "normal",
            }}
          >
            {roleLabels[r]}
          </button>
        ))}
      </div>

      {/* login / signup toggle */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => {
            setMode("login");
            setOtpMode(false);
          }}
          disabled={mode === "login"}
        >
          Login
        </button>
        <button
          style={{ marginLeft: 8 }}
          onClick={() => {
            setMode("signup");
            setOtpMode(false);
          }}
          disabled={mode === "signup"}
        >
          Signup
        </button>
      </div>

      {!otpMode ? (
        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div style={{ marginBottom: 8 }}>
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div style={{ marginBottom: 8 }}>
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Login"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <p>Enter the 6-digit OTP sent to {form.email}</p>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
          <div style={{ marginTop: 8 }}>
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      )}

      {/* GitHub login */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <p>OR</p>
        <a href={githubUrl}>
          <button type="button">Continue with GitHub</button>
        </a>
      </div>

      {info && <p style={{ color: "green" }}>{info}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default function AuthPageWrapper() {
  return (
    <GuestRoute>
      <AuthPage/>
    </GuestRoute>
  );
}