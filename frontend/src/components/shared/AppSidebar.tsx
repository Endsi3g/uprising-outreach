"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/shared/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat";
import { 
  Bot, 
  Mic, 
  Pin, 
  PinOff, 
  Folder, 
  Settings, 
  Globe, 
  HelpCircle, 
  Zap, 
  Download, 
  Gift, 
  Info, 
  LogOut,
  ChevronDown,
  LayoutGrid,
  Search,
  History,
  AppWindow,
  Users,
  Send,
  GitBranch,
  Inbox,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  PlusSquare,
  MessageSquare
} from "lucide-react";

const NAV_TOP = [
  { 
    icon: <LayoutGrid size={18} strokeWidth={1.5} />,
    label: "Dashboard",
    href: "/",
    highlight: false,
  },
  {
    icon: <PlusSquare size={18} strokeWidth={1.5} />,
    label: "Nouvelle prospection",
    href: null, // Logic handled by button
    highlight: true,
  },
  {
    icon: <History size={18} strokeWidth={1.5} />,
    label: "Historique",
    href: "/discussion",
    highlight: false,
  },
];

const NAV_SECTIONS = [
  { icon: <AppWindow size={16} />, label: "Projets", href: "/projects" },
  { icon: <Users size={16} />, label: "Leads", href: "/leads" },
  { icon: <Send size={16} />, label: "Campaigns", href: "/campaigns" },
  { icon: <GitBranch size={16} />, label: "Pipeline", href: "/pipeline" },
  { icon: <Inbox size={16} />, label: "Inbox", href: "/inbox" },
  { icon: <BarChart3 size={16} />, label: "Analytics", href: "/analytics" },
];

const AI_ASSISTANTS = [
  { icon: <Bot size={16} />, label: "Secrétaire (NanoClaw)", href: "/ai/secretary" },
  { icon: <Mic size={16} />, label: "Assistant Vocal", href: "/ai/voice" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavItem({
  icon,
  label,
  href,
  isActive,
  highlight,
  collapsed,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href: string | null;
  isActive?: boolean;
  highlight?: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <motion.div
      whileHover={{ backgroundColor: "var(--color-surface-2)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-colors relative cursor-pointer",
        collapsed ? "justify-center" : "",
        isActive ? "bg-[--color-surface-2] text-[--color-text]" : "text-[--color-text-secondary] hover:text-[--color-text]",
        highlight && "text-[--color-cta] hover:bg-[--color-cta]/5"
      )}
    >
      <span className={cn("flex-shrink-0 w-4 h-4 flex items-center justify-center", highlight && "text-[--color-cta]")}>
        {icon}
      </span>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn("truncate", highlight && "font-semibold")}
        >
          {label}
        </motion.span>
      )}
      {isActive && !collapsed && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 w-1 h-4 bg-[--color-cta] rounded-r-full"
        />
      )}
    </motion.div>
  );

  if (onClick) return <div className="w-full">{inner}</div>;
  return href ? <Link href={href}>{inner}</Link> : <button className="w-full text-left">{inner}</button>;
}

