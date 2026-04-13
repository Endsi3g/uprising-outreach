import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ── Brand ───────────────────────────────────────────────────────────
        terracotta: {
          DEFAULT: "#c96442",
          light: "#d97757",
        },
        // ── Backgrounds ─────────────────────────────────────────────────────
        parchment: "#141413",
        ivory: "#30302e",
        // ── Text ────────────────────────────────────────────────────────────
        "near-black": "#141413",
        "warm-gray": {
          100: "#f0eee6",
          200: "#e8e6dc",
          300: "#d1cfc5",
          400: "#b0aea5",
          500: "#87867f",
          600: "#5e5d59",
          700: "#4d4c48",
          800: "#3d3d3a",
          900: "#30302e",
        },
        // ── Surface / dark ───────────────────────────────────────────────────
        "dark-surface": "#30302e",
        // ── Semantic ─────────────────────────────────────────────────────────
        focus: "#3898ec",
        error: "#b53333",
      },
      fontFamily: {
        serif: ["Anthropic Serif", "Georgia", "serif"],
        sans: ["Anthropic Sans", "Arial", "sans-serif"],
        mono: ["Anthropic Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1.6" }],
        xs: ["0.75rem", { lineHeight: "1.25" }],
        sm: ["0.875rem", { lineHeight: "1.43" }],
        base: ["1rem", { lineHeight: "1.25" }],
        body: ["1.0625rem", { lineHeight: "1.6" }],
        lg: ["1.25rem", { lineHeight: "1.6" }],
        xl: ["1.3rem", { lineHeight: "1.2" }],
        "2xl": ["1.6rem", { lineHeight: "1.2" }],
        "3xl": ["2rem", { lineHeight: "1.1" }],
        "4xl": ["2.3rem", { lineHeight: "1.3" }],
        "5xl": ["3.25rem", { lineHeight: "1.2" }],
        "6xl": ["4rem", { lineHeight: "1.1" }],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },
      boxShadow: {
        ring: "0px 0px 0px 1px rgba(20,20,19,0.12)",
        "ring-warm": "0px 0px 0px 1px #d1cfc5",
        "ring-focus": "0px 0px 0px 2px #3898ec",
        whisper: "rgba(0,0,0,0.05) 0px 4px 24px",
        "inset-ring": "inset 0px 0px 0px 1px rgba(20,20,19,0.15)",
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
