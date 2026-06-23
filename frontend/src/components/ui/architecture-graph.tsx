"use client";

import { User, Users, Building2, CreditCard, Handshake, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function ArchitectureGraph() {
  const nodes = [
    { id: "user", label: "User", icon: User, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
    { id: "contact", label: "Contact", icon: Users, color: "text-success", bg: "bg-success/10", border: "border-success/30" },
    { id: "company", label: "Company", icon: Building2, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
    { id: "subscription", label: "Subscription", icon: CreditCard, color: "text-info", bg: "bg-info/10", border: "border-info/30" },
    { id: "deal", label: "Deal", icon: Handshake, color: "text-error", bg: "bg-error/10", border: "border-error/30" }
  ];

  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center p-8 bg-[#0A0A0F] relative overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      <div className="relative w-full max-w-2xl flex flex-wrap justify-center gap-x-12 gap-y-16">
        
        {/* Connecting Lines (SVG overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0 0 4px rgba(109, 93, 251, 0.3))' }}>
          {/* Simple mock connections - in a real app these would be dynamically calculated */}
          {/* User to Contact */}
          <path d="M 220,100 L 290,100" stroke="#6D5DFB" strokeWidth="2" strokeDasharray="4 4" fill="none" className="opacity-50 animate-[dash_20s_linear_infinite]" />
          {/* Contact to Company */}
          <path d="M 430,100 L 500,100" stroke="#6D5DFB" strokeWidth="2" strokeDasharray="4 4" fill="none" className="opacity-50 animate-[dash_20s_linear_infinite]" />
          {/* User to Subscription */}
          <path d="M 150,140 C 150,200 200,220 250,220" stroke="#6D5DFB" strokeWidth="2" strokeDasharray="4 4" fill="none" className="opacity-50 animate-[dash_20s_linear_infinite]" />
          {/* Company to Deal */}
          <path d="M 570,140 C 570,200 520,220 470,220" stroke="#6D5DFB" strokeWidth="2" strokeDasharray="4 4" fill="none" className="opacity-50 animate-[dash_20s_linear_infinite]" />
        </svg>

        <style>{`
          @keyframes dash {
            to { stroke-dashoffset: -1000; }
          }
        `}</style>

        {/* Nodes - Top Row */}
        <div className="w-full flex justify-center items-center gap-12 z-10">
          {[nodes[0], nodes[1], nodes[2]].map((node, i) => (
            <div key={node.id} className="flex items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`flex flex-col items-center justify-center w-36 h-28 bg-[#151821] border ${node.border} rounded-xl shadow-lg hover:border-accent/60 hover:shadow-accent/20 transition-all cursor-pointer group`}
              >
                <div className={`w-10 h-10 rounded-lg ${node.bg} ${node.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <node.icon size={20} />
                </div>
                <span className="text-sm font-semibold text-text">{node.label}</span>
                <span className="text-[10px] text-text-muted font-mono mt-1">Entity Node</span>
              </motion.div>
              
              {i < 2 && (
                <div className="mx-6 text-text-muted/50 hidden md:block">
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Nodes - Bottom Row */}
        <div className="w-full flex justify-center items-center gap-24 z-10">
          {[nodes[3], nodes[4]].map((node, i) => (
            <motion.div 
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className={`flex flex-col items-center justify-center w-36 h-28 bg-[#151821] border ${node.border} rounded-xl shadow-lg hover:border-accent/60 hover:shadow-accent/20 transition-all cursor-pointer group`}
            >
              <div className={`w-10 h-10 rounded-lg ${node.bg} ${node.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <node.icon size={20} />
              </div>
              <span className="text-sm font-semibold text-text">{node.label}</span>
              <span className="text-[10px] text-text-muted font-mono mt-1">Relation Node</span>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
