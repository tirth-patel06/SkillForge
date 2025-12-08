import { useState } from "react";
import { MentorLayout } from "@/components/MentorLayout";
import { Dashboard } from "@/components/Dashboard";
import { TaskCreation } from "@/components/TaskCreation";
import { SubmissionReview } from "@/components/SubmissionReview";
import { ReferralSystem } from "@/components/ReferralSystem";

type Page = "dashboard" | "tasks" | "reviews" | "referrals";

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
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
    <main style={{ padding: 20 }}>
      <h1>Hustle Haveli — Home</h1>
      <p>
        App is running. Go to <a href="/auth">/auth</a> or <a href="/dashboard">/dashboard</a>.
      </p>
    </main>
  );
}