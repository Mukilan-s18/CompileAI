"use client";

import { FileText, Search, Filter, AlertCircle, AlertTriangle, Info, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";

type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  details?: string;
}

const LOGS: LogEntry[] = [
  { id: "LOG-001", timestamp: "2026-06-23T14:02:14Z", level: "INFO", source: "CompilerEngine", message: "Compilation started for spec: B2B SaaS CRM", details: "Session ID: sess_a8f2c4d1" },
  { id: "LOG-002", timestamp: "2026-06-23T14:02:14Z", level: "INFO", source: "IntentExtractor", message: "Extracted 5 features with avg confidence 0.966" },
  { id: "LOG-003", timestamp: "2026-06-23T14:02:15Z", level: "INFO", source: "SystemDesigner", message: "Architecture generated: Next.js 14 + PostgreSQL + Prisma" },
  { id: "LOG-004", timestamp: "2026-06-23T14:02:16Z", level: "INFO", source: "SchemaGenerator", message: "Generated 6 schema artifacts across 4 layers" },
  { id: "LOG-005", timestamp: "2026-06-23T14:02:17Z", level: "WARN", source: "Validator", message: "Field naming inconsistency: API uses user_id but DB uses userId", details: "Affected: apiSchema.contacts, databaseSchema.Contact" },
  { id: "LOG-006", timestamp: "2026-06-23T14:02:17Z", level: "WARN", source: "Validator", message: "Missing database index on frequently queried field", details: "Field: Contact.email — Suggestion: Add @@index([email])" },
  { id: "LOG-007", timestamp: "2026-06-23T14:02:18Z", level: "INFO", source: "RepairEngine", message: "Applied 1 automatic repair: field naming normalized to camelCase" },
  { id: "LOG-008", timestamp: "2026-06-23T14:02:19Z", level: "INFO", source: "RuntimeSimulator", message: "Dry-run execution completed: All 14 routes respond correctly" },
  { id: "LOG-009", timestamp: "2026-06-23T14:02:19Z", level: "INFO", source: "CompilerEngine", message: "Compilation completed successfully in 9.1s" },
  { id: "LOG-010", timestamp: "2026-06-23T14:05:32Z", level: "ERROR", source: "CompilerEngine", message: "Rate limit exceeded for workspace org_c9x2b4m8", details: "Max 10 compilations/hour. Retry after: 2026-06-23T15:00:00Z" },
  { id: "LOG-011", timestamp: "2026-06-23T14:10:01Z", level: "DEBUG", source: "CacheManager", message: "Schema cache invalidated for session sess_a8f2c4d1" },
  { id: "LOG-012", timestamp: "2026-06-23T14:15:44Z", level: "INFO", source: "CompilerEngine", message: "Compilation started for spec: E-Commerce Storefront" },
];

const levelConfig: Record<LogLevel, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  ERROR: { icon: <AlertCircle size={14} />, color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" },
  WARN: { icon: <AlertTriangle size={14} />, color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
  INFO: { icon: <CheckCircle2 size={14} />, color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
  DEBUG: { icon: <Info size={14} />, color: "#94A3B8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" },
};

export default function LogsPage() {
  const [filter, setFilter] = useState<LogLevel | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = LOGS.filter(log => {
    const matchesLevel = filter === "ALL" || log.level === filter;
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || log.source.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <FileText size={18} className="text-[#6D5DFB]" />
            System Logs
          </h1>
          <p className="text-xs text-[#475569] mt-0.5">Compiler engine activity and audit trail</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="bg-[#0A0A0F] border border-[#1E2330] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6D5DFB]/50 w-56 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1">
            {(["ALL", "ERROR", "WARN", "INFO", "DEBUG"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  filter === level
                    ? "bg-white/10 text-white"
                    : "text-[#475569] hover:text-[#94A3B8] hover:bg-white/5"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl w-full mx-auto p-6 space-y-2">
          {filtered.map((log) => {
            const config = levelConfig[log.level];
            return (
              <div
                key={log.id}
                className="bg-[#111318] border border-[#1E2330] rounded-lg px-4 py-3 flex items-start gap-3 hover:border-[#2B3040] transition-colors"
              >
                <div className="mt-0.5 shrink-0" style={{ color: config.color }}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{ color: config.color, backgroundColor: config.bg, border: `1px solid ${config.border}` }}
                    >
                      {log.level}
                    </span>
                    <span className="text-[10px] font-mono text-[#475569] bg-white/5 px-1.5 py-0.5 rounded">{log.source}</span>
                    <span className="text-[10px] font-mono text-[#475569] ml-auto flex items-center gap-1">
                      <Clock size={9} /> {log.timestamp.split("T")[1].replace("Z", "")}
                    </span>
                  </div>
                  <p className="text-sm text-[#F8FAFC]">{log.message}</p>
                  {log.details && (
                    <p className="text-xs text-[#475569] font-mono mt-1 bg-[#0A0A0F] px-2 py-1 rounded border border-[#1E2330]">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
