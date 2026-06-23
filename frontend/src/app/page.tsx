"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Cuboid, 
  FileCode2, 
  ShieldCheck, 
  Wrench, 
  Rocket,
  CheckCircle2,
  Loader2,
  Lock,
  Database,
  Layout,
  Code2,
  AlertTriangle,
  Activity,
  Sparkles,
  RefreshCw,
  Check,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Terminal,
  Box,
  Zap,
  Download,
  Copy,
  Bell,
  BookOpen,
  Users,
  Building2,
  CreditCard,
  Handshake,
  User,
  ArrowRight
} from "lucide-react";
import { JsonViewer } from "@/components/ui/json-viewer";
import { MOCK_DATA } from "@/app/generator/mock-data";

/* ──────────────────────────── Mini Sparkline ──────────────────────────── */
function MiniChart({ color, data }: { color: string; data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ──────────────────────────── Circular Progress ──────────────────────────── */
function CircularProgress({ value, color, size = 40 }: { value: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} strokeWidth="3" stroke="rgba(255,255,255,0.06)" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} strokeWidth="3" stroke={color} fill="none" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
    </svg>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("Build a CRM with:\n  • Authentication (email + Google)\n  • Contacts management\n  • Analytics dashboard\n  • Role-based access (Admin, Manager, Sales)\n  • Premium subscriptions with payments");
  const [isCompiling, setIsCompiling] = useState(false);
  const [hasCompiled, setHasCompiled] = useState(true);
  const [currentStage, setCurrentStage] = useState(5);
  const [activeTab, setActiveTab] = useState<string>("intent");

  const stages = [
    { id: "intent", label: "Intent Extraction", icon: Target, desc: "NL → Structured Intent", time: "1.2s" },
    { id: "design", label: "System Design", icon: Cuboid, desc: "Intent → Architecture", time: "1.8s" },
    { id: "schemas", label: "Schema Generation", icon: FileCode2, desc: "Architecture → Schemas", time: "3.3s" },
    { id: "validation", label: "Validation", icon: ShieldCheck, desc: "Cross-schema checks", time: "0.0s" },
    { id: "repair", label: "Repair Engine", icon: Wrench, desc: "Targeted fixes applied", time: "0.3s" },
    { id: "simulation", label: "Runtime Simulation", icon: Rocket, desc: "Execution verification", time: "1.5s" },
  ];

  const tabs = [
    { id: "intent", label: "Intent" },
    { id: "architecture", label: "Architecture" },
    { id: "uiSchema", label: "UI Schema" },
    { id: "apiSchema", label: "API Schema" },
    { id: "databaseSchema", label: "Database Schema" },
    { id: "authRules", label: "Auth Rules" },
    { id: "validationReport", label: "Validation Report" },
    { id: "executionReport", label: "Execution Report" },
  ];

  const handleCompile = () => {
    if (!prompt.trim()) return;
    setIsCompiling(true);
    setHasCompiled(false);
    setCurrentStage(0);

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= stages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCompiling(false);
            setHasCompiled(true);
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1100);
  };

  return (
    <div className="h-full flex flex-col">
      
      {/* ═══════════════════ TOP HEADER BAR ═══════════════════ */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0">
        {/* Left: Welcome + Engine Status */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-[#94A3B8]">Welcome back, Mukilan 👋</span>
        </div>
        
        {/* Right: Engine pill + Docs + Bell + Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#10B981]">Engine Online</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors border border-border">
            <BookOpen size={14} />
            Docs
          </button>
          <button className="p-2 text-[#475569] hover:text-white transition-colors">
            <Bell size={16} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#6D5DFB] flex items-center justify-center text-white font-bold text-xs cursor-pointer">
            MK
          </div>
        </div>
      </div>

      {/* ═══════════════════ SCROLLABLE CONTENT ═══════════════════ */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        
        {/* ─── ROW 1: Hero + Engine Status + Metrics ─── */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left: Hero + Application Spec */}
          <div className="col-span-7 flex flex-col gap-6">
            
            {/* Hero */}
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight tracking-tight mb-2">
                Define your architecture.<br />
                We <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D5DFB] to-[#9D8BFF]">compile</span> the execution.
              </h1>
              <p className="text-sm text-[#94A3B8] max-w-xl leading-relaxed">
                Transform ideas into production-ready applications with<br />
                AI-powered compilation, validation, and runtime verification.
              </p>
            </div>
            
            {/* Application Spec Editor */}
            <div className="bg-[#111318] border border-[#1E2330] rounded-xl overflow-hidden shadow-lg">
              {/* Editor Header */}
              <div className="px-4 py-2.5 border-b border-[#1E2330] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">
                    APPLICATION SPEC
                  </span>
                  <span className="text-[10px] text-[#94A3B8] bg-white/5 px-2 py-0.5 rounded">(Natural Language)</span>
                </div>
                <span className="text-[10px] font-medium text-[#6D5DFB] bg-[#6D5DFB]/10 px-2 py-0.5 rounded border border-[#6D5DFB]/20">
                  Example: CRM
                </span>
              </div>
              
              {/* Editor Body */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 bg-[#0C0E14] text-[#F8FAFC] text-[13px] font-mono p-4 resize-none focus:outline-none placeholder:text-[#475569] leading-relaxed"
                spellCheck="false"
              />

              {/* Editor Footer */}
              <div className="px-4 py-2.5 border-t border-[#1E2330] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors">
                    <Sparkles size={12} className="text-[#6D5DFB]" />
                    AI Assist
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors">
                    <RefreshCw size={12} />
                    Improve Spec
                  </button>
                </div>
                <button
                  onClick={handleCompile}
                  disabled={isCompiling || !prompt.trim()}
                  className="bg-gradient-to-r from-[#6D5DFB] to-[#5B4AEB] text-white hover:from-[#5B4AEB] hover:to-[#4A39D9] disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(109,93,251,0.25)] flex items-center gap-2"
                >
                  {isCompiling ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      Compile Application
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Engine Status + 4 Metric Cards */}
          <div className="col-span-5 flex flex-col gap-4">
            
            {/* Engine Status */}
            <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">Engine Status</p>
                <p className="text-sm font-semibold text-[#10B981]">All Systems Operational</p>
              </div>
              <div className="flex items-center gap-1">
                {[30, 45, 35, 55, 50, 65, 60, 75, 70, 85, 80, 95].map((h, i) => (
                  <div key={i} className="w-1.5 rounded-full bg-[#10B981]/20" style={{ height: `${h * 0.28}px` }}>
                    <div className="w-full h-full rounded-full bg-[#10B981]/50" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Total Compilations */}
              <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Total Compilations</p>
                  <div className="w-7 h-7 rounded-lg bg-[#6D5DFB]/10 flex items-center justify-center">
                    <Zap size={14} className="text-[#6D5DFB]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-2">1,248</p>
                <MiniChart color="#6D5DFB" data={[20, 35, 30, 45, 40, 55, 50, 65, 60, 72]} />
                <p className="text-[10px] text-[#10B981] font-semibold mt-2 flex items-center gap-1">
                  <TrendingUp size={10} /> +18.7% this week
                </p>
              </div>

              {/* Execution Pass Rate */}
              <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Execution Pass Rate</p>
                  <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-[#10B981]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-2">98.6%</p>
                <MiniChart color="#10B981" data={[90, 92, 94, 93, 96, 95, 97, 98, 97, 98.6]} />
                <p className="text-[10px] text-[#10B981] font-semibold mt-2 flex items-center gap-1">
                  <TrendingUp size={10} /> +2.4% this week
                </p>
              </div>

              {/* Avg. Latency */}
              <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Avg. Latency</p>
                  <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                    <Activity size={14} className="text-[#3B82F6]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-2">2.43s</p>
                <MiniChart color="#3B82F6" data={[3.2, 3.0, 2.8, 2.9, 2.7, 2.6, 2.5, 2.5, 2.4, 2.43]} />
                <p className="text-[10px] text-[#10B981] font-semibold mt-2 flex items-center gap-1">
                  <TrendingDown size={10} /> ↓ 0.31s improvement
                </p>
              </div>

              {/* Validation Errors */}
              <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Validation Errors</p>
                  <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                    <AlertTriangle size={14} className="text-[#F59E0B]" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#F59E0B] mb-2">12</p>
                <MiniChart color="#F59E0B" data={[5, 8, 6, 9, 7, 10, 8, 11, 9, 12]} />
                <p className="text-[10px] text-[#F59E0B] font-semibold mt-2 flex items-center gap-1">
                  <TrendingUp size={10} /> +34% this week
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ROW 2: Compiler Pipeline + Output Explorer ─── */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Compiler Pipeline */}
          <div className="col-span-4 bg-[#111318] border border-[#1E2330] rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">Compiler Pipeline</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[10px] font-semibold text-[#10B981]">Live</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[15px] top-6 bottom-16 w-[1.5px] bg-[#1E2330] z-0" />
              
              {stages.map((stage, idx) => {
                const isComplete = hasCompiled || (isCompiling && currentStage > idx);
                const isCurrent = isCompiling && currentStage === idx;
                const Icon = stage.icon;

                let statusColor = "#10B981";
                let StatusIcon = Check;
                let badge = null;

                if (isComplete) {
                  if (stage.id === "validation") {
                    StatusIcon = Check;
                    statusColor = "#F59E0B";
                    badge = (
                      <span className="text-[9px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Check size={8} /> 2 issues
                      </span>
                    );
                  } else if (stage.id === "repair") {
                    statusColor = "#3B82F6";
                    badge = (
                      <span className="text-[9px] font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Check size={8} /> 1 fix
                      </span>
                    );
                  } else if (stage.id === "simulation") {
                    badge = (
                      <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Check size={8} /> PASS
                      </span>
                    );
                  }
                }

                return (
                  <div key={stage.id} className="relative z-10 flex items-center gap-3 py-2 group">
                    {/* Status Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300
                      ${isComplete 
                        ? `border-[${statusColor}]/30` 
                        : isCurrent 
                          ? "border-[#6D5DFB]/50 shadow-[0_0_12px_rgba(109,93,251,0.3)]"
                          : "border-[#1E2330]"
                      }
                    `}
                    style={{
                      background: isComplete ? `${statusColor}15` : isCurrent ? '#6D5DFB15' : '#151821',
                      borderColor: isComplete ? `${statusColor}50` : isCurrent ? '#6D5DFB80' : '#1E2330',
                    }}
                    >
                      {isComplete ? (
                        <Check size={14} style={{ color: statusColor }} />
                      ) : isCurrent ? (
                        <Loader2 size={14} className="text-[#6D5DFB] animate-spin" />
                      ) : (
                        <Icon size={14} className="text-[#475569]" />
                      )}
                    </div>
                    
                    {/* Label + Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isComplete || isCurrent ? "text-white" : "text-[#475569]"}`}>
                          {stage.label}
                        </span>
                        {badge}
                      </div>
                      <span className="text-[11px] text-[#475569]">{stage.desc}</span>
                    </div>
                    
                    {/* Time Badge */}
                    <span className="text-[10px] font-mono text-[#475569] bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                      {stage.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Completion Banner */}
            <AnimatePresence>
              {hasCompiled && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#10B981]" />
                    <span className="text-xs font-bold text-[#10B981]">Compilation Completed Successfully</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#10B981]/70">Total Time: 9.1s</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Output Explorer */}
          <div className="col-span-8 bg-[#111318] border border-[#1E2330] rounded-xl overflow-hidden flex flex-col">
            {/* Tab Bar */}
            <div className="flex items-center justify-between border-b border-[#1E2330] bg-[#0E1015] px-1">
              <div className="flex items-center overflow-x-auto custom-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2.5 text-[11px] font-semibold tracking-wide transition-colors border-b-2 whitespace-nowrap ${
                      activeTab === tab.id 
                        ? "text-white border-[#6D5DFB]" 
                        : "text-[#475569] border-transparent hover:text-[#94A3B8]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pr-3 shrink-0">
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors border border-[#1E2330]">
                  <Download size={11} />
                  Download
                  <ChevronDown size={10} />
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors border border-[#1E2330]">
                  <Copy size={11} />
                  Copy
                </button>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex flex-1 min-h-[360px]">
              {/* JSON Viewer */}
              <div className="flex-1 overflow-auto bg-[#0A0A0F] p-4 font-mono text-[13px] leading-relaxed custom-scrollbar border-r border-[#1E2330]">
                {hasCompiled || activeTab === "intent" ? (
                  <JsonViewerInline data={(MOCK_DATA as any)[activeTab]} />
                ) : isCompiling ? (
                  <div className="flex items-center justify-center h-full text-[#475569]">
                    <Loader2 size={20} className="animate-spin text-[#6D5DFB]" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#475569] text-sm">
                    Awaiting compilation...
                  </div>
                )}
              </div>

              {/* Right Sidebar: Architecture Overview + Quick Stats */}
              <div className="w-[280px] shrink-0 flex flex-col bg-[#0E1015]">
                {/* Architecture Overview */}
                <div className="p-4 border-b border-[#1E2330] flex-1">
                  <h4 className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-4">Architecture Overview</h4>
                  <div className="relative flex flex-col items-center gap-2">
                    {/* Node Graph */}
                    <div className="w-full flex justify-center gap-3 flex-wrap">
                      {[
                        { label: "User", color: "#6D5DFB" },
                        { label: "Contact", color: "#10B981" },
                        { label: "Company", color: "#3B82F6" },
                      ].map((node) => (
                        <div key={node.label} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold border"
                          style={{ 
                            borderColor: `${node.color}40`, 
                            backgroundColor: `${node.color}10`,
                            color: node.color 
                          }}
                        >
                          {node.label}
                        </div>
                      ))}
                    </div>
                    {/* Connection lines (SVG) */}
                    <svg className="w-full h-8" viewBox="0 0 200 30">
                      <line x1="40" y1="0" x2="100" y2="25" stroke="#1E2330" strokeWidth="1" />
                      <line x1="100" y1="0" x2="100" y2="25" stroke="#1E2330" strokeWidth="1" />
                      <line x1="160" y1="0" x2="100" y2="25" stroke="#1E2330" strokeWidth="1" />
                    </svg>
                    <div className="w-full flex justify-center gap-3">
                      {[
                        { label: "Subscription", color: "#F59E0B" },
                        { label: "Deal", color: "#EF4444" },
                      ].map((node) => (
                        <div key={node.label} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold border"
                          style={{ 
                            borderColor: `${node.color}40`, 
                            backgroundColor: `${node.color}10`,
                            color: node.color 
                          }}
                        >
                          {node.label}
                        </div>
                      ))}
                    </div>
                    <button className="text-[10px] text-[#6D5DFB] hover:underline mt-2">+ 6 more entities</button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="p-4">
                  <h4 className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-3">Quick Stats</h4>
                  <div className="space-y-2.5">
                    {[
                      { icon: <Box size={12} />, label: "Entities", value: "12", color: "#6D5DFB" },
                      { icon: <Code2 size={12} />, label: "API Endpoints", value: "28", color: "#10B981" },
                      { icon: <Database size={12} />, label: "Database Tables", value: "14", color: "#3B82F6" },
                      { icon: <Layout size={12} />, label: "UI Pages", value: "22", color: "#F59E0B" },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span style={{ color: stat.color }}>{stat.icon}</span>
                          <span className="text-[11px] text-[#94A3B8]">{stat.label}</span>
                        </div>
                        <span className="text-sm font-bold text-white">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="px-4 py-2 border-t border-[#1E2330] bg-[#0E1015] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[#10B981]" />
                <span className="text-[10px] font-semibold text-[#10B981]">Schema Valid</span>
              </div>
              <span className="text-[10px] text-[#475569]">Last updated: 2s ago</span>
            </div>
          </div>
        </div>

        {/* ─── ROW 3: Bottom Dashboard Cards ─── */}
        <div className="grid grid-cols-4 gap-6 pb-6">
          <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-5 flex items-center gap-4">
            <div className="relative">
              <CircularProgress value={90} color="#6D5DFB" size={44} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">90%</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-1">Benchmarks</p>
              <p className="text-lg font-bold text-white">18 / 20 Passed</p>
            </div>
          </div>
          
          <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-5 flex items-center gap-4">
            <div className="w-16 shrink-0">
              <MiniChart color="#10B981" data={[95, 96, 97, 96, 98, 97, 98, 99, 98, 98.6]} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-1">Execution Success</p>
              <p className="text-lg font-bold text-white">98.6%</p>
            </div>
          </div>

          <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-5 flex items-center gap-4">
            <div className="w-16 shrink-0">
              <MiniChart color="#F59E0B" data={[8, 9, 10, 9, 11, 10, 12, 11, 13, 12.4]} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-1">Repair Rate</p>
              <p className="text-lg font-bold text-white">12.4%</p>
            </div>
          </div>

          <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-5 flex items-center gap-4">
            <div className="w-16 shrink-0">
              <MiniChart color="#10B981" data={[90, 92, 94, 93, 96, 95, 97, 98, 97, 99]} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-1">System Health</p>
              <p className="text-lg font-bold text-[#10B981]">Healthy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────── Inline JSON Viewer (with line numbers like reference) ──────────── */
function JsonViewerInline({ data }: { data: any }) {
  const json = JSON.stringify(data, null, 2);
  const lines = json.split("\n");

  return (
    <div className="flex">
      {/* Line Numbers */}
      <div className="pr-4 text-right select-none shrink-0 border-r border-[#1E2330] mr-4">
        {lines.map((_, i) => (
          <div key={i} className="text-[#2A3040] text-[13px] leading-relaxed font-mono">{i + 1}</div>
        ))}
      </div>
      {/* Code */}
      <pre className="text-[13px] leading-relaxed overflow-x-auto">
        {lines.map((line, i) => (
          <div key={i}>{colorize(line)}</div>
        ))}
      </pre>
    </div>
  );
}

/* Simple JSON syntax colorizer */
function colorize(line: string): React.ReactNode {
  // Split the line into tokens and colorize
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    // Match key: "key":
    const keyMatch = remaining.match(/^(\s*)"([^"]+)"(\s*:\s*)/);
    if (keyMatch) {
      parts.push(<span key={key++} className="text-[#F8FAFC]">{keyMatch[1]}&quot;{keyMatch[2]}&quot;</span>);
      parts.push(<span key={key++} className="text-[#475569]">{keyMatch[3]}</span>);
      remaining = remaining.slice(keyMatch[0].length);
      continue;
    }

    // Match string value: "value"
    const strMatch = remaining.match(/^"([^"]*)"(,?\s*)/);
    if (strMatch) {
      parts.push(<span key={key++} className="text-[#10B981]">&quot;{strMatch[1]}&quot;</span>);
      parts.push(<span key={key++} className="text-[#475569]">{strMatch[2]}</span>);
      remaining = remaining.slice(strMatch[0].length);
      continue;
    }

    // Match number
    const numMatch = remaining.match(/^(\d+\.?\d*)(,?\s*)/);
    if (numMatch) {
      parts.push(<span key={key++} className="text-[#F59E0B]">{numMatch[1]}</span>);
      parts.push(<span key={key++} className="text-[#475569]">{numMatch[2]}</span>);
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Match boolean / null
    const boolMatch = remaining.match(/^(true|false|null)(,?\s*)/);
    if (boolMatch) {
      parts.push(<span key={key++} className="text-[#6D5DFB]">{boolMatch[1]}</span>);
      parts.push(<span key={key++} className="text-[#475569]">{boolMatch[2]}</span>);
      remaining = remaining.slice(boolMatch[0].length);
      continue;
    }

    // Match brackets, braces, whitespace, commas
    const bracketMatch = remaining.match(/^([{}\[\],\s]+)/);
    if (bracketMatch) {
      parts.push(<span key={key++} className="text-[#475569]">{bracketMatch[1]}</span>);
      remaining = remaining.slice(bracketMatch[0].length);
      continue;
    }

    // Fallback: take one char
    parts.push(<span key={key++} className="text-[#94A3B8]">{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return <>{parts}</>;
}
