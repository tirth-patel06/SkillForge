import { useEffect, useState } from "react";
import type React from "react";
import { api } from "@/lib/api";
import {
  ChevronRight,
  ExternalLink,
  FileCode,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
} from "lucide-react";

type Submission = {
  id: string;
  task_id: string;
  student_id: string;
  version: number;
  github_url?: string;
  file_urls?: string[];
  notes?: string;
  status: string;
  submitted_at: string;
  student_name: string;
  task_title: string;
};

type RubricCriteria = {
  id: string;
  name: string;
  description: string;
  weightage: number;
};

type Score = {
  criteria_id: string;
  score: number;
  feedback: string;
};

export function SubmissionReview() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (selectedSubmission) {
      loadRubricCriteria(selectedSubmission.task_id);
    } else {
      setRubricCriteria([]);
      setScores([]);
    }
  }, [selectedSubmission]);

  async function loadSubmissions() {
    try {
      const { data } = await api.get<Submission[]>("/submissions", {
        params: { status: "PENDING" },
      });

      setSubmissions(data || []);
      if (data && data.length > 0) {
        setSelectedSubmission(data[0]);
      } else {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRubricCriteria(taskId: string) {
    try {
      const { data } = await api.get<RubricCriteria[]>(`/tasks/rubric/${taskId}`);
      setRubricCriteria(data || []);
      setScores(
        (data || []).map((c) => ({
          criteria_id: c.id,
          score: 0,
          feedback: "",
        }))
      );
    } catch (error) {
      console.error("Error loading rubric criteria:", error);
    }
  }

  const updateScore = (criteriaId: string, field: "score" | "feedback", value: number | string) => {
    setScores((prev) =>
      prev.map((s) => (s.criteria_id === criteriaId ? { ...s, [field]: value } : s))
    );
  };

  const handleReview = async (newStatus: "APPROVED" | "CHANGES_REQUESTED") => {
    if (!selectedSubmission) return;

    setSubmitting(true);
    setMessage("");

    try {
      await api.post(`/submissions/${selectedSubmission.id}/review`, {
        scores,
        generalFeedback,
        status: newStatus,
      });

      setMessage(
        `Submission ${
          newStatus === "APPROVED" ? "approved" : "marked for changes"
        } successfully!`
      );

      await loadSubmissions();
      setGeneralFeedback("");
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-80 bg-zinc-950 border-r border-zinc-800 animate-pulse">
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-zinc-900 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="h-8 bg-zinc-900 rounded w-64 mb-4" />
          <div className="h-32 bg-zinc-900 rounded mb-4" />
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
          <p className="text-zinc-400">No pending submissions to review</p>
        </div>
      </div>
    );
  }

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxScore = rubricCriteria.reduce((sum, c) => sum + c.weightage, 0);

  return (
    <div className="flex h-screen">
      <aside className="w-80 bg-zinc-950 border-r border-zinc-800 overflow-y-auto">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-lg font-semibold mb-1">Pending Reviews</h3>
          <p className="text-sm text-zinc-400">{submissions.length} submissions</p>
        </div>

        <div className="p-4 space-y-3">
          {submissions.map((submission) => (
            <button
              key={submission.id}
              onClick={() => setSelectedSubmission(submission)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedSubmission?.id === submission.id
                  ? "bg-zinc-800 border-blue-500"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">
                    {submission.student_name}
                  </p>
                  <p className="text-xs text-zinc-400 mb-2">{submission.task_title}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                  v{submission.version}
                </span>
              </div>
              <div className="flex items-center text-xs text-zinc-500">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(submission.submitted_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {selectedSubmission && (
          <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">{selectedSubmission.task_title}</h2>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-sm font-medium">
                  Version {selectedSubmission.version}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-zinc-400">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {selectedSubmission.student_name}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileCode className="w-5 h-5 mr-2" />
                Submission Files
              </h3>

              <div className="space-y-3">
                {selectedSubmission.github_url && (
                  <a
                    href={selectedSubmission.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center mr-3">
                        <ExternalLink className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-medium">GitHub Repository</p>
                        <p className="text-sm text-zinc-400">View source code</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  </a>
                )}

                {selectedSubmission.notes && (
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <p className="text-sm font-medium text-zinc-300 mb-2">Student Notes:</p>
                    <p className="text-zinc-400 text-sm">{selectedSubmission.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Rubric Scoring</h3>
                <div className="text-right">
                  <p className="text-sm text-zinc-400">Total Score</p>
                  <p className="text-2xl font-bold">
                    {totalScore} / {maxScore}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {rubricCriteria.map((criteria) => {
                  const score = scores.find((s) => s.criteria_id === criteria.id);

                  return (
                    <div key={criteria.id} className="border-b border-zinc-800 pb-6 last:border-0">
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{criteria.name}</h4>
                            {criteria.description && (
                              <p className="text-sm text-zinc-400">{criteria.description}</p>
                            )}
                          </div>
                          <span className="text-sm text-zinc-400 ml-4">
                            Max: {criteria.weightage} pts
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-zinc-400">Score</label>
                            <span className="text-sm font-medium">
                              {score?.score || 0} / {criteria.weightage}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={criteria.weightage}
                            value={score?.score || 0}
                            onChange={(e) =>
                              updateScore(
                                criteria.id,
                                "score",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        <textarea
                          value={score?.feedback || ""}
                          onChange={(e) =>
                            updateScore(criteria.id, "feedback", e.target.value)
                          }
                          rows={2}
                          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Feedback for this criterion..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">General Feedback</h3>
              <textarea
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide overall feedback on the submission..."
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg mb-6 ${
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
                onClick={() => handleReview("CHANGES_REQUESTED")}
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                <span>Request Changes</span>
              </button>
              <button
                onClick={() => handleReview("APPROVED")}
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{submitting ? "Saving..." : "Approve"}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
