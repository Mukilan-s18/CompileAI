"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/utils";
import { 
  Zap, 
  TerminalSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Target, 
  Cuboid, 
  FileCode2, 
  ShieldCheck, 
  Wrench, 
  Rocket 
} from "lucide-react";

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
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900">
          AI Application Compiler
        </h1>
        <p className="text-slate-500 mt-2">
          Convert natural language product requirements into validated, executable application specifications.
        </p>
      </div>

      {/* Quick Start */}
      <Link
        href="/generator"
        className="block mb-10 bg-white border border-slate-200 rounded-xl p-6 transition-all hover:border-blue-400 hover:shadow-sm cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
              Start Compiling <span className="group-hover:translate-x-1 transition-transform">→</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter a product description and generate complete application
              specs
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Zap size={24} />
          </div>
        </div>
      </Link>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-50 border border-slate-100 p-5 animate-pulse h-28 rounded-xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold mt-2 text-slate-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Compilations */}
      <div className="bg-white border border-slate-200 overflow-hidden rounded-xl mb-12">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Compilations
          </h2>
        </div>
        {compilations.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/30">
            <p className="text-slate-600 text-base mb-1">
              No compilations yet
            </p>
            <p className="text-slate-400 text-sm">
              Go to the Generator to create your first compilation
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    App
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Domain
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Errors
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Repairs
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Execution
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {compilations.map((comp) => (
                  <tr
                    key={comp.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/generator?id=${comp.id}`}
                        className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {comp.app_name || "Untitled"}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {comp.domain}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${statusColors[comp.status] || "badge-info"}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {comp.validation_errors}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {comp.repair_count}
                    </td>
                    <td className="px-5 py-3.5">
                      {comp.execution_status && (
                        <span className={`badge ${statusColors[comp.execution_status] || "badge-info"}`}>
                          {comp.execution_status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
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
      <div className="bg-white border border-slate-200 p-6 rounded-xl">
        <h2 className="text-base font-semibold text-slate-900 mb-5">
          Compiler Pipeline
        </h2>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {[
            { label: "Intent Extraction", icon: <Target size={20} className="text-blue-500" />, desc: "NL → Structured" },
            { label: "System Design", icon: <Cuboid size={20} className="text-indigo-500" />, desc: "Intent → Architecture" },
            { label: "Schema Generation", icon: <FileCode2 size={20} className="text-violet-500" />, desc: "Architecture → Schemas" },
            { label: "Validation", icon: <ShieldCheck size={20} className="text-emerald-500" />, desc: "Cross-schema checks" },
            { label: "Repair", icon: <Wrench size={20} className="text-amber-500" />, desc: "Targeted fixes" },
            { label: "Simulation", icon: <Rocket size={20} className="text-rose-500" />, desc: "Runtime verification" },
          ].map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center min-w-[120px] p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-300 transition-colors">
                <span className="mb-1.5">{stage.icon}</span>
                <span className="text-xs font-semibold text-slate-700 text-center">
                  {stage.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 text-center">
                  {stage.desc}
                </span>
              </div>
              {i < 5 && (
                <span className="text-slate-300 text-lg shrink-0">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
