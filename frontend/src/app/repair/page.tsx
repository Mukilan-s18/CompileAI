"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/utils";

interface RepairAction {
  action_type: string;
  target_schema: string;
  location: string;
  description: string;
  error_id: string;
}

interface CompilationSummary {
  id: string;
  app_name: string;
  repair_count: number;
}

export default function RepairPage() {
  const [compilations, setCompilations] = useState<CompilationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [repairs, setRepairs] = useState<RepairAction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient<CompilationSummary[]>("/compilations")
      .then(setCompilations)
      .catch(() => {});
  }, []);

  async function loadRepairs(id: string) {
    setSelectedId(id);
    setLoading(true);
    try {
      const result = await apiClient<Record<string, unknown>>(`/compilations/${id}`);
      setRepairs((result.repair_log as RepairAction[]) || []);
    } catch {
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  }

  const actionIcons: Record<string, string> = {
    add_endpoint: "🔗",
    add_column: "📊",
    add_table: "🗄️",
    add_role: "👤",
    add_route_guard: "🛡️",
    fix_type: "🔧",
    fix_relationship: "↔️",
    fix_foreign_key: "🔑",
    remove_field: "🗑️",
    add_field: "➕",
    add_permission: "🔐",
    add_navigation: "🧭",
  };

  const schemaColors: Record<string, string> = {
    api: "text-blue-400",
    db: "text-emerald",
    auth: "text-violet",
    ui: "text-amber",
    business_logic: "text-rose-400",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text">Repair Logs</h1>
        <p className="text-text-secondary text-sm mt-1">
          Targeted repairs performed by the repair engine
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
                onClick={() => loadRepairs(comp.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedId === comp.id
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "bg-surface-hover text-text-secondary hover:text-text border border-border-light"
                }`}
              >
                {comp.app_name || comp.id.substring(0, 8)} ({comp.repair_count} repairs)
              </button>
            ))
          )}
        </div>
      </div>

      {/* Repair Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-4 shimmer h-20" />
          ))}
        </div>
      ) : repairs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">⚙️</p>
          <p className="text-text-secondary">
            {selectedId
              ? "No repairs were needed — schemas were valid on first pass"
              : "Select a compilation to view repair actions"}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border-light" />

          <div className="space-y-4">
            {repairs.map((repair, i) => (
              <div
                key={i}
                className="relative flex items-start gap-4 animate-fade-in"
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                {/* Timeline dot */}
                <div className="relative z-10 w-12 h-12 rounded-lg bg-surface border border-border-light flex items-center justify-center text-xl shrink-0">
                  {actionIcons[repair.action_type] || "🔧"}
                </div>

                {/* Repair card */}
                <div className="flex-1 glass-card p-4 hover:border-accent/20 transition-all">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="badge badge-info">{repair.action_type}</span>
                    <span className={`text-xs font-medium ${schemaColors[repair.target_schema] || "text-text-secondary"}`}>
                      {repair.target_schema.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-text">{repair.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <code className="text-[11px] text-text-muted bg-background px-2 py-0.5 rounded">
                      {repair.location}
                    </code>
                    <span className="text-[10px] text-text-muted">
                      triggered by {repair.error_id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
