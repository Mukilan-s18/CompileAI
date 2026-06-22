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
          <main className="flex-1 overflow-auto bg-background">{children}</main>
        </div>
      </body>
    </html>
  );
}
