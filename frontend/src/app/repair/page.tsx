"use client";

import { Wrench, ShieldCheck, FileCode2, Code2, Database, Lock, CheckCircle2, ChevronRight, Activity } from "lucide-react";

export default function RepairEngine() {
  const repairs = [
    {
      id: "REP-901",
      action: "FIX_TYPE_MISMATCH",
      schema: "API",
      location: "src/app/api/contacts/route.ts:42",
      description: "Wrapped return object in { data: ... } to match frontend expectations.",
      status: "APPLIED",
      time: "2026-06-23T14:02:11Z",
      icon: <Code2 size={14} className="text-info" />
    },
    {
      id: "REP-902",
      action: "ADD_SCALAR_FIELD",
      schema: "DATABASE",
      location: "prisma/schema.prisma:18",
      description: "Added missing `userId String` field to Contact model to satisfy Prisma relation constraints.",
      status: "APPLIED",
      time: "2026-06-23T14:02:12Z",
      icon: <Database size={14} className="text-success" />
    },
    {
      id: "REP-903",
      action: "UPDATE_FALLBACK_ROLE",
      schema: "AUTH",
      location: "src/lib/auth.ts:114",
      description: "Changed fallback role from 'ADMIN' to 'USER' to prevent insecure default assignment.",
      status: "APPLIED",
      time: "2026-06-23T14:02:13Z",
      icon: <Lock size={14} className="text-warning" />
    },
    {
      id: "REP-904",
      action: "EXTEND_INTERFACE",
      schema: "UI",
      location: "src/components/dashboard/AnalyticsCharts.tsx:8",
      description: "Added `revenue: number` to AnalyticsData interface to resolve undefined property access.",
      status: "APPLIED",
      time: "2026-06-23T14:02:14Z",
      icon: <FileCode2 size={14} className="text-accent" />
    },
    {
      id: "REP-905",
      action: "ADD_DB_INDEX",
      schema: "DATABASE",
      location: "prisma/schema.prisma:22",
      description: "Added `@@index([email])` to User model to resolve performance warning on auth queries.",
      status: "APPLIED",
      time: "2026-06-23T14:02:14Z",
      icon: <Database size={14} className="text-success" />
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F]">
      
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text tracking-tight flex items-center gap-2">
            <Wrench size={18} className="text-accent" />
            Repair Engine
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Automated architecture corrections</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-success-bg border border-success/20">
            <CheckCircle2 size={14} className="text-success" />
            <span className="text-xs font-semibold text-success">5 Repairs Applied</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-auto p-6 max-w-5xl w-full mx-auto">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-px bg-border" />

          <div className="space-y-6">
            {repairs.map((repair, idx) => (
              <div key={repair.id} className="relative flex items-start gap-6 group">
                
                {/* Timeline Node */}
                <div className="relative z-10 w-12 h-12 rounded-xl bg-[#111318] border border-border flex items-center justify-center shrink-0">
                  {repair.icon}
                </div>

                {/* Repair Card */}
                <div className="flex-1 panel p-5 group-hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="badge badge-neutral">{repair.action}</span>
                      <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
                        {repair.schema}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-text-muted">{repair.time}</span>
                  </div>
                  
                  <p className="text-sm font-medium text-text mb-3">{repair.description}</p>
                  
                  <div className="flex items-center gap-2 bg-[#0A0A0F] p-2 rounded-md border border-white/5 w-fit">
                    <Activity size={12} className="text-text-muted" />
                    <code className="text-[11px] font-mono text-text-secondary">{repair.location}</code>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
