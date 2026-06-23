import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const firaCode = Fira_Code({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "CompileAI | Premium Infrastructure",
  description:
    "Engineering platform for AI application compilation.",
};

import { Book, Bell, UserCircle } from "lucide-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${firaCode.variable} font-sans antialiased bg-background text-text selection:bg-accent/30 selection:text-white`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 bg-background">
            {/* Top Header */}
            <header className="h-14 flex-shrink-0 border-b border-border bg-surface flex items-center justify-between px-6 z-10">
              <div className="flex-1"></div>
              
              {/* Center Status Pill */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-[11px] font-semibold text-success tracking-wide uppercase">
                  CompileAI Engine v2.0 Online
                </span>
              </div>
              
              {/* Right Icons */}
              <div className="flex-1 flex items-center justify-end gap-4 text-text-muted">
                <button className="hover:text-text transition-colors"><Book size={16} /></button>
                <button className="hover:text-text transition-colors"><Bell size={16} /></button>
                <div className="w-px h-4 bg-border mx-1"></div>
                <button className="hover:text-text transition-colors"><UserCircle size={20} /></button>
              </div>
            </header>
            
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
