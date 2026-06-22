"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";

export default function ClarifyPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClarify = async () => {
    if (!prompt.trim() || prompt.length < 10) {
      setError("Prompt must be at least 10 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze prompt");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 pb-20">
      <PageHeader
        title="Prompt Clarification Engine"
        description="Analyze your natural language prompt for ambiguity, conflicts, and underspecification before generating the application."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto mt-8">
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Input Prompt</h2>
            <textarea
              className="w-full h-48 bg-background border border-border rounded-lg p-4 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              placeholder="e.g. Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              onClick={handleClarify}
              disabled={isLoading || prompt.length < 10}
              className="mt-4 w-full bg-accent hover:bg-accent-hover text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Analyzing..." : "Analyze Prompt"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {result ? (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text">Analysis Result</h2>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    result.prompt_quality === "excellent"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : result.prompt_quality === "good"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : result.prompt_quality === "fair"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}
                >
                  Quality: {result.prompt_quality.toUpperCase()}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Confidence Score</span>
                  <span className="text-text font-medium">
                    {Math.round(result.confidence_score * 100)}%
                  </span>
                </div>
                <div className="w-full bg-surface rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      result.confidence_score >= 0.8
                        ? "bg-green-500"
                        : result.confidence_score >= 0.5
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.round(result.confidence_score * 100)}%` }}
                  />
                </div>
              </div>

              {result.needs_clarification ? (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h3 className="text-red-500 font-medium mb-2 flex items-center gap-2">
                    <span>⚠️</span> Clarification Required
                  </h3>
                  <p className="text-sm text-red-400/90">
                    Your prompt has severe conflicts or is missing critical details.
                    Please address the issues below before proceeding.
                  </p>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h3 className="text-green-500 font-medium mb-2 flex items-center gap-2">
                    <span>✓</span> Ready for Generation
                  </h3>
                  <p className="text-sm text-green-400/90">
                    Your prompt is clear enough to generate a system design.
                  </p>
                </div>
              )}

              {result.conflicts && result.conflicts.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-text">Detected Issues</h3>
                  {result.conflicts.map((conflict: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-md border ${
                        conflict.severity === "high"
                          ? "bg-red-500/5 border-red-500/20"
                          : conflict.severity === "medium"
                          ? "bg-yellow-500/5 border-yellow-500/20"
                          : "bg-blue-500/5 border-blue-500/20"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold capitalize text-text">
                          {conflict.type.replace("_", " ")}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            conflict.severity === "high"
                              ? "bg-red-500/20 text-red-400"
                              : conflict.severity === "medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {conflict.severity}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">
                        {conflict.description}
                      </p>
                      <div className="text-xs space-y-1">
                        <p>
                          <span className="text-accent">Suggestion:</span>{" "}
                          <span className="text-text-muted">{conflict.suggestion}</span>
                        </p>
                        <p>
                          <span className="text-accent">Question:</span>{" "}
                          <span className="text-text-muted">{conflict.clarifying_question}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.auto_assumptions && result.auto_assumptions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-text">Auto-Assumptions</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.auto_assumptions.map((assumption: str, idx: number) => (
                      <li key={idx} className="text-sm text-text-secondary">
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-6 h-full flex flex-col items-center justify-center text-center text-text-muted min-h-[300px]">
              <span className="text-4xl mb-4 opacity-50">🔍</span>
              <p>Enter a prompt and click Analyze to detect conflicts and ambiguity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
