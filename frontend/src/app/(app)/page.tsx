"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { cn } from "@/lib/utils";

export default function ComposerPage() {
  return (
    <div className="flex flex-col h-full bg-[--color-bg] relative overflow-hidden">
      {/* Decorative Background Elements from design language */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[--color-cta]/5 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[--color-cta]/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl">
          <AnimatedAIChat />
        </div>
      </main>
    </div>
  );
}
