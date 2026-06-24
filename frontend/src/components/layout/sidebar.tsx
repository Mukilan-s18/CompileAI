import Link from "next/link";
import { 
  Play, 
  Terminal, 
  Settings,
  Database,
  BarChart3,
  Box,
  ShieldCheck,
  CheckCircle2,
  BrainCircuit,
  Eye
} from "lucide-react";

const NavGroup = ({ title, items }: { title: string, items: { name: string, icon: React.ElementType, href: string }[] }) => (
  <div className="mb-6">
    <h3 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest px-3 mb-3">{title}</h3>
    <div className="flex flex-col space-y-0.5">
      {items.map((item) => (
        <Link 
          key={item.name} 
          href={item.href}
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative
            ${item.href === "/reviewer" 
              ? "text-[#6D5DFB] bg-[#6D5DFB]/10 hover:bg-[#6D5DFB]/20" 
              : "text-[#94A3B8] hover:text-white hover:bg-[#1E2330]"
            }`}
        >
          <item.icon size={16} className={item.href === "/reviewer" ? "text-[#6D5DFB]" : "text-[#475569] group-hover:text-white transition-colors"} />
          <span>{item.name}</span>
          {item.href === "/reviewer" && (
            <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#6D5DFB] animate-pulse" />
          )}
        </Link>
      ))}
    </div>
  </div>
);

export function Sidebar() {
  const lifecycleItems = [
    { name: "Compiler IDE", icon: Play, href: "/" },
    { name: "Schema Generation", icon: Database, href: "/generator" },
    { name: "Validation Engine", icon: ShieldCheck, href: "/validation" },
    { name: "Repair Pipeline", icon: CheckCircle2, href: "/repair" },
    { name: "Execution Logic", icon: Terminal, href: "/execution" },
  ];

  const metricsItems = [
    { name: "Reviewer Mode", icon: Eye, href: "/reviewer" },
    { name: "Benchmark Center", icon: BarChart3, href: "/benchmarks" },
    { name: "Architecture Models", icon: Box, href: "/templates" },
    { name: "Model Settings", icon: BrainCircuit, href: "/settings" },
  ];

  return (
    <div className="w-[220px] h-full bg-[#0E1015] border-r border-[#1E2330] flex flex-col z-20 shrink-0 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1E2330 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      <div className="p-6 border-b border-[#1E2330] relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="text-[13px] font-bold text-white tracking-tight">Compile</h2>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C6EFB] to-[#5B4AEB] flex items-center justify-center shadow-[0_0_15px_rgba(109,93,251,0.3)] border border-[#6D5DFB]/50">
            <span className="text-white font-bold text-sm font-mono tracking-tighter">AI</span>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar relative z-10">
        <NavGroup title="Core Lifecycle" items={lifecycleItems} />
        <NavGroup title="Telemetry & Output" items={metricsItems} />
      </div>

      <div className="p-4 border-t border-[#1E2330] relative z-10 bg-[#111318]">
        <Link href="/settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#94A3B8] hover:text-white hover:bg-[#1E2330] transition-colors group">
          <Settings size={16} className="text-[#475569] group-hover:text-white transition-colors" />
          <span>Workspace Setup</span>
        </Link>
      </div>
    </div>
  );
}
