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
        className="block mb-8 glass-card p-6 glow-hover transition-all duration-300 cursor-pointer group animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text group-hover:text-accent transition-colors">
              Start Compiling →
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Enter a product description and generate complete application
              specs
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-violet flex items-center justify-center text-white text-xl">
            ⚡
          </div>
        </div>
      </Link>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="glass-card p-5 shimmer h-28 rounded-xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className="glass-card p-5 animate-fade-in hover:border-accent/30 transition-all duration-300"
              style={{ animationDelay: `${0.15 + i * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-medium">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold mt-2 text-text">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-lg`}
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
        className="glass-card animate-fade-in"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="p-5 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text">
            Recent Compilations
          </h2>
        </div>
        {compilations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted text-lg mb-2">
              No compilations yet
            </p>
            <p className="text-text-muted text-sm">
              Go to the Generator to create your first compilation
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    App
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Domain
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Errors
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Repairs
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Execution
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-5 py-3">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {compilations.map((comp) => (
                  <tr
                    key={comp.id}
                    className="border-b border-border-light hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/generator?id=${comp.id}`}
                        className="text-sm font-medium text-text hover:text-accent transition-colors"
                      >
                        {comp.app_name || "Untitled"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {comp.domain}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${statusColors[comp.status] || "badge-info"}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {comp.validation_errors}
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
                      {comp.repair_count}
                    </td>
                    <td className="px-5 py-4">
                      {comp.execution_status && (
                        <span className={`badge ${statusColors[comp.execution_status] || "badge-info"}`}>
                          {comp.execution_status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary">
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
        className="mt-8 glass-card p-6 animate-fade-in"
        style={{ animationDelay: "0.5s" }}
      >
        <h2 className="text-lg font-semibold text-text mb-4">
          Compiler Pipeline
        </h2>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {[
            { label: "Intent Extraction", icon: "🎯", desc: "NL → Structured" },
            { label: "System Design", icon: "🏗️", desc: "Intent → Architecture" },
            { label: "Schema Generation", icon: "📋", desc: "Architecture → Schemas" },
            { label: "Validation", icon: "✅", desc: "Cross-schema checks" },
            { label: "Repair", icon: "🔧", desc: "Targeted fixes" },
            { label: "Simulation", icon: "🚀", desc: "Runtime verification" },
          ].map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center min-w-[120px] p-3 rounded-lg bg-surface-hover border border-border-light hover:border-accent/30 transition-all">
                <span className="text-xl mb-1">{stage.icon}</span>
                <span className="text-xs font-medium text-text text-center">
                  {stage.label}
                </span>
                <span className="text-[10px] text-text-muted mt-0.5 text-center">
                  {stage.desc}
                </span>
              </div>
              {i < 5 && (
                <span className="text-text-muted text-lg shrink-0">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
