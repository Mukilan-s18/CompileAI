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
  BookOpen
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
    <aside className="w-64 flex-shrink-0 bg-surface border-r border-border flex flex-col h-screen">
      <div className="h-14 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[4px] bg-white text-black flex items-center justify-center font-bold text-[10px]">
            C
          </div>
          <h1 className="text-sm font-semibold text-text tracking-tight">
            CompileAI
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={group.title} className={cn("space-y-0.5", idx > 0 && "mt-6")}>
            <p className="px-2 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-text-secondary hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className={cn("flex-shrink-0", isActive ? "text-white" : "text-text-muted")}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border mt-auto">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white font-medium text-[10px]">
            M
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-text truncate">
              Mukilan
            </p>
            <p className="text-[11px] text-text-muted truncate">
              Personal Workspace
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
