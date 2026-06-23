"use client";

import { BarChart2, CheckCircle2, XCircle, Clock, Zap } from "lucide-react";

export default function BenchmarksPage() {
  const benchmarks = [
    { name: "B2B SaaS Core", complexity: "High", success: true, latency: "4.2s", repairs: 2, schemas: 12 },
    { name: "E-Commerce Storefront", complexity: "High", success: true, latency: "5.1s", repairs: 4, schemas: 18 },
    { name: "Internal Admin Dashboard", complexity: "Medium", success: true, latency: "2.8s", repairs: 0, schemas: 6 },
    { name: "Real-time Chat App", complexity: "Very High", success: false, latency: "8.4s", repairs: 11, schemas: 8 },
    { name: "Personal Blog", complexity: "Low", success: true, latency: "1.1s", repairs: 0, schemas: 3 },
    { name: "Fintech Ledger", complexity: "Critical", success: true, latency: "6.5s", repairs: 3, schemas: 24 },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#09090B]">
      
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111113] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text tracking-tight flex items-center gap-2">
            <BarChart2 size={18} className="text-accent" />
            Evaluation Benchmarks
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Automated prompt suite evaluation results</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Pass Rate</span>
            <span className="text-xs font-bold text-text">83.3%</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-auto p-6 max-w-6xl w-full mx-auto space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="panel p-5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Total Benchmarks</p>
            <p className="text-2xl font-bold text-text">6</p>
          </div>
          <div className="panel p-5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Successful</p>
            <p className="text-2xl font-bold text-success">5</p>
          </div>
          <div className="panel p-5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Failed</p>
            <p className="text-2xl font-bold text-error">1</p>
          </div>
          <div className="panel p-5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Avg Latency</p>
            <p className="text-2xl font-bold text-accent">4.6s</p>
          </div>
        </div>

        {/* Benchmark Table */}
        <div className="panel overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-[#111113]/50 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                <th className="p-4 pl-5">Benchmark Suite</th>
                <th className="p-4">Complexity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Schemas Gen</th>
                <th className="p-4">Repairs Req</th>
                <th className="p-4 pr-5">Comp. Latency</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {benchmarks.map((bm, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 pl-5 font-medium text-text-secondary">{bm.name}</td>
                  <td className="p-4">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      {bm.complexity}
                    </span>
                  </td>
                  <td className="p-4">
                    {bm.success ? (
                      <span className="badge badge-success flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} /> PASS
                      </span>
                    ) : (
                      <span className="badge badge-error flex items-center gap-1 w-fit">
                        <XCircle size={12} /> FAIL
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-text-secondary">{bm.schemas}</td>
                  <td className="p-4 font-mono text-text-secondary">{bm.repairs}</td>
                  <td className="p-4 pr-5 font-mono text-text-muted flex items-center gap-1.5">
                    <Clock size={12} className="opacity-50" />
                    {bm.latency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
