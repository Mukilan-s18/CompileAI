"use client";

import { BookOpen, Search, ExternalLink, FileCode2, Terminal, Database, ShieldCheck, Wrench, Rocket, Zap } from "lucide-react";
import { useState } from "react";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Zap,
    articles: [
      { title: "Introduction to CompileAI", desc: "Overview of the compiler-based software generation platform and core concepts." },
      { title: "Your First Compilation", desc: "Step-by-step guide to compiling your first application from a natural language spec." },
      { title: "Understanding the Pipeline", desc: "How the 6-stage compiler pipeline transforms specs into executable schemas." },
    ],
  },
  {
    id: "compiler-api",
    title: "Compiler API",
    icon: Terminal,
    articles: [
      { title: "API Authentication", desc: "Securing your API requests with key-based authentication and rate limiting." },
      { title: "Compile Endpoint", desc: "POST /api/compile — Submit application specs and receive generated schemas." },
      { title: "Async Compilation", desc: "Handle long-running compilations with webhooks and polling strategies." },
      { title: "Error Handling", desc: "Understanding error codes, validation failures, and retry semantics." },
    ],
  },
  {
    id: "schemas",
    title: "Schema Reference",
    icon: FileCode2,
    articles: [
      { title: "Intent Schema", desc: "Structure of the extracted intent object including features, roles, and complexity." },
      { title: "Architecture Schema", desc: "Frontend, backend, and infrastructure configuration output format." },
      { title: "Database Schema", desc: "Prisma-compatible model definitions, relations, and index specifications." },
      { title: "Auth Rules Schema", desc: "Role-permission mappings, session strategies, and access control policies." },
    ],
  },
  {
    id: "validation",
    title: "Validation & Repair",
    icon: ShieldCheck,
    articles: [
      { title: "Validation Rules", desc: "142 built-in checks across schema consistency, type safety, and business logic." },
      { title: "Auto-Repair Engine", desc: "How the repair engine automatically resolves common validation failures." },
      { title: "Custom Validation Rules", desc: "Define organization-specific validation constraints for your compilations." },
    ],
  },
  {
    id: "runtime",
    title: "Runtime Verification",
    icon: Rocket,
    articles: [
      { title: "Dry-Run Simulation", desc: "How CompileAI simulates route responses, auth guards, and API endpoints." },
      { title: "Execution Reports", desc: "Understanding the pass/fail criteria and execution score methodology." },
    ],
  },
];

export default function DocsPage() {
  const [search, setSearch] = useState("");

  const filtered = sections.map((section) => ({
    ...section,
    articles: section.articles.filter(
      (a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.articles.length > 0);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <BookOpen size={18} className="text-[#6D5DFB]" />
            Documentation
          </h1>
          <p className="text-xs text-[#475569] mt-0.5">CompileAI platform guides and API reference</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documentation..."
            className="bg-[#0A0A0F] border border-[#1E2330] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6D5DFB]/50 w-72 transition-colors"
          />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 max-w-4xl w-full mx-auto space-y-8">
        {filtered.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#6D5DFB]/10 flex items-center justify-center">
                  <Icon size={14} className="text-[#6D5DFB]" />
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">{section.title}</h2>
              </div>
              <div className="space-y-2">
                {section.articles.map((article) => (
                  <div
                    key={article.title}
                    className="bg-[#111318] border border-[#1E2330] rounded-xl px-5 py-4 flex items-center justify-between hover:border-[#6D5DFB]/20 transition-colors cursor-pointer group"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#6D5DFB] transition-colors">{article.title}</h3>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{article.desc}</p>
                    </div>
                    <ExternalLink size={14} className="text-[#475569] group-hover:text-[#6D5DFB] transition-colors shrink-0 ml-4" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
