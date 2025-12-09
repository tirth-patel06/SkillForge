import { redirect } from "next/navigation";

"use client";

import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/LandingPage";

export default function HomePage() {
  return redirect("/auth");
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth");
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
}
