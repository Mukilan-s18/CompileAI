"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/utils";

interface ValidationError {
  error_id: string;
  error_type: string;
  severity: string;
  location: string;
  message: string;
  suggestion: string;
  related_locations: string[];
}

interface CompilationSummary {
  id: string;
  status: string;
  app_name: string;
  validation_errors: number;
}

export default function ValidationPage() {
  const [compilations, setCompilations] = useState<CompilationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    apiClient<CompilationSummary[]>("/compilations")
      .then(setCompilations)
      .catch(() => {});
  }, []);

  async function loadValidation(id: string) {
    setSelectedId(id);
    setLoading(true);
    try {
      const result = await apiClient<Record<string, unknown>>(`/compilations/${id}`);
      const validation = result.validation as Record<string, unknown>;
      if (validation) {
        setErrors((validation.errors as ValidationError[]) || []);
        setWarnings((validation.warnings as ValidationError[]) || []);
      }
    } catch {
      setErrors([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredErrors =
    filter === "all"
      ? [...errors, ...warnings]
      : filter === "errors"
      ? errors
      : warnings;

  const severityIcon: Record<string, string> = {
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  const severityBadge: Record<string, string> = {
    error: "badge-error",
    warning: "badge-warning",
    info: "badge-info",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text">Validation Logs</h1>
        <p className="text-text-secondary text-sm mt-1">
          Cross-schema consistency check results
        </p>
      </div>

      {/* Compilation Selector */}
      <div className="glass-card p-4 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
          Select Compilation
        </label>
        <div className="flex flex-wrap gap-2">
          {compilations.length === 0 ? (
            <p className="text-sm text-text-muted">No compilations available. Generate one first.</p>
          ) : (
            compilations.map((comp) => (
              <button
                key={comp.id}
                onClick={() => loadValidation(comp.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedId === comp.id
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "bg-surface-hover text-text-secondary hover:text-text border border-border-light"
                }`}
              >
                {comp.app_name || comp.id.substring(0, 8)} ({comp.validation_errors} errors)
              </button>
            ))
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        {[
          { key: "all", label: `All (${errors.length + warnings.length})` },
          { key: "errors", label: `Errors (${errors.length})` },
          { key: "warnings", label: `Warnings (${warnings.length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === f.key
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-surface text-text-secondary border border-border-light hover:text-text"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Validation Errors List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-4 shimmer h-24" />
          ))}
        </div>
      ) : filteredErrors.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-text-secondary">
            {selectedId ? "No validation issues found" : "Select a compilation to view validation results"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredErrors.map((err, i) => (
            <div
              key={err.error_id}
              className="glass-card p-4 animate-fade-in hover:border-accent/20 transition-all"
              style={{ animationDelay: `${0.2 + i * 0.03}s` }}
            >
              <div className="flex items-start gap-3">
                <span className={`text-lg ${err.severity === "error" ? "text-error" : "text-warning"}`}>
                  {severityIcon[err.severity] || "•"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge ${severityBadge[err.severity]}`}>{err.error_type}</span>
                    <code className="text-xs text-text-muted bg-surface-hover px-2 py-0.5 rounded">
                      {err.location}
                    </code>
                  </div>
                  <p className="text-sm text-text">{err.message}</p>
                  <p className="text-xs text-accent mt-1">💡 {err.suggestion}</p>
                  {err.related_locations.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {err.related_locations.map((loc) => (
                        <code key={loc} className="text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded">
                          {loc}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
