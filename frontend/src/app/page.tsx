"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  ArrowRight, 
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
  ChevronUp
} from "lucide-react";
import { JsonViewer } from "@/components/ui/json-viewer";
import { MOCK_DATA, DEMO_ARCHITECTURE } from "@/app/generator/mock-data";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [hasCompiled, setHasCompiled] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [activePreviewTab, setActivePreviewTab] = useState<"intent" | "architecture" | "uiSchema" | "apiSchema" | "databaseSchema" | "authRules">("intent");
  const [showValidationIntel, setShowValidationIntel] = useState(true);

  const stages = [
    { id: "intent", label: "Intent Extraction", icon: Target, desc: "NL → Structured" },
    { id: "design", label: "System Design", icon: Cuboid, desc: "Intent → Architecture" },
    { id: "schemas", label: "Schema Generation", icon: FileCode2, desc: "Architecture → Schemas" },
    { id: "validation", label: "Validation", icon: ShieldCheck, desc: "Cross-schema checks" },
    { id: "repair", label: "Repair Engine", icon: Wrench, desc: "Targeted fixes" },
    { id: "simulation", label: "Runtime Simulation", icon: Rocket, desc: "Execution verification" },
  ];

  const previewTabs = [
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
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1200); // slightly faster for better demo feel
  };

  return (
    <div className="min-h-full flex flex-col p-6 lg:p-10 max-w-7xl mx-auto space-y-12">
      
      {/* 1. Hero & Messaging */}
      <section className="flex flex-col items-center text-center mt-6 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-text-secondary">
              <Terminal size={14} className="text-accent" />
              <span>CompileAI Engine v2.0</span>
            </div>
            
            {/* Benchmark Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-xs font-medium text-success">
              <Activity size={14} />
              <span>Benchmarks Passed: 18 / 20</span>
              <span className="text-success/50 ml-1">|</span>
              <span className="font-bold ml-1">Execution Success: 90%</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-text tracking-tight mb-4">
            CompileAI <br className="hidden sm:block"/>
            <span className="text-text-secondary font-medium text-2xl md:text-3xl mt-2 block">Compiler for Software Generation</span>
          </h1>
          <p className="text-sm md:text-base text-text-muted max-w-xl mx-auto font-mono mt-4">
            Natural Language → Architecture → Schemas → Runtime
          </p>
        </motion.div>
      </section>

      {/* 2. Sophisticated Prompt Editor */}
      <section className="w-full max-w-4xl mx-auto">
        <motion.div 
          className="panel flex flex-col focus-within:border-accent/50 transition-colors shadow-2xl shadow-black/50"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-3 border-b border-border bg-[#131316] rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold text-text-secondary tracking-widest uppercase ml-2">
                Application Spec ──────────────────
              </span>
            </div>
            <span className="text-[10px] font-mono text-success bg-success/10 px-2 py-0.5 rounded-sm">Ready</span>
          </div>
          <div className="relative p-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Build a CRM with:&#10;• Authentication&#10;• Contacts&#10;• Analytics dashboard&#10;• Role-based access&#10;• Premium subscriptions"
              className="w-full h-40 bg-transparent text-accent text-sm font-mono p-4 resize-none focus:outline-none placeholder:text-text-muted/40 leading-relaxed"
              spellCheck="false"
            />
          </div>
          <div className="p-3 border-t border-border bg-[#131316] rounded-b-xl flex justify-between items-center">
            <span className="text-[11px] text-text-muted font-mono">
              Syntax: Markdown | Press Cmd + Enter to compile
            </span>
            <button
              onClick={handleCompile}
              disabled={isCompiling || !prompt.trim()}
              className="bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors flex items-center gap-2"
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
        </motion.div>
      </section>

      {/* 3. Split Workspace: Process & Output */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 pb-20">
        
        {/* Left Column: Process & Verification */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Interactive Pipeline Graph */}
          <div className="panel p-5 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Compiler Pipeline</h3>
              {isCompiling && <Loader2 size={14} className="text-accent animate-spin" />}
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-2 relative gap-6">
              {/* Connecting Line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-border z-0" />
              
              {stages.map((stage, idx) => {
                const isComplete = hasCompiled || (isCompiling && currentStage > idx);
                const isCurrent = isCompiling && currentStage === idx;
                const isPending = !hasCompiled && (!isCompiling || currentStage < idx);
                const Icon = stage.icon;

                // Dynamic Status Logic
                let StatusIcon = CheckCircle2;
                let iconColorClass = "bg-success/10 border-success/30 text-success";
                let statusBadge = null;

                if (isComplete) {
                  if (stage.id === "validation") {
                    StatusIcon = AlertTriangle;
                    iconColorClass = "bg-warning/10 border-warning/30 text-warning";
                    statusBadge = <span className="text-[10px] font-mono text-warning bg-warning/10 px-1.5 py-0.5 rounded-sm">2 issues found</span>;
                  } else if (stage.id === "repair") {
                    StatusIcon = Wrench;
                    iconColorClass = "bg-info/10 border-info/30 text-info";
                    statusBadge = <span className="text-[10px] font-mono text-info bg-info/10 px-1.5 py-0.5 rounded-sm">1 fix applied</span>;
                  } else if (stage.id === "simulation") {
                    StatusIcon = CheckCircle2;
                    iconColorClass = "bg-success/10 border-success/30 text-success";
                    statusBadge = <span className="text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded-sm">PASS</span>;
                  }
                }

                return (
                  <div key={stage.id} className="relative z-10 flex items-start gap-4 group cursor-default">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-300
                      ${isComplete ? iconColorClass : 
                        isCurrent ? "bg-accent/10 border-accent/50 text-accent shadow-[0_0_10px_rgba(99,102,241,0.3)]" : 
                        "bg-[#111113] border-border text-text-muted"}
                    `}>
                      {isComplete ? <StatusIcon size={14} /> : <Icon size={14} />}
                    </div>
                    
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isCurrent ? "text-text" : isComplete ? "text-text-secondary" : "text-text-muted"}`}>
                          {stage.label}
                        </span>
                        {statusBadge}
                      </div>
                      <span className="text-[11px] text-text-muted font-mono mt-0.5 block">{stage.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Reports (Only show after compiling) */}
          <AnimatePresence>
            {hasCompiled && (
              <motion.div 
                className="flex flex-col gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                
                {/* Validation Intelligence Panel */}
                <div className="panel overflow-hidden border-warning/30 bg-warning-bg/5">
                  <div 
                    className="p-3 border-b border-warning/10 bg-[#131316] flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setShowValidationIntel(!showValidationIntel)}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-warning" />
                      <h3 className="text-xs font-semibold text-warning uppercase tracking-wider">Validation Intelligence</h3>
                    </div>
                    {showValidationIntel ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
                  </div>
                  
                  <AnimatePresence>
                    {showValidationIntel && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-[#09090B]">
                          <pre className="text-[11px] font-mono text-text-secondary leading-relaxed">
                            <span className="text-white">{"{"}</span>{"\n"}
                            {"  "}<span className="text-[#A1A1AA]">"issue":</span> <span className="text-error">"api field mismatch"</span>,{"\n"}
                            {"  "}<span className="text-[#A1A1AA]">"location":</span> <span className="text-success">"contacts.email"</span>,{"\n"}
                            {"  "}<span className="text-[#A1A1AA]">"severity":</span> <span className="text-warning">"medium"</span>,{"\n"}
                            {"  "}<span className="text-[#A1A1AA]">"repair":</span> <span className="text-accent">"field added automatically"</span>{"\n"}
                            <span className="text-white">{"}"}</span>
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Execution Report Panel */}
                <div className="panel p-5 border-success/20 bg-success-bg/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Server size={14} className="text-success" />
                    <h3 className="text-xs font-semibold text-success uppercase tracking-wider">Execution Report</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <span className="text-[10px] text-text-muted font-mono block mb-1">Routes Generated</span>
                      <span className="text-sm font-bold text-text">14</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted font-mono block mb-1">API Endpoints</span>
                      <span className="text-sm font-bold text-text">21</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted font-mono block mb-1">DB Tables</span>
                      <span className="text-sm font-bold text-text">8</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted font-mono block mb-1">RBAC Policies</span>
                      <span className="text-sm font-bold text-text">12</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-success/10 flex items-center justify-between">
                    <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wider">Execution Status</span>
                    <span className="badge badge-success flex items-center gap-1.5"><PlayCircle size={12} /> PASS</span>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Output Preview Explorer */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
          <div className="panel flex flex-col h-full overflow-hidden flex-1 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-border bg-[#131316] px-2 pt-2">
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-2">
                {previewTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-medium transition-colors border-b-2 ${
                      activePreviewTab === tab.id 
                        ? "text-text border-accent bg-white/5" 
                        : "text-text-muted border-transparent hover:text-text-secondary hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden bg-[#09090B]">
              {hasCompiled ? (
                <JsonViewer data={(MOCK_DATA as any)[activePreviewTab]} title={`generated_${activePreviewTab}.json`} />
              ) : isCompiling ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-text-muted bg-[#09090B]">
                  <Loader2 size={24} className="animate-spin mb-4 text-accent" />
                  <p className="text-xs font-mono">Generating {activePreviewTab}...</p>
                </div>
              ) : (
                <JsonViewer data={DEMO_ARCHITECTURE} title="demo_architecture.json" />
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
