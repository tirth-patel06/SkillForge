"use client";

import type { ReactNode } from "react";
import { StudentLayout } from "@/components/StudentLayout";

export default function StudentSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <StudentLayout>{children}</StudentLayout>;
}
