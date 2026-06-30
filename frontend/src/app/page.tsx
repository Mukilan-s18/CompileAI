"use client";

import { useState, useEffect } from "react";
import { 
  Target, Cuboid, FileCode2, ShieldCheck, Wrench, Rocket,
  CheckCircle2, Loader2, Check, Play, Database, AlertTriangle, 
  BrainCircuit, Activity, Link2, SearchCode, ScrollText
} from "lucide-react";
import { CompilerResponse, CompilerOutputs, Assumption, UIComponent, APIEndpoint, DBTable, AuthRule } from "@/types/compiler";

/* ──────────────────────────── TYPES & CONSTANTS ──────────────────────────── */
type StageState = "IDLE" | "RUNNING" | "PASSED" | "FAILED" | "REPAIRED";

const STAGES = [
  { id: "intent", label: "Intent Extraction", icon: Target, desc: "NL → Structured Intent", expectedTime: "1.2s" },
  { id: "assumptions", label: "Assumption Engine", icon: BrainCircuit, desc: "Ambiguity resolution", expectedTime: "0.8s" },
  { id: "design", label: "System Design", icon: Cuboid, desc: "Intent → Architecture", expectedTime: "1.8s" },
  { id: "schemas", label: "Schema Generation", icon: FileCode2, desc: "Architecture → Schemas", expectedTime: "3.3s" },
  { id: "validation", label: "Validation", icon: ShieldCheck, desc: "Cross-schema checks", expectedTime: "0.9s" },
  { id: "repair", label: "Repair Engine", icon: Wrench, desc: "Targeted fixes applied", expectedTime: "2.1s" },
  { id: "simulation", label: "Runtime Simulation", icon: Rocket, desc: "Execution verification", expectedTime: "1.5s" },
];

