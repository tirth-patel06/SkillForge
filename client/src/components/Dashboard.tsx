"use client";

import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    // optional: you can redirect to /auth here instead
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold">
            Welcome, {user.name || user.email}
          </h1>
          <p className="text-xs text-slate-400">Role: {user.role}</p>
        </div>

        <div className="flex items-center gap-3">
          {user.verified && (
            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-950/60 border border-emerald-700/60 px-2 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Verified
            </span>
          )}
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="p-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p className="text-sm text-slate-400 mb-4">
            This is a protected page. Only logged-in users can access this.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-1">Email</h3>
              <p className="text-xs text-slate-300">{user.email}</p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-1">Role</h3>
              <p className="text-xs text-slate-300">{user.role}</p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-1">Status</h3>
              <p className="text-xs text-slate-300">
                {user.verified ? "Verified ✅" : "Pending verification"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
