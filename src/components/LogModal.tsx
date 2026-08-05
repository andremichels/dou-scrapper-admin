"use client";

import { useEffect, useState, useRef } from "react";
import { fetchSyncStatus } from "@/lib/api";
import type { SyncRun } from "@/lib/types";

interface Props {
  syncId: number;
  onClose: () => void;
}

export function LogModal({ syncId, onClose }: Props) {
  const [sync, setSync] = useState<SyncRun | null>(null);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSyncStatus(syncId)
      .then(setSync)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [syncId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const logs: string[] = [];
  if (sync) {
    logs.push(`#${sync.id} — ${sync.date_str} (${sync.secao})`);
    logs.push(`Status: ${sync.status}`);
    logs.push(`Triggered by: ${sync.triggered_by}`);
    logs.push(`Articles synced: ${sync.articles_synced}`);
    logs.push(`Articles skipped: ${sync.articles_skipped}`);
    logs.push(`Total articles: ${sync.total_articles || "—"}`);
    logs.push(`Started: ${new Date(sync.started_at).toLocaleString("pt-BR")}`);
    if (sync.completed_at) {
      const duration = (new Date(sync.completed_at).getTime() - new Date(sync.started_at).getTime()) / 1000;
      logs.push(`Completed: ${new Date(sync.completed_at).toLocaleString("pt-BR")}`);
      logs.push(`Duration: ${duration.toFixed(1)}s`);
    }
    if (sync.error_message) {
      logs.push("");
      logs.push(`❌ ERROR: ${sync.error_message}`);
    }
    if (sync.status === "completed") {
      logs.push("");
      logs.push(`✅ Sync concluído com sucesso`);
    } else if (sync.status === "running") {
      logs.push("");
      logs.push(`⏳ Sync em execução...`);
    } else if (sync.status === "failed") {
      logs.push("");
      logs.push(`❌ Sync falhou`);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-lg mx-4 shadow-2xl"
        style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "2px solid var(--color-divider)" }}>
          <h3 className="text-sm" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>
            Sync #{syncId} {sync ? `— ${sync.date_str} (${sync.secao})` : ""}
          </h3>
          <button onClick={onClose} className="text-sm font-bold" style={{ color: "var(--color-neutral-500)" }}>
            ✕
          </button>
        </div>

        <div className="p-4 font-mono text-xs overflow-y-auto" style={{ background: "#1a1a2e", color: "#00ff88", maxHeight: "400px" }}>
          {loading ? (
            <span className="animate-pulse" style={{ color: "#555" }}>Carregando...</span>
          ) : logs.length === 0 ? (
            <span style={{ color: "#555" }}>Nenhum dado disponível</span>
          ) : (
            logs.map((line, i) => (
              <div key={i} className="leading-relaxed">{line}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
