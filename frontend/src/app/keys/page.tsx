"use client";

import { Key, Plus, Copy, Eye, EyeOff, Trash2, Shield, Check, Clock } from "lucide-react";
import { useState } from "react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  permissions: string[];
  status: "active" | "revoked";
}

const API_KEYS: ApiKey[] = [
  {
    id: "key_1",
    name: "Production API Key",
    prefix: "cai_prod_",
    created: "2026-05-15",
    lastUsed: "2026-06-23",
    permissions: ["compile", "read:schemas", "read:reports"],
    status: "active",
  },
  {
    id: "key_2",
    name: "Development API Key",
    prefix: "cai_dev_",
    created: "2026-06-01",
    lastUsed: "2026-06-22",
    permissions: ["compile", "read:schemas", "read:reports", "write:templates"],
    status: "active",
  },
  {
    id: "key_3",
    name: "CI/CD Pipeline Key",
    prefix: "cai_ci_",
    created: "2026-04-20",
    lastUsed: "2026-06-10",
    permissions: ["compile"],
    status: "revoked",
  },
];

export default function ApiKeysPage() {
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (id: string) => {
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0F]">
      <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-[#111318] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <Key size={18} className="text-[#6D5DFB]" />
            API Keys
          </h1>
          <p className="text-xs text-[#475569] mt-0.5">Manage access keys for the CompileAI API</p>
        </div>
        <button className="bg-gradient-to-r from-[#6D5DFB] to-[#5B4AEB] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(109,93,251,0.25)]">
          <Plus size={14} /> Generate New Key
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Security Notice */}
        <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4 flex items-start gap-3">
          <Shield size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#F59E0B]">Keep your API keys secure</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Never share your keys in client-side code, public repositories, or unsecured channels. 
              Rotate keys regularly and use the minimum required permissions.
            </p>
          </div>
        </div>

        {/* Keys List */}
        {API_KEYS.map((key) => (
          <div
            key={key.id}
            className={`bg-[#111318] border rounded-xl overflow-hidden ${
              key.status === "revoked" ? "border-[#1E2330] opacity-60" : "border-[#1E2330]"
            }`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#6D5DFB]/10 flex items-center justify-center">
                    <Key size={16} className="text-[#6D5DFB]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{key.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        key.status === "active" 
                          ? "text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20" 
                          : "text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20"
                      }`}>
                        {key.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReveal(key.id)}
                    className="p-2 text-[#475569] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {revealedKeys.has(key.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleCopy(key.id)}
                    className="p-2 text-[#475569] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {copiedKey === key.id ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                  </button>
                  {key.status === "active" && (
                    <button className="p-2 text-[#475569] hover:text-[#EF4444] hover:bg-[#EF4444]/5 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Key Value */}
              <div className="bg-[#0A0A0F] border border-[#1E2330] rounded-lg px-4 py-2.5 font-mono text-sm text-[#94A3B8] mb-4">
                {revealedKeys.has(key.id) 
                  ? `${key.prefix}${"x".repeat(32)}` 
                  : `${key.prefix}${"•".repeat(32)}`
                }
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-6 text-[10px] text-[#475569]">
                <span className="flex items-center gap-1"><Clock size={9} /> Created: {key.created}</span>
                <span className="flex items-center gap-1"><Clock size={9} /> Last used: {key.lastUsed}</span>
                <span>Permissions: {key.permissions.length}</span>
              </div>
            </div>

            {/* Permissions */}
            <div className="px-5 py-3 border-t border-[#1E2330] bg-[#0E1015] flex items-center gap-2 flex-wrap">
              {key.permissions.map((perm) => (
                <span key={perm} className="text-[9px] font-mono text-[#94A3B8] bg-white/5 px-2 py-0.5 rounded border border-[#1E2330]">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
