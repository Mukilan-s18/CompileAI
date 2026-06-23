"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, FileWarning, Filter, Terminal, AlertTriangle, AlertCircle, Info, FileCode2, Wrench } from "lucide-react";
import { VALIDATION_ERRORS, ErrorCategory, ErrorSeverity } from "./mock-data";

const SeverityIcon = ({ severity }: { severity: ErrorSeverity }) => {
  switch (severity) {
    case "CRITICAL": return <AlertOctagon className="text-error" size={16} />;
    case "ERROR": return <AlertCircle className="text-error" size={16} />;
    case "WARNING": return <AlertTriangle className="text-warning" size={16} />;
    case "INFO": return <Info className="text-info" size={16} />;
  }
};

// Simple Lucide React missing icon mock
const AlertOctagon = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const SeverityBadge = ({ severity }: { severity: ErrorSeverity }) => {
  const styles = {
    CRITICAL: "badge-error",
    ERROR: "badge-error opacity-80",
    WARNING: "badge-warning",
    INFO: "badge-info"
  };
  return <span className={`badge ${styles[severity]} font-mono`}>{severity}</span>;
};

export default function ValidationCenter() {
  const [activeCategory, setActiveCategory] = useState<ErrorCategory | "All">("All");

  const categories: (ErrorCategory | "All")[] = ["All", "Schema", "Type", "Cross-Layer", "Business Logic"];
  
  const filteredErrors = VALIDATION_ERRORS.filter(
    (err) => activeCategory === "All" || err.category === activeCategory
  );

  const criticalCount = VALIDATION_ERRORS.filter(e => e.severity === "CRITICAL").length;
  const errorCount = VALIDATION_ERRORS.filter(e => e.severity === "ERROR").length;
  const warningCount = VALIDATION_ERRORS.filter(e => e.severity === "WARNING").length;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F]">
      
      {/* Header Summary Bar */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text tracking-tight flex items-center gap-2">
            <ShieldAlert size={18} className="text-error" />
            Validation Center
          </h1>
          <p className="text-xs text-text-muted mt-0.5">CI/CD Architecture Verification Logs</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-error-bg border border-error/20">
            <AlertOctagon size={14} className="text-error" />
            <span className="text-xs font-semibold text-error">{criticalCount} Critical</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-error-bg/50 border border-error/20">
            <AlertCircle size={14} className="text-error/80" />
            <span className="text-xs font-semibold text-error/80">{errorCount} Errors</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-warning-bg border border-warning/20">
            <AlertTriangle size={14} className="text-warning" />
            <span className="text-xs font-semibold text-warning">{warningCount} Warnings</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-5xl w-full mx-auto p-6">
        
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Filter size={14} className="text-text-muted mr-2" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                activeCategory === cat
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-transparent text-text-secondary border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredErrors.map((error, idx) => (
              <motion.div
                key={error.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="panel overflow-hidden border border-border bg-[#151821]"
              >
                {/* Log Header */}
                <div className="px-4 py-2 border-b border-border/50 bg-[#111318] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={error.severity} />
                    <span className="text-xs font-mono text-text-muted">{error.id}</span>
                    <span className="text-xs font-medium text-text-secondary px-2 py-0.5 rounded-sm bg-white/5 border border-white/5">
                      {error.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-text-muted">{error.timestamp}</span>
                </div>

                {/* Log Body */}
                <div className="p-4 flex gap-4">
                  <div className="pt-0.5">
                    <SeverityIcon severity={error.severity} />
                  </div>
                  <div className="flex-1 space-y-3">
                    
                    <div>
                      <h3 className="text-sm font-medium text-text mb-1">{error.message}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted bg-black/20 p-1.5 rounded-md w-fit border border-white/5">
                        <FileCode2 size={12} />
                        {error.file}
                        {error.line && <span className="text-text-secondary">:{error.line}</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Cause</span>
                        <div className="p-3 bg-error-bg/20 border border-error/10 rounded-md text-xs text-text-secondary leading-relaxed">
                          {error.cause}
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Suggested Repair</span>
                        <div className="p-3 bg-success-bg/10 border border-success/10 rounded-md text-xs text-text-secondary leading-relaxed flex gap-2">
                          <Wrench size={14} className="text-success shrink-0 mt-0.5" />
                          <span>{error.repairAction}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredErrors.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-text-muted">
              <ShieldCheck size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">No validation errors found in this category.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
