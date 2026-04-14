"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

interface SearchResult {
  id: string;
  type: "lead" | "project" | "campaign";
  title: string;
  subtitle: string;
  href: string;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery("");
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const [leadsRes, projectsRes] = await Promise.allSettled([
          apiClient.get<{ data: any[] }>(`/leads?q=${encodeURIComponent(query)}&limit=4`),
          apiClient.get<{ data: any[] }>(`/projects?q=${encodeURIComponent(query)}&limit=4`),
        ]);

        const out: SearchResult[] = [];

        if (leadsRes.status === "fulfilled") {
          for (const l of leadsRes.value.data ?? []) {
            out.push({
              id: l.id,
              type: "lead",
              title: l.full_name || l.email || "Lead",
              subtitle: l.company_name || l.status || "",
              href: "/leads",
            });
          }
        }

        if (projectsRes.status === "fulfilled") {
          for (const p of projectsRes.value.data ?? []) {
            out.push({
              id: p.id,
              type: "project",
              title: p.name,
              subtitle: p.description || "",
              href: `/projects/details?id=${p.id}`,
            });
          }
        }

        setResults(out);
        setSelected(0);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) navigate(results[selected].href);
    if (e.key === "Escape") onClose();
  };

  const TYPE_ICON: Record<string, string> = { lead: "👤", project: "📁", campaign: "✉️" };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-[560px] rounded-2xl overflow-hidden"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-whisper), var(--shadow-ring)",
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[--color-border]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16" y2="16" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                className="flex-1 bg-transparent text-[15px] outline-none placeholder-[--color-text-tertiary]"
                style={{ color: "var(--color-text)" }}
                placeholder="Rechercher leads, projets, campagnes…"
              />
              {loading && (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              <kbd className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-[--color-border] text-[--color-text-tertiary]">Échap</kbd>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="py-2 max-h-72 overflow-y-auto custom-scrollbar">
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => navigate(r.href)}
                    onMouseEnter={() => setSelected(i)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors"
                    style={{ background: selected === i ? "var(--color-surface-2)" : "transparent" }}
                  >
                    <span className="text-lg w-6 text-center flex-shrink-0">{TYPE_ICON[r.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{r.title}</p>
                      {r.subtitle && (
                        <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>{r.subtitle}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "var(--color-surface)", color: "var(--color-text-tertiary)" }}>
                      {r.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {query.trim() && !loading && results.length === 0 && (
              <div className="py-10 text-center text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                Aucun résultat pour « {query} »
              </div>
            )}

            {/* Hint footer */}
            {!query && (
              <div className="px-5 py-3 flex items-center gap-4 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                <span><kbd className="font-mono">↑↓</kbd> naviguer</span>
                <span><kbd className="font-mono">↵</kbd> ouvrir</span>
                <span><kbd className="font-mono">Échap</kbd> fermer</span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
