"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

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
  app_name: string;
  duration_ms: number;
  validation_errors: number;
  repair_count: number;
  execution_status: string;
  created_at: string;
}

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"];

export default function MetricsPage() {
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

  // Derive chart data
  const statusDistribution = (() => {
    const counts: Record<string, number> = { success: 0, partial: 0, failed: 0 };
    compilations.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  })();

  const latencyByCompilation = compilations
    .slice()
    .reverse()
    .map((c, i) => ({
      name: c.app_name || `#${i + 1}`,
      duration: Math.round(c.duration_ms / 1000 * 10) / 10,
      errors: c.validation_errors,
      repairs: c.repair_count,
    }));

  const errorRepairData = compilations
    .slice()
    .reverse()
    .map((c, i) => ({
      name: c.app_name || `#${i + 1}`,
      errors: c.validation_errors,
      repairs: c.repair_count,
    }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text">Metrics Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">
          Compiler performance analytics and insights
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 shimmer h-48" />
          ))}
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Compilations", value: metrics?.total_compilations || 0, color: "from-accent to-violet" },
              { label: "Success Rate", value: `${metrics?.success_rate || 0}%`, color: "from-emerald to-green-400" },
              { label: "Avg Latency", value: `${((metrics?.avg_duration_ms || 0) / 1000).toFixed(1)}s`, color: "from-amber to-yellow-400" },
              { label: "Exec Pass Rate", value: `${metrics?.execution_pass_rate || 0}%`, color: "from-blue-500 to-cyan-400" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="glass-card p-5 animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2 text-text">{stat.value}</p>
                <div className={`w-8 h-1 rounded bg-gradient-to-r ${stat.color} mt-2`} />
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Compilation Status Distribution */}
            <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-sm font-semibold text-text mb-4">Status Distribution</h3>
              {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#12141c",
                        border: "1px solid #2a2d3e",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#e4e6f0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-text-muted text-sm">
                  No data yet
                </div>
              )}
              <div className="flex justify-center gap-4 mt-2">
                {statusDistribution.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="text-[10px] text-text-muted capitalize">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Latency Over Compilations */}
            <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <h3 className="text-sm font-semibold text-text mb-4">Latency (seconds)</h3>
              {latencyByCompilation.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={latencyByCompilation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                    <XAxis dataKey="name" tick={{ fill: "#5c5f76", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#5c5f76", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#12141c",
                        border: "1px solid #2a2d3e",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#e4e6f0",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="duration"
                      stroke="#6366f1"
                      fill="rgba(99, 102, 241, 0.1)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-text-muted text-sm">
                  No data yet
                </div>
              )}
            </div>

            {/* Errors vs Repairs */}
            <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h3 className="text-sm font-semibold text-text mb-4">Validation Errors vs Repairs</h3>
              {errorRepairData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={errorRepairData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
                    <XAxis dataKey="name" tick={{ fill: "#5c5f76", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#5c5f76", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#12141c",
                        border: "1px solid #2a2d3e",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#e4e6f0",
                      }}
                    />
                    <Bar dataKey="errors" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="repairs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-text-muted text-sm">
                  No data yet
                </div>
              )}
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-error" />
                  <span className="text-[10px] text-text-muted">Errors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                  <span className="text-[10px] text-text-muted">Repairs</span>
                </div>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <h3 className="text-sm font-semibold text-text mb-4">Compiler Health</h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Success Rate",
                    value: metrics?.success_rate || 0,
                    max: 100,
                    color: "from-emerald to-green-400",
                    suffix: "%",
                  },
                  {
                    label: "Execution Pass Rate",
                    value: metrics?.execution_pass_rate || 0,
                    max: 100,
                    color: "from-accent to-violet",
                    suffix: "%",
                  },
                  {
                    label: "Avg Tokens",
                    value: metrics?.avg_tokens_used || 0,
                    max: 10000,
                    color: "from-amber to-yellow-400",
                    suffix: "",
                  },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-text-muted">{metric.label}</span>
                      <span className="text-xs font-medium text-text">
                        {metric.value}{metric.suffix}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                        style={{
                          width: `${Math.min((Number(metric.value) / metric.max) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
