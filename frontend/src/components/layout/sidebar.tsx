"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Terminal, 
  GitMerge, 
  ShieldCheck, 
  Wrench, 
  Play, 
  BarChart2, 
  LineChart, 
  Settings,
  LayoutTemplate,
  FileText,
  Key,
  BookOpen,
  Star,
  RefreshCw,
  Clock,
  ChevronDown
} from "lucide-react";

const navGroups = [
  {
    title: "BUILD",
    items: [
      { label: "Dashboard", href: "/", icon: <LayoutDashboard size={16} /> },
      { label: "Compiler", href: "/generator", icon: <Terminal size={16} /> },
      { label: "Pipeline", href: "/pipeline", icon: <GitMerge size={16} /> },
      { label: "Templates", href: "/templates", icon: <LayoutTemplate size={16} /> },
    ]
  },
  {
    title: "RELIABILITY",
    items: [
      { label: "Validation", href: "/validation", icon: <ShieldCheck size={16} /> },
      { label: "Repair Engine", href: "/repair", icon: <Wrench size={16} /> },
      { label: "Runtime Verification", href: "/execution", icon: <Play size={16} /> },
    ]
  },
  {
    title: "EVALUATION",
    items: [
      { label: "Benchmarks", href: "/benchmarks", icon: <BarChart2 size={16} /> },
      { label: "Metrics", href: "/metrics", icon: <LineChart size={16} /> },
      { label: "Logs", href: "/logs", icon: <FileText size={16} /> },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", href: "/settings", icon: <Settings size={16} /> },
      { label: "API Keys", href: "/keys", icon: <Key size={16} /> },
      { label: "Documentation", href: "/docs", icon: <BookOpen size={16} /> },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[190px] flex-shrink-0 bg-[#0E1015] border-r border-border flex flex-col h-screen">
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6D5DFB] text-white flex items-center justify-center font-bold text-sm">
            C
          </div>
          <h1 className="text-[13px] font-bold text-text tracking-tight">
            CompileAI
          </h1>
          <span className="text-[9px] font-semibold text-text-muted bg-white/5 border border-border px-1 py-0.5 rounded-md ml-1">
            v2.0
          </span>
          <ChevronDown size={12} className="text-text-muted ml-auto" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={group.title} className={cn(idx > 0 && "mt-4")}>
            <p className="px-2 mb-1.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.1em]">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all duration-150 mb-0.5",
                    isActive
                      ? "bg-[#6D5DFB]/15 text-white font-semibold border border-[#6D5DFB]/20"
                      : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className={cn("flex-shrink-0", isActive ? "text-[#6D5DFB]" : "text-[#475569]")}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="border-t border-border">
        <div className="px-3 py-3 flex items-center gap-2 hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-7 h-7 flex-shrink-0 rounded-full bg-[#6D5DFB] flex items-center justify-center text-white font-bold text-[10px]">
            MK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-text truncate">
              Mukilan K
            </p>
            <p className="text-[10px] text-text-muted truncate">
              Developer
            </p>
          </div>
        </div>
        {/* Bottom Action Icons */}
        <div className="px-3 pb-3 flex items-center justify-between">
          <button className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors">
            <Star size={13} />
          </button>
          <button className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors">
            <RefreshCw size={13} />
          </button>
          <button className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors">
            <Clock size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
