"use client";

import { Settings as SettingsIcon, Key, Users, Building, CreditCard, Shield } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General Workspace", icon: Building },
    { id: "keys", label: "API Keys", icon: Key },
    { id: "team", label: "Team & Access", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#09090B]">
      
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111113] flex items-center gap-2">
        <SettingsIcon size={18} className="text-accent" />
        <h1 className="text-lg font-semibold text-text tracking-tight">System Settings</h1>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden flex max-w-6xl w-full mx-auto">
        
        {/* Settings Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-border p-6 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? "bg-white/10 text-white" 
                    : "text-text-secondary hover:text-text hover:bg-white/5"
                }`}
              >
                <Icon size={16} className={activeTab === tab.id ? "text-white" : "text-text-muted"} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {activeTab === "general" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold text-text mb-1">Workspace Profile</h2>
                <p className="text-sm text-text-muted mb-6">Manage your organization details and preferences.</p>
                
                <div className="panel p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Workspace Name</label>
                    <input 
                      type="text" 
                      defaultValue="CompileAI Labs"
                      className="w-full max-w-md bg-[#09090B] border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Workspace ID</label>
                    <div className="flex gap-2 max-w-md">
                      <input 
                        type="text" 
                        value="org_c9x2b4m8"
                        disabled
                        className="flex-1 bg-[#09090B]/50 border border-border/50 rounded-md px-3 py-2 text-sm text-text-muted font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "keys" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold text-text mb-1">API Keys</h2>
                <p className="text-sm text-text-muted mb-6">Manage your provider keys for the CompileAI engine.</p>
                
                <div className="panel p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#09090B] border border-border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#131316] border border-border flex items-center justify-center">
                        <Key size={14} className="text-text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">OpenAI Provider Key</p>
                        <p className="text-xs font-mono text-text-muted">sk-proj-**********************</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-text-secondary hover:text-white transition-colors">Edit</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#09090B] border border-border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#131316] border border-border flex items-center justify-center">
                        <Key size={14} className="text-text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">Anthropic Provider Key</p>
                        <p className="text-xs font-mono text-text-muted">sk-ant-**********************</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-text-secondary hover:text-white transition-colors">Edit</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dummy placeholders for other tabs to prevent empty states */}
          {["team", "security", "billing"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-64 text-text-muted animate-in fade-in duration-500">
              <Shield size={32} className="mb-4 opacity-20" />
              <p className="text-sm font-medium capitalize">{activeTab} Settings</p>
              <p className="text-xs mt-1">Available in Enterprise Tier</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
