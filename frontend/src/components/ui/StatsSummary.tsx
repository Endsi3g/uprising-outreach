"use client";

import { motion } from "framer-motion";

export function StatsSummary() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="max-w-[600px] text-center mt-2 mb-10"
    >
      <p className="text-[14px] leading-relaxed text-[--color-text-secondary] font-medium">
        Vous avez <span className="text-[--color-text] font-semibold">12 nouveaux leads</span> aujourd'hui (+15%). 
        Votre campagne principale génère un <span className="text-[--color-cta] font-semibold">taux de réponse de 24%</span>.
      </p>
    </motion.div>
  );
}