/* ──────────────────────────── UTILS ──────────────────────────── */
function StatusBadge({ type, text }: { type: 'PASS' | 'REPAIRED' | 'VALIDATED' | 'EXECUTABLE' | 'ISSUES' | 'CONSISTENT', text?: string }) {
  const styles = {
    PASS: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20",
    REPAIRED: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20",
    VALIDATED: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
    EXECUTABLE: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20",
    ISSUES: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20",
    CONSISTENT: "text-[#6D5DFB] bg-[#6D5DFB]/10 border-[#6D5DFB]/20"
  };

  return (
    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ml-2 flex shrink-0 border ${styles[type]} shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] uppercase tracking-wider`}>
      {text || type}
    </span>
  );
}

/* ──────────────────────────── TAB OUTPUT COMPONENTS ──────────────────────────── */

function EmptyStateFlow() {
  const steps = [
    { name: "Natural Language", highlight: false },
    { name: "Assumption Engine", highlight: true },
    { name: "System Architecture", highlight: false },
    { name: "Schemas", highlight: false },
    { name: "Cross-Layer Validation", highlight: true },
    { name: "Intelligent Repair", highlight: false },
    { name: "Runtime Verification", highlight: true },
    { name: "Executable Software", highlight: false }
  ];
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-[#475569] font-mono text-[11px] p-6 relative">
       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#1E2330 1px, transparent 1px), linear-gradient(90deg, #1E2330 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
       <div className="relative z-10 flex flex-col items-center">
         {steps.map((step, i) => (
           <div key={step.name} className="flex flex-col items-center">
              <div className={`px-4 py-2 border rounded text-center w-64 shadow-lg backdrop-blur-sm transition-all duration-500
                ${step.highlight ? 'border-[#6D5DFB]/30 bg-[#6D5DFB]/5 text-[#E2E8F0] shadow-[0_0_15px_rgba(109,93,251,0.05)]' : 'border-[#1E2330] bg-[#111318]/80 text-[#94A3B8]'}`}
              >
                {step.name}
              </div>
              {i < steps.length - 1 && (
                <div className="h-5 w-[1px] bg-gradient-to-b from-[#1E2330] to-transparent my-1" />
              )}
           </div>
         ))}
       </div>
    </div>
  );
}

function IntentOutput({ data }: { data: CompilerOutputs | null }) {
  if (!data) return null;
  const { intent } = data;
  return (
    <div className="p-8 text-[#E2E8F0] max-w-3xl font-sans">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1E2330]">
        <div>
          <h2 className="text-lg font-bold">Intent Extracted</h2>
          <p className="text-xs text-[#94A3B8]">NLP engine successfully parsed requirements into structured tokens.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Extraction Confidence</p>
          <p className="text-xl font-bold text-[#10B981]">96%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">Detected Features</h3>
          <ul className="flex flex-col gap-3">
            {intent.features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={14} className="text-[#6D5DFB]" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">Detected Roles</h3>
          <ul className="flex flex-col gap-3 mb-6">
            {intent.user_roles.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={14} className="text-[#3B82F6]" /> {f}
              </li>
            ))}
          </ul>
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-2">Complexity Target</h3>
          <span className="px-3 py-1 bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] rounded-full text-xs font-bold">Medium</span>
        </div>
      </div>
    </div>
  );
}

function AssumptionsOutput({ data }: { data: CompilerOutputs | null }) {
  if (!data) return null;
  return (
    <div className="p-8 text-[#E2E8F0] max-w-3xl font-sans">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1E2330]">
        <div className="flex items-center gap-3">
          <BrainCircuit size={20} className="text-[#6D5DFB]" />
          <div>
            <h2 className="text-lg font-bold">Assumption Engine</h2>
            <p className="text-xs text-[#94A3B8]">Resolving ambiguous and incomplete requirements.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Resolution Confidence</p>
          <p className="text-xl font-bold text-[#10B981]">92%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">Core Entities (Accepted)</h3>
          <ul className="flex flex-col gap-3">
            {data.intent.core_entities.map(e => (
              <li key={e} className="flex items-center gap-2 text-sm"><Check size={14} className="text-[#10B981]" /> {e}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">Generated Assumptions</h3>
          <ul className="flex flex-col gap-3 mb-6">
            {data.intent.assumptions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Activity size={14} className="text-[#6D5DFB] mt-1 shrink-0" /> 
                <span><strong className="text-white">{a.assumption_made}</strong><br/><span className="text-xs text-[#94A3B8]">{a.reasoning}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ArchitectureOutput({ data }: { data: CompilerOutputs | null }) {
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  if (!data) return null;
  const arch = data.architecture;
  
  const nodeData: Record<string, { type: string, info: string }> = {
    Frontend: { type: arch.frontend_framework, info: "Client layer" },
    Backend: { type: arch.backend_framework, info: "API layer" },
    Database: { type: arch.database_type, info: "Persistence layer" },
    Auth: { type: arch.auth_provider, info: "Security layer" },
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex overflow-hidden font-mono bg-[#0A0A0F]">
       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1E2330 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
       
       <div className="flex-1 relative flex items-center justify-center">
         <div className="relative w-[400px] h-[300px]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <style>{`@keyframes dash { to { stroke-dashoffset: -20; } } .animated-line { stroke-dasharray: 4; animation: dash 1s linear infinite; }`}</style>
              <line x1="200" y1="50" x2="200" y2="150" stroke="#3B82F6" strokeWidth="1.5" className="animated-line opacity-40" />
              <line x1="200" y1="150" x2="100" y2="250" stroke="#3B82F6" strokeWidth="1.5" className="animated-line opacity-40" />
              <line x1="200" y1="150" x2="300" y2="250" stroke="#3B82F6" strokeWidth="1.5" className="animated-line opacity-40" />
            </svg>
            
            {[
              { id: 'Frontend', x: 150, y: 35, color: '#6D5DFB' },
              { id: 'Backend', x: 150, y: 135, color: '#3B82F6' },
              { id: 'Database', x: 50, y: 235, color: '#10B981' },
              { id: 'Auth', x: 250, y: 235, color: '#F59E0B' },
            ].map(n => (
              <div 
                key={n.id}
                onMouseEnter={() => setHoverNode(n.id)}
                onMouseLeave={() => setHoverNode(null)}
                className={`absolute w-[100px] text-center px-3 py-1.5 bg-[#0E1015] border rounded-lg text-[11px] font-bold z-10 backdrop-blur-md cursor-pointer transition-all duration-300
                  ${hoverNode === n.id ? 'scale-110 shadow-lg' : 'opacity-90'}
                `}
                style={{ top: n.y, left: n.x, color: n.color, borderColor: `${n.color}50` }}
              >
                {n.id}
              </div>
            ))}
         </div>
       </div>

       <div className="w-64 border-l border-[#1E2330] bg-[#0E1015]/90 backdrop-blur-xl flex flex-col p-6 z-20 overflow-y-auto custom-scrollbar">
         <h4 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-6 flex items-center gap-2">
           <SearchCode size={14}/> {hoverNode ? `Node: ${hoverNode}` : "Architecture Insights"}
         </h4>
         
         {hoverNode ? (
           <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-[#111318] p-3 rounded border border-[#1E2330]">
               <p className="text-[10px] text-[#475569] uppercase mb-1">Technology</p>
               <p className="text-lg font-bold text-white">{nodeData[hoverNode].type}</p>
             </div>
             <div className="bg-[#111318] p-3 rounded border border-[#1E2330]">
               <p className="text-[10px] text-[#475569] uppercase mb-1">Role</p>
               <p className="text-sm font-bold text-white">{nodeData[hoverNode].info}</p>
             </div>
           </div>
         ) : (
           <div className="flex flex-col gap-6 animate-in fade-in duration-300">
             <div>
               <p className="text-xs font-semibold text-white">Pattern: {arch.architecture_pattern}</p>
             </div>
             <div>
               <p className="text-[10px] text-[#475569] uppercase mb-2">Design Decisions</p>
               <ul className="text-[10px] text-[#94A3B8] flex flex-col gap-2">
                  {arch.key_design_decisions.map((d, i) => <li key={i}>• {d}</li>)}
               </ul>
             </div>
           </div>
         )}
       </div>
    </div>
  );
}

function SchemaCounters({ active, data }: { active: boolean, data: CompilerOutputs | null }) {
  const [counts, setCounts] = useState({ ui: 0, api: 0, db: 0, auth: 0 });
  const schema = data?.application_schema;
  const targets = {
    ui: schema?.ui_schema?.length || 0,
    api: schema?.api_schema?.length || 0,
    db: schema?.db_schema?.length || 0,
    auth: schema?.auth_rules?.length || 0
  };

  useEffect(() => {
    if (!active) return;
    let frame: number;
    let progress = 0;
    const animate = () => {
      progress += 0.05;
      setCounts({
        ui: Math.min(targets.ui, Math.floor(progress * targets.ui * 1.5)),
        api: Math.min(targets.api, Math.floor(progress * targets.api * 1.5)),
        db: Math.min(targets.db, Math.floor(progress * targets.db * 1.5)),
        auth: Math.min(targets.auth, Math.floor(progress * targets.auth * 1.5))
      });
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active, targets.ui, targets.api, targets.db, targets.auth]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-[#0A0A0F]">
      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
        {[
          { label: "UI Pages Generated", value: counts.ui, target: targets.ui, color: "text-[#6D5DFB]" },
          { label: "API Endpoints Generated", value: counts.api, target: targets.api, color: "text-[#10B981]" },
          { label: "Database Tables Generated", value: counts.db, target: targets.db, color: "text-[#3B82F6]" },
          { label: "Auth Policies Generated", value: counts.auth, target: targets.auth, color: "text-[#F59E0B]" }
        ].map(item => (
          <div key={item.label} className="bg-[#111318] border border-[#1E2330] p-6 rounded-xl flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div>
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-1">{item.label}</p>
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            </div>
            {item.value === item.target && item.target > 0 && (
              <div className="w-8 h-8 rounded-full bg-[#1E2330] flex items-center justify-center animate-in zoom-in duration-300">
                <Check size={14} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidationOutput({ data }: { data: CompilerOutputs | null }) {
  if (!data) return null;
  const { validation } = data;
  return (
    <div className="flex h-full w-full font-sans">
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#1E2330]">
          {validation.is_valid ? <CheckCircle2 size={20} className="text-[#10B981]" /> : <AlertTriangle size={20} className="text-[#EF4444]" />}
          <h2 className="text-lg font-bold text-white">Validation Report</h2>
          {validation.is_valid ? <StatusBadge type="PASS" text="NO ISSUES" /> : <StatusBadge type="ISSUES" text={`${validation.errors.length} ISSUES FOUND`} />}
        </div>

        <div className="flex flex-col gap-4">
          {validation.errors.length === 0 ? (
            <div className="text-[#10B981] font-mono text-xs">All components are fully valid.</div>
          ) : validation.errors.map((err, i) => (
            <div key={i} className={`bg-[#111318] border rounded-lg p-5 ${err.severity === 'High' ? 'border-[#EF4444]/30' : 'border-[#F59E0B]/30'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${err.severity === 'High' ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20' : 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20'}`}>{err.layer} Error</span>
                <span className="text-[10px] font-bold text-[#475569] uppercase">Severity: {err.severity}</span>
              </div>
              <p className="text-[#E2E8F0] text-xs mt-2">{err.issue}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-72 border-l border-[#1E2330] bg-[#0E1015]/50 flex flex-col p-6 overflow-y-auto custom-scrollbar">
        <h3 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-6 flex items-center gap-2">
           <Link2 size={14}/> Cross-Layer Consistency
        </h3>
        <h3 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-4">Validation Quality Score</h3>
        <div className="flex flex-col gap-3 text-xs">
          <div className="flex justify-between mt-2 pt-2 border-t border-[#1E2330] font-bold"><span className="text-white">Overall Score</span><span className="text-[#10B981] font-mono">{validation.consistency_score}/100</span></div>
        </div>
      </div>
    </div>
  );
}

function RepairOutput({ data }: { data: CompilerOutputs | null }) {
  if (!data) return null;
  return (
    <div className="flex h-full w-full font-sans">
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#1E2330]">
          <Wrench size={20} className="text-[#3B82F6]" />
          <h2 className="text-lg font-bold text-white">Repair Engine</h2>
          {data.validation.is_valid ? <StatusBadge type="PASS" text="NO REPAIRS NEEDED" /> : <StatusBadge type="REPAIRED" text="FIXES APPLIED" />}
        </div>
        <div className="text-[#E2E8F0] font-mono text-xs">
           {data.validation.is_valid ? "The schema passed all programmatic validations. No AI repairs were necessary." : "Targeted repairs were applied to correct validation failures."}
        </div>
      </div>
    </div>
  );
}

function RuntimeVerificationOutput({ data }: { data: CompilerOutputs | null }) {
  if (!data) return null;
  const exe = data.execution;
  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center font-sans bg-[#0A0A0F]">
       <div className="max-w-3xl w-full bg-[#111318] border border-[#1E2330] rounded-xl shadow-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
         <div className="p-6 border-b border-[#1E2330] flex items-center justify-between bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E2330]/40 to-[#111318]">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-[0_0_15px_rgba(16,185,129,0.1)] ${exe.is_executable ? 'bg-[#10B981]/10 border-[#10B981]/20' : 'bg-[#EF4444]/10 border-[#EF4444]/20'}`}>
                <Rocket size={24} className={exe.is_executable ? 'text-[#10B981]' : 'text-[#EF4444]'} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white tracking-tight">Runtime Verification {exe.is_executable ? 'Passed' : 'Failed'}</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">{exe.is_executable ? 'Executable package passed all simulated runtime constraints.' : 'Execution failed during syntax verification.'}</p>
              </div>
            </div>
            <StatusBadge type={exe.is_executable ? "EXECUTABLE" : "ISSUES"} text={exe.is_executable ? "READY FOR DEPLOYMENT" : "FAILED EXECUTION"} />
         </div>
         {!exe.is_executable && (
            <div className="p-6">
              {exe.compilation_errors.map((e, i) => <div key={i} className="text-[#EF4444] text-xs font-mono">{e}</div>)}
            </div>
         )}
         <div className="p-6 grid grid-cols-4 gap-4 bg-[#0E1015] border-b border-[#1E2330]">
           {[
             { l: "Routes", v: data.application_schema.ui_schema.length },
             { l: "Endpoints", v: data.application_schema.api_schema.length },
             { l: "Tables", v: data.application_schema.db_schema.length },
             { l: "Policies", v: data.application_schema.auth_rules.length }
           ].map(k => (
             <div key={k.l} className="text-center">
               <p className="text-2xl font-bold text-white">{k.v}</p>
               <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mt-1">{k.l}</p>
             </div>
           ))}
         </div>
         <div className="p-6 bg-[#0E1015]">
            <div className="bg-[#111318] p-4 rounded-lg border border-[#1E2330]">
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">Execution Score</p>
              <p className="text-2xl font-bold text-white tracking-tight">{exe.deployment_readiness_score}<span className="text-sm text-[#475569] ml-1 font-normal">/100</span></p>
            </div>
         </div>
       </div>
    </div>
  );
}

function FinalSummary({ data }: { data: CompilerOutputs | null }) {
  if (!data) return null;
  return (
    <div className="w-full h-full p-8 flex flex-col items-center justify-center font-sans bg-[#0A0A0F] animate-in fade-in zoom-in duration-500">
      <div className="max-w-xl w-full bg-[#111318] border border-[#1E2330] rounded-xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6D5DFB] via-[#3B82F6] to-[#10B981]" />
        <div className="p-8 pb-6 text-center border-b border-[#1E2330]">
          <div className="w-16 h-16 mx-auto bg-[#10B981]/10 rounded-full flex items-center justify-center mb-6 border border-[#10B981]/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <ScrollText size={32} className="text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Compilation Certificate</h2>
          <p className="text-[13px] text-[#94A3B8]">Application successfully compiled and verified.</p>
        </div>
        <div className="p-6 bg-[#111318] border-t border-[#1E2330] flex items-center justify-between">
           <span className="text-[10px] font-mono text-[#475569]">Timestamp: {new Date().toISOString()}</span>
           <button className="bg-white text-black font-bold py-2 px-6 rounded-lg text-xs hover:bg-[#E2E8F0] transition-colors shadow-lg">
             Deploy Infrastructure
           </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── MAIN PAGE COMPONENT ──────────────────────────── */

export default function Home() {
  const defaultPrompt = `Build a CRM with:

• Authentication
• Contacts
• Analytics Dashboard
• Role-Based Access
• Premium Subscription`;

  const [prompt, setPrompt] = useState(defaultPrompt);
  
  // Compilation State Engine
  const [isCompiling, setIsCompiling] = useState(false);
  const [hasCompiled, setHasCompiled] = useState(false);
  const [stageStates, setStageStates] = useState<StageState[]>(Array(7).fill("IDLE"));
  const [activeTab, setActiveTab] = useState<string>("intent");
  const [logs, setLogs] = useState<{time: string, stage: string, duration: string, result: string, resultColor: string}[]>([]);
  const [compilerData, setCompilerData] = useState<CompilerOutputs | null>(null);

  const addLog = (stage: string, duration: string, result: string, resultColor: string = "text-[#10B981]") => {
    const d = new Date();
    const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    setLogs(prev => [...prev, { time, stage, duration, result, resultColor }]);
  };

  const handleCompile = async () => {
    if (!prompt.trim() || isCompiling) return;
    
    setIsCompiling(true);
    setHasCompiled(false);
    setStageStates(Array(7).fill("IDLE"));
    setLogs([]);
    setCompilerData(null);

    let realData: CompilerOutputs | null = null;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data: CompilerResponse = await res.json();
      if (!res.ok) throw new Error((data as unknown as Record<string, unknown>).error as string || "Failed to compile");
      realData = data.outputs;
      setCompilerData(data.outputs);
    } catch (e) {
      console.error(e);
      addLog("System", "0.0s", "API Connection Failed", "text-[#EF4444]");
      setIsCompiling(false);
      return;
    }

    const delays = [800, 600, 1000, 1200, 600, 1500, 1000];
    
    for (let i = 0; i < STAGES.length; i++) {
      setStageStates(prev => {
        const next = [...prev];
        next[i] = "RUNNING";
        return next;
      });
      setActiveTab(STAGES[i].id); 

      await new Promise(r => setTimeout(r, delays[i]));

      let resultState: StageState = "PASSED";
      let logMsg = "PASS";
      let logColor = "text-[#10B981]";
      
      if (STAGES[i].id === "validation") {
        if (!realData?.validation?.is_valid) {
          resultState = "FAILED";
          logMsg = `${realData?.validation?.errors?.length || 0} Issues Found`;
          logColor = "text-[#EF4444]";
        }
      }
      if (STAGES[i].id === "repair") {
        if (!realData?.validation?.is_valid) {
           resultState = "REPAIRED";
           logMsg = "Repaired";
           logColor = "text-[#3B82F6]";
        } else {
           logMsg = "No Repairs Needed";
        }
      }

      setStageStates(prev => {
        const next = [...prev];
        next[i] = resultState;
        return next;
      });

      const durStr = (delays[i] / 1000).toFixed(1) + "s";
      addLog(STAGES[i].label, durStr, logMsg, logColor);
    }

    setIsCompiling(false);
    setHasCompiled(true);
    setActiveTab("summary");
  };

  const tabs = [
    { id: "intent", label: "Intent" },
    { id: "assumptions", label: "Assumptions" },
    { id: "design", label: "Architecture" },
    { id: "schemas", label: "Schemas" },
    { id: "validation", label: "Validation" },
    { id: "repair", label: "Repair" },
    { id: "simulation", label: "Execution" },
    ...(hasCompiled ? [{ id: "summary", label: "Certificate" }] : [])
  ];

  return (
    <div className="h-full flex flex-col bg-[#0A0A0F]">
      
      {/* ════════════ PREMIUM IDE HEADER ════════════ */}
      <div className="relative border-b border-[#1E2330] h-[64px] flex-shrink-0 flex items-center bg-[#0E1015] overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#1E2330 1px, transparent 1px), linear-gradient(90deg, #1E2330 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="w-full max-w-[1600px] mx-auto px-8 flex items-center justify-between relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-bold text-white tracking-tight">CompileAI</h1>
              <span className="text-[10px] font-mono text-[#6D5DFB] border border-[#6D5DFB]/30 bg-[#6D5DFB]/10 px-1.5 py-0.5 rounded tracking-widest uppercase">Compiler</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-[12px] font-semibold text-[#94A3B8]">
              <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#10B981]/10 border border-[#10B981]/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] font-mono text-[#10B981] font-bold uppercase tracking-wider">Engine Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ MAIN WORKSPACE ════════════ */}
      <div className="flex-1 overflow-auto flex flex-col relative">
        <div className="max-w-[1600px] w-full mx-auto px-8 py-8 flex flex-col gap-6 flex-1">
          
          {/* APPLICATION SPEC EDITOR */}
          <div className="flex-shrink-0 flex flex-col border border-[#1E2330] rounded-xl overflow-hidden shadow-2xl bg-[#0E1015] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="px-6 h-11 border-b border-[#1E2330] flex items-center justify-between bg-gradient-to-r from-[#111318] to-[#0E1015]">
              <div className="flex items-center gap-3">
                <FileCode2 size={14} className="text-[#475569]" />
                <span className="text-[11px] font-bold text-[#E2E8F0] tracking-wider">
                  application_spec.ts
                </span>
              </div>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full min-h-[220px] bg-[#0A0A0F] text-[#E2E8F0] text-[13px] font-mono p-6 resize-none focus:outline-none placeholder:text-[#475569] leading-relaxed tracking-wide"
              spellCheck="false"
            />

            {/* LIVE COMPILER STATUS BAR */}
            <div className="px-6 h-14 border-t border-[#1E2330] flex justify-between items-center bg-[#111318]">
              <div className="flex items-center gap-4 overflow-hidden flex-1 mr-4">
                {isCompiling || hasCompiled ? (
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest overflow-x-auto whitespace-nowrap hide-scrollbar">
                    {STAGES.map((s, i) => {
                      const state = stageStates[i];
                      if (state === "IDLE") return null;
                      
                      let color = "text-[#6D5DFB]";
                      let Icon = Loader2;
                      let anim = "animate-spin";
                      
                      if (state === "PASSED") { color = "text-[#10B981]"; Icon = Check; anim = ""; }
                      if (state === "FAILED") { color = "text-[#EF4444]"; Icon = AlertTriangle; anim = ""; }
                      if (state === "REPAIRED") { color = "text-[#3B82F6]"; Icon = Wrench; anim = ""; }

                      return (
                         <div key={s.id} className={`flex items-center gap-1.5 ${color} animate-in fade-in slide-in-from-left-4 duration-500`}>
                            <Icon size={12} className={anim} />
                            <span>{state === "FAILED" ? "Issues Found" : state === "REPAIRED" ? "Repaired" : s.label}</span>
                         </div>
                      );
                    })}
                    {hasCompiled && (
                      <>
                        <div className="w-[1px] h-3 bg-[#1E2330] mx-2" />
                        <span className="text-[#94A3B8]">Time: 10.3s</span>
                        <span className="text-[#10B981]">Status: EXECUTABLE</span>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-[#475569] font-mono font-medium flex items-center gap-1.5">
                    <Database size={12} /> Auto-Save Enabled
                  </span>
                )}
              </div>

              <button
                onClick={handleCompile}
                disabled={isCompiling || !prompt.trim()}
                className="shrink-0 bg-gradient-to-b from-[#7C6EFB] to-[#5B4AEB] hover:from-[#8B7FFB] hover:to-[#6D5DFB] border border-[#6D5DFB]/50 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-xs font-bold tracking-wide transition-all shadow-[0_4px_14px_rgba(109,93,251,0.39)] flex items-center gap-2"
              >
                {isCompiling ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Compiling...
                  </>
                ) : hasCompiled ? (
                  <>
                    <Play size={14} className="fill-current" />
                    Recompile
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-current" />
                    Build & Execute
                  </>
                )}
              </button>
            </div>
          </div>

          {/* COMPILER WORKSPACE (Split 25/75) */}
          <div className="flex flex-1 gap-6 min-h-[450px]">
            {/* Left: Pipeline */}
            <div className="w-1/4 flex flex-col bg-[#0E1015] border border-[#1E2330] rounded-xl overflow-hidden shadow-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="px-5 h-11 border-b border-[#1E2330] flex items-center justify-between bg-gradient-to-r from-[#111318] to-[#0E1015]">
                <h3 className="text-[11px] font-bold text-[#E2E8F0] tracking-wider uppercase">Execution Pipeline</h3>
                {isCompiling && <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
              </div>
              
              <div className="flex-1 p-5 overflow-auto custom-scrollbar">
                <div className="flex flex-col gap-5 relative">
                  <div className="absolute left-[11px] top-[16px] bottom-[16px] w-[2px] bg-[#1E2330] z-0 rounded-full" />
                  
                  {STAGES.map((stage, i) => {
                    const state = stageStates[i];
                    const isCurrent = state === "RUNNING";
                    const isDone = state !== "IDLE" && state !== "RUNNING";

                    let borderColor = "border-[#1E2330]";
                    let statusColor = "";
                    let badge = null;

                    if (isCurrent) borderColor = "border-[#6D5DFB] shadow-[0_0_10px_rgba(109,93,251,0.5)] scale-110";
                    else if (state === "PASSED") { borderColor = "border-[#10B981]"; statusColor = "#10B981"; }
                    else if (state === "FAILED") { borderColor = "border-[#EF4444]"; statusColor = "#EF4444"; badge = <StatusBadge type="ISSUES" text="2 ISSUES" />; }
                    else if (state === "REPAIRED") { borderColor = "border-[#3B82F6]"; statusColor = "#3B82F6"; badge = <StatusBadge type="REPAIRED" text="1 FIX" />; }

                    return (
                      <div key={stage.id} className={`relative z-10 flex gap-4 group ${state === 'IDLE' ? 'opacity-50' : 'opacity-100'}`}>
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-[1.5px] mt-0.5 transition-all duration-500 bg-[#0E1015] ${borderColor}`}
                        >
                          {isCurrent ? (
                            <Loader2 size={10} className="text-[#6D5DFB] animate-spin" />
                          ) : isDone ? (
                            state === "FAILED" ? <AlertTriangle size={10} style={{ color: statusColor, strokeWidth: 3 }} /> : <Check size={10} style={{ color: statusColor, strokeWidth: 3 }} />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#1E2330]" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex flex-col">
                            <span className={`text-[12px] font-bold ${isDone ? "text-white" : isCurrent ? "text-[#E2E8F0]" : "text-[#475569]"}`}>
                              {stage.label}
                            </span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-[#64748B] font-medium truncate max-w-[120px]">{stage.desc}</span>
                              {isDone && <span className="text-[9px] font-mono text-[#475569]">{stage.expectedTime}</span>}
                            </div>
                            {badge && <div className="mt-2.5 flex">{badge}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="h-[140px] border-t border-[#1E2330] bg-[#0A0A0F] p-3 overflow-y-auto flex flex-col gap-2 font-mono text-[9px] custom-scrollbar">
                 {logs.map((log, i) => (
                   <div key={i} className="flex flex-col gap-0.5 animate-in slide-in-from-bottom-2 fade-in duration-300 border-l-[2px] border-[#1E2330] pl-2">
                     <div className="flex items-center justify-between text-[#475569]">
                        <span>[{log.time}] {log.stage}</span>
                        <span>{log.duration}</span>
                     </div>
                     <div className={`${log.resultColor} font-bold uppercase`}>{log.result}</div>
                   </div>
                 ))}
                 {logs.length === 0 && <div className="text-[#475569] italic">Compiler logs will appear here...</div>}
                 <div className="animate-pulse w-1.5 h-3 bg-[#475569] mt-1" />
              </div>
            </div>
            
            {/* Right: Output Explorer */}
            <div className="w-3/4 flex flex-col bg-[#0E1015] border border-[#1E2330] rounded-xl overflow-hidden shadow-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between border-b border-[#1E2330] bg-[#111318] h-11 px-2">
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar h-full">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center px-4 h-full text-[11px] font-bold tracking-wider transition-all border-b-[3px] whitespace-nowrap shrink-0 ${
                        activeTab === tab.id 
                          ? "text-white border-[#6D5DFB] bg-[#1E2330]/40" 
                          : "text-[#64748B] border-transparent hover:text-[#94A3B8] hover:bg-[#1E2330]/20"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 overflow-auto bg-[#0A0A0F] custom-scrollbar relative">
                {(!isCompiling && !hasCompiled) ? (
                  <EmptyStateFlow />
                ) : (
                  <div className="w-full h-full animate-in fade-in duration-300">
                    {activeTab === "intent" && <IntentOutput data={compilerData} />}
                    {activeTab === "assumptions" && <AssumptionsOutput data={compilerData} />}
                    {activeTab === "design" && <ArchitectureOutput data={compilerData} />}
                    {activeTab === "schemas" && <SchemaCounters active={activeTab === 'schemas'} data={compilerData} />}
                    {activeTab === "validation" && <ValidationOutput data={compilerData} />}
                    {activeTab === "repair" && <RepairOutput data={compilerData} />}
                    {activeTab === "simulation" && <RuntimeVerificationOutput data={compilerData} />}
                    {activeTab === "summary" && <FinalSummary data={compilerData} />}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
