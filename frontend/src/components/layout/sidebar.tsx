"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: "◆" },
  { label: "Generator", href: "/generator", icon: "⚡" },
  { label: "Clarify", href: "/clarify", icon: "🔍" },
  { label: "Validation", href: "/validation", icon: "✓" },
  { label: "Repair", href: "/repair", icon: "⚙" },
  { label: "Execution", href: "/execution", icon: "▶" },
  { label: "Benchmarks", href: "/benchmarks", icon: "📊" },
  { label: "Cost Analysis", href: "/cost-analysis", icon: "💰" },
  { label: "Metrics", href: "/metrics", icon: "📈" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border-light bg-surface/40 backdrop-blur-2xl shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-10 relative">
      {/* Logo */}
      <div className="p-5 border-b border-border-light/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/20 ring-1 ring-white/20">
            AC
          </div>
          <div>
            <h1 className="text-sm font-bold text-text tracking-wide text-gradient">AI Compiler</h1>
            <p className="text-[10px] text-accent tracking-widest uppercase mt-0.5">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 animate-fade-in-up",
                isActive
                  ? "bg-accent/15 text-white border border-accent/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] backdrop-blur-md"
                  : "text-text-secondary hover:text-white hover:bg-surface-hover hover:border-white/5 border border-transparent"
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className={cn(
                "text-base transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-accent drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : ""
              )}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-light/50 bg-black/20">
        <div className="glass-card p-3 text-center">
          <p className="text-[11px] text-text-muted">Powered by</p>
          <p className="text-xs font-medium text-accent">OpenAI + Pydantic</p>
        </div>
      </div>
    </aside>
  );
}
