"use client";

import { LineChart, Activity, Zap, Cpu, MemoryStick, Clock } from "lucide-react";

export default function MetricsPage() {
  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F]">
      
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text tracking-tight flex items-center gap-2">
            <LineChart size={18} className="text-accent" />
            System Metrics
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Platform telemetry and performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-md bg-success/10 border border-success/20 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs font-bold text-success uppercase tracking-wider">All Systems Operational</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-auto p-6 max-w-6xl w-full mx-auto space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Avg Latency</span>
              <Clock size={14} className="text-text-muted" />
            </div>
            <p className="text-2xl font-bold text-text mb-1">1,240 <span className="text-sm font-normal text-text-muted">ms</span></p>
            <p className="text-[10px] text-success font-semibold flex items-center gap-1">↓ 12% vs last week</p>
          </div>
          
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Compilation Req/s</span>
              <Activity size={14} className="text-text-muted" />
            </div>
            <p className="text-2xl font-bold text-text mb-1">4.2</p>
            <p className="text-[10px] text-error font-semibold flex items-center gap-1">↑ 2.1% vs last week</p>
          </div>
          
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">GPU Utilization</span>
              <Cpu size={14} className="text-text-muted" />
            </div>
            <p className="text-2xl font-bold text-text mb-1">68.4 <span className="text-sm font-normal text-text-muted">%</span></p>
            <div className="w-full h-1 bg-[#111318] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: '68.4%' }}></div>
            </div>
          </div>
          
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Memory Usage</span>
              <MemoryStick size={14} className="text-text-muted" />
            </div>
            <p className="text-2xl font-bold text-text mb-1">12.4 <span className="text-sm font-normal text-text-muted">GB</span></p>
            <div className="w-full h-1 bg-[#111318] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>
        </div>

        {/* Mock Chart Area */}
        <div className="panel p-6 h-80 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-text">Compiler Throughput</h3>
              <p className="text-xs text-text-muted">Compilations per hour over the last 24 hours</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-sm bg-white/5 text-[10px] text-text-secondary border border-border">24H</span>
              <span className="px-2 py-1 rounded-sm text-[10px] text-text-muted hover:bg-white/5 transition-colors cursor-pointer">7D</span>
              <span className="px-2 py-1 rounded-sm text-[10px] text-text-muted hover:bg-white/5 transition-colors cursor-pointer">30D</span>
            </div>
          </div>
          
          <div className="flex-1 border-b border-l border-border/50 relative z-10">
            {/* Super simple mock grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-px bg-border/30" />
              ))}
            </div>
            {/* Super simple mock line chart path using svg */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <path 
                d="M 0,150 Q 50,140 100,80 T 200,60 T 300,100 T 400,20 T 500,50 T 600,10 T 700,90 T 800,40 T 900,10 T 1000,60" 
                fill="none" 
                stroke="#6366F1" 
                strokeWidth="2"
                className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              />
              <path 
                d="M 0,150 Q 50,140 100,80 T 200,60 T 300,100 T 400,20 T 500,50 T 600,10 T 700,90 T 800,40 T 900,10 T 1000,60 L 1000,300 L 0,300 Z" 
                fill="url(#gradient)" 
                stroke="none"
                opacity="0.1"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
