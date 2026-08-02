"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SyncMonitor } from "@/components/SyncMonitor";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const session = sessionStorage.getItem("dou_admin_auth");
    if (session === "true") setAuthed(true);
  }, []);

  const handleLogin = () => {
    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin";
    if (password === expected) {
      sessionStorage.setItem("dou_admin_auth", "true");
      setAuthed(true);
      setError("");
    } else {
      setError("Senha incorreta");
    }
  };

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-bg)" }}
      >
        <div
          className="p-8 w-80"
          style={{
            background: "var(--color-surface)",
            border: "2px solid var(--color-divider)",
          }}
        >
          <h1
            className="text-lg mb-6"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              color: "var(--color-text)",
            }}
          >
            DOU Admin
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Senha"
            className="w-full px-3 py-2 text-sm mb-3"
            style={{
              background: "var(--color-bg)",
              border: "2px solid var(--color-divider)",
              color: "var(--color-text)",
            }}
            autoFocus
          />
          <button
            onClick={handleLogin}
            className="w-full py-2 text-sm"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
            }}
          >
            Entrar
          </button>
          {error && (
            <p className="text-xs mt-2" style={{ color: "var(--color-accent)" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <SyncMonitor />
    </>
  );
}
