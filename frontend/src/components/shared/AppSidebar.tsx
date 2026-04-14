import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/shared/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
  PenTool,
  AppWindow,
  Users,
  Send,
  GitBranch,
  Inbox,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

const NAV_TOP = [
  { 
    icon: <LayoutGrid size={18} strokeWidth={1.5} />,
    label: "Nouvelle prospection",
    href: "/prospect",
    highlight: true,
  },
  {
    icon: <Search size={18} strokeWidth={1.5} />,
    label: "Rechercher",
    href: null,
    highlight: false,
  },
  {
    icon: <PenTool size={18} strokeWidth={1.5} />,
    label: "Personnaliser",
    href: "/customize",
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
  const router = useRouter(); // Initialize router
  const { theme, resolvedTheme, setTheme } = useTheme() as any;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([
    { id: 1, title: "Prospection Montréal PME", pinned: false, project: "General" },
    { id: 2, title: "Campagne agences web Q2", pinned: false, project: "General" },
    { id: 3, title: "Leads construction 2026", pinned: true, project: "General" },
    { id: 4, title: "Séquence SaaS local", pinned: false, project: "General" },
  ]);

  const handleToggle = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("auto");
    else setTheme("dark");
  };

  const togglePin = (id: number) => {
    setRecentChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const moveToProject = (id: number) => {
    // Simulated move logic
    console.log("Moving chat", id, "to project...");
    alert("Dossier de projet mis à jour avec succès.");
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
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
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
            return (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname.startsWith(item.href)}
                collapsed={collapsed}
              />
            );
          })}
        </div>

        <div className="mx-3 h-px bg-[--color-border] mb-4" />

        <div className="px-2 mb-4">
          {!collapsed && (
            <p className="text-[10px] font-medium uppercase tracking-widest px-2.5 mb-2 text-[--color-text-tertiary]">
              Assistants IA
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

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2"
            >
              <div className="mx-1 h-px bg-[--color-border] mb-3" />
              
              {/* Pinned Section */}
              {recentChats.some(c => c.pinned) && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest px-2.5 mb-2 text-[--color-cta] flex items-center gap-1.5">
                    <Pin size={10} strokeWidth={3} /> Épinglés
                  </p>
                  <div className="space-y-0.5">
                    {recentChats.filter(c => c.pinned).map((chat) => (
                      <div key={chat.id} className="group relative">
                        <motion.button
                          whileHover={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text)" }}
                          className="w-full px-2.5 py-1.5 rounded-lg text-left text-sm truncate text-[--color-text] font-medium transition-colors pr-14"
                        >
                          {chat.title}
                        </motion.button>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => togglePin(chat.id)} className="p-1 hover:bg-[--color-surface] rounded text-[--color-cta]" title="Désépingler">
                            <PinOff size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] font-medium uppercase tracking-widest px-2.5 mb-2 text-[--color-text-tertiary]">
                Récents
              </p>
              <div className="space-y-0.5">
                {recentChats.filter(c => !c.pinned).map((chat) => (
                  <div key={chat.id} className="group relative">
                    <motion.button
                      whileHover={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text)" }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-sm truncate text-[--color-text-secondary] transition-colors pr-14"
                    >
                      {chat.title}
                    </motion.button>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => togglePin(chat.id)} className="p-1 hover:bg-[--color-surface] rounded text-[--color-text-tertiary] hover:text-[--color-cta]" title="Épingler">
                        <Pin size={14} />
                      </button>
                      <button onClick={() => moveToProject(chat.id)} className="p-1 hover:bg-[--color-surface] rounded text-[--color-text-tertiary] hover:text-[--color-text]" title="Déplacer vers un projet">
                        <Folder size={14} />
                      </button>
                    </div>
                  </div>
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
            {resolvedTheme === "dark" ? <Mic size={16} /> : <Search size={16} />}
          </button>
        )}

        <div className="relative">
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-3 w-64 bg-[--color-surface] border border-[--color-border] rounded-xl shadow-2xl z-50 mb-2 overflow-hidden"
                style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }}
              >
                <div className="p-3 border-b border-[--color-border]">
                  <p className="text-[11px] text-[--color-text-tertiary] truncate">quebecsaas@gmail.com</p>
                </div>
                <div className="p-1">
                  <MenuButton icon={<Settings size={14} />} label="Paramètres" shortcut="⇧+Ctrl+," onClick={() => { router.push('/settings'); setIsProfileOpen(false); }} />
                  <MenuButton icon={<Globe size={14} />} label="Langue" hasSubmenu />
                  <MenuButton icon={<HelpCircle size={14} />} label="Obtenir de l'aide" />
                  <div className="h-px bg-[--color-border] my-1" />
                  <MenuButton icon={<Zap size={14} />} label="Mettre à niveau l'abonnement" />
                  <MenuButton icon={<Download size={14} />} label="Obtenir des applications" />
                  <MenuButton icon={<Gift size={14} />} label="Offrir ProspectOS" />
                  <MenuButton icon={<Info size={14} />} label="En savoir plus" hasSubmenu />
                  <div className="h-px bg-[--color-border] my-1" />
                  <MenuButton icon={<LogOut size={14} />} label="Se déconnecter" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "flex items-center hover:bg-[--color-surface-2] cursor-pointer transition-colors m-1 rounded-xl",
              isProfileOpen ? "bg-[--color-surface-2]" : "",
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
              <div className="flex gap-1 text-[--color-text-tertiary]">
                 <ChevronDown size={14} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function MenuButton({ icon, label, shortcut, hasSubmenu, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[--color-text] hover:bg-[--color-surface-2] transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="w-4 flex justify-center">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      {shortcut && <span className="text-[10px] text-[--color-text-tertiary]">{shortcut}</span>}
      {hasSubmenu && <ChevronDown size={12} className="-rotate-90 text-[--color-text-tertiary]" />}
    </button>
  );
}
