"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const MODES = [
  { 
    key: "chat", 
    label: "Chat", 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ), 
    route: "/" 
  },
  { 
    key: "prospect", 
    label: "Prospecter", 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2m0 14v2M3 12h2m14 0h2" />
      </svg>
    ), 
    route: "/leads" 
  },
  { 
    key: "outreach", 
    label: "Outreach", 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 17a2 2 0 01-2 2H4a2 2 0 01-2-2V9.5l10-6 10 6V17z" />
        <polyline points="2,9.5 12,15.5 22,9.5" />
      </svg>
    ), 
    route: "/campaigns" 
  },
  { 
    key: "analyze", 
    label: "Analyser", 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ), 
    route: "/analytics" 
  },
  { 
    key: "pipeline", 
    label: "Pipeline", 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 3h5v5M8 21H3v-5M21 3L12 12M3 21l9-9" />
      </svg>
    ), 
    route: "/pipeline" 
  },
] as const;

export function FloatingDock() {
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const activeKey = MODES.find((m) => {
    if (m.route === "/" && pathname === "/") return true;
    if (m.route !== "/" && pathname.startsWith(m.route)) return true;
    return false;
  })?.key ?? "chat";

  return (
    <div className="flex items-center justify-center">
      <motion.div
        layout
        className="flex items-center gap-1 px-1.5 py-1.5 rounded-2xl bg-[--color-surface]/80 border border-[--color-border] shadow-whisper backdrop-blur-xl"
      >
        {MODES.map((mode) => {
          const isActive = activeKey === mode.key;
          const isHovered = hoveredKey === mode.key;
          
          return (
            <button
              key={mode.key}
              onClick={() => router.push(mode.route)}
              onMouseEnter={() => setHoveredKey(mode.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActive ? "text-[--color-text]" : "text-[--color-text-secondary] hover:text-[--color-text]"
              )}
            >
              {/* Active Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-xl bg-[--color-surface-2] shadow-sm"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}

              {/* Hover Background Pill */}
              {isHovered && !isActive && (
                <motion.div
                  layoutId="hover-pill"
                  className="absolute inset-0 rounded-xl bg-[--color-surface-white]/50"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                />
              )}

              <motion.span
                animate={{ 
                  scale: isHovered ? 1.1 : 1,
                  y: isHovered ? -1 : 0
                }}
                className={cn("text-lg", isActive && "text-[--color-cta]")}
              >
                {mode.icon}
              </motion.span>
              
              <AnimatePresence mode="wait">
                {(isActive || isHovered) && (
                   <motion.span
                    initial={{ opacity: 0, width: 0, x: -5 }}
                    animate={{ opacity: 1, width: "auto", x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -5 }}
                    className="overflow-hidden whitespace-nowrap text-xs font-semibold"
                   >
                    {mode.label}
                   </motion.span>
                )}
              </AnimatePresence>

              {isActive && (
                <motion.span
                  layoutId="active-dot"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[--color-cta]"
                />
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
