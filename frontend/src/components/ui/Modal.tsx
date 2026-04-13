"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(20,20,19,0.4)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={clsx("w-full rounded-2xl flex flex-col", sizeMap[size])}
        style={{
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-whisper)",
          border: "1px solid var(--color-border)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-lg font-medium" style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}>
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-2 px-6 py-4 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
