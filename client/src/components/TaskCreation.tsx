import { useState } from "react";
import type React from "react";
import { api } from "@/lib/api";
import { Plus, X, Calendar, Tag, FileText, Save, Users } from "lucide-react";

type RubricCriterion = {
  id: string;
  name: string;
  description: string;
  weightage: number;
  orderIndex?: number;
};

export function TaskCreation() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [expectedTeamSize, setExpectedTeamSize] = useState<number | undefined>();
  const [deadline, setDeadline] = useState("");
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([
    { id: "1", name: "", description: "", weightage: 0, orderIndex: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput("");
    }
  };

  const removeTech = (skill: string) => {
    setTechStack(techStack.filter((s) => s !== skill));
  };

  const addCriterion = () => {
    setRubricCriteria([
      ...rubricCriteria,
      {
        id: Date.now().toString(),
        name: "",
        description: "",
        weightage: 0,
        orderIndex: rubricCriteria.length,
      },
    ]);
  };

  const removeCriterion = (id: string) => {
    if (rubricCriteria.length > 1) {
      setRubricCriteria(rubricCriteria.filter((c) => c.id !== id));
    }
  };

  const updateCriterion = (id: string, field: keyof RubricCriterion, value: string | number) => {
    setRubricCriteria(
      rubricCriteria.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const rubricPayload = rubricCriteria
        .filter((c) => c.name.trim())
        .map((c, index) => ({
          name: c.name,
          description: c.description,
          weightage: c.weightage,
          orderIndex: index,
        }));

      await api.post("/tasks", {
        title,
        description,
        difficulty,
        techStack,
        expectedTeamSize,
        deadline: deadline || null,
        rubric: rubricPayload,
      });

      setMessage("Task created successfully!");
      setTitle("");
      setDescription("");
      setTechStack([]);
      setExpectedTeamSize(undefined);
      setDeadline("");
      setRubricCriteria([{ id: "1", name: "", description: "", weightage: 0, orderIndex: 0 }]);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const totalWeightage = rubricCriteria.reduce(
    (sum, c) => sum + (c.weightage || 0),
    0
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create New Task</h2>
        <p className="text-zinc-400">Design an assignment with detailed rubric criteria</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Task Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Build a React Component Library"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description (Markdown supported) <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="## Overview&#10;Describe the task in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")
                  }
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Expected Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  value={expectedTeamSize ?? ""}
                  onChange={(e) =>
                    setExpectedTeamSize(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 items-center">
                <Tag className="w-4 h-4 mr-2" />
                Tech Stack
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., React, TypeScript, Node.js"
                />
                <button
                  type="button"
                  onClick={addTech}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-zinc-800 text-zinc-200 rounded-full text-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeTech(skill)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Rubric Builder</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Total Weightage: <span className="font-semibold">{totalWeightage}</span> points
              </p>
            </div>
            <button
              type="button"
              onClick={addCriterion}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Criterion</span>
            </button>
          </div>

          <div className="space-y-4">
            {rubricCriteria.map((criterion, index) => (
              <div
                key={criterion.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm font-medium text-zinc-400">
                    Criterion {index + 1}
                  </span>
                  {rubricCriteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriterion(criterion.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) => updateCriterion(criterion.id, "name", e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Criterion name (e.g., Code Quality)"
                  />
                  <textarea
                    value={criterion.description}
                    onChange={(e) =>
                      updateCriterion(criterion.id, "description", e.target.value)
                    }
                    rows={2}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Description of what you're looking for..."
                  />
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-zinc-400">Weightage:</label>
                    <input
                      type="number"
                      value={criterion.weightage || ""}
                      onChange={(e) =>
                        updateCriterion(
                          criterion.id,
                          "weightage",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min={0}
                    />
                    <span className="text-sm text-zinc-400">points</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              setTitle("");
              setDescription("");
              setTechStack([]);
              setExpectedTeamSize(undefined);
              setDeadline("");
              setRubricCriteria([{ id: "1", name: "", description: "", weightage: 0 }]);
            }}
            className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Creating..." : "Create Task"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
