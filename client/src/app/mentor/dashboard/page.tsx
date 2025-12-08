"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MentorLayout } from "@/components/MentorLayout";
import { Dashboard } from "@/components/Dashboard";
import { TaskCreation } from "@/components/TaskCreation";
import { SubmissionReview } from "@/components/SubmissionReview";
import { ReferralSystem } from "@/components/ReferralSystem";
import { MyTasks } from "@/components/MyTasks";
import { useAuth } from "@/context/AuthContext";
import { logoutApi } from "@/api/auth";

type Page = "dashboard" | "my-tasks" | "create-task" | "reviews" | "referrals";

function MentorDashboardInner() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutApi();
      await logout();
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API fails
      await logout();
      router.push("/auth");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "my-tasks":
        return <MyTasks />;
      case "create-task":
        return <TaskCreation />;
      case "reviews":
        return <SubmissionReview />;
      case "referrals":
        return <ReferralSystem />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MentorLayout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
      user={user || undefined}
      onLogout={handleLogout}
    >
      {renderPage()}
    </MentorLayout>
  );
}

export default function MentorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["MENTOR"]}>
      <MentorDashboardInner />
    </ProtectedRoute>
  );
}