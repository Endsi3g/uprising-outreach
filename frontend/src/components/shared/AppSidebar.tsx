"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/shared/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/store/useAIChat";
import { useAuthStore } from "@/store/auth";
import { SearchOverlay } from "./SearchOverlay";

const NAV_SECTIONS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    label: "Projets", href: "/projects",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    label: "Leads", href: "/leads",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
      </svg>
    ),
    label: "Campagnes", href: "/campaigns",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    label: "Pipeline", href: "/pipeline",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: "Inbox", href: "/inbox",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    label: "Analytics", href: "/analytics",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><circle cx="19" cy="5" r="3"/>
      </svg>
    ),
    label: "AI Chat", href: "/ai",
  },
];

const RECENTS = [
  "Prospection Montréal PME",
  "Campagne agences web Q2",
  "Leads construction 2026",
  "Séquence SaaS local",
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { toggleSidebar: toggleAI } = useAIChat();
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ⌘F opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  return (
    <>
      <SearchOverlay open={showSearch} onClose={() => setShowSearch(false)} />

      <motion.aside
        animate={{
          width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col flex-shrink-0 h-screen relative bg-[--color-bg] border-r border-[--color-border] overflow-hidden"
      >
        {/* ── Logo + collapse toggle ─── */}
        <div className="flex items-center justify-between px-3 h-14 border-b border-[--color-border] flex-shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1.5 overflow-hidden"
              >
                <Link href="/" className="flex items-center gap-1.5">
                  <span className="text-[--color-cta] text-lg">✺</span>
                  <span className="text-[15px] font-medium text-[--color-text] font-serif">Uprising</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--color-surface-2] transition-colors text-[--color-text-secondary] hover:text-[--color-text]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
        </div>

        {/* ── Scrollable nav ─── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">

          {/* Top utility actions */}
          <div className="px-2 space-y-0.5 mb-4">
            <Link href="/">
              <motion.div
                whileHover={{ backgroundColor: "var(--color-surface-2)" }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-colors text-[--color-cta] hover:text-[--color-cta-hover]",
                  collapsed && "justify-center"
                )}
              >
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9"/>
                    <line x1="8" y1="9" x2="16" y2="9"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                    <line x1="8" y1="15" x2="13" y2="15"/>
                  </svg>
                </span>
                {!collapsed && <span className="truncate">Nouvelle prospection</span>}
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ backgroundColor: "var(--color-surface-2)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSearch(true)}
              className={cn(
                "flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-sm transition-colors text-[--color-text-secondary] hover:text-[--color-text]",
                collapsed && "justify-center"
              )}
            >
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/>
                </svg>
              </span>
              {!collapsed && <span className="flex-1 text-left">Rechercher</span>}
              {!collapsed && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-[--color-text-tertiary] px-1.5 py-0.5 rounded bg-[--color-surface] border border-[--color-border]">⌘F</span>
              )}
            </motion.button>

            <Link href="/customize">
              <motion.div
                whileHover={{ backgroundColor: "var(--color-surface-2)" }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-colors text-[--color-text-secondary] hover:text-[--color-text]",
                  collapsed && "justify-center"
                )}
              >
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="12" rx="2"/>
                    <path d="M7 20h10"/><path d="M12 16v4"/>
                  </svg>
                </span>
                {!collapsed && <span className="truncate">Personnaliser</span>}
              </motion.div>
            </Link>
          </div>

          <div className="mx-3 h-px bg-[--color-border] mb-4" />

          {/* Main navigation */}
          <div className="px-2 space-y-0.5 mb-4">
            {NAV_SECTIONS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ backgroundColor: "var(--color-surface-2)" }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors relative cursor-pointer",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-[--color-surface-2] text-[--color-text]"
                        : "text-[--color-text-secondary] hover:text-[--color-text]"
                    )}
                  >
                    <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="truncate">
                        {item.label}
                      </motion.span>
                    )}
                    {isActive && !collapsed && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 w-1 h-4 bg-[--color-cta] rounded-r-full"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* AI ⌘K */}
          <div className="px-2 mb-4">
            <motion.button
              whileHover={{ backgroundColor: "var(--color-surface-2)" }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleAI}
              className={cn(
                "flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-sm transition-colors text-[--color-cta] hover:text-[--color-cta-hover]",
                collapsed && "justify-center"
              )}
            >
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-base leading-none">✺</span>
              {!collapsed && (
                <>
                  <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex-1 text-left">
                    AI
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[9px] font-bold uppercase tracking-wider text-[--color-text-tertiary] px-1.5 py-0.5 rounded bg-[--color-surface] border border-[--color-border]"
                  >
                    ⌘K
                  </motion.span>
                </>
              )}
            </motion.button>
          </div>

          {/* Récents */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-2">
                <div className="mx-1 h-px bg-[--color-border] mb-3" />
                <p className="text-[10px] font-medium uppercase tracking-widest px-2.5 mb-2 text-[--color-text-tertiary]">
                  Récents
                </p>
                <div className="space-y-0.5">
                  {RECENTS.map((title) => (
                    <motion.button
                      key={title}
                      whileHover={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text)" }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-sm truncate text-[--color-text-secondary] transition-colors"
                    >
                      {title}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom: theme toggle + user ─── */}
        <div className="border-t border-[--color-border]">
          {/* 2-state theme toggle */}
          {!collapsed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-[--color-text-tertiary]">{isDark ? "Sombre" : "Clair"}</span>
              <button
                onClick={toggleTheme}
                aria-label="Basculer thème"
                className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                style={{ background: isDark ? "var(--color-cta)" : "var(--color-border-warm)" }}
              >
                <motion.span
                  animate={{ x: isDark ? 18 : 2 }}
                  className="absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </motion.div>
          ) : (
            <button
              onClick={toggleTheme}
              aria-label="Basculer thème"
              className="w-full h-9 flex items-center justify-center text-[--color-text-tertiary] hover:text-[--color-text] transition-colors"
            >
              {isDark ? "☽" : "☀"}
            </button>
          )}

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className={cn(
                "w-full flex items-center hover:bg-[--color-surface-2] cursor-pointer transition-colors",
                collapsed ? "justify-center py-3" : "gap-2.5 px-3 py-3"
              )}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 text-white bg-gradient-to-br from-[#e08a5a] to-[#c96442]">
                K
              </div>
              {!collapsed && (
                <>
                  <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate text-[--color-text]">Kael</p>
                    <p className="text-xs truncate text-[--color-text-tertiary]">Forfait Pro</p>
                  </motion.div>
                  <svg
                    width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-text-tertiary)" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: showUserMenu ? "rotate(180deg)" : "none", transition: "transform .2s" }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </>
              )}
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  className="absolute bottom-full mb-1 left-2 right-2 rounded-xl overflow-hidden z-50"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-whisper)",
                  }}
                >
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[--color-text-secondary] hover:bg-[--color-surface-2] hover:text-[--color-text] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                    Paramètres
                  </Link>
                  <div className="h-px bg-[--color-border]" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/5 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
