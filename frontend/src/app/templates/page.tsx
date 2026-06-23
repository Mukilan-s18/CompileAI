"use client";

import { LayoutTemplate, Search, Star, Clock, ArrowRight, Zap, Users, ShoppingCart, MessageSquare, FileText, BarChart2 } from "lucide-react";
import { useState } from "react";

const templates = [
  {
    id: "crm",
    name: "B2B SaaS CRM",
    description: "Full-featured customer relationship management with contacts, deals pipeline, analytics, and team collaboration.",
    complexity: "High",
    schemas: 18,
    estimatedTime: "~5.1s",
    category: "Business",
    icon: Users,
    popular: true,
  },
  {
    id: "ecommerce",
    name: "E-Commerce Platform",
    description: "Online storefront with product catalog, shopping cart, checkout flow, inventory management, and Stripe integration.",
    complexity: "High",
    schemas: 22,
    estimatedTime: "~6.2s",
    category: "Commerce",
    icon: ShoppingCart,
    popular: true,
  },
  {
    id: "chat",
    name: "Real-time Chat Application",
    description: "Messaging platform with channels, direct messages, file sharing, presence indicators, and push notifications.",
    complexity: "Very High",
    schemas: 14,
    estimatedTime: "~7.8s",
    category: "Communication",
    icon: MessageSquare,
    popular: false,
  },
  {
    id: "blog",
    name: "Content Management System",
    description: "Blog and content platform with rich text editor, categories, tags, SEO optimization, and multi-author support.",
    complexity: "Medium",
    schemas: 8,
    estimatedTime: "~2.4s",
    category: "Content",
    icon: FileText,
    popular: false,
  },
  {
    id: "dashboard",
    name: "Admin Dashboard",
    description: "Internal analytics dashboard with data visualization, user management, audit logs, and role-based access control.",
    complexity: "Medium",
    schemas: 10,
    estimatedTime: "~3.1s",
    category: "Internal Tools",
    icon: BarChart2,
    popular: true,
  },
  {
    id: "fintech",
    name: "Fintech Ledger",
    description: "Financial transaction ledger with double-entry bookkeeping, reconciliation, compliance reporting, and audit trails.",
    complexity: "Critical",
    schemas: 28,
    estimatedTime: "~8.5s",
    category: "Finance",
    icon: Zap,
    popular: false,
  },
];

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <LayoutTemplate size={18} className="text-[#6D5DFB]" />
            Starter Templates
          </h1>
          <p className="text-xs text-[#475569] mt-0.5">Pre-configured application specs for rapid compilation</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="bg-[#0A0A0F] border border-[#1E2330] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-[#6D5DFB]/50 w-64 transition-colors"
          />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="bg-[#111318] border border-[#1E2330] rounded-xl p-5 hover:border-[#6D5DFB]/30 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#6D5DFB]/10 flex items-center justify-center">
                    <Icon size={20} className="text-[#6D5DFB]" />
                  </div>
                  {template.popular && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                      <Star size={10} /> Popular
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{template.name}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-4 line-clamp-2">{template.description}</p>

                <div className="flex items-center gap-3 mb-4 text-[10px] font-mono text-[#475569]">
                  <span className="bg-white/5 px-2 py-0.5 rounded">{template.complexity}</span>
                  <span>{template.schemas} schemas</span>
                  <span className="flex items-center gap-1"><Clock size={9} /> {template.estimatedTime}</span>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-[#94A3B8] border border-[#1E2330] hover:bg-[#6D5DFB]/10 hover:text-[#6D5DFB] hover:border-[#6D5DFB]/30 transition-all group-hover:border-[#6D5DFB]/20">
                  Use Template <ArrowRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
