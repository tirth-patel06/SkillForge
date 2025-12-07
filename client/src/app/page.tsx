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
    <MentorLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </MentorLayout>
  );
}
