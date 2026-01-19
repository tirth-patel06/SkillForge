// client/src/app/student/contribution/page.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ContributionDashboard from "@/components/contribution/ContributionDashboard";

export default function StudentContributionPage() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <main className="min-h-screen bg-[#02040b] text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Page Header */}
          <section className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Contributions
            </h1>
            <p className="text-sm text-slate-400">
              Detailed view of your activity, impact, and consistency.
            </p>
          </section>

          {/* Contribution Dashboard */}
          <ContributionDashboard />
        </div>
      </main>
    </ProtectedRoute>
  );
}
