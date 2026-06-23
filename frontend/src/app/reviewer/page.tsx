"use client";

import { 
  Activity, ShieldCheck, CheckCircle2, AlertTriangle, 
  BarChart3, BrainCircuit, Target, Terminal, Eye
} from "lucide-react";

export default function ReviewerMode() {
  return (
    <div className="h-full flex flex-col bg-[#0A0A0F] overflow-hidden">
      
      {/* ════════════ HEADER ════════════ */}
      <div className="relative border-b border-[#1E2330] h-[64px] flex-shrink-0 flex items-center bg-[#0E1015] px-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#1E2330 1px, transparent 1px), linear-gradient(90deg, #1E2330 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded bg-[#6D5DFB]/10 flex items-center justify-center border border-[#6D5DFB]/30">
            <Eye size={16} className="text-[#6D5DFB]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight">Reviewer Mode</h1>
            <p className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest">Macro Telemetry & System Benchmarks</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
          
          {/* ════════════ RELIABILITY DASHBOARD ════════════ */}
          <section>
            <h2 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={14} /> Reliability Dashboard
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Compilation Success", value: "98.4%", color: "text-[#10B981]", bg: "bg-[#10B981]" },
                { label: "Execution Pass Rate", value: "96.7%", color: "text-[#10B981]", bg: "bg-[#10B981]" },
                { label: "Repair Success Rate", value: "91.2%", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]" },
                { label: "Avg Compile Time", value: "8.4s", color: "text-white", bg: "bg-[#475569]" },
                { label: "Avg Repair Count", value: "1.3", color: "text-white", bg: "bg-[#475569]" },
              ].map(stat => (
                <div key={stat.label} className="bg-[#0E1015] border border-[#1E2330] p-5 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold font-mono tracking-tighter ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-8">
            {/* ════════════ FAILURE ANALYSIS CENTER ════════════ */}
            <section>
              <h2 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> Failure Analysis Center
              </h2>
              <div className="bg-[#0E1015] border border-[#1E2330] rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#111318] border-b border-[#1E2330] text-[10px] font-bold text-[#475569] uppercase tracking-widest">
                    <tr>
                      <th className="p-4">Root Cause</th>
                      <th className="p-4">Occurrences</th>
                      <th className="p-4">Severity</th>
                      <th className="p-4">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330] text-[#E2E8F0]">
                    {[
                      { cause: "Schema Type Mismatch", count: 12, sev: "High", res: "Auto-Repaired (AST)" },
                      { cause: "Missing Foreign Key", count: 8, sev: "Medium", res: "Auto-Repaired (DB)" },
                      { cause: "Conflicting Auth Rules", count: 5, sev: "High", res: "Manual Review Req" },
                      { cause: "Incomplete Intent", count: 18, sev: "Low", res: "Assumptions Applied" },
                    ].map(row => (
                      <tr key={row.cause} className="hover:bg-[#111318] transition-colors">
                        <td className="p-4 font-mono text-[11px] text-[#94A3B8]">{row.cause}</td>
                        <td className="p-4 font-bold">{row.count}</td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.sev === 'High' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : row.sev === 'Medium' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' : 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20'}`}>{row.sev}</span></td>
                        <td className="p-4 text-xs text-[#64748B]">{row.res}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ════════════ CROSS-LAYER CONSISTENCY ════════════ */}
            <section>
              <h2 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck size={14} /> Cross-Layer Consistency Global Metrics
              </h2>
              <div className="bg-[#0E1015] border border-[#1E2330] rounded-xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] h-[230px] flex flex-col justify-center">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#94A3B8]">UI Schema ↔ API Schema Consistency</span>
                    <span className="text-sm font-mono font-bold text-[#10B981]">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#94A3B8]">API Schema ↔ Database Consistency</span>
                    <span className="text-sm font-mono font-bold text-[#10B981]">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#94A3B8]">Database Schema ↔ Auth Rules</span>
                    <span className="text-sm font-mono font-bold text-[#10B981]">99.2%</span>
                  </div>
                  <div className="mt-2 pt-4 border-t border-[#1E2330] flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Global Consistency Score</p>
                      <p className="text-2xl font-bold font-mono tracking-tighter text-[#6D5DFB] mt-1">99.2%</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Total Checks Run</p>
                       <p className="text-2xl font-bold font-mono tracking-tighter text-white mt-1">14,205</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ════════════ BENCHMARK CENTER ════════════ */}
          <section>
            <h2 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Target size={14} /> Benchmark Center
            </h2>
            <div className="grid grid-cols-2 gap-8">
              
              {/* Real Product Prompts */}
              <div className="bg-[#0E1015] border border-[#1E2330] rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <div className="bg-[#111318] p-4 border-b border-[#1E2330]">
                  <h3 className="text-sm font-bold text-white">10 Real Product Prompts</h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Testing the compiler against complete application requirements.</p>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] font-bold text-[#475569] uppercase tracking-widest border-b border-[#1E2330]">
                    <tr>
                      <th className="p-4">Prompt</th>
                      <th className="p-4">Result</th>
                      <th className="p-4">Repairs</th>
                      <th className="p-4">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330] text-[#E2E8F0]">
                    {[
                      { p: "CRM", r: "PASS", rp: 2, l: "8.4s" },
                      { p: "HRMS", r: "PASS", rp: 1, l: "7.2s" },
                      { p: "Inventory", r: "PASS", rp: 3, l: "9.1s" },
                      { p: "Learning Platform", r: "PASS", rp: 0, l: "6.5s" },
                      { p: "E-Commerce", r: "PASS", rp: 4, l: "11.2s" },
                      { p: "Booking System", r: "PASS", rp: 1, l: "7.8s" },
                      { p: "Help Desk", r: "PASS", rp: 0, l: "6.2s" },
                      { p: "Analytics Platform", r: "PASS", rp: 2, l: "8.9s" },
                      { p: "Subscription App", r: "PASS", rp: 1, l: "7.1s" },
                      { p: "Project Management Tool", r: "PASS", rp: 3, l: "9.5s" },
                    ].map(row => (
                      <tr key={row.p} className="hover:bg-[#111318] transition-colors">
                        <td className="p-3 px-4 font-medium text-xs">{row.p}</td>
                        <td className="p-3 px-4"><span className="text-[9px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-1.5 py-0.5 rounded uppercase">{row.r}</span></td>
                        <td className="p-3 px-4 font-mono text-xs text-[#94A3B8]">{row.rp}</td>
                        <td className="p-3 px-4 font-mono text-xs text-[#94A3B8]">{row.l}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edge Cases */}
              <div className="bg-[#0E1015] border border-[#1E2330] rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <div className="bg-[#111318] p-4 border-b border-[#1E2330]">
                  <h3 className="text-sm font-bold text-white">10 Edge Cases</h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Stress testing the assumption and repair engines.</p>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="text-[10px] font-bold text-[#475569] uppercase tracking-widest border-b border-[#1E2330]">
                    <tr>
                      <th className="p-4">Edge Case</th>
                      <th className="p-4">Handler</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330] text-[#E2E8F0]">
                    {[
                      { c: "Vague Requirements", h: "Assumption Engine", r: "RESOLVED" },
                      { c: "Conflicting Requirements", h: "Repair Engine", r: "RESOLVED" },
                      { c: "Incomplete Inputs", h: "Assumption Engine", r: "RESOLVED" },
                      { c: "Missing Roles", h: "Assumption Engine", r: "RESOLVED" },
                      { c: "Missing Auth", h: "Assumption Engine", r: "RESOLVED" },
                      { c: "Broken Relationships", h: "Repair Engine", r: "REPAIRED" },
                      { c: "Cyclic Dependencies", h: "Validation Engine", r: "REJECTED" },
                      { c: "Orphaned Tables", h: "Repair Engine", r: "REPAIRED" },
                      { c: "Missing Foreign Keys", h: "Repair Engine", r: "REPAIRED" },
                      { c: "Unreachable Routes", h: "Repair Engine", r: "REPAIRED" },
                    ].map(row => (
                      <tr key={row.c} className="hover:bg-[#111318] transition-colors">
                        <td className="p-3 px-4 font-medium text-xs">{row.c}</td>
                        <td className="p-3 px-4 font-mono text-[10px] text-[#64748B]">{row.h}</td>
                        <td className="p-3 px-4">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${row.r === 'REJECTED' ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20' : row.r === 'REPAIRED' ? 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' : 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20'}`}>
                            {row.r}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
