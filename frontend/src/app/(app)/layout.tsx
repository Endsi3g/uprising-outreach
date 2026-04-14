"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { FloatingDock } from "@/components/shared/FloatingDock";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* ── Main region ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div
          className="flex-1 overflow-auto m-2 rounded-2xl relative"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-whisper)",
          }}
        >
          <div className="h-full pb-20">
            {children}
          </div>
        </div>

        {/* ── Floating Dock ────────────────────────────────────────────────────── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
          <FloatingDock />
        </div>
      </div>
    </div>
  );
}
