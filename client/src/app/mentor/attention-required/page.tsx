"use client";

import Link from "next/link";
import { AttentionRequired } from "@/components/AttentionRequired";
import { ArrowLeft } from "lucide-react";

export default function AttentionRequiredPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation Bar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/mentor/dashboard" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold">Critical Issues</h1>
          <div className="w-24" />
        </div>
      </nav>

      {/* Main Content */}
      <AttentionRequired />
    </div>
  );
}
