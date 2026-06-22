"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function CostAnalysisPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCostData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/cost-analysis");
        if (!res.ok) throw new Error("Failed to fetch cost analysis");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCostData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-accent text-lg">Loading cost analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-red-500 bg-red-500/10 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Format data for chart
  const chartData = data.model_comparison.map((m: any) => ({
    name: m.model,
    cost: m.cost_for_100_compilations_usd,
    quality: m.quality_score * 100,
    latency: m.avg_latency_ms / 1000,
  }));

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="Cost vs Quality Tradeoff Analysis"
        description="Compare latency, token usage, accuracy, and dollar cost across supported LLM models."
      />

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-accent/20 border-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-text-muted uppercase font-semibold">
                Recommended Default
              </p>
              <h3 className="text-xl font-bold text-accent">
                {data.recommendations.recommended_default.model}
              </h3>
            </div>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {data.recommendations.recommended_default.reason}
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-text-muted uppercase font-semibold">
                Best Value
              </p>
              <h3 className="text-xl font-bold text-text">
                {data.recommendations.best_value.model}
              </h3>
            </div>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {data.recommendations.best_value.reason}
          </p>
          <p className="mt-4 font-mono text-sm text-accent">
            ${data.recommendations.best_value.cost} / compile
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-text-muted uppercase font-semibold">
                Lowest Latency
              </p>
              <h3 className="text-xl font-bold text-text">
                {data.recommendations.lowest_latency.model}
              </h3>
            </div>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {data.recommendations.lowest_latency.reason}
          </p>
          <p className="mt-4 font-mono text-sm text-accent">
            {data.recommendations.lowest_latency.latency_ms / 1000}s / compile
          </p>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text">Model Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="p-4 text-xs font-medium text-text-muted uppercase">Model</th>
                <th className="p-4 text-xs font-medium text-text-muted uppercase">Description</th>
                <th className="p-4 text-xs font-medium text-text-muted uppercase text-right">Tokens/Run</th>
                <th className="p-4 text-xs font-medium text-text-muted uppercase text-right">Cost/Run</th>
                <th className="p-4 text-xs font-medium text-text-muted uppercase text-right">Latency</th>
                <th className="p-4 text-xs font-medium text-text-muted uppercase text-right">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.model_comparison.map((model: any) => (
                <tr key={model.model} className="hover:bg-surface-hover transition-colors">
                  <td className="p-4 font-medium text-text">{model.model}</td>
                  <td className="p-4 text-sm text-text-secondary">{model.description}</td>
                  <td className="p-4 text-sm font-mono text-text-muted text-right">
                    {model.total_tokens.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-mono text-accent text-right">
                    ${model.cost_per_compilation_usd.toFixed(4)}
                  </td>
                  <td className="p-4 text-sm font-mono text-text-muted text-right">
                    {(model.avg_latency_ms / 1000).toFixed(1)}s
                  </td>
                  <td className="p-4 text-sm text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        model.quality_score >= 0.9
                          ? "bg-green-500/10 text-green-500"
                          : model.quality_score >= 0.8
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {Math.round(model.quality_score * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-6 h-[400px]">
        <h2 className="text-lg font-semibold text-text mb-6">Cost for 100 Compilations (USD)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D334B" vertical={false} />
            <XAxis dataKey="name" stroke="#8A92B2" tick={{ fill: "#8A92B2" }} />
            <YAxis stroke="#8A92B2" tick={{ fill: "#8A92B2" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1A1D2D", borderColor: "#2D334B", color: "#E2E8F0" }}
              itemStyle={{ color: "#E2E8F0" }}
            />
            <Bar dataKey="cost" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Cost (USD)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
