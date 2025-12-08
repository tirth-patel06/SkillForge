import { useEffect, useState } from "react";
import type React from "react";
import { api } from "@/lib/api";
import { Clock, CheckCircle, Users, Send, TrendingUp, AlertCircle } from "lucide-react";

type DashboardStats = {
  pendingReviews: number;
  activeTasks: number;
  teamsNeedingAttention: number;
  referralRequests: number;
  recentSubmissions: Array<{
    id: string;
    student_name: string;
    task_title: string;
    submitted_at: string;
  }>;
  taskProgress: Array<{
    task_title: string;
    completion_rate: number;
  }>;
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingReviews: 0,
    activeTasks: 0,
    teamsNeedingAttention: 0,
    referralRequests: 0,
    recentSubmissions: [],
    taskProgress: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      const { data } = await api.get<DashboardStats>("/mentors/dashboard");
      setStats(data);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-zinc-900 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-zinc-400">Overview of your mentoring activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          subtitle="submissions waiting"
          icon={Clock}
          color="from-orange-500 to-red-500"
        />
        <StatCard
          title="Active Tasks"
          value={stats.activeTasks}
          subtitle="ongoing assignments"
          icon={CheckCircle}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Needing Attention"
          value={stats.teamsNeedingAttention}
          subtitle="require follow-up"
          icon={AlertCircle}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Referral Requests"
          value={stats.referralRequests}
          subtitle="pending referrals"
          icon={Send}
          color="from-green-500 to-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Submissions</h3>
            <Clock className="w-5 h-5 text-zinc-400" />
          </div>

          {stats.recentSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-400">No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-start justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium mb-1">{submission.student_name}</p>
                    <p className="text-sm text-zinc-400 mb-2">{submission.task_title}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(submission.submitted_at).toLocaleDateString()} at{" "}
                      {new Date(submission.submitted_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <button className="px-3 py-1 text-sm bg-zinc-800 rounded hover:bg-zinc-700 transition-colors">
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <TrendingUp className="w-5 h-5 text-zinc-400" />
          </div>

          <div className="space-y-3">
            <ActionButton
              title="Create New Task"
              description="Add a new assignment with rubric"
              icon={FileTextIcon}
            />
            <ActionButton
              title="Review Submissions"
              description="Grade pending student work"
              icon={CheckCircle}
            />
            <ActionButton
              title="Write Referral"
              description="Recommend a student"
              icon={Users}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
};

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-linear-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-zinc-400 text-sm mb-1">{title}</p>
        <p className="text-4xl font-bold mb-1">{value}</p>
        <p className="text-zinc-500 text-xs">{subtitle}</p>
      </div>
    </div>
  );
}

type ActionButtonProps = {
  title: string;
  description: string;
  icon: React.ElementType;
};

function ActionButton({ title, description, icon: Icon }: ActionButtonProps) {
  return (
    <button className="w-full flex items-start space-x-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all text-left">
      <div className="p-2 bg-zinc-800 rounded-lg">
        <Icon className="w-5 h-5 text-zinc-300" />
      </div>
      <div className="flex-1">
        <p className="font-medium mb-1">{title}</p>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </button>
  );
}




function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    
  );
}
