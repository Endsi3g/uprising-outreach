"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ToolResultEvent, ToolUseEvent } from "@/types/ai";

const TOOL_LABELS: Record<string, string> = {
  search_leads: "Recherche de leads",
  get_pipeline_stats: "Statistiques pipeline",
  score_leads: "Scoring IA",
  enrich_leads: "Enrichissement",
};

const TOOL_ICONS: Record<string, string> = {
  search_leads: "🔍",
  get_pipeline_stats: "📊",
  score_leads: "⚡",
  enrich_leads: "✨",
};

interface Props {
  toolUse: ToolUseEvent;
  toolResult?: ToolResultEvent;
}

export function ToolResultCard({ toolUse, toolResult }: Props) {
  const [expanded, setExpanded] = useState(false);
  const label = TOOL_LABELS[toolUse.name] ?? toolUse.name;
  const icon = TOOL_ICONS[toolUse.name] ?? "🛠";
  const done = !!toolResult;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[90%] rounded-xl border border-[--color-border] bg-[--color-surface] overflow-hidden"
    >
      <button
        onClick={() => done && setExpanded((e) => !e)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
          done && "hover:bg-[--color-surface-2]"
        )}
      >
        <span className="text-base">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[--color-text]">{label}</p>
          {!done && (
            <p className="text-[10px] text-[--color-text-tertiary]">En cours…</p>
          )}
          {done && toolResult && (
            <p className="text-[10px] text-[--color-text-tertiary]">
              {formatSummary(toolUse.name, toolResult.output)}
            </p>
          )}
        </div>
        {done ? (
          <span className="text-emerald-600 text-xs">✓</span>
        ) : (
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 bg-[--color-text-tertiary] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        )}
        {done && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn("text-[--color-text-tertiary] transition-transform", expanded && "rotate-180")}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {expanded && toolResult && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[--color-border] overflow-hidden"
          >
            <pre className="px-3 py-2.5 text-[10px] text-[--color-text-secondary] overflow-x-auto leading-relaxed">
              {JSON.stringify(toolResult.output, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function formatSummary(tool: string, output: Record<string, unknown>): string {
  switch (tool) {
    case "search_leads":
      return `${output.total ?? 0} lead(s) trouvé(s)`;
    case "get_pipeline_stats":
      return `${output.total ?? 0} leads · score moyen ${output.avg_score ?? "N/A"}`;
    case "score_leads":
      return `${output.scored ?? 0} lead(s) scoré(s)`;
    case "enrich_leads":
      return `${output.enriched ?? 0} lead(s) enrichi(s)`;
    default:
      return "Terminé";
  }
}
