"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { triggerSync } from "@/lib/api";

export default function ManualSyncPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [secao, setSecao] = useState("dou1");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // Convert YYYY-MM-DD → DD-MM-YYYY
      const [y, m, d] = date.split("-");
      await triggerSync(`${d}-${m}-${y}`, secao);
      setStatus(`✅ Sync de ${`${d}-${m}-${y}`} (${secao}) disparado com sucesso.`);
    } catch {
      setStatus("❌ Erro ao disparar sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6">
        <h2
          className="text-xl mb-4"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Manual Sync
        </h2>

        <div
          className="max-w-sm p-5"
          style={{
            background: "var(--color-surface)",
            border: "2px solid var(--color-divider)",
          }}
        >
          <label
            className="block text-xs mb-1"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm mb-3"
            style={{
              background: "var(--color-bg)",
              border: "2px solid var(--color-divider)",
              color: "var(--color-text)",
            }}
          />

          <label
            className="block text-xs mb-1"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            Seção
          </label>
          <select
            value={secao}
            onChange={(e) => setSecao(e.target.value)}
            className="w-full px-3 py-2 text-sm mb-4"
            style={{
              background: "var(--color-bg)",
              border: "2px solid var(--color-divider)",
              color: "var(--color-text)",
            }}
          >
            <option value="dou1">dou1</option>
            <option value="dou2">dou2</option>
            <option value="dou3">dou3</option>
          </select>

          <button
            onClick={handleSync}
            disabled={loading}
            className="w-full py-2 text-sm"
            style={{
              background: loading ? "var(--color-neutral-500)" : "var(--color-accent)",
              color: "#fff",
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
            }}
          >
            {loading ? "Disparando..." : "Disparar Sync"}
          </button>

          {status && (
            <p
              className="text-xs mt-3"
              style={{ color: status.startsWith("✅") ? "#155724" : "var(--color-accent)" }}
            >
              {status}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
