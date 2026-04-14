"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface DashboardStats {
  new_leads_today: number;
  reply_rate: number;
  change_pct: number;
}

export function StatsSummary() {
  const { data } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiClient.get<DashboardStats>("/leads/stats/summary"),
    staleTime: 60_000,
    // Don't throw if not logged in or endpoint missing — silently hide
    retry: false,
  });

  if (!data) return null;

  const sign = data.change_pct >= 0 ? "+" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="max-w-[600px] text-center mt-2 mb-10"
    >
      <p className="text-[14px] leading-relaxed text-[--color-text-secondary] font-medium">
        Vous avez{" "}
        <span className="text-[--color-text] font-semibold">
          {data.new_leads_today} nouveaux leads
        </span>{" "}
        aujourd&apos;hui ({sign}{data.change_pct.toFixed(0)}%).{" "}
        {data.reply_rate > 0 && (
          <>
            Votre campagne principale génère un{" "}
            <span className="text-[--color-cta] font-semibold">
              taux de réponse de {data.reply_rate.toFixed(0)}%
            </span>
            .
          </>
        )}
      </p>
    </motion.div>
  );
}
