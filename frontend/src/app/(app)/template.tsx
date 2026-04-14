"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ 
        type: "tween", 
        ease: [0.16, 1, 0.3, 1], // Custom slow ease-out typical of premium UIs
        duration: 0.3 
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
