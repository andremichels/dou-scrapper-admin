"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div className="text-center p-8" style={{ border: "2px solid var(--color-divider)", background: "var(--color-surface)", maxWidth: 400 }}>
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-xl mb-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
          Acesso negado
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-neutral-600)" }}>
          Sua conta não tem permissão para acessar o painel administrativo.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2 text-sm font-bold"
          style={{ background: "var(--color-accent)", color: "#fff", border: "none", fontFamily: "var(--font-heading)" }}
        >
          Voltar ao login
        </button>
      </div>
    </div>
  );
}
