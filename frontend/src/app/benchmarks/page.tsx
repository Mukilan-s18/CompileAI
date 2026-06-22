"use client";

import { useState } from "react";
import { apiClient } from "@/lib/utils";

interface BenchmarkResult {
  id: string;
  status: string;
  prompt: string;
  app_name: string;
  domain: string;
  duration_ms: number;
  validation_errors: number;
  repair_count: number;
  execution_status: string;
}

interface BenchmarkResponse {
  total_prompts: number;
  completed: number;
  success_count: number;
  failure_count: number;
  avg_duration_ms: number;
  results: BenchmarkResult[];
}

const statusColors: Record<string, string> = {
  success: "badge-success",
  partial: "badge-warning",
  failed: "badge-error",
  PASS: "badge-success",
  FAIL: "badge-error",
};

export default function BenchmarksPage() {
  const [data, setData] = useState<BenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runBenchmarks() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient<BenchmarkResponse>("/benchmarks/run", {
        method: "POST",
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run benchmarks");
    } finally {
      setLoading(false);
    }
  }

  async function loadLatest() {
    try {
      const result = await apiClient<BenchmarkResponse>("/benchmarks");
      if (result) setData(result);
    } catch {}
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text">Benchmark Results</h1>
        <p className="text-text-secondary text-sm mt-1">
          Evaluate the compiler against 10 real prompts and 10 edge cases
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <button
          onClick={runBenchmarks}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-accent to-violet text-white text-sm font-semibold hover:shadow-lg hover:shadow-accent/20 disabled:opacity-40 transition-all"
        >
          {loading ? "⟳ Running..." : "🚀 Run Benchmark Suite"}
        </button>
        <button
          onClick={loadLatest}
          className="px-4 py-2.5 rounded-lg bg-surface border border-border-light text-text-secondary text-sm hover:text-text transition-all"
        >
          Load Latest
        </button>
      </div>

      {error && (
        <div className="glass-card p-4 mb-6 border-error/30">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {loading && (
        <div className="glass-card p-12 text-center animate-pulse-glow">
          <p className="text-4xl mb-3">⏳</p>
          <p className="text-text-secondary">
            Running 20 prompts through the compiler pipeline...
          </p>
          <p className="text-xs text-text-muted mt-2">This may take a few minutes</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Total Prompts", value: data.total_prompts, icon: "📝" },
              { label: "Completed", value: data.completed, icon: "✓" },
              { label: "Successes", value: data.success_count, icon: "✅" },
              { label: "Failures", value: data.failure_count, icon: "❌" },
              { label: "Avg Duration", value: `${(data.avg_duration_ms / 1000).toFixed(1)}s`, icon: "⏱" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="glass-card p-4 text-center animate-fade-in"
                style={{ animationDelay: `${0.15 + i * 0.05}s` }}
              >
                <p className="text-lg mb-1">{stat.icon}</p>
                <p className="text-xl font-bold text-text">{stat.value}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Success Rate Bar */}
          <div className="glass-card p-4 mb-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Success Rate
              </span>
              <span className="text-sm font-bold text-text">
                {data.total_prompts > 0
                  ? `${Math.round((data.success_count / data.total_prompts) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <div className="w-full h-3 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-1000"
                style={{
                  width: `${data.total_prompts > 0 ? (data.success_count / data.total_prompts) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-card animate-fade-in" style={{ animationDelay: "0.35s" }}>
            <div className="p-4 border-b border-border-light">
              <h2 className="text-sm font-semibold text-text">Per-Prompt Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left text-[10px] font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Prompt
                    </th>
                    <th className="text-left text-[10px] font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      App
                    </th>
                    <th className="text-left text-[10px] font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-[10px] font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Errors
                    </th>
                    <th className="text-left text-[10px] font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Repairs
                    </th>
                    <th className="text-left text-[10px] font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Execution
                    </th>
                    <th className="text-left text-[10px] font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((r) => (
                    <tr key={r.id} className="border-b border-border-light hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-3 text-xs text-text-secondary max-w-[200px] truncate">
                        {r.prompt}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-text">{r.app_name}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusColors[r.status] || "badge-info"}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">{r.validation_errors}</td>
                      <td className="px-4 py-3 text-xs text-text-secondary">{r.repair_count}</td>
                      <td className="px-4 py-3">
                        {r.execution_status && (
                          <span className={`badge ${statusColors[r.execution_status] || "badge-info"}`}>
                            {r.execution_status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">
                        {(r.duration_ms / 1000).toFixed(1)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
