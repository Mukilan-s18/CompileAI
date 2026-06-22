"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/utils";

interface ExecutionCheck {
  check_name: string;
  passed: boolean;
  details: string;
  artifacts: string[];
}

interface ExecutionResult {
  status: string;
  checks: ExecutionCheck[];
  passed_count: number;
  failed_count: number;
  generated_ddl: string;
  generated_routes: string[];
}

interface CompilationSummary {
  id: string;
  app_name: string;
  execution_status: string;
}

export default function ExecutionPage() {
  const [compilations, setCompilations] = useState<CompilationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDDL, setShowDDL] = useState(false);

  useEffect(() => {
    apiClient<CompilationSummary[]>("/compilations")
      .then(setCompilations)
      .catch(() => {});
  }, []);

  async function loadExecution(id: string) {
    setSelectedId(id);
    setLoading(true);
    try {
      const result = await apiClient<Record<string, unknown>>(`/compilations/${id}`);
      setExecution(result.execution_result as ExecutionResult);
    } catch {
      setExecution(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text">Execution Results</h1>
        <p className="text-text-secondary text-sm mt-1">
          Runtime simulation — can the generated config create a working application?
        </p>
      </div>

      {/* Compilation Selector */}
      <div className="glass-card p-4 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
          Select Compilation
        </label>
        <div className="flex flex-wrap gap-2">
          {compilations.length === 0 ? (
            <p className="text-sm text-text-muted">No compilations available.</p>
          ) : (
            compilations.map((comp) => (
              <button
                key={comp.id}
                onClick={() => loadExecution(comp.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedId === comp.id
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "bg-surface-hover text-text-secondary hover:text-text border border-border-light"
                }`}
              >
                {comp.app_name || comp.id.substring(0, 8)}{" "}
                <span className={comp.execution_status === "PASS" ? "text-success" : "text-error"}>
                  {comp.execution_status}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 shimmer h-20" />
          ))}
        </div>
      ) : !execution ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">🚀</p>
          <p className="text-text-secondary">
            Select a compilation to view execution simulation results
          </p>
        </div>
      ) : (
        <>
          {/* Overall Status */}
          <div className="glass-card p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                    execution.status === "PASS"
                      ? "bg-success-bg border border-success/20"
                      : "bg-error-bg border border-error/20"
                  }`}
                >
                  {execution.status === "PASS" ? "✅" : "❌"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">
                    {execution.status === "PASS" ? "All Checks Passed" : "Some Checks Failed"}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {execution.passed_count} passed, {execution.failed_count} failed
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{execution.passed_count}</p>
                  <p className="text-[10px] text-text-muted uppercase">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-error">{execution.failed_count}</p>
                  <p className="text-[10px] text-text-muted uppercase">Failed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {execution.checks.map((check, i) => (
              <div
                key={check.check_name}
                className="glass-card p-4 animate-fade-in"
                style={{ animationDelay: `${0.2 + i * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-xl ${check.passed ? "text-success" : "text-error"}`}>
                    {check.passed ? "✓" : "✕"}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-text capitalize">
                      {check.check_name.replace(/_/g, " ")}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">{check.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Generated DDL */}
          {execution.generated_ddl && (
            <div className="glass-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={() => setShowDDL(!showDDL)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-hover transition-colors rounded-xl"
              >
                <span className="text-sm font-medium text-text">
                  Generated SQL DDL
                </span>
                <span className="text-text-muted">{showDDL ? "▼" : "▶"}</span>
              </button>
              {showDDL && (
                <div className="p-4 pt-0">
                  <pre className="json-viewer text-emerald text-xs">
                    {execution.generated_ddl}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Generated Routes */}
          {execution.generated_routes.length > 0 && (
            <div className="glass-card p-4 mt-4 animate-fade-in" style={{ animationDelay: "0.45s" }}>
              <h3 className="text-sm font-medium text-text mb-3">Generated Routes</h3>
              <div className="space-y-1">
                {execution.generated_routes.map((route, i) => (
                  <div key={i} className="text-xs text-text-secondary px-3 py-1.5 rounded bg-surface-hover font-mono">
                    {route}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
