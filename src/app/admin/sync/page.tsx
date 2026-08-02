"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { triggerSync, fetchSyncStatus } from "@/lib/api";
import { useActiveSync } from "@/lib/useActiveSync";
import { SyncRun } from "@/lib/types";

export default function ManualSyncPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [secao, setSecao] = useState("dou3");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [runId, setRunId] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const { active, start } = useActiveSync();

  // Resume from sessionStorage on mount
  useEffect(() => {
    if (active && !completed) {
      setRunId(active.runId);
      setLoading(true);
      setCompleted(false);
      addLog(`🔄 Reconectando ao sync em execução... (run #${active.runId})`);
      addLog(`📋 ${active.dateStr} (${active.secao})`);
    }
  }, []);

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!runId || completed) return;
    const interval = setInterval(async () => {
      try {
        const status: SyncRun = await fetchSyncStatus(runId);
        if (status.status === "running") {
          // Only log at meaningful intervals to avoid spam
          if (status.articles_synced > 0 || status.articles_skipped > 0) {
            addLog(
              `⏳ Em execução... ${status.articles_synced} syncados, ${status.articles_skipped} pulados`
            );
          }
        } else if (status.status === "completed") {
          addLog(
            `✅ Sync concluído — ${status.articles_synced} artigos syncados, ${status.articles_skipped} pulados`
          );
          setCompleted(true);
          setLoading(false);
          clearInterval(interval);
        } else if (status.status === "failed") {
          addLog(`❌ Sync falhou: ${status.error_message || "erro desconhecido"}`);
          setCompleted(true);
          setLoading(false);
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [runId, completed]);

  const handleSync = async () => {
    setLoading(true);
    setCompleted(false);
    setLogs([]);
    setRunId(null);

    const [y, m, d] = date.split("-");
    const dateStr = `${d}-${m}-${y}`;
    addLog(`🚀 Iniciando sync: ${dateStr} (${secao})`);
    addLog(`📡 Conectando ao DOU...`);

    try {
      const result = await triggerSync(dateStr, secao);
      addLog(`📋 Sync disparado (run #${result.run_id}) — aguardando progresso...`);
      setRunId(result.run_id);
      start({
        runId: result.run_id,
        dateStr,
        secao,
        startedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      addLog(`❌ ${err.message || "Erro ao disparar sync"}`);
      setLoading(false);
      setCompleted(true);
    }
  };

  const statusColor = completed
    ? logs.some((l) => l.includes("✅"))
      ? "#155724"
      : "var(--color-accent)"
    : "var(--color-accent)";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col">
        <h2
          className="text-xl mb-4"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Manual Sync
        </h2>

        <div className="flex gap-6 flex-1">
          {/* Form */}
          <div className="w-72 shrink-0">
            <div
              className="p-5"
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
                disabled={loading && !completed}
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
                disabled={loading && !completed}
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
                disabled={loading && !completed}
                className="w-full py-2 text-sm"
                style={{
                  background:
                    loading && !completed
                      ? "var(--color-neutral-500)"
                      : "var(--color-accent)",
                  color: "#fff",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                }}
              >
                {loading && !completed ? "Executando..." : "Disparar Sync"}
              </button>

              {(logs.length > 0 || completed) && (
                <div className="mt-4 text-xs space-y-1">
                  {completed && (
                    <p style={{ color: statusColor, fontFamily: "var(--font-heading)", fontWeight: 800 }}>
                      {logs.some((l) => l.includes("✅"))
                        ? "✓ Concluído"
                        : "✗ Falhou"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 flex flex-col min-h-0">
            <div
              className="flex-1 p-4 font-mono text-xs overflow-y-auto"
              style={{
                background: "#1a1a2e",
                color: "#00ff88",
                border: "2px solid var(--color-divider)",
                minHeight: "400px",
              }}
            >
              {logs.length === 0 ? (
                <span style={{ color: "#555" }}>
                  Aguardando início do sync...
                </span>
              ) : (
                logs.map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    {line}
                  </div>
                ))
              )}
              {loading && !completed && (
                <span className="animate-pulse">▊</span>
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
