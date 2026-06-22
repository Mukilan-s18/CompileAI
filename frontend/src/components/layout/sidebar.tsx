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
    <aside className="w-56 m-4 flex-shrink-0 glass-card rounded-2xl flex flex-col h-[calc(100vh-2rem)]">
      <div className="h-16 flex items-center px-6 border-b border-white/40">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          CompileAI
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Pipeline
          </p>
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  isActive
                    ? "bg-white/80 shadow-sm text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-white/40 hover:text-slate-900"
                )}
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

      <div className="p-4 border-t border-white/40">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/40 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs shadow-sm">
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
