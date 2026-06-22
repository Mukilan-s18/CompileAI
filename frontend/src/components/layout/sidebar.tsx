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
    <aside className="w-64 h-screen flex flex-col border-r border-border-light bg-surface shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-border-light">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-violet flex items-center justify-center text-white font-bold text-sm">
            AC
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text">AI Compiler</h1>
            <p className="text-[11px] text-text-muted">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-text-secondary hover:text-text hover:bg-surface-hover"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-light">
        <div className="glass-card p-3 text-center">
          <p className="text-[11px] text-text-muted">Powered by</p>
          <p className="text-xs font-medium text-accent">OpenAI + Pydantic</p>
        </div>
      </div>
    </aside>
  );
}
