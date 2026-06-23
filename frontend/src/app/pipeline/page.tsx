"use client";

import { GitMerge, Settings2, Target, Cuboid, FileCode2, ShieldCheck, Wrench, Rocket, Save } from "lucide-react";
import { useState } from "react";

export default function PipelineConfiguration() {
  const [stages, setStages] = useState([
    { id: "intent", label: "Intent Extraction", icon: Target, enabled: true, required: true },
    { id: "design", label: "System Design", icon: Cuboid, enabled: true, required: true },
    { id: "schemas", label: "Schema Generation", icon: FileCode2, enabled: true, required: true },
    { id: "validation", label: "Architecture Validation", icon: ShieldCheck, enabled: true, required: false },
    { id: "repair", label: "Auto-Repair Engine", icon: Wrench, enabled: true, required: false },
    { id: "simulation", label: "Runtime Verification", icon: Rocket, enabled: false, required: false },
  ]);

  const toggleStage = (id: string) => {
    setStages(stages.map(s => {
      if (s.id === id && !s.required) {
        return { ...s, enabled: !s.enabled };
      }
      return s;
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F]">
      
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text tracking-tight flex items-center gap-2">
            <GitMerge size={18} className="text-accent" />
            Pipeline Configuration
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Customize compiler stages and execution flow</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-black hover:bg-white/90 text-xs font-semibold tracking-wide transition-colors">
            <Save size={14} />
            Save Configuration
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-auto p-6 max-w-4xl w-full mx-auto space-y-6">
        
        <div className="panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 size={16} className="text-text-muted" />
            <h2 className="text-sm font-semibold text-text">Execution Stages</h2>
          </div>
          
          <div className="space-y-3">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className={`flex items-center justify-between p-4 rounded-lg border ${stage.enabled ? 'border-accent/30 bg-accent/5' : 'border-border bg-[#111318] opacity-60'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${stage.enabled ? 'bg-accent/10 text-accent' : 'bg-white/5 text-text-muted'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text">{stage.label}</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {stage.required ? "Required for base compilation" : "Optional safety check"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {stage.required && (
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-2 py-1 bg-white/5 rounded-sm">Required</span>
                    )}
                    <button
                      onClick={() => toggleStage(stage.id)}
                      disabled={stage.required}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed ${stage.enabled ? 'bg-accent' : 'bg-[#1a1a20]'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${stage.enabled ? 'translate-x-2' : '-translate-x-2'}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
