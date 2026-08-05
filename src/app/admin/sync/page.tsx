"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { triggerSync, fetchSyncStatus, fetchSyncs } from "@/lib/api";
import { useActiveSync } from "@/lib/useActiveSync";
import { SyncRun } from "@/lib/types";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

const SECOES = ["dou1", "dou2", "dou3"] as const;

export default function ManualSyncPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [secao, setSecao] = useState("dou3");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [runId, setRunId] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [lastFailed, setLastFailed] = useState<SyncRun | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Queue mode
  const [queueMode, setQueueMode] = useState(false);
  const [queueDates, setQueueDates] = useState<string[]>([date]);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [queueRunning, setQueueRunning] = useState(false);

  const { active, start } = useActiveSync();
  const { toast } = useToast();

  useEffect(() => {
    fetchSyncs(5, 0).then((list) => {
      setLastFailed(list.find((s) => s.status === "failed") || null);
    }).catch(() => {});
  }, [completed, active]);

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

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  useEffect(() => {
    if (!runId || completed) return;
    const interval = setInterval(async () => {
      try {
        const status: SyncRun = await fetchSyncStatus(runId);
        if (status.status === "running") {
          if (status.articles_synced > 0 || status.articles_skipped > 0) {
            addLog(`⏳ Em execução... ${status.articles_synced} syncados, ${status.articles_skipped} pulados`);
          }
        } else if (status.status === "completed") {
          addLog(`✅ Sync concluído — ${status.articles_synced} artigos syncados, ${status.articles_skipped} pulados`);
          setCompleted(true);
          setLoading(false);
          clearInterval(interval);
        } else if (status.status === "failed") {
          addLog(`❌ Sync falhou: ${status.error_message || "erro desconhecido"}`);
          setCompleted(true);
          setLoading(false);
          clearInterval(interval);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [runId, completed]);

  // Poll queue status
  useEffect(() => {
    if (!queueRunning) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/admin/sync-queue/status`);
        const status = await res.json();
        setQueueStatus(status);
        if (!status.running) {
          setQueueRunning(false);
          addLog(`🏁 Fila concluída: ${status.completed.length} OK, ${status.failed.length} falhas`);
          if (status.failed.length > 0) {
            status.failed.forEach((f: any) => addLog(`❌ ${f.date}: ${f.error}`));
          }
          clearInterval(interval);
        } else {
          addLog(`📋 Fila: ${status.completed.length + status.failed.length + 1}/${status.completed.length + status.failed.length + status.pending.length + 1} — ${status.current_date}`);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [queueRunning]);

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
      start({ runId: result.run_id, dateStr, secao, startedAt: new Date().toISOString() });
    } catch (err: any) {
      addLog(`❌ ${err.message || "Erro ao disparar sync"}`);
      setLoading(false);
      setCompleted(true);
    }
  };

  const handleQueueSync = async () => {
    setQueueRunning(true);
    setLogs([]);
    setLoading(false);
    setCompleted(false);

    const dates = queueDates.filter(Boolean);
    if (dates.length === 0) {
      toast("Selecione pelo menos uma data", "error");
      setQueueRunning(false);
      return;
    }

    // Convert YYYY-MM-DD -> DD-MM-YYYY
    const formatted = dates.map((d) => {
      const [y, m, day] = d.split("-");
      return `${day}-${m}-${y}`;
    });

    addLog(`🔄 Enfileirando ${formatted.length} datas para ${secao}...`);
    formatted.forEach((d) => addLog(`  📅 ${d}`));

    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/sync-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: formatted, secao, force_resync: false }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erro ao iniciar fila");
      }
      addLog(`✅ Fila iniciada — processando uma data por vez...`);
      toast("Fila iniciada", "success");
    } catch (err: any) {
      addLog(`❌ ${err.message}`);
      setQueueRunning(false);
    }
  };

  const addQueueDate = () => {
    if (queueDates.length >= 5) return;
    setQueueDates([...queueDates, ""]);
  };

  const updateQueueDate = (i: number, value: string) => {
    const next = [...queueDates];
    next[i] = value;
    setQueueDates(next);
  };

  const removeQueueDate = (i: number) => {
    if (queueDates.length <= 1) return;
    setQueueDates(queueDates.filter((_, idx) => idx !== i));
  };

  const doResume = () => {
    if (!lastFailed) return;
    const [d, m, y] = lastFailed.date_str.split("-");
    setDate(`${y}-${m}-${d}`);
    setSecao(lastFailed.secao);
    setTimeout(() => handleSync(), 50);
  };

  const statusColor = completed
    ? logs.some((l) => l.includes("✅")) ? "#155724" : "var(--color-accent)"
    : "var(--color-accent)";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col">
        <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>
          Manual Sync
        </h2>

        <div className="flex gap-6 flex-1">
          <div className="w-72 shrink-0">
            {lastFailed && !loading && !queueRunning && (
              <div className="p-3 mb-3" style={{ background: "#f8d7da", border: "2px solid #f5c6cb" }}>
                <p className="text-xs mb-2" style={{ color: "#721c24", fontFamily: "var(--font-heading)", fontWeight: 800 }}>
                  Último sync falhou:
                </p>
                <p className="text-xs mb-2" style={{ color: "#721c24" }}>
                  {lastFailed.date_str} ({lastFailed.secao}) — {lastFailed.articles_synced} sync / {lastFailed.articles_skipped} skip
                </p>
                <button onClick={doResume} className="w-full py-1 text-xs" style={{ background: "#721c24", color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 800 }}>
                  ↻ Retomar
                </button>
              </div>
            )}

            <div className="p-5" style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)" }}>
              {/* Mode toggle */}
              <div className="flex mb-4" style={{ border: "2px solid var(--color-divider)" }}>
                <button
                  onClick={() => setQueueMode(false)}
                  className="flex-1 py-1.5 text-xs font-bold"
                  style={{
                    background: !queueMode ? "var(--color-accent)" : "transparent",
                    color: !queueMode ? "#fff" : "var(--color-neutral-600)",
                  }}
                >
                  Único
                </button>
                <button
                  onClick={() => setQueueMode(true)}
                  className="flex-1 py-1.5 text-xs font-bold"
                  style={{
                    background: queueMode ? "var(--color-accent)" : "transparent",
                    color: queueMode ? "#fff" : "var(--color-neutral-600)",
                  }}
                >
                  Fila (até 5)
                </button>
              </div>

              {!queueMode ? (
                <>
                  <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Data</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={loading && !completed}
                    className="w-full px-3 py-2 text-sm mb-3" style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }} />

                  <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Seção</label>
                  <select value={secao} onChange={(e) => setSecao(e.target.value)} disabled={loading && !completed}
                    className="w-full px-3 py-2 text-sm mb-4" style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}>
                    {SECOES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>

                  <button onClick={handleSync} disabled={loading && !completed}
                    className="w-full py-2 text-sm"
                    style={{ background: loading && !completed ? "var(--color-neutral-500)" : "var(--color-accent)", color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 800 }}>
                    {loading && !completed ? "Executando..." : "Disparar Sync"}
                  </button>
                </>
              ) : (
                <>
                  <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Seção</label>
                  <select value={secao} onChange={(e) => setSecao(e.target.value)} disabled={queueRunning}
                    className="w-full px-3 py-2 text-sm mb-3" style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}>
                    {SECOES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>

                  <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>
                    Datas ({queueDates.length}/5)
                  </label>
                  <div className="space-y-2 mb-3">
                    {queueDates.map((d, i) => (
                      <div key={i} className="flex gap-1">
                        <input type="date" value={d} onChange={(e) => updateQueueDate(i, e.target.value)}
                          className="flex-1 px-2 py-1.5 text-xs"
                          style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
                          disabled={queueRunning} />
                        {queueDates.length > 1 && (
                          <button onClick={() => removeQueueDate(i)} className="px-2 text-xs"
                            style={{ color: "var(--color-accent)", border: "1px solid var(--color-divider)" }}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {queueDates.length < 5 && (
                    <button onClick={addQueueDate} className="w-full py-1 text-xs mb-3"
                      style={{ border: "2px dashed var(--color-divider)", color: "var(--color-neutral-500)" }}>
                      + Adicionar data
                    </button>
                  )}

                  <Button onClick={handleQueueSync} disabled={queueRunning} className="w-full justify-center py-2 text-sm">
                    {queueRunning ? "Processando fila..." : `Sincronizar ${queueDates.filter(Boolean).length} datas`}
                  </Button>
                </>
              )}

              {(logs.length > 0 || completed) && (
                <div className="mt-4 text-xs space-y-1">
                  {completed && (
                    <p style={{ color: statusColor, fontFamily: "var(--font-heading)", fontWeight: 800 }}>
                      {logs.some((l) => l.includes("✅")) ? "✓ Concluído" : "✗ Falhou"}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Queue progress */}
            {queueStatus && queueRunning && (
              <div className="mt-3 p-3" style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)" }}>
                <p className="text-xs mb-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Progresso da fila</p>
                <div className="text-xs space-y-1">
                  {queueStatus.completed.map((d: string) => (
                    <div key={d} style={{ color: "#155724" }}>✓ {d}</div>
                  ))}
                  {queueStatus.current_date && (
                    <div style={{ color: "#856404" }}>⏳ {queueStatus.current_date} (em execução)</div>
                  )}
                  {queueStatus.pending.map((d: string) => (
                    <div key={d} style={{ color: "var(--color-neutral-500)" }}>○ {d}</div>
                  ))}
                  {queueStatus.failed.map((f: any) => (
                    <div key={f.date} style={{ color: "#721c24" }}>✗ {f.date}: {f.error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto"
              style={{ background: "#1a1a2e", color: "#00ff88", border: "2px solid var(--color-divider)", minHeight: "400px" }}>
              {logs.length === 0 ? (
                <span style={{ color: "#555" }}>Aguardando início do sync...</span>
              ) : (
                logs.map((line, i) => <div key={i} className="leading-relaxed">{line}</div>)
              )}
              {(loading || queueRunning) && !completed && <span className="animate-pulse">▊</span>}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
