"use client";

import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/LandingPage";

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth");
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
}