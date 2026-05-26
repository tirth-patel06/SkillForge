"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import {
  registerApi,
  verifyEmailApi,
  loginApi,
  Role,
} from "@/api/auth";

const roleLabels: Record<Role, string> = {
  STUDENT: "Student",
  MENTOR: "Mentor / Alumni",
  ADMIN: "Professor",
};

function getDashboardRoute(role: Role): string {
  switch (role) {
    case "STUDENT":
      return "/student/dashboard";
    case "MENTOR":
      return "/mentor/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/dashboard";
  }
}

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>("STUDENT");
  const [otpStep, setOtpStep] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInput =
    (field: "name" | "email" | "password") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // 🔹 Centralized redirect based on role
  const redirectToRoleDashboard = (roleFromBackend?: Role | null) => {
    const finalRole = roleFromBackend || role; // fallback to selected role if backend role not returned
    const target = getDashboardRoute(finalRole);
    window.location.href = target;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await registerApi({
          email: form.email,
          password: form.password,
          name: form.name,
          role,
        });
        setOtpStep(true);
        setMessage("OTP sent to your email. Please verify.");
      } else {
        const res = await loginApi({
          email: form.email,
          password: form.password,
          role,
        });

        const userRole: Role | undefined = res?.data?.user?.role;

        setMessage("Login successful! Redirecting…");
        // window.location.href = "/dashboard";
        redirectToRoleDashboard(userRole);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      // 🔹 After OTP verification, you can also have backend return user+token
      const res = await verifyEmailApi({ email: form.email, otp });

      // If API returns role, use it; else fallback to selected role
      const userRole: Role | undefined = res?.data?.user?.role;
      alert("Verified successfully ✅");
      // window.location.href = "/dashboard";
      redirectToRoleDashboard(userRole);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-indigo-900 to-sky-800 p-4">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 animate-fadeIn">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Mentor Hub Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Login or create an account to continue
          </p>
        </div>

        {/* Login / Signup Tabs */}
        <div className="flex mb-5 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setOtpStep(false);
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 pb-2 text-sm font-semibold transition border-b-2 ${
              mode === "login"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setOtpStep(false);
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 pb-2 text-sm font-semibold transition border-b-2 ${
              mode === "signup"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(Object.keys(roleLabels) as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2 px-2 text-xs rounded-full border text-center font-medium transition ${
                role === r
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>

        {/* OTP Step */}
        {otpStep ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Verify your email
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We’ve sent a 6-digit code to{" "}
                <span className="font-medium">{form.email}</span>
              </p>
            </div>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-center tracking-[0.4em] text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        ) : (
          // Login / Signup form
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInput("name")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInput("email")}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleInput("password")}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "signup"
                ? "Create account"
                : "Login"}
            </button>
          </form>
        )}

        {/* Messages */}
        {message && (
          <p className="mt-3 text-xs text-center text-emerald-600">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-3 text-xs text-center text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Tiny animation helper */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out;
        }
      `}</style>
    </main>
  );
}
