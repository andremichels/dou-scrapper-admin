"use client";

import { useState, useEffect, useRef } from "react";
import { useActiveSync } from "@/lib/useActiveSync";
import { fetchSyncStatus } from "@/lib/api";
import { SyncRun } from "@/lib/types";

export function SyncMonitor() {
  const { active, status, clear } = useActiveSync();
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastStatus, setLastStatus] = useState<SyncRun | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  };

  // Poll for logs
  useEffect(() => {
    if (!active) return;
    if (logs.length === 0) {
      addLog(`🔄 Sync em execução: ${active.dateStr} (${active.secao})`);
    }
    const interval = setInterval(async () => {
      try {
        const s = await fetchSyncStatus(active.runId);
        setLastStatus(s);
        if (s.articles_synced > 0 || s.articles_skipped > 0) {
          addLog(`⏳ ${s.articles_synced} syncados, ${s.articles_skipped} pulados`);
        }
        if (s.status === "completed") {
          addLog(`✅ Concluído — ${s.articles_synced} syncados, ${s.articles_skipped} pulados`);
          clearInterval(interval);
          setTimeout(() => { setExpanded(false); setLogs([]); }, 3000);
        } else if (s.status === "failed") {
          addLog(`❌ Falhou: ${s.error_message || "erro"}`);
          clearInterval(interval);
          setTimeout(() => { setExpanded(false); setLogs([]); }, 5000);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [active?.runId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!active) return null;

  const isRunning = lastStatus?.status === "running" || (!lastStatus && active);

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            if (!expanded) setExpanded(true);
            else { setExpanded(false); if (lastStatus?.status !== "running") { clear(); setLogs([]); } }
          }}
          className="flex items-center gap-2 px-3 py-2 text-xs shadow-lg"
          style={{
            background: isRunning ? "#1a1a2e" : lastStatus?.status === "failed" ? "#f8d7da" : "#d4edda",
            color: isRunning ? "#00ff88" : lastStatus?.status === "failed" ? "#721c24" : "#155724",
            border: `2px solid ${isRunning ? "#00ff88" : lastStatus?.status === "failed" ? "#f5c6cb" : "#c3e6cb"}`,
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
          }}
        >
          <span className={`w-2 h-2 rounded-full ${isRunning ? "animate-pulse" : ""}`}
            style={{ background: isRunning ? "#00ff88" : lastStatus?.status === "failed" ? "#721c24" : "#155724" }} />
          {isRunning
            ? `Sync ${active.dateStr} (${active.secao}) — ${lastStatus?.articles_synced || 0} artigos`
            : lastStatus?.status === "failed" ? "Sync falhou ✗" : "Sync concluído ✓"}
        </button>
      </div>

      {/* Expanded terminal modal */}
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none"
          onClick={() => setExpanded(false)}>
          <div
            className="pointer-events-auto w-full sm:max-w-2xl sm:m-4 mx-2 mb-16 sm:mb-4 shadow-2xl"
            style={{ border: "2px solid var(--color-divider)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2"
              style={{ background: "#0d0d1f", borderBottom: "1px solid #333" }}>
              <span className="text-xs" style={{ color: "#888", fontFamily: "monospace" }}>
                dou-scrapper ~ sync #{active.runId}
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="text-xs px-2"
                style={{ color: "#888", fontFamily: "monospace" }}
              >
                ✕
              </button>
            </div>
            {/* Terminal body */}
            <div
              className="p-4 font-mono text-xs overflow-y-auto"
              style={{ background: "#1a1a2e", color: "#00ff88", maxHeight: "350px" }}
            >
              {logs.map((line, i) => (
                <div key={i} className="leading-relaxed">{line}</div>
              ))}
              {isRunning && <span className="animate-pulse">▊</span>}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
