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
      router.push("/leads");
    } catch (err: unknown) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{ background: "var(--color-surface)", boxShadow: "var(--shadow-whisper)" }}
      >
        <h1 className="text-3xl font-medium mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          ProspectOS
        </h1>
        <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Sign in to your workspace
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md text-sm border"
              style={{
                background: "var(--color-surface-white)",
                borderColor: "var(--color-border-warm)",
                color: "var(--color-text)",
              }}
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md text-sm border"
              style={{
                background: "var(--color-surface-white)",
                borderColor: "var(--color-border-warm)",
                color: "var(--color-text)",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: "var(--color-cta)", color: "#faf9f5" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
