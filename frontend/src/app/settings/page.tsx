"use client";

import { Settings as SettingsIcon, Key, Users, Building, CreditCard, Shield, ExternalLink, Activity } from "lucide-react";
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
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-[#1E2330] bg-[#111318] flex items-center gap-2">
        <SettingsIcon size={18} className="text-[#6D5DFB]" />
        <h1 className="text-lg font-semibold text-white tracking-tight">System Settings</h1>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden flex max-w-6xl w-full mx-auto">
        
        {/* Settings Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-[#1E2330] p-6 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? "bg-white/10 text-white" 
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} className={activeTab === tab.id ? "text-white" : "text-[#475569]"} />
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
                <h2 className="text-xl font-semibold text-white mb-1">Workspace Profile</h2>
                <p className="text-sm text-[#94A3B8] mb-6">Manage your organization details and preferences.</p>
                
                <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Workspace Name</label>
                    <input 
                      type="text" 
                      defaultValue="CompileAI Labs"
                      className="w-full max-w-md bg-[#0A0A0F] border border-[#1E2330] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6D5DFB] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Workspace ID</label>
                    <div className="flex gap-2 max-w-md">
                      <input 
                        type="text" 
                        value="org_c9x2b4m8"
                        disabled
                        className="flex-1 bg-[#0A0A0F]/50 border border-[#1E2330]/50 rounded-md px-3 py-2 text-sm text-[#475569] font-mono"
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
                <h2 className="text-xl font-semibold text-white mb-1">API Provider Keys</h2>
                <p className="text-sm text-[#94A3B8] mb-6">Securely manage connections to external LLM providers.</p>
                
                <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#0A0A0F] border border-[#1E2330] rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#151821] border border-[#1E2330] flex items-center justify-center">
                        <Key size={14} className="text-[#94A3B8]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">OpenAI Provider Key</p>
                        <p className="text-xs font-mono text-[#475569]">••••••••••••••••••••••••••••</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors">Replace</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#0A0A0F] border border-[#1E2330] rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#151821] border border-[#1E2330] flex items-center justify-center">
                        <Key size={14} className="text-[#94A3B8]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Anthropic Provider Key</p>
                        <p className="text-xs font-mono text-[#475569]">••••••••••••••••••••••••••••</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors">Replace</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Team & Access</h2>
                <p className="text-sm text-[#94A3B8] mb-6">Manage roles, invites, and organization access.</p>
                <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white">Active Members</h3>
                    <button className="text-xs font-semibold text-[#6D5DFB] bg-[#6D5DFB]/10 px-3 py-1.5 rounded-md">Invite Member</button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-[#1E2330]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6D5DFB] flex items-center justify-center text-xs font-bold text-white">MK</div>
                        <div>
                          <p className="text-sm font-medium text-white">Mukilan K</p>
                          <p className="text-xs text-[#94A3B8]">mukilan@example.com</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Owner</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Security & Auditing</h2>
                <p className="text-sm text-[#94A3B8] mb-6">Configure platform compliance and security headers.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#10B981]" />
                        <h3 className="text-sm font-medium text-white">Audit Logging</h3>
                      </div>
                      <div className="w-8 h-4 bg-[#10B981]/20 rounded-full flex items-center p-0.5">
                        <div className="w-3 h-3 bg-[#10B981] rounded-full translate-x-4"></div>
                      </div>
                    </div>
                    <p className="text-xs text-[#94A3B8]">All workspace events are continuously logged and retained for 30 days.</p>
                  </div>
                  <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-[#10B981]" />
                        <h3 className="text-sm font-medium text-white">2FA Enforced</h3>
                      </div>
                      <div className="w-8 h-4 bg-[#10B981]/20 rounded-full flex items-center p-0.5">
                        <div className="w-3 h-3 bg-[#10B981] rounded-full translate-x-4"></div>
                      </div>
                    </div>
                    <p className="text-xs text-[#94A3B8]">All team members are required to use Two-Factor Authentication.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Billing & Limits</h2>
                <p className="text-sm text-[#94A3B8] mb-6">View your plan details and compilation usage.</p>
                <div className="bg-[#111318] border border-[#1E2330] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Pro Plan</h3>
                      <p className="text-xs text-[#94A3B8]">$99 / month</p>
                    </div>
                    <button className="text-xs font-medium text-[#475569] border border-[#1E2330] bg-[#0A0A0F] px-3 py-1.5 rounded-md hover:text-white transition-colors flex items-center gap-1">
                      Manage via Stripe <ExternalLink size={12} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Compilations (This Month)</span>
                      <span className="text-white font-mono">1,248 / 5,000</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0A0A0F] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6D5DFB] w-1/4 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
