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
  Loader2
} from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    { id: "intent", label: "Intent Extraction", icon: Target },
    { id: "design", label: "System Design", icon: Cuboid },
    { id: "schemas", label: "Schema Generation", icon: FileCode2 },
    { id: "validation", label: "Validation", icon: ShieldCheck },
    { id: "repair", label: "Repair Engine", icon: Wrench },
    { id: "simulation", label: "Simulation", icon: Rocket },
  ];

  const handleCompile = () => {
    if (!prompt.trim()) return;
    setIsCompiling(true);
    setCurrentStage(0);

    // Simulate compilation progress
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= stages.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsCompiling(false), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <div className="min-h-full flex flex-col p-8 lg:p-12 max-w-5xl mx-auto space-y-16">
      
      {/* 1. Command Center Hero */}
      <section className="flex flex-col items-center text-center mt-12 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-text-secondary mb-6">
            <Terminal size={14} className="text-accent" />
            <span>CompileAI Engine v2.0 Online</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-text tracking-tight mb-4">
            Define your architecture. <br className="hidden sm:block"/>
            We compile the execution.
          </h1>
          <p className="text-base text-text-secondary max-w-xl mx-auto">
            Convert natural language product requirements into validated, executable application specifications ready for deployment.
          </p>
        </motion.div>
      </section>

      {/* 2. Prompt Editor */}
      <section className="w-full max-w-3xl mx-auto">
        <motion.div 
          className="panel flex flex-col focus-within:border-accent/50 transition-colors shadow-2xl shadow-black/50"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-3 border-b border-border bg-[#131316] rounded-t-xl flex items-center gap-2">
            <div className="flex gap-1.5 ml-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
            <span className="ml-4 text-xs font-mono text-text-muted">system_prompt.txt</span>
          </div>
          <div className="relative p-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Build a CRM with:&#10;- authentication&#10;- contacts&#10;- analytics dashboard&#10;- role-based access&#10;- premium subscription"
              className="w-full h-48 bg-transparent text-text text-sm font-mono p-4 resize-none focus:outline-none placeholder:text-text-muted/50 leading-relaxed"
              spellCheck="false"
            />
          </div>
          <div className="p-3 border-t border-border bg-[#131316] rounded-b-xl flex justify-between items-center">
            <span className="text-[11px] text-text-muted font-mono">
              Press Cmd + Enter to compile
            </span>
            <button
              onClick={handleCompile}
              disabled={isCompiling || !prompt.trim()}
              className="bg-text text-background hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors flex items-center gap-2"
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

      {/* 3. Live Compilation Flow */}
      <AnimatePresence>
        {isCompiling && (
          <motion.section 
            className="w-full max-w-3xl mx-auto panel p-6"
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-text">Compilation Progress</h3>
              <span className="text-xs font-mono text-accent">
                {Math.round((currentStage / (stages.length - 1)) * 100)}%
              </span>
            </div>
            <div className="space-y-4">
              {stages.map((stage, idx) => {
                const isComplete = currentStage > idx;
                const isCurrent = currentStage === idx;
                const Icon = stage.icon;

                return (
                  <div key={stage.id} className="flex items-center gap-4">
                    <div className="w-6 flex justify-center">
                      {isComplete ? (
                        <CheckCircle2 size={16} className="text-success" />
                      ) : isCurrent ? (
                        <Loader2 size={16} className="text-accent animate-spin" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      )}
                    </div>
                    <div className={`text-sm ${isCurrent ? 'text-text font-medium' : isComplete ? 'text-text-secondary' : 'text-text-muted'}`}>
                      {stage.label}
                    </div>
                    {isCurrent && (
                      <motion.div 
                        className="h-1 bg-accent/20 rounded-full flex-1 ml-4 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div 
                          className="h-full bg-accent"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.5, ease: "linear" }}
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 4. Elegant Metric Panels */}
      {!isCompiling && (
        <section className="w-full max-w-4xl mx-auto pt-8 border-t border-border">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-6">System Telemetry</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Compilations", value: "1,204" },
              { label: "Execution Pass Rate", value: "98.2%" },
              { label: "Avg Latency", value: "2.4s" },
              { label: "Validation Errors", value: "0" },
            ].map((metric) => (
              <div key={metric.label} className="panel p-4 flex flex-col justify-between h-24 hover:border-white/20 transition-colors">
                <span className="text-[11px] text-text-secondary font-medium">{metric.label}</span>
                <span className="text-2xl font-semibold text-text tracking-tight">{metric.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
