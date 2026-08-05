"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { fetchSyncs, triggerSync } from "@/lib/api";
import { useActiveSync } from "@/lib/useActiveSync";
import { SyncRun } from "@/lib/types";

const PAGE_SIZE = 20;

function fmtDuration(start: string, end: string | null): string {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
  return `${Math.round(ms / 3600000)}h`;
}

function pct(row: SyncRun): string {
  if (!row.total_articles) return "—";
  return `${Math.round(((row.articles_synced + row.articles_skipped) / row.total_articles) * 100)}%`;
}

export default function SyncsPage() {
  const [syncs, setSyncs] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { active, start } = useActiveSync();
  const router = useRouter();

  const load = () => {
    setLoading(true);
    fetchSyncs(PAGE_SIZE, page * PAGE_SIZE)
      .then((data) => {
        setSyncs(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);
  useEffect(() => { load(); }, [active]);

  const handleResume = async (row: SyncRun) => {
    setResuming(row.id);
    try {
      const result = await triggerSync(row.date_str, row.secao);
      start({
        runId: result.run_id,
        dateStr: row.date_str,
        secao: row.secao,
        startedAt: new Date().toISOString(),
      });
      setTimeout(() => load(), 2000);
    } catch {
      // error shown in Manual Sync page
    }
    setResuming(null);
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6 overflow-x-auto">
        <div className="flex items-baseline justify-between mb-4">
          <h2
            className="text-xl"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            Sync History
          </h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs font-bold"
              style={{
                background: page === 0 ? "var(--color-divider)" : "var(--color-accent)",
                color: page === 0 ? "var(--color-neutral-500)" : "#fff",
                border: "none",
                cursor: page === 0 ? "default" : "pointer",
              }}
            >
              ← Anterior
            </button>
            <span className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
              Pág {page + 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="px-3 py-1 text-xs font-bold"
              style={{
                background: !hasMore ? "var(--color-divider)" : "var(--color-accent)",
                color: !hasMore ? "var(--color-neutral-500)" : "#fff",
                border: "none",
                cursor: !hasMore ? "default" : "pointer",
              }}
            >
              Próximo →
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
            Carregando...
          </p>
        ) : (
          <div style={{ border: "2px solid var(--color-divider)" }}>
            <table className="w-full text-xs">
              <thead>
                <tr
                  style={{
                    background: "var(--color-surface)",
                    borderBottom: "2px solid var(--color-divider)",
                  }}
                >
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>#</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Data</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Seção</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Status</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Progresso</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Duração</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Por</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Início</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}></th>
                </tr>
              </thead>
              <tbody>
                {syncs.map((row) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: "1px solid var(--color-divider)" }}
                  >
                    <td className="p-2" style={{ color: "var(--color-neutral-500)" }}>{row.id}</td>
                    <td className="p-2">{row.date_str}</td>
                    <td className="p-2">{row.secao}</td>
                    <td className="p-2">
                      <span
                        className="px-2 py-0.5"
                        style={{
                          background:
                            row.status === "completed" ? "#d4edda" :
                            row.status === "failed" ? "#f8d7da" :
                            row.status === "running" ? "#fff3cd" : "#e2e3e5",
                          color:
                            row.status === "completed" ? "#155724" :
                            row.status === "failed" ? "#721c24" :
                            row.status === "running" ? "#856404" : "#383d41",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {row.total_articles > 0
                        ? `${row.articles_synced + row.articles_skipped}/${row.total_articles} (${pct(row)})`
                        : `${row.articles_synced} sync / ${row.articles_skipped} skip`}
                    </td>
                    <td className="p-2">{fmtDuration(row.started_at, row.completed_at)}</td>
                    <td className="p-2">{row.triggered_by}</td>
                    <td className="p-2" style={{ color: "var(--color-neutral-500)" }}>
                      {new Date(row.started_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-2">
                      {row.status === "running" && (
                        <button
                          onClick={() => {
                            start({ runId: row.id, dateStr: row.date_str, secao: row.secao, startedAt: row.started_at });
                            router.push("/admin/sync");
                          }}
                          className="px-2 py-0.5 text-xs"
                          style={{
                            background: "#fff3cd",
                            color: "#856404",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 800,
                            border: "1px solid #ffc107",
                          }}
                        >
                          📋 Ver logs
                        </button>
                      )}
                      {(row.status === "failed" || row.status === "completed") && (
                        <button
                          onClick={() => handleResume(row)}
                          disabled={resuming === row.id}
                          className="px-2 py-0.5 text-xs"
                          style={{
                            background: "var(--color-accent)",
                            color: "#fff",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 800,
                            opacity: resuming === row.id ? 0.6 : 1,
                          }}
                        >
                          {resuming === row.id ? "..." : "↻ Resume"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
