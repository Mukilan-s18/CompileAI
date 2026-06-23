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
  Code2
} from "lucide-react";
import { JsonViewer } from "@/components/ui/json-viewer";
import { MOCK_DATA } from "@/app/generator/mock-data";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [hasCompiled, setHasCompiled] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [activePreviewTab, setActivePreviewTab] = useState<"intent" | "architecture" | "uiSchema" | "apiSchema" | "databaseSchema" | "authRules">("intent");

  const stages = [
    { id: "intent", label: "Intent Extraction", icon: Target, desc: "NL → Structured" },
    { id: "design", label: "System Design", icon: Cuboid, desc: "Intent → Architecture" },
    { id: "schemas", label: "Schema Generation", icon: FileCode2, desc: "Architecture → Schemas" },
    { id: "validation", label: "Validation", icon: ShieldCheck, desc: "Cross-schema checks" },
    { id: "repair", label: "Repair", icon: Wrench, desc: "Targeted fixes" },
    { id: "simulation", label: "Simulation", icon: Rocket, desc: "Runtime verification" },
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
    }, 1500);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-text-secondary mb-6">
            <Terminal size={14} className="text-accent" />
            <span>CompileAI Engine v2.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-text tracking-tight mb-4">
            CompileAI <br className="hidden sm:block"/>
            <span className="text-text-secondary font-medium text-2xl md:text-3xl mt-2 block">Natural Language → Executable Applications</span>
          </h1>
          <p className="text-sm md:text-base text-text-muted max-w-xl mx-auto font-mono mt-4">
            Compiler-inspired software generation with validation, repair, and runtime verification.
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

      {/* 3. Split Workspace: Pipeline Graph & Output Preview */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        
        {/* Left: Interactive Pipeline Graph */}
        <div className="lg:col-span-4 panel p-5 h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Compiler Pipeline</h3>
            {isCompiling && <Loader2 size={14} className="text-accent animate-spin" />}
          </div>
          
          <div className="flex-1 flex flex-col justify-between py-2 relative">
            {/* Connecting Line */}
            <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-border z-0" />
            
            {stages.map((stage, idx) => {
              const isComplete = hasCompiled || (isCompiling && currentStage > idx);
              const isCurrent = isCompiling && currentStage === idx;
              const isPending = !hasCompiled && (!isCompiling || currentStage < idx);
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="relative z-10 flex items-start gap-4 group cursor-default">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-300
                    ${isComplete ? "bg-success/10 border-success/30 text-success" : 
                      isCurrent ? "bg-accent/10 border-accent/50 text-accent" : 
                      "bg-[#111113] border-border text-text-muted"}
                  `}>
                    {isComplete ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                  </div>
                  
                  <div className="pt-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isCurrent ? "text-text" : isComplete ? "text-text-secondary" : "text-text-muted"}`}>
                        [{stage.label}]
                      </span>
                      {stage.id === "repair" && isComplete && (
                        <span className="text-[10px] font-mono text-warning bg-warning/10 px-1.5 py-0.5 rounded-sm">2 fixes</span>
                      )}
                      {stage.id === "simulation" && isComplete && (
                        <span className="text-[10px] font-mono text-success bg-success/10 px-1.5 py-0.5 rounded-sm">PASS</span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted font-mono mt-0.5 block">{stage.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Output Preview Explorer */}
        <div className="lg:col-span-8 panel flex flex-col h-[500px] overflow-hidden">
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
              <JsonViewer data={(MOCK_DATA as any)[activePreviewTab]} title={`${activePreviewTab}.json`} />
            ) : isCompiling ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                <Loader2 size={24} className="animate-spin mb-4 text-accent" />
                <p className="text-xs font-mono">Generating {activePreviewTab}...</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                <FileCode2 size={32} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No compilations yet.</p>
                <p className="text-xs mt-1">Run your first benchmark or compile an application.</p>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
