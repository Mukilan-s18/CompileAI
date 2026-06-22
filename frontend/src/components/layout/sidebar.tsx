"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { 
  LayoutDashboard, 
  Zap, 
  Search, 
  CheckCircle2, 
  Wrench, 
  Play, 
  BarChart3, 
  CircleDollarSign, 
  LineChart 
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
  { label: "Generator", href: "/generator", icon: <Zap size={20} /> },
  { label: "Clarify", href: "/clarify", icon: <Search size={20} /> },
  { label: "Validation", href: "/validation", icon: <CheckCircle2 size={20} /> },
  { label: "Repair", href: "/repair", icon: <Wrench size={20} /> },
  { label: "Execution", href: "/execution", icon: <Play size={20} /> },
  { label: "Benchmarks", href: "/benchmarks", icon: <BarChart3 size={20} /> },
  { label: "Cost Analysis", href: "/cost-analysis", icon: <CircleDollarSign size={20} /> },
  { label: "Metrics", href: "/metrics", icon: <LineChart size={20} /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border-light bg-surface/40 backdrop-blur-2xl shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-10 relative">
    <aside className="w-56 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          CompileAI
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Pipeline
          </p>
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-slate-100 text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <span
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              Jane Doe
            </p>
            <p className="text-xs text-slate-500 truncate">
              Workspace Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
