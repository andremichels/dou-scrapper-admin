"use client";

import { useState, useEffect, useRef } from "react";
import { useActiveSync } from "@/lib/useActiveSync";
import { fetchSyncStatus, stopSync } from "@/lib/api";
import { SyncRun } from "@/lib/types";

export function SyncMonitor() {
  const { active, clear } = useActiveSync();
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
          setTimeout(() => { setExpanded(false); setLogs([]); lastCountRef.current = 0; clear(); }, 6000);
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
      {/* Footer bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: "#1a1a2e", borderTop: "2px solid #00ff88" }}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4 text-xs">
          {/* Status */}
          <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${isRunning ? "animate-pulse" : ""}`}
              style={{ background: isRunning ? "#00ff88" : "#ffc107" }} />
            <span className="font-bold" style={{ color: "#00ff88", fontFamily: "var(--font-heading)" }}>
              {isRunning ? `${active.dateStr} (${active.secao})` : isRunning ? "" : "Finalizado"}
            </span>
            {total > 0 && (
              <>
                <div className="flex-1 max-w-xs h-1.5 mx-2" style={{ background: "#333" }}>
                  <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, background: "#00ff88" }} />
                </div>
                <span style={{ color: "#888", whiteSpace: "nowrap" }}>{pct}% · {processed.toLocaleString()}/{total.toLocaleString()} · {elapsed}min</span>
              </>
            )}
            {!total && <span style={{ color: "#888" }}>{processed} processados</span>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isRunning && (
              <button onClick={handleStop} disabled={stopping}
                className="px-3 py-1 font-bold" style={{ background: "#f8d7da", color: "#721c24", fontFamily: "var(--font-heading)" }}>
                {stopping ? "..." : "🛑 Parar"}
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)} className="px-2 py-1" style={{ color: "#888" }}>
              {expanded ? "▼" : "▲"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded log panel */}
      {expanded && (
        <div className="fixed bottom-10 left-0 right-0 z-40" style={{ background: "#0d0d1f", borderTop: "1px solid #333" }}>
          <div className="max-w-7xl mx-auto p-4 font-mono text-xs overflow-y-auto" style={{ color: "#00ff88", maxHeight: "250px" }}>
            {isRunning && total > 0 && (
              <div className="mb-2 pb-2" style={{ borderBottom: "1px solid #333" }}>
                <span>{pct}% concluído — {processed.toLocaleString()} de {total.toLocaleString()} artigos</span>
              </div>
            )}
            {logs.map((line, i) => <div key={i} className="leading-relaxed">{line}</div>)}
            {isRunning && <span className="animate-pulse">▊</span>}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Spacer so content doesn't get hidden behind footer */}
      <div style={{ height: isRunning || active ? "40px" : "0", transition: "height 0.3s" }} />
    </>
  );
}
