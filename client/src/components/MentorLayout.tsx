import { LayoutDashboard, FileText, ClipboardCheck, Users, LogOut, ListChecks, AlertTriangle, CheckCircle2 } from "lucide-react";
import type React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type PageId = "dashboard" | "create-task" | "my-tasks" | "reviews" | "referrals";

type User = {
  id: string;
  name?: string;
  email: string;
  role: "MENTOR" | "STUDENT" | "ADMIN";
  profilePhotoUrl?: string;
};

type MentorLayoutProps = {
  children: React.ReactNode;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  user?: User;
  onLogout?: () => void;
};

export function MentorLayout({ children, currentPage, onNavigate, user, onLogout }: MentorLayoutProps) {
  const navItems = [
    { id: "dashboard" as const, icon: LayoutDashboard, label: "Dashboard" },
    { id: "my-tasks" as const, icon: ListChecks, label: "My Tasks" },
    { id: "create-task" as const, icon: FileText, label: "Create Task" },
    { id: "reviews" as const, icon: ClipboardCheck, label: "Reviews" },
    { id: "referrals" as const, icon: Users, label: "Referrals" },
  ];

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch profile photo on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfilePhoto = async () => {
      try {
        setLoading(true);
        const res = await api.get("/mentors/me/profile");
        if (res.data.profile?.profilePhotoUrl) {
          setProfilePhoto(res.data.profile.profilePhotoUrl);
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePhoto();
  }, [user?.id]);

  // Get initials from name or email
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold">Mentor Hub</h1>
          <p className="text-sm text-zinc-400 mt-1">Task & Review System</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-lg"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Attention Required Section */}
        <div className="p-4 border-t border-zinc-800">
          <Link href="/mentor/attention-required">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-900/20 border border-red-800/50 hover:bg-red-900/30 transition-colors cursor-pointer">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-300">Critical Issues</p>
                <p className="text-xs text-red-400/70">View attention required</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Resolution History Section */}
        <div className="p-4 border-t border-zinc-800">
          <Link href="/mentor/resolved-history">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer">
              <CheckCircle2 className="w-5 h-5 text-zinc-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-300">Resolution History</p>
                <p className="text-xs text-zinc-500">View resolved issues</p>
              </div>
            </div>
          </Link>
        </div>        <div className="p-4 border-t border-zinc-800 space-y-3">
          {/* Profile Section */}
          <Link href="/mentor/profile">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0 overflow-hidden">
                {profilePhoto && !loading ? (
                  <img
                    src={profilePhoto}
                    alt={user?.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">{getInitials()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-zinc-400 truncate">{user?.email || "user@example.com"}</p>
              </div>
            </div>
          </Link>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-black">{children}</main>
    </div>
  );
}
