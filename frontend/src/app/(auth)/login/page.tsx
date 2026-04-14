"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiClient.post<{ access_token: string; refresh_token: string }>(
        "/auth/login",
        { email, password }
      );
      setTokens(data.access_token, data.refresh_token);
      router.push("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12"
        style={{ background: "var(--color-surface)", borderRight: "1px solid var(--color-border)" }}
      >
        <div>
          <span
            className="text-xl font-medium flex items-center gap-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <span style={{ color: "var(--color-cta)" }}>✺</span> Uprising Outreach
          </span>
        </div>
        <div>
          <p
            className="text-4xl font-medium leading-tight mb-6"
            style={{ fontFamily: "var(--font-serif)", lineHeight: 1.15 }}
          >
            Cold outreach,<br />without the cold.
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            AI-powered prospecting from lead sourcing to signed deal — in one workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm bg-gradient-to-tr from-amber-500 to-[#c96442] text-white"
          >
            K
          </div>
          <div>
            <p className="text-sm font-medium">Kael</p>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Uprising Studio</p>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Logo for mobile */}
          <div className="lg:hidden mb-10">
            <span
              className="text-lg font-medium flex items-center gap-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <span style={{ color: "var(--color-cta)" }}>✺</span> Uprising Outreach
            </span>
          </div>

          <h1
            className="text-2xl font-medium mb-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Sign in
          </h1>
          <p className="mb-8 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Enter your workspace credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:ring-2"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  transition: "border-color 0.2s",
                }}
                placeholder="you@uprising.studio"
                onFocus={(e) => (e.target.style.borderColor = "var(--color-cta)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:ring-2"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  transition: "border-color 0.2s",
                }}
                placeholder="••••••••"
                onFocus={(e) => (e.target.style.borderColor = "var(--color-cta)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(181,51,51,0.15)", color: "var(--color-error)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ background: "var(--color-cta)", color: "#faf9f5" }}
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
