"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/shared/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/store/useAIChat";

const NAV_TOP = [
  { 
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="15" x2="13" y2="15" />
      </svg>
    ),
    label: "Nouvelle prospection",
    href: "/",
    highlight: true,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16" y2="16" />
      </svg>
    ),
    label: "Rechercher",
    href: null,
    highlight: false,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M7 20h10" />
        <path d="M12 16v4" />
      </svg>
    ),
    label: "Personnaliser",
    href: "/customize",
    highlight: false,
  },
];

const NAV_SECTIONS = [
  { icon: "ProjectsIcon", label: "Projets", href: "/projects" },
  { icon: "LeadsIcon", label: "Leads", href: "/leads" },
  { icon: "CampaignsIcon", label: "Campaigns", href: "/campaigns" },
  { icon: "PipelineIcon", label: "Pipeline", href: "/pipeline" },
  { icon: "InboxIcon", label: "Inbox", href: "/inbox" },
  { icon: "AnalyticsIcon", label: "Analytics", href: "/analytics" },
  { icon: "AIPageIcon", label: "AI Chat", href: "/ai" },
];

const RECENTS = [
  "Prospection Montréal PME",
  "Campagne agences web Q2",
  "Leads construction 2026",
  "Séquence SaaS local",
];

const ICONS: any = {
  LeadsIcon: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  CampaignsIcon: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  ),
  PipelineIcon: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  InboxIcon: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  ProjectsIcon: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  AnalyticsIcon: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  AIPageIcon: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><circle cx="19" cy="5" r="3"/>
    </svg>
  ),
};

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
}: {
  icon: React.ReactNode;
  label: string;
  href: string | null;
  isActive?: boolean;
  highlight?: boolean;
  collapsed: boolean;
}) {
  const inner = (
    <motion.div
      whileHover={{ backgroundColor: "var(--color-surface-2)" }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors relative cursor-pointer",
        collapsed ? "justify-center" : "",
        isActive ? "bg-[--color-surface-2] text-[--color-text]" : "text-[--color-text-secondary] hover:text-[--color-text]",
        highlight && "text-[--color-cta] hover:text-[--color-cta-hover]"
      )}
    >
      <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {icon}
      </span>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="truncate"
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

  return href ? <Link href={href}>{inner}</Link> : <button className="w-full text-left">{inner}</button>;
}

export function AppSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme() as any;
  const { toggleSidebar: toggleAI } = useAIChat();

  const handleToggle = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("auto");
    else setTheme("dark");
  };

  return (
    <motion.aside
      animate={{ 
        width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)" 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col flex-shrink-0 h-screen relative bg-[--color-bg] border-r border-[--color-border] overflow-hidden"
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

      {/* ── Scrollable nav area ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        <div className="px-2 space-y-0.5 mb-4">
          {NAV_TOP.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              highlight={item.highlight}
              collapsed={collapsed}
            />
          ))}
        </div>

        <div className="mx-3 h-px bg-[--color-border] mb-4" />

        <div className="px-2 space-y-0.5 mb-4">
          {NAV_SECTIONS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <NavItem
                key={item.href}
                icon={<Icon />}
                label={item.label}
                href={item.href}
                isActive={pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            );
          })}
        </div>

        {/* AI button */}
        <div className="px-2 mb-4">
          <motion.button
            whileHover={{ backgroundColor: "var(--color-surface-2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleAI}
            className={cn(
              "flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-sm transition-colors",
              collapsed ? "justify-center" : "",
              "text-[--color-cta] hover:text-[--color-cta-hover]"
            )}
          >
            <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-base leading-none">✺</span>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 text-left"
              >
                AI
              </motion.span>
            )}
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[9px] font-bold uppercase tracking-wider text-[--color-text-tertiary] px-1.5 py-0.5 rounded bg-[--color-surface] border border-[--color-border]"
              >
                ⌘K
              </motion.span>
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2"
            >
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

      {/* ── Bottom: Theme + User ────────────────────────────────── */}
      <div className="border-t border-[--color-border]">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <span className="text-xs text-[--color-text-tertiary]">
              {theme === "auto" ? "Système" : theme === "dark" ? "Sombre" : "Clair"}
            </span>
            <button
              onClick={handleToggle}
              className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
              style={{ background: resolvedTheme === "dark" ? "var(--color-cta)" : "var(--color-border-warm)" }}
            >
              <motion.span
                animate={{ x: resolvedTheme === "dark" ? 18 : 2 }}
                className="absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </motion.div>
        )}

        {collapsed && (
          <button
            onClick={handleToggle}
            className="w-full h-10 flex items-center justify-center text-[--color-text-tertiary] hover:text-[--color-text] transition-colors"
          >
            {theme === "auto" ? "⚙️" : theme === "dark" ? "☽" : "☀"}
          </button>
        )}

        <div
          className={cn(
            "flex items-center hover:bg-[--color-surface-2] cursor-pointer transition-colors",
            collapsed ? "justify-center py-3" : "gap-2.5 px-3 py-3"
          )}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 text-white bg-gradient-to-br from-[#e08a5a] to-[#c96442]">
            K
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium truncate text-[--color-text]">Kael</p>
              <p className="text-xs truncate text-[--color-text-tertiary]">Forfait Pro</p>
            </motion.div>
          )}
          {!collapsed && (
            <div className="flex gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[--color-text-tertiary] hover:text-[--color-text] hover:bg-[--color-surface] transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[--color-text-tertiary] hover:text-[--color-text] hover:bg-[--color-surface] transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
