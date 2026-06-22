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
    <div className="flex flex-col justify-between h-[calc(100vh-2rem)] mx-auto px-10 py-6 max-w-7xl overflow-y-auto">
      <div>
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Application Compiler
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Convert natural language product requirements into validated, executable application specifications.
          </p>
        </div>

        {/* Quick Start */}
        <Link
          href="/generator"
          className="block mb-10 glass-card glass-card-hover p-8 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors flex items-center gap-3">
                Start Compiling <span className="group-hover:translate-x-2 transition-transform">→</span>
              </h2>
              <p className="text-slate-600 mt-2 text-lg">
                Enter a product description and generate complete application
                specs
              </p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
              <Zap size={32} />
            </div>
          </div>
        </Link>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass-card p-6 animate-pulse h-32 rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {statCards.map((card, i) => (
              <div
                key={card.label}
                className="glass-card glass-card-hover p-6 rounded-2xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-bold">
                      {card.label}
                    </p>
                    <p className="text-4xl font-extrabold mt-3 text-slate-900">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Compilations */}
        <div className="glass-card overflow-hidden rounded-2xl mb-12">
          <div className="p-6 border-b border-white/40 bg-white/40">
            <h2 className="text-xl font-bold text-slate-900">
              Recent Compilations
            </h2>
          </div>
          {compilations.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-700 font-medium text-lg mb-1">
                No compilations yet
              </p>
              <p className="text-slate-500">
                Go to the Generator to create your first compilation
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/40 bg-white/20">
                    <th className="text-left text-sm font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      App
                    </th>
                    <th className="text-left text-sm font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Domain
                    </th>
                    <th className="text-left text-sm font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-sm font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Errors
                    </th>
                    <th className="text-left text-sm font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Repairs
                    </th>
                    <th className="text-left text-sm font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Execution
                    </th>
                    <th className="text-left text-sm font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/40">
                  {compilations.map((comp) => (
                    <tr
                      key={comp.id}
                      className="border-b border-white/20 hover:bg-white/60 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/generator?id=${comp.id}`}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {comp.app_name || "Untitled"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {comp.domain}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${statusColors[comp.status] || "badge-info"}`}>
                          {comp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-mono font-medium">
                        {comp.validation_errors}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-mono font-medium">
                        {comp.repair_count}
                      </td>
                      <td className="px-6 py-4">
                        {comp.execution_status && (
                          <span className={`badge ${statusColors[comp.execution_status] || "badge-info"}`}>
                            {comp.execution_status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono font-medium">
                        {(comp.duration_ms / 1000).toFixed(1)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Architecture Diagram - Pushed to bottom by flex-col justify-between */}
      <div className="glass-card p-8 rounded-2xl mt-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-8">
          Compiler Pipeline
        </h2>
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
          {[
            { label: "Intent Extraction", icon: <Target size={28} className="text-rose-500" />, desc: "NL → Structured" },
            { label: "System Design", icon: <Cuboid size={28} className="text-orange-500" />, desc: "Intent → Architecture" },
            { label: "Schema Generation", icon: <FileCode2 size={28} className="text-amber-500" />, desc: "Architecture → Schemas" },
            { label: "Validation", icon: <ShieldCheck size={28} className="text-emerald-500" />, desc: "Cross-schema checks" },
            { label: "Repair", icon: <Wrench size={28} className="text-blue-500" />, desc: "Targeted fixes" },
            { label: "Simulation", icon: <Rocket size={28} className="text-indigo-500" />, desc: "Runtime verification" },
          ].map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-4 flex-1">
              <div className="flex flex-col items-center w-full p-4 rounded-xl bg-white/40 border border-white/60 hover:bg-white/80 transition-all hover:-translate-y-1 shadow-sm">
                <span className="mb-3 p-3 bg-white rounded-xl shadow-sm">{stage.icon}</span>
                <span className="text-sm font-bold text-slate-900 text-center">
                  {stage.label}
                </span>
                <span className="text-xs font-medium text-slate-500 mt-1 text-center">
                  {stage.desc}
                </span>
              </div>
              {i < 5 && (
                <span className="text-slate-400 text-2xl shrink-0 font-light">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
