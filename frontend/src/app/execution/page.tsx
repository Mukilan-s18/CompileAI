"use client";

import { Play, Activity, Server, Database, Globe, Shield, Terminal } from "lucide-react";

export default function ExecutionSimulator() {
  const routes = [
    { path: "/", status: 200, latency: "42ms", size: "12kb" },
    { path: "/login", status: 200, latency: "38ms", size: "8kb" },
    { path: "/dashboard", status: 302, latency: "15ms", size: "0kb", notes: "Redirects to /login (Auth Guard)" },
    { path: "/dashboard/contacts", status: 302, latency: "18ms", size: "0kb", notes: "Redirects to /login" }
  ];

  const apis = [
    { endpoint: "GET /api/contacts", auth: "Required", status: 401, latency: "12ms", notes: "Fails correctly without JWT" },
    { endpoint: "POST /api/contacts", auth: "Required", status: 401, latency: "14ms", notes: "Fails correctly without JWT" },
    { endpoint: "POST /api/webhooks/stripe", auth: "Public", status: 400, latency: "8ms", notes: "Fails correctly on missing signature" }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F]">
      
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text tracking-tight flex items-center gap-2">
            <Play size={18} className="text-accent" />
            Runtime Verification
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Automated execution and dry-run simulation</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Execution Score</span>
            <span className="text-lg font-bold text-success">100 / 100</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-auto p-6 max-w-6xl w-full mx-auto space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="panel p-5 border-success/30 bg-success-bg/5">
            <div className="flex items-center gap-2 mb-2">
              <Server size={16} className="text-success" />
              <h3 className="text-sm font-semibold text-text">Build Status</h3>
            </div>
            <p className="text-2xl font-bold text-success">PASSED</p>
            <p className="text-xs text-text-muted mt-1 font-mono">1240ms container build</p>
          </div>
          
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-2">
              <Database size={16} className="text-accent" />
              <h3 className="text-sm font-semibold text-text">Schema Push</h3>
            </div>
            <p className="text-2xl font-bold text-text">SUCCESS</p>
            <p className="text-xs text-text-muted mt-1 font-mono">0 data loss warnings</p>
          </div>
          
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-warning" />
              <h3 className="text-sm font-semibold text-text">Auth Guards</h3>
            </div>
            <p className="text-2xl font-bold text-text">VERIFIED</p>
            <p className="text-xs text-text-muted mt-1 font-mono">14 protected boundaries</p>
          </div>
        </div>

        {/* Route Simulation */}
        <div className="panel overflow-hidden">
          <div className="p-4 border-b border-border bg-[#111318] flex items-center gap-2">
            <Globe size={16} className="text-text-muted" />
            <h2 className="text-sm font-semibold text-text">Frontend Route Simulation</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-[#111318]/50 text-xs font-semibold text-text-muted uppercase tracking-wider">
                <th className="p-3 pl-4">Route Path</th>
                <th className="p-3">Status</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Size</th>
                <th className="p-3 pr-4">Notes</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {routes.map((route, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="p-3 pl-4 font-mono text-text-secondary">{route.path}</td>
                  <td className="p-3">
                    <span className={`badge ${route.status === 200 ? 'badge-success' : 'badge-warning'}`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-text-muted">{route.latency}</td>
                  <td className="p-3 font-mono text-text-muted">{route.size}</td>
                  <td className="p-3 pr-4 text-text-muted text-xs">{route.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* API Simulation */}
        <div className="panel overflow-hidden">
          <div className="p-4 border-b border-border bg-[#111318] flex items-center gap-2">
            <Terminal size={16} className="text-text-muted" />
            <h2 className="text-sm font-semibold text-text">API Dry-Run Verification</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-[#111318]/50 text-xs font-semibold text-text-muted uppercase tracking-wider">
                <th className="p-3 pl-4">Endpoint</th>
                <th className="p-3">Auth</th>
                <th className="p-3">Simulated Status</th>
                <th className="p-3">Latency</th>
                <th className="p-3 pr-4">Assertion</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {apis.map((api, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="p-3 pl-4 font-mono text-text-secondary">{api.endpoint}</td>
                  <td className="p-3">
                    <span className={`text-[11px] font-semibold tracking-wider uppercase ${api.auth === 'Public' ? 'text-success' : 'text-warning'}`}>
                      {api.auth}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="badge badge-neutral">{api.status}</span>
                  </td>
                  <td className="p-3 font-mono text-text-muted">{api.latency}</td>
                  <td className="p-3 pr-4 text-text-muted text-xs flex items-center gap-1.5">
                    <Activity size={12} className="text-success" />
                    {api.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
