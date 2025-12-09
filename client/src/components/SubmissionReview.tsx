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
  review?: {
    feedback: string;
  };
};

type RubricCriteria = {
  id: string;
  name: string;
  description: string;
  weightage: number;
};

type Score = {
  criteriaId: string;
  score: number;
  feedback: string;
};

export function SubmissionReview() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviewedSubmissions, setReviewedSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending");
  const [submissionScores, setSubmissionScores] = useState<Score[]>([]);

  useEffect(() => {
    loadSubmissions();
    loadReviewedSubmissions();
  }, []);

  useEffect(() => {
    if (selectedSubmission) {
      loadRubricCriteria(selectedSubmission.task_id);
      if (activeTab === "reviewed") {
        loadSubmissionScores(selectedSubmission.id);
        setGeneralFeedback(selectedSubmission.review?.feedback || "");
      } else {
        setSubmissionScores([]);
        setGeneralFeedback("");
      }
    } else {
      setRubricCriteria([]);
      setScores([]);
      setSubmissionScores([]);
    }
  }, [selectedSubmission, activeTab]);

  async function loadSubmissions() {
    try {
      const { data } = await api.get<Submission[]>("/submissions", {
        params: { status: "PENDING" },
      });

      setSubmissions(data || []);
      if (data && data.length > 0 && activeTab === "pending") {
        setSelectedSubmission(data[0]);
      } else if (activeTab === "pending") {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadReviewedSubmissions() {
    try {
      // Fetch both APPROVED and CHANGES_REQUESTED submissions
      const [approved, changesRequested] = await Promise.all([
        api.get<Submission[]>("/submissions", {
          params: { status: "APPROVED" },
        }),
        api.get<Submission[]>("/submissions", {
          params: { status: "CHANGES_REQUESTED" },
        }),
      ]);

      const combined = [...(approved.data || []), ...(changesRequested.data || [])];
      // Sort by submitted date, most recent first
      combined.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      setReviewedSubmissions(combined);
    } catch (error) {
      console.error("Error loading reviewed submissions:", error);
    }
  }

  async function loadRubricCriteria(taskId: string) {
    try {
      const { data } = await api.get<RubricCriteria[]>(`/tasks/rubric/${taskId}`);
      setRubricCriteria(data || []);
      setScores(
        (data || []).map((c) => ({
          criteriaId: c.id,
          score: 0,
          feedback: "",
        }))
      );
    } catch (error) {
      console.error("Error loading rubric criteria:", error);
    }
  }

  async function loadSubmissionScores(submissionId: string) {
    try {
      const { data } = await api.get<Array<{criteriaId: string; score: number; feedback: string}>>(
        `/submissions/${submissionId}/scores`
      );
      setSubmissionScores(data || []);
    } catch (error) {
      console.error("Error loading submission scores:", error);
      setSubmissionScores([]);
    }
  }

  const updateScore = (criteriaId: string, field: "score" | "feedback", value: number | string) => {
    setScores((prev) =>
      prev.map((s) => (s.criteriaId === criteriaId ? { ...s, [field]: value } : s))
    );
  };

  const handleReview = async (newStatus: "APPROVED" | "CHANGES_REQUESTED") => {
    if (!selectedSubmission) return;

    setSubmitting(true);
    setMessage("");

    try {
      await api.post(`/submissions/${selectedSubmission.id}/review`, {
        scores,
        feedback: generalFeedback,
        status: newStatus,
      });

      setMessage(
        `Submission ${
          newStatus === "APPROVED" ? "approved" : "marked for changes"
        } successfully!`
      );

      await loadSubmissions();
      await loadReviewedSubmissions();
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

  const currentSubmissions = activeTab === "pending" ? submissions : reviewedSubmissions;
  const currentScores = activeTab === "reviewed" ? submissionScores : scores;
  const totalScore = currentScores.reduce((sum, s) => sum + s.score, 0);
  const maxScore = rubricCriteria.reduce((sum, c) => sum + c.weightage, 0);

  return (
    <div className="flex h-screen">
      <aside className="w-80 bg-zinc-950 border-r border-zinc-800 overflow-y-auto">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => {
                setActiveTab("pending");
                if (submissions.length > 0) setSelectedSubmission(submissions[0]);
                else setSelectedSubmission(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => {
                setActiveTab("reviewed");
                if (reviewedSubmissions.length > 0) setSelectedSubmission(reviewedSubmissions[0]);
                else setSelectedSubmission(null);
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "reviewed"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Reviewed
            </button>
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {activeTab === "pending" ? "Pending Reviews" : "Reviewed Submissions"}
          </h3>
          <p className="text-sm text-zinc-400">
            {currentSubmissions.length} submissions
          </p>
        </div>

        <div className="p-4 space-y-3">
          {currentSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">
                {activeTab === "pending" ? "All caught up!" : "No reviewed submissions yet"}
              </p>
            </div>
          ) : (
            currentSubmissions.map((submission) => (
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
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                      v{submission.version}
                    </span>
                    {submission.status !== "PENDING" && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        submission.status === "APPROVED"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {submission.status === "APPROVED" ? "Approved" : "Changes"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-xs text-zinc-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {selectedSubmission ? (
          <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="mb-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Task</div>
                <h2 className="text-2xl font-bold text-blue-400">{selectedSubmission.task_title}</h2>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-zinc-300">Submission Review</div>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-sm font-medium">
                  Version {selectedSubmission.version}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-zinc-400">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">{selectedSubmission.student_name}</span>
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
                  const isReviewed = activeTab === "reviewed";
                  const score = isReviewed 
                    ? submissionScores.find((s) => s.criteriaId === criteria.id)
                    : scores.find((s) => s.criteriaId === criteria.id);

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
                            disabled={isReviewed}
                            className={`w-full h-2 bg-zinc-800 rounded-lg appearance-none ${isReviewed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} accent-blue-500`}
                          />
                        </div>

                        <textarea
                          value={score?.feedback || ""}
                          onChange={(e) =>
                            updateScore(criteria.id, "feedback", e.target.value)
                          }
                          rows={2}
                          disabled={isReviewed}
                          className={`w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 ${isReviewed ? 'cursor-not-allowed opacity-60' : 'focus:outline-none focus:ring-2 focus:ring-blue-500'} text-sm`}
                          placeholder={isReviewed ? "" : "Feedback for this criterion..."}
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
                disabled={activeTab === "reviewed"}
                className={`w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 ${activeTab === "reviewed" ? 'cursor-not-allowed opacity-60' : 'focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
                placeholder={activeTab === "reviewed" ? "" : "Provide overall feedback on the submission..."}
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

            {activeTab === "pending" && (
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
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-zinc-400">No submission selected</h3>
              <p className="text-zinc-500">Select a submission from the list to view details</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
