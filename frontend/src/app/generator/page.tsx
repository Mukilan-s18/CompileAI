"use client";

import { useState } from "react";
import { apiClient } from "@/lib/utils";

interface CompilationResult {
  id: string;
  status: string;
  prompt: string;
  intent: Record<string, unknown> | null;
  architecture: Record<string, unknown> | null;
  ui_schema: Record<string, unknown> | null;
  api_schema: Record<string, unknown> | null;
  db_schema: Record<string, unknown> | null;
  auth_schema: Record<string, unknown> | null;
  business_logic: Record<string, unknown> | null;
  runtime_config: Record<string, unknown> | null;
  validation: Record<string, unknown> | null;
  repair_log: Array<Record<string, unknown>>;
  execution_result: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}

const examplePrompts = [
  "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.",
  "Build an e-commerce store with product listings, shopping cart, checkout with Stripe, and admin dashboard.",
  "Build a project management tool with boards, lists, cards, comments, and team collaboration.",
  "Build an HRMS with employee profiles, leave management, payroll, and attendance tracking.",
  "Build an online learning platform with courses, quizzes, and student progress tracking.",
];

const stages = [
  { key: "intent", label: "Intent Extraction", icon: "🎯" },
  { key: "architecture", label: "System Design", icon: "🏗️" },
  { key: "schemas", label: "Schema Generation", icon: "📋" },
  { key: "validation", label: "Validation", icon: "✅" },
  { key: "repair", label: "Repair", icon: "🔧" },
  { key: "simulation", label: "Simulation", icon: "🚀" },
];

const schemaTabs = [
  { key: "intent", label: "Intent" },
  { key: "architecture", label: "Architecture" },
  { key: "ui_schema", label: "UI Schema" },
  { key: "api_schema", label: "API Schema" },
  { key: "db_schema", label: "DB Schema" },
  { key: "auth_schema", label: "Auth" },
  { key: "business_logic", label: "Business Logic" },
  { key: "runtime_config", label: "Runtime" },
  { key: "validation", label: "Validation" },
  { key: "execution_result", label: "Execution" },
];

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [activeTab, setActiveTab] = useState("intent");
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || prompt.length < 10) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Simulate stage progression
    for (let i = 0; i < stages.length; i++) {
      setActiveStage(i);
      await new Promise((r) => setTimeout(r, 300));
    }

    try {
      const data = await apiClient<CompilationResult>("/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      setResult(data);
      setActiveStage(stages.length); // All done
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compilation failed");
      setActiveStage(-1);
    } finally {
      setLoading(false);
    }
  }

  function getStageStatus(index: number) {
    if (loading && index === activeStage) return "active";
    if (loading && index < activeStage) return "complete";
    if (!loading && result && index < stages.length) return "complete";
    if (!loading && error) return "error";
    return "pending";
  }

  function getTabData(): unknown {
    if (!result) return null;
    const data = result[activeTab as keyof CompilationResult];
    return data;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text">Application Compiler</h1>
        <p className="text-text-secondary text-sm mt-1">
          Enter your product requirements and compile into executable specs
        </p>
      </div>

      {/* Prompt Input */}
      <div className="glass-card p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <label className="block text-sm font-medium text-text mb-2">
          Product Requirements
        </label>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your application... e.g., Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments."
          className="w-full h-32 p-4 rounded-lg bg-background border border-border text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all text-sm"
          disabled={loading}
        />

        {/* Example Prompts */}
        <div className="mt-3 flex flex-wrap gap-2">
          {examplePrompts.map((ep, i) => (
            <button
              key={i}
              onClick={() => setPrompt(ep)}
              className="text-xs px-3 py-1.5 rounded-full bg-surface-hover border border-border-light text-text-secondary hover:text-accent hover:border-accent/30 transition-all"
              disabled={loading}
            >
              {ep.substring(0, 40)}...
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          id="generate-button"
          onClick={handleGenerate}
          disabled={loading || prompt.length < 10}
          className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-accent to-violet text-white font-semibold text-sm hover:shadow-lg hover:shadow-accent/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span> Compiling...
            </span>
          ) : (
            "⚡ Compile Application"
          )}
        </button>
      </div>

      {/* Pipeline Stage Indicator */}
      <div className="glass-card p-4 mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <div className="flex items-center justify-between">
          {stages.map((stage, i) => (
            <div key={stage.key} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`stage-dot ${getStageStatus(i)}`} />
                  <span className="text-xs font-medium text-text-secondary">
                    {stage.icon}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted text-center">
                  {stage.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div
                  className={`h-px flex-1 max-w-8 transition-colors duration-500 ${
                    getStageStatus(i) === "complete"
                      ? "bg-success"
                      : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card p-4 mb-6 border-error/30 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-error text-lg">✕</span>
            <div>
              <p className="text-sm font-medium text-error">Compilation Failed</p>
              <p className="text-xs text-text-secondary mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="glass-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {/* Result Header */}
          <div className="p-5 border-b border-border-light flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`badge ${
                  result.status === "success"
                    ? "badge-success"
                    : result.status === "partial"
                    ? "badge-warning"
                    : "badge-error"
                }`}
              >
                {result.status.toUpperCase()}
              </span>
              <h2 className="text-lg font-semibold text-text">
                {(result.intent as Record<string, string>)?.app_name || "Compilation Result"}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span>
                ID: {result.id.substring(0, 8)}
              </span>
              <span>
                {((result.metadata as Record<string, number>)?.total_duration_ms / 1000).toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Schema Tabs */}
          <div className="border-b border-border-light overflow-x-auto">
            <div className="flex">
              {schemaTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? "border-accent text-accent"
                      : "border-transparent text-text-secondary hover:text-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schema Viewer */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-text">
                {schemaTabs.find((t) => t.key === activeTab)?.label}
              </h3>
              <button
                onClick={() => {
                  const data = getTabData();
                  if (data) navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                }}
                className="text-xs px-3 py-1.5 rounded-md bg-surface-hover text-text-secondary hover:text-accent transition-colors"
              >
                📋 Copy JSON
              </button>
            </div>
            <div className="json-viewer max-h-[500px] overflow-y-auto">
              {getTabData()
                ? JSON.stringify(getTabData(), null, 2)
                : "No data available for this tab"}
            </div>
          </div>

          {/* Repair Log (if any) */}
          {result.repair_log.length > 0 && (
            <div className="p-5 border-t border-border-light">
              <h3 className="text-sm font-medium text-text mb-3">
                Repair Actions ({result.repair_log.length})
              </h3>
              <div className="space-y-2">
                {result.repair_log.map((repair, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-surface-hover text-xs"
                  >
                    <span className="text-amber">⚙</span>
                    <div>
                      <span className="font-medium text-text">
                        {(repair as Record<string, string>).action_type}
                      </span>
                      <span className="text-text-muted ml-2">
                        {(repair as Record<string, string>).description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