export function AppSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme() as any;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { sessions, activeSessionId, setActiveSession, addSession, deleteSession } = useChatStore();

  const handleToggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("auto");
    else setTheme("dark");
  };

  const handleNewSession = () => {
    const id = addSession();
    setActiveSession(id);
    router.push("/");
  };

  const handleSessionClick = (id: string) => {
    setActiveSession(id);
    if (pathname !== "/") router.push("/");
  };

  return (
    <motion.aside
      animate={{ 
        width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)" 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col flex-shrink-0 h-screen relative bg-[--color-background] border-r border-[--color-border] overflow-hidden"
    >
      {/* ── Top: Logo + collapse toggle ─────────────────────────── */}
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
                <span className="text-[15px] font-medium text-[--color-text] font-serif tracking-tight">ProspectOS</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--color-surface-2] transition-colors text-[--color-text-secondary] hover:text-[--color-text]"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* ── Scrollable nav area ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        {/* Quick Actions */}
        <div className="px-2 space-y-0.5 mb-6">
          <NavItem
            icon={NAV_TOP[0].icon}
            label={NAV_TOP[0].label}
            href={NAV_TOP[0].href}
            isActive={pathname === "/"}
            collapsed={collapsed}
          />
          <NavItem
            icon={NAV_TOP[1].icon}
            label={NAV_TOP[1].label}
            href={null}
            highlight={true}
            onClick={handleNewSession}
            collapsed={collapsed}
          />
          <NavItem
            icon={NAV_TOP[2].icon}
            label={NAV_TOP[2].label}
            href={NAV_TOP[2].href}
            isActive={pathname === "/discussion"}
            collapsed={collapsed}
          />
        </div>

        <div className="mx-3 h-px bg-[--color-border] mb-6 opacity-50" />

        {/* Core Workspace Sections */}
        {!collapsed && (
           <p className="text-[10px] font-bold uppercase tracking-[0.15em] px-5 mb-2 text-[--color-text-tertiary]/70">
             Workspace
           </p>
        )}
        <div className="px-2 space-y-0.5 mb-6">
          {NAV_SECTIONS.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname.startsWith(item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* AI Section (Highlighted) */}
        <div className="mx-2 mb-6 p-1.5 rounded-2xl bg-[--color-surface-2]/30 border border-[--color-border-subtle]">
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 mb-1.5 text-[--color-cta] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[--color-cta] animate-pulse" />
              Intelligence
            </p>
          )}
          <div className="space-y-0.5">
            {AI_ASSISTANTS.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        {/* History / Recent Chats */}
        <AnimatePresence>
          {!collapsed && sessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2 mt-2"
            >
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[--color-text-tertiary]/70">
                  Récents
                </p>
                <Link href="/discussion" className="text-[9px] font-bold uppercase hover:text-[--color-cta] transition-colors">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1 thin-scrollbar">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="group relative">
                    <button
                      onClick={() => handleSessionClick(session.id)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl text-left text-[13px] truncate transition-all pr-10",
                        activeSessionId === session.id 
                          ? "bg-[--color-surface-2] text-[--color-text] font-medium" 
                          : "text-[--color-text-secondary] hover:bg-[--color-surface-2]/50 hover:text-[--color-text]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare size={12} className="opacity-50" />
                        <span className="truncate">{session.title}</span>
                      </div>
                    </button>
                    {activeSessionId === session.id && (
                       <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-[--color-cta] rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom: Theme + User ────────────────────────────────── */}
      <div className="border-t border-[--color-border] bg-[--color-background]/80 backdrop-blur-md">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between px-5 py-3"
          >
            <div className="flex items-center gap-2">
               <Zap size={14} className="text-[--color-cta]" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-[--color-text-secondary]">Mode {theme === "auto" ? "Système" : theme === "dark" ? "Sombre" : "Clair"}</span>
            </div>
            <button
              onClick={handleToggleTheme}
              className="relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 border border-[--color-border]"
              style={{ background: resolvedTheme === "dark" ? "var(--color-cta)" : "var(--color-surface-2)" }}
            >
              <motion.span
                animate={{ x: resolvedTheme === "dark" ? 20 : 2 }}
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm shadow-black/10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </motion.div>
        )}

        <div className="relative">
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-3 w-64 bg-[--color-surface] border border-[--color-border] rounded-2xl shadow-2xl z-50 mb-3 overflow-hidden"
              >
                <div className="p-4 border-b border-[--color-border] bg-[--color-surface-2]/30">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6000] to-[#c96442] flex items-center justify-center text-white font-serif font-bold text-lg">K</div>
                    <div>
                      <p className="text-sm font-semibold text-[--color-text]">Kael Uprising</p>
                      <p className="text-[10px] text-[--color-text-tertiary] uppercase tracking-widest font-bold">Plan Pro</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <MenuButton icon={<Settings size={14} />} label="Paramètres" shortcut="⌘," onClick={() => { router.push('/settings'); setIsProfileOpen(false); }} />
                  <MenuButton icon={<Download size={14} />} label="Télécharger l'App" onClick={() => { router.push('/download'); setIsProfileOpen(false); }} />
                  <MenuButton icon={<HelpCircle size={14} />} label="Centre d'aide" />
                  <div className="h-px bg-[--color-border] my-1.5 mx-2 opacity-50" />
                  <MenuButton icon={<LogOut size={14} />} label="Déconnexion" className="text-red-500 hover:bg-red-50 hover:text-red-600" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "flex items-center hover:bg-[--color-surface-2] cursor-pointer transition-all m-2 rounded-2xl p-2",
              isProfileOpen ? "bg-[--color-surface-2]" : "",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 text-white bg-gradient-to-br from-[#ff6000] to-[#c96442] shadow-sm">
              K
            </div>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[13px] font-semibold truncate text-[--color-text]">Kael</p>
                <p className="text-[11px] truncate text-[--color-text-tertiary]">Professionnel</p>
              </motion.div>
            )}
            {!collapsed && (
              <div className="flex gap-1 text-[--color-text-tertiary]/50">
                 <ChevronDown size={14} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function MenuButton({ icon, label, shortcut, hasSubmenu, onClick, className }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-[--color-text-secondary] hover:bg-[--color-surface-2] hover:text-[--color-text] transition-all",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="w-4 flex justify-center opacity-70 group-hover:opacity-100">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      {shortcut && <span className="text-[9px] font-mono opacity-40">{shortcut}</span>}
      {hasSubmenu && <ChevronDown size={12} className="-rotate-90 text-[--color-text-tertiary]" />}
    </button>
  );
}
