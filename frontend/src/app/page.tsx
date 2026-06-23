"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
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
  PlayCircle,
  Activity,
  Server,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  GitCommit,
  Check,
  TrendingUp,
  Box
} from "lucide-react";
import { JsonViewer } from "@/components/ui/json-viewer";
import { ArchitectureGraph } from "@/components/ui/architecture-graph";
import { MOCK_DATA, DEMO_ARCHITECTURE } from "@/app/generator/mock-data";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [hasCompiled, setHasCompiled] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [activePreviewTab, setActivePreviewTab] = useState<"intent" | "architecture" | "uiSchema" | "apiSchema" | "databaseSchema" | "authRules" | "architectureOverview">("architectureOverview");

  const stages = [
    { id: "intent", label: "Intent Extraction", icon: Target, desc: "NL → Structured" },
    { id: "design", label: "System Design", icon: Cuboid, desc: "Intent → Architecture" },
    { id: "schemas", label: "Schema Generation", icon: FileCode2, desc: "Architecture → Schemas" },
    { id: "validation", label: "Validation", icon: ShieldCheck, desc: "Cross-schema checks" },
    { id: "repair", label: "Repair Engine", icon: Wrench, desc: "Targeted fixes" },
    { id: "simulation", label: "Runtime Simulation", icon: Rocket, desc: "Execution verification" },
  ];

  const previewTabs = [
    { id: "architectureOverview", label: "Architecture Graph", icon: <Box size={14} /> },
    { id: "intent", label: "Intent", icon: <Target size={14} /> },
    { id: "architecture", label: "Architecture", icon: <Cuboid size={14} /> },
    { id: "uiSchema", label: "UI Schema", icon: <Layout size={14} /> },
    { id: "apiSchema", label: "API Schema", icon: <Code2 size={14} /> },
    { id: "databaseSchema", label: "Database Schema", icon: <Database size={14} /> },
    { id: "authRules", label: "Auth Rules", icon: <Lock size={14} /> },
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
            setActivePreviewTab("databaseSchema");
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  return (
    <div className="min-h-full flex flex-col p-6 lg:p-8 max-w-[1600px] mx-auto space-y-10">
      
      {/* ================= HERO SECTION ================= */}
      <section className="flex flex-col items-center text-center mt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text tracking-tight mb-4 leading-tight">
            Define your architecture.<br />
            We <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D5DFB] to-[#9D8BFF]">compile</span> the execution.
          </h1>
          <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto font-medium mt-4">
            Transform ideas into production-ready applications with AI-powered compilation, validation, repair, and runtime verification.
          </p>
        </motion.div>
      </section>

      {/* ================= APPLICATION SPEC EDITOR ================= */}
      <section className="w-full max-w-5xl mx-auto">
        <motion.div 
          className="bg-[#111318] border border-[#2B3040] rounded-xl overflow-hidden shadow-2xl focus-within:border-[#6D5DFB]/50 transition-colors"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Editor Header */}
          <div className="px-4 py-2.5 border-b border-[#2B3040] bg-[#151821] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-text-muted tracking-widest uppercase">
                APPLICATION SPEC
              </span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/50" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/50" />
              <div className="w-3 h-3 rounded-full bg-[#10B981]/20 border border-[#10B981]/50" />
            </div>
          </div>
          
          {/* Editor Body */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Build a CRM with:&#10;• Authentication&#10;• Contacts management&#10;• Analytics dashboard&#10;• Role-based access&#10;• Premium subscriptions with payments"
              className="w-full h-44 bg-transparent text-[#F8FAFC] text-sm font-mono p-5 resize-none focus:outline-none placeholder:text-[#475569] leading-loose"
              spellCheck="false"
            />
          </div>

          {/* Editor Bottom Toolbar */}
          <div className="px-4 py-3 border-t border-[#2B3040] bg-[#151821] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                <Sparkles size={14} className="text-[#6D5DFB]" />
                AI Assist
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                <RefreshCw size={14} />
                Improve Spec
              </button>
            </div>
            <button
              onClick={handleCompile}
              disabled={isCompiling || !prompt.trim()}
              className="bg-gradient-to-r from-[#6D5DFB] to-[#5B4AEB] text-white hover:from-[#5B4AEB] hover:to-[#4A39D9] disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-md text-xs font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(109,93,251,0.3)] flex items-center gap-2"
            >
              {isCompiling ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  Compile Application
                  <Terminal size={14} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </section>

      {/* ================= THREE-COLUMN WORKSPACE ================= */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        
        {/* COLUMN 1: COMPILER PIPELINE (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-[#111318] border border-border rounded-xl p-5 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Compiler Pipeline</h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-2 relative gap-6">
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-[#2B3040] z-0" />
              
              {stages.map((stage, idx) => {
                const isComplete = hasCompiled || (isCompiling && currentStage > idx);
                const isCurrent = isCompiling && currentStage === idx;
                const Icon = stage.icon;

                let StatusIcon = Check;
                let iconColorClass = "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]";
                let statusBadge = null;

                if (isComplete) {
                  if (stage.id === "validation") {
                    StatusIcon = AlertTriangle;
                    iconColorClass = "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]";
                    statusBadge = <span className="text-[10px] font-mono text-[#F59E0B] mt-0.5 block">2 issues found</span>;
                  } else if (stage.id === "repair") {
                    StatusIcon = Wrench;
                    iconColorClass = "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]";
                    statusBadge = <span className="text-[10px] font-mono text-[#3B82F6] mt-0.5 block">1 fix applied</span>;
                  } else if (stage.id === "simulation") {
                    StatusIcon = CheckCircle2;
                    iconColorClass = "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]";
                    statusBadge = <span className="text-[10px] font-mono text-[#10B981] mt-0.5 block">PASS</span>;
                  }
                }

                return (
                  <div key={stage.id} className="relative z-10 flex items-start gap-4 group cursor-default">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-300
                      ${isComplete ? iconColorClass : 
                        isCurrent ? "bg-[#6D5DFB]/10 border-[#6D5DFB]/50 text-[#6D5DFB] shadow-[0_0_10px_rgba(109,93,251,0.3)]" : 
                        "bg-[#151821] border-[#2B3040] text-[#475569]"}
                    `}>
                      {isComplete ? <StatusIcon size={14} /> : <Icon size={14} />}
                    </div>
                    
                    <div className="pt-1.5">
                      <span className={`text-sm font-semibold ${isCurrent ? "text-white" : isComplete ? "text-[#94A3B8]" : "text-[#475569]"}`}>
                        {stage.label}
                      </span>
                      {statusBadge}
                    </div>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {hasCompiled && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-4 border-t border-border bg-[#10B981]/5 rounded-lg border border-[#10B981]/20 p-3 text-center"
                >
                  <p className="text-xs font-bold text-[#10B981] mb-1">Compilation Completed</p>
                  <p className="text-[10px] font-mono text-[#10B981]/70">Total Time: 9.1s</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* COLUMN 2: OUTPUT EXPLORER (6 cols) */}
        <div className="lg:col-span-6 flex flex-col h-full min-h-[500px]">
          <div className="bg-[#111318] border border-border rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-border bg-[#151821] px-2 pt-2">
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-2">
                {previewTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-[11px] font-semibold tracking-wide transition-colors border-b-2 whitespace-nowrap ${
                      activePreviewTab === tab.id 
                        ? "text-white border-[#6D5DFB] bg-white/5" 
                        : "text-[#94A3B8] border-transparent hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-[#0A0A0F] relative">
              {/* Output Content */}
              {activePreviewTab === "architectureOverview" ? (
                <ArchitectureGraph />
              ) : hasCompiled ? (
                <div className="p-4 h-full">
                  <JsonViewer data={(MOCK_DATA as any)[activePreviewTab]} title={`${activePreviewTab}.json`} />
                </div>
              ) : isCompiling ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#475569]">
                  <Loader2 size={24} className="animate-spin mb-4 text-[#6D5DFB]" />
                  <p className="text-xs font-mono">Generating {activePreviewTab}...</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#475569]">
                  <FileCode2 size={32} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium text-[#94A3B8]">Awaiting Compilation</p>
                  <p className="text-xs mt-1">Enter a spec and compile to view outputs.</p>
                </div>
              )}

              {/* Float Toolbar inside Explorer */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button className="px-3 py-1 bg-[#151821] border border-border rounded text-[10px] font-mono text-[#94A3B8] hover:text-white transition-colors">Copy</button>
                <button className="px-3 py-1 bg-[#151821] border border-border rounded text-[10px] font-mono text-[#94A3B8] hover:text-white transition-colors">Download</button>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: RIGHT SIDEBAR ANALYTICS (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Engine Status Card */}
          <div className="bg-[#111318] border border-border rounded-xl p-5">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Engine Status</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <span className="text-sm font-semibold text-text">All Systems Operational</span>
            </div>
            {/* Subtle Line Chart representation */}
            <div className="w-full h-12 flex items-end justify-between gap-1 mt-4">
              {[40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
                <div key={i} className="w-full bg-[#10B981]/20 rounded-t-sm" style={{ height: `${h}%` }}>
                  <div className="w-full bg-[#10B981] rounded-t-sm" style={{ height: '2px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111318] border border-border rounded-xl p-4">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Total Compilations</p>
              <p className="text-xl font-bold text-white mb-2">1,204</p>
              <p className="text-[10px] text-[#10B981] flex items-center gap-1 font-semibold"><TrendingUp size={10} /> +12% this week</p>
            </div>
            
            <div className="bg-[#111318] border border-border rounded-xl p-4">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Pass Rate</p>
              <p className="text-xl font-bold text-white mb-2">98.2%</p>
              <p className="text-[10px] text-[#10B981] flex items-center gap-1 font-semibold"><TrendingUp size={10} /> +0.4% this week</p>
            </div>

            <div className="bg-[#111318] border border-border rounded-xl p-4">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Avg Latency</p>
              <p className="text-xl font-bold text-white mb-2">2.4s</p>
              <p className="text-[10px] text-[#10B981] flex items-center gap-1 font-semibold">↓ -0.2s this week</p>
            </div>

            <div className="bg-[#111318] border border-border rounded-xl p-4">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Validation Errors</p>
              <p className="text-xl font-bold text-[#F59E0B] mb-2">0</p>
              <p className="text-[10px] text-[#94A3B8] flex items-center gap-1 font-semibold">Stable</p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= BOTTOM DASHBOARD SYSTEM CARDS ================= */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 pb-12">
        <div className="bg-[#111318] border border-[#2B3040] rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Benchmarks</p>
            <p className="text-lg font-bold text-white">18/20 Passed</p>
          </div>
          <Activity className="text-[#6D5DFB] opacity-50" size={24} />
        </div>
        
        <div className="bg-[#111318] border border-[#2B3040] rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Execution Success</p>
            <p className="text-lg font-bold text-white">98.6%</p>
          </div>
          <CheckCircle2 className="text-[#10B981] opacity-50" size={24} />
        </div>

        <div className="bg-[#111318] border border-[#2B3040] rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Repair Rate</p>
            <p className="text-lg font-bold text-white">12.4%</p>
          </div>
          <Wrench className="text-[#3B82F6] opacity-50" size={24} />
        </div>

        <div className="bg-[#111318] border border-[#2B3040] rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">System Health</p>
            <p className="text-lg font-bold text-[#10B981]">Healthy</p>
          </div>
          <ShieldCheck className="text-[#10B981] opacity-50" size={24} />
        </div>
      </section>

    </div>
  );
}
