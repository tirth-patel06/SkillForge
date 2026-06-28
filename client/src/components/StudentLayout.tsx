"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  User,
  Mail,
  Leaf,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/tasks", label: "My Tasks", icon: ListChecks },
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/referrals", label: "Referrals", icon: Mail },
  { href: "/student/contribution", label: "Contributions", icon: Leaf },
];

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return user?.email?.charAt(0)?.toUpperCase() || "S";
  };

  return (
    <div className="flex min-h-screen items-start bg-black text-white">
      <aside className="w-64 shrink-0 self-start sticky top-0 h-screen overflow-y-auto bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold">SkillForge</h1>
          <p className="text-sm text-zinc-400 mt-1">Student Workspace</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname!.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-lg"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-3">
          <Link href="/student/profile">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/60 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-sky-500 flex items-center justify-center shrink-0">
                <span className="text-zinc-900 font-semibold text-sm">
                  {getInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.name || "Student"}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {user?.email || "student@skillforge"}
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen overflow-auto bg-black">{children}</main>
    </div>
  );
}
