"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Copy, Download, Check, FileCode2 } from "lucide-react";

interface JsonViewerProps {
  data: any;
  title?: string;
}

const renderValue = (value: any): React.ReactNode => {
  if (typeof value === "string") {
    return <span className="text-[#10B981]">"{value}"</span>; // Success color for strings
  }
  if (typeof value === "number") {
    return <span className="text-[#F59E0B]">{value}</span>; // Warning color for numbers
  }
  if (typeof value === "boolean") {
    return <span className="text-[#6366F1]">{value ? "true" : "false"}</span>; // Accent color for booleans
  }
  if (value === null) {
    return <span className="text-[#EF4444]">null</span>; // Error color for nulls
  }
  return <span>{String(value)}</span>;
};

const JsonNode = ({
  keyName,
  value,
  isLast,
  depth = 0,
}: {
  keyName?: string;
  value: any;
  isLast: boolean;
  depth?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const isObject = typeof value === "object" && value !== null;
  const isArray = Array.isArray(value);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (!isObject) {
    return (
      <div className="font-mono text-[13px] leading-relaxed" style={{ paddingLeft: `${depth * 1.5}rem` }}>
        {keyName && <span className="text-[#FAFAFA]">"{keyName}"</span>}
        {keyName && <span className="text-[#A1A1AA]"> : </span>}
        {renderValue(value)}
        {!isLast && <span className="text-[#A1A1AA]">,</span>}
      </div>
    );
  }

  const isEmpty = isArray ? value.length === 0 : Object.keys(value).length === 0;
  const bracketOpen = isArray ? "[" : "{";
  const bracketClose = isArray ? "]" : "}";

  if (isEmpty) {
    return (
      <div className="font-mono text-[13px] leading-relaxed" style={{ paddingLeft: `${depth * 1.5}rem` }}>
        {keyName && <span className="text-[#FAFAFA]">"{keyName}"</span>}
        {keyName && <span className="text-[#A1A1AA]"> : </span>}
        <span className="text-[#A1A1AA]">{bracketOpen}{bracketClose}</span>
        {!isLast && <span className="text-[#A1A1AA]">,</span>}
      </div>
    );
  }

  const entries = isArray ? value : Object.entries(value);

  return (
    <div className="font-mono text-[13px] leading-relaxed relative">
      <div 
        className="flex items-center cursor-pointer hover:bg-white/5 rounded-sm px-1 -ml-1 transition-colors w-fit"
        style={{ paddingLeft: `calc(${depth * 1.5}rem - 4px)` }}
        onClick={toggleExpand}
      >
        <span className="text-[#71717A] absolute left-0 flex items-center justify-center w-4 h-4" style={{ left: `calc(${depth * 1.5}rem - 1.25rem)` }}>
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {keyName && <span className="text-[#FAFAFA]">"{keyName}"</span>}
        {keyName && <span className="text-[#A1A1AA]"> : </span>}
        <span className="text-[#A1A1AA]">{bracketOpen}</span>
        {!isExpanded && (
          <>
            <span className="text-[#71717A] mx-1">...</span>
            <span className="text-[#A1A1AA]">{bracketClose}</span>
            {!isLast && <span className="text-[#A1A1AA]">,</span>}
            <span className="text-[#71717A] text-[11px] ml-2 italic">
              {isArray ? `${value.length} items` : `${Object.keys(value).length} keys`}
            </span>
          </>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="flex flex-col">
            {isArray
              ? (entries as any[]).map((item, index) => (
                  <JsonNode
                    key={index}
                    value={item}
                    isLast={index === entries.length - 1}
                    depth={depth + 1}
                  />
                ))
              : (entries as [string, any][]).map(([k, v], index) => (
                  <JsonNode
                    key={k}
                    keyName={k}
                    value={v}
                    isLast={index === entries.length - 1}
                    depth={depth + 1}
                  />
                ))}
          </div>
          <div style={{ paddingLeft: `${depth * 1.5}rem` }}>
            <span className="text-[#A1A1AA]">{bracketClose}</span>
            {!isLast && <span className="text-[#A1A1AA]">,</span>}
          </div>
        </>
      )}
    </div>
  );
};

export function JsonViewer({ data, title = "output.json" }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#09090B] border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111113] border-b border-border">
        <div className="flex items-center gap-2">
          <FileCode2 size={14} className="text-text-muted" />
          <span className="text-xs font-medium text-text-secondary">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-text-muted hover:text-text hover:bg-white/5 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 text-text-muted hover:text-text hover:bg-white/5 rounded-md transition-colors"
            title="Export JSON file"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <JsonNode value={data} isLast={true} depth={1} />
      </div>
    </div>
  );
}
