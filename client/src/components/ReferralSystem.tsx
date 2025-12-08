import { useEffect, useState } from "react";
import type React from "react";
import { api } from "@/lib/api";
import { Plus, X, Send, FileText, Link as LinkIcon, User } from "lucide-react";

type Student = {
  id: string;
  name: string;
  email: string;
};

type ReferralForm = {
  student_id: string;
  recommendation: string;
  evidence_links: string[];
};

type SavedReferral = {
  id: string;
  student_name: string;
  recommendation: string;
  evidence_links: string[];
  status: string;
  created_at: string;
};

export function ReferralSystem() {
  const [students, setStudents] = useState<Student[]>([]);
  const [referrals, setReferrals] = useState<SavedReferral[]>([]);
  const [form, setForm] = useState<ReferralForm>({
    student_id: "",
    recommendation: "",
    evidence_links: [],
  });
  const [linkInput, setLinkInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [studentsRes, referralsRes] = await Promise.all([
        api.get<Student[]>("/students"),
        api.get<SavedReferral[]>("/referrals/my"),
      ]);

      setStudents(studentsRes.data || []);
      setReferrals(referralsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  const addLink = () => {
    if (linkInput.trim() && !form.evidence_links.includes(linkInput.trim())) {
      setForm({
        ...form,
        evidence_links: [...form.evidence_links, linkInput.trim()],
      });
      setLinkInput("");
    }
  };

  const removeLink = (link: string) => {
    setForm({
      ...form,
      evidence_links: form.evidence_links.filter((l) => l !== link),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await api.post("/referrals", {
        studentId: form.student_id,
        recommendation: form.recommendation,
        evidenceLinks: form.evidence_links,
        // status is optional; backend defaults to "PENDING"
      });

      setMessage("Referral created successfully!");
      setForm({
        student_id: "",
        recommendation: "",
        evidence_links: [],
      });
      await loadData();
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-300";
      case "ACCEPTED":
        return "bg-blue-500/20 text-blue-300";
      case "REJECTED":
        return "bg-red-500/20 text-red-300";
      case "APPROVED":
        return "bg-green-500/20 text-green-300";
      case "REMOVED":
        return "bg-zinc-500/20 text-zinc-200";
      default:
        return "bg-zinc-500/20 text-zinc-300";
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-zinc-900 rounded-xl" />
            <div className="h-96 bg-zinc-900 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Referral System</h2>
        <p className="text-zinc-400">Create and manage student referrals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Create New Referral
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Select Student <span className="text-red-400 ml-1">*</span>
              </label>
              <select
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Recommendation <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.recommendation}
                onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your recommendation for this student..."
                required
              />
              <p className="text-xs text-zinc-500 mt-2">
                {form.recommendation.length} characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center">
                <LinkIcon className="w-4 h-4 mr-2" />
                Evidence Links
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/student/project"
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {form.evidence_links.length > 0 && (
                <div className="space-y-2">
                  {form.evidence_links.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg"
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-blue-400 hover:text-blue-300 truncate mr-3"
                      >
                        {link}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeLink(link)}
                        className="text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.startsWith("Error")
                    ? "bg-red-900/20 border border-red-800 text-red-200"
                    : "bg-green-900/20 border border-green-800 text-green-200"
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    student_id: "",
                    recommendation: "",
                    evidence_links: [],
                  });
                  setMessage("");
                }}
                className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
                <span>{submitting ? "Generating..." : "Generate Referral"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* History */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Referral History</h3>

          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">No referrals created yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold mb-1">
                        {referral.student_name}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {new Date(referral.created_at).toLocaleDateString()} at{" "}
                        {new Date(referral.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        referral.status
                      )}`}
                    >
                      {referral.status}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 line-clamp-3 mb-3">
                    {referral.recommendation}
                  </p>

                  {referral.evidence_links.length > 0 && (
                    <div className="flex items-center text-xs text-zinc-500">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      {referral.evidence_links.length} evidence link
                      {referral.evidence_links.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
