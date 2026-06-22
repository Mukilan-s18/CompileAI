"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/utils";

interface MetricsSummary {
  total_compilations: number;
  success_rate: number;
  avg_duration_ms: number;
  total_validation_errors: number;
  total_repairs: number;
  execution_pass_rate: number;
  avg_tokens_used: number;
}

interface CompilationSummary {
  id: string;
  status: string;
  prompt: string;
  app_name: string;
  domain: string;
  created_at: string;
  duration_ms: number;
  validation_errors: number;
  repair_count: number;
  execution_status: string;
}

const statusColors: Record<string, string> = {
  success: "badge-success",
  partial: "badge-warning",
  failed: "badge-error",
  PASS: "badge-success",
  FAIL: "badge-error",
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [compilations, setCompilations] = useState<CompilationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, c] = await Promise.all([
          apiClient<MetricsSummary>("/metrics"),
          apiClient<CompilationSummary[]>("/compilations"),
        ]);
        setMetrics(m);
        setCompilations(c);
      } catch {
        // API not available yet — use defaults
        setMetrics({
          total_compilations: 0,
          success_rate: 0,
          avg_duration_ms: 0,
          total_validation_errors: 0,
          total_repairs: 0,
          execution_pass_rate: 0,
          avg_tokens_used: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = metrics
    ? [
        {
          label: "Total Compilations",
          value: metrics.total_compilations,
          icon: "⚡",
          color: "from-accent to-violet",
          bgColor: "accent-glow",
        },
        {
          label: "Success Rate",
          value: `${metrics.success_rate}%`,
          icon: "✓",
          color: "from-emerald to-green-400",
          bgColor: "success-bg",
        },
        {
          label: "Avg Latency",
          value: `${(metrics.avg_duration_ms / 1000).toFixed(1)}s`,
          icon: "⏱",
          color: "from-amber to-yellow-400",
          bgColor: "warning-bg",
        },
        {
          label: "Execution Pass Rate",
          value: `${metrics.execution_pass_rate}%`,
          icon: "▶",
          color: "from-blue-500 to-cyan-400",
          bgColor: "info-bg",
        },
        {
          label: "Validation Errors",
          value: metrics.total_validation_errors,
          icon: "⚠",
          color: "from-red-500 to-rose-400",
          bgColor: "error-bg",
        },
        {
          label: "Repair Operations",
          value: metrics.total_repairs,
          icon: "⚙",
          color: "from-violet to-purple-400",
          bgColor: "violet-bg",
        },
      ]
    : [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-text">
          AI Application Compiler
        </h1>
        <p className="text-text-secondary mt-1">
          Convert natural language into executable application specifications
        </p>
      </div>

      {/* Quick Start */}
      <Link
        href="/generator"
        className="block mb-8 glass-panel glass-panel-hover p-8 transition-all duration-300 cursor-pointer group animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text group-hover:text-accent transition-colors flex items-center gap-2">
              Start Compiling <span className="group-hover:translate-x-1 transition-transform">→</span>
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              Enter a product description and generate complete application
              specs
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all group-hover:scale-110">
            <Zap size={28} />
          </div>
        </div>
      </Link>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="glass-panel p-6 shimmer h-32 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className="glass-panel glass-panel-hover p-6 animate-fade-in-up transition-all duration-300"
              style={{ animationDelay: `${0.15 + i * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    {card.label}
                  </p>
                  <p className="text-3xl font-extrabold mt-3 text-text font-mono">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Compilations */}
      <div
        className="glass-panel animate-fade-in-up overflow-hidden rounded-2xl"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-lg font-bold text-text">
            Recent Compilations
          </h2>
        </div>
        {compilations.length === 0 ? (
          <div className="p-16 text-center bg-black/10">
            <p className="text-text-muted text-lg mb-2">
              No compilations yet
            </p>
            <p className="text-text-secondary text-sm">
              Go to the Generator to create your first compilation
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-black/20">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    App
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Domain
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Errors
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Repairs
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Execution
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-black/10">
                {compilations.map((comp) => (
                  <tr
                    key={comp.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/generator?id=${comp.id}`}
                        className="text-sm font-semibold text-text hover:text-accent transition-colors"
                      >
                        {comp.app_name || "Untitled"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {comp.domain}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${statusColors[comp.status] || "badge-info"}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary font-mono">
                      {comp.validation_errors}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary font-mono">
                      {comp.repair_count}
                    </td>
                    <td className="px-6 py-4">
                      {comp.execution_status && (
                        <span className={`badge ${statusColors[comp.execution_status] || "badge-info"}`}>
                          {comp.execution_status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary font-mono">
                      {(comp.duration_ms / 1000).toFixed(1)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pipeline Architecture Diagram */}
      <div
        className="mt-10 glass-panel p-8 animate-fade-in-up rounded-2xl"
        style={{ animationDelay: "0.5s" }}
      >
        <h2 className="text-lg font-bold text-text mb-6">
          Compiler Pipeline
        </h2>
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-4">
          {[
            { label: "Intent Extraction", icon: <Target size={24} className="text-blue-400" />, desc: "NL → Structured" },
            { label: "System Design", icon: <Cuboid size={24} className="text-indigo-400" />, desc: "Intent → Architecture" },
            { label: "Schema Generation", icon: <FileCode2 size={24} className="text-violet-400" />, desc: "Architecture → Schemas" },
            { label: "Validation", icon: <ShieldCheck size={24} className="text-emerald-400" />, desc: "Cross-schema checks" },
            { label: "Repair", icon: <Wrench size={24} className="text-amber-400" />, desc: "Targeted fixes" },
            { label: "Simulation", icon: <Rocket size={24} className="text-rose-400" />, desc: "Runtime verification" },
          ].map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-3">
              <div className="flex flex-col items-center min-w-[140px] p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-accent/40 hover:bg-white/[0.04] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(99,102,241,0.15)] group">
                <span className="mb-2 group-hover:scale-110 transition-transform">{stage.icon}</span>
                <span className="text-xs font-bold text-text text-center">
                  {stage.label}
                </span>
                <span className="text-[10px] text-text-secondary mt-1 text-center">
                  {stage.desc}
                </span>
              </div>
              {i < 5 && (
                <span className="text-accent/40 text-xl shrink-0 font-light">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
