"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou senha inválidos");
      setLoading(false);
      return;
    }

    // Hard navigation ensures cookies reach the middleware
    window.location.href = "/admin";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="w-full max-w-sm p-8"
        style={{ border: "2px solid var(--color-divider)", background: "var(--color-surface)" }}
      >
        <h1
          className="text-xl mb-6 text-center"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}
        >
          DOU Admin
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm"
              style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
              placeholder="admin@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm"
              style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
            />
          </div>

          {error && (
            <div className="p-3 text-xs" style={{ background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-bold"
            style={{
              background: loading ? "var(--color-neutral-500)" : "var(--color-accent)",
              color: "#fff",
              border: "none",
              fontFamily: "var(--font-heading)",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
