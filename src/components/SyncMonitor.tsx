"use client";

import { useState, useEffect, useRef } from "react";
import { useActiveSync } from "@/lib/useActiveSync";
import { fetchSyncStatus, stopSync } from "@/lib/api";
import { SyncRun } from "@/lib/types";

export function SyncMonitor() {
  const { active, status, clear } = useActiveSync();
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastStatus, setLastStatus] = useState<SyncRun | null>(null);
  const [stopping, setStopping] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  };

  const handleStop = async () => {
    if (!active || stopping) return;
    setStopping(true);
    try {
      await stopSync(active.runId);
      addLog("🛑 Parando sync...");
    } catch {
      addLog("❌ Erro ao parar sync");
    }
    setStopping(false);
  };

  useEffect(() => {
    if (!active) return;
    if (logs.length === 0) {
      addLog(`🔄 Sync em execução: ${active.dateStr} (${active.secao})`);
    }
    const interval = setInterval(async () => {
      try {
        const s = await fetchSyncStatus(active.runId);
        setLastStatus(s);
        const processed = s.articles_synced + s.articles_skipped;
        if (processed > lastCountRef.current) {
          lastCountRef.current = processed;
          const total = s.total_articles || 0;
          const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
          addLog(`⏳ ${s.articles_synced} sync / ${s.articles_skipped} skip${total > 0 ? ` — ${pct}%` : ""}`);
        }
        if (s.status === "completed" || s.status === "cancelled") {
          const label = s.status === "cancelled" ? "🛑 Cancelado" : "✅ Concluído";
          addLog(`${label} — ${s.articles_synced} syncados, ${s.articles_skipped} pulados`);
          clearInterval(interval);
          setTimeout(() => { setExpanded(false); setLogs([]); lastCountRef.current = 0; clear(); }, 5000);
        } else if (s.status === "failed") {
          addLog(`❌ Falhou: ${s.error_message || "erro"}`);
          clearInterval(interval);
          setTimeout(() => { setExpanded(false); setLogs([]); lastCountRef.current = 0; }, 8000);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [active?.runId]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  if (!active) return null;

  const isRunning = lastStatus?.status === "running" || (!lastStatus && active);
  const processed = (lastStatus?.articles_synced || 0) + (lastStatus?.articles_skipped || 0);
  const total = lastStatus?.total_articles || 0;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const elapsed = lastStatus?.started_at ? Math.round((Date.now() - new Date(lastStatus.started_at).getTime()) / 1000 / 60) : 0;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
        {isRunning && (
          <button
            onClick={handleStop}
            disabled={stopping}
            className="px-3 py-1.5 text-xs font-bold shadow-lg"
            style={{
              background: "#f8d7da",
              color: "#721c24",
              border: "2px solid #f5c6cb",
              fontFamily: "var(--font-heading)",
            }}
          >
            {stopping ? "Parando..." : "🛑 Parar sync"}
          </button>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex flex-col gap-1 px-3 py-2 text-xs shadow-lg min-w-[240px]"
          style={{
            background: isRunning ? "#1a1a2e" : lastStatus?.status === "cancelled" ? "#fff3cd" : lastStatus?.status === "failed" ? "#f8d7da" : "#d4edda",
            color: isRunning ? "#00ff88" : lastStatus?.status === "cancelled" ? "#856404" : lastStatus?.status === "failed" ? "#721c24" : "#155724",
            border: `2px solid ${isRunning ? "#00ff88" : lastStatus?.status === "cancelled" ? "#ffc107" : lastStatus?.status === "failed" ? "#f5c6cb" : "#c3e6cb"}`,
          }}
        >
          <div className="flex items-center gap-2 w-full">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isRunning ? "animate-pulse" : ""}`}
              style={{ background: isRunning ? "#00ff88" : lastStatus?.status === "cancelled" ? "#ffc107" : lastStatus?.status === "failed" ? "#721c24" : "#155724" }} />
            <span className="flex-1 text-left font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {isRunning ? `Sincronizando ${active.dateStr}` : lastStatus?.status === "cancelled" ? "Cancelado" : lastStatus?.status === "failed" ? "Falhou" : "Concluído"}
            </span>
            {total > 0 && <span className="text-xs opacity-70">{pct}%</span>}
          </div>
          {isRunning && total > 0 && (
            <div className="w-full h-1" style={{ background: "#333" }}>
              <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, background: "#00ff88" }} />
            </div>
          )}
          {isRunning && (
            <div className="flex justify-between text-xs opacity-60">
              <span>{processed.toLocaleString()} / {total.toLocaleString()} artigos</span>
              <span>{elapsed}min</span>
            </div>
          )}
        </button>
      </div>

      {expanded && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none"
          onClick={() => setExpanded(false)}>
          <div className="pointer-events-auto w-full sm:max-w-2xl sm:m-4 mx-2 mb-32 sm:mb-4 shadow-2xl"
            style={{ border: "2px solid var(--color-divider)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-2" style={{ background: "#0d0d1f", borderBottom: "1px solid #333" }}>
              <span className="text-xs" style={{ color: "#888", fontFamily: "monospace" }}>dou-scrapper ~ sync #{active.runId}</span>
              <div className="flex gap-2">
                {isRunning && (
                  <button onClick={handleStop} disabled={stopping} className="text-xs px-2 py-0.5"
                    style={{ background: "#f8d7da", color: "#721c24", fontFamily: "var(--font-heading)", fontWeight: 800 }}>
                    {stopping ? "..." : "🛑 Parar"}
                  </button>
                )}
                <button onClick={() => setExpanded(false)} className="text-xs px-2" style={{ color: "#888" }}>✕</button>
              </div>
            </div>
            <div className="p-4 font-mono text-xs overflow-y-auto" style={{ background: "#1a1a2e", color: "#00ff88", maxHeight: "350px" }}>
              {isRunning && total > 0 && (
                <div className="mb-3 pb-3" style={{ borderBottom: "1px solid #333" }}>
                  <div className="flex justify-between mb-1"><span>{pct}% concluído</span><span>{processed.toLocaleString()} de {total.toLocaleString()}</span></div>
                  <div className="w-full h-2" style={{ background: "#333" }}>
                    <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: "#00ff88" }} />
                  </div>
                </div>
              )}
              {logs.map((line, i) => <div key={i} className="leading-relaxed">{line}</div>)}
              {isRunning && <span className="animate-pulse">▊</span>}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
