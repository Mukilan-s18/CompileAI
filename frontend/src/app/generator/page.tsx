"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Terminal, ShieldCheck, Database, Layout, Lock, Code2, PlayCircle, Layers } from "lucide-react";
import { JsonViewer } from "@/components/ui/json-viewer";
import { MOCK_DATA } from "./mock-data";

export default function GeneratorPage() {
  const [activeTab, setActiveTab] = useState("intent");

  const tabs = [
    { id: "intent", label: "Intent", icon: <Terminal size={14} />, data: MOCK_DATA.intent },
    { id: "architecture", label: "Architecture", icon: <Layers size={14} />, data: MOCK_DATA.architecture },
    { id: "uiSchema", label: "UI Schema", icon: <Layout size={14} />, data: MOCK_DATA.uiSchema },
    { id: "apiSchema", label: "API Schema", icon: <Code2 size={14} />, data: MOCK_DATA.apiSchema },
    { id: "databaseSchema", label: "Database Schema", icon: <Database size={14} />, data: MOCK_DATA.databaseSchema },
    { id: "authRules", label: "Auth Rules", icon: <Lock size={14} />, data: MOCK_DATA.authRules },
    { id: "validationReport", label: "Validation Report", icon: <ShieldCheck size={14} />, data: MOCK_DATA.validationReport },
    { id: "executionReport", label: "Execution Report", icon: <PlayCircle size={14} />, data: MOCK_DATA.executionReport },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F]">
      {/* Workspace Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text tracking-tight">Compiler Output</h1>
          <p className="text-xs text-text-muted mt-0.5">B2B SaaS CRM Configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success">Compiled Successfully</span>
          <span className="text-xs text-text-muted font-mono ml-2">1.24s</span>
        </div>
      </header>

      {/* Tabs & Workspace */}
      <Tabs.Root 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex flex-1 overflow-hidden"
        orientation="vertical"
      >
        {/* Tab List (Left Column of Workspace) */}
        <Tabs.List className="w-56 flex-shrink-0 border-r border-border bg-[#111318] p-3 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">
            Generated Artifacts
          </div>
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left
                data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:font-medium
                data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:bg-white/5 data-[state=inactive]:hover:text-white"
            >
              <span className="opacity-70">{tab.icon}</span>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Tab Content (Right Column JSON Viewer) */}
        <div className="flex-1 p-6 bg-[#0A0A0F] overflow-hidden flex flex-col">
          {tabs.map((tab) => (
            <Tabs.Content 
              key={tab.id} 
              value={tab.id}
              className="flex-1 overflow-hidden data-[state=inactive]:hidden outline-none"
            >
              <JsonViewer 
                data={tab.data} 
                title={`compileai_${tab.id}.json`} 
              />
            </Tabs.Content>
          ))}
        </div>
      </Tabs.Root>
    </div>
  );
}
