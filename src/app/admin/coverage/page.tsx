"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { fetchCoverage, triggerSync } from "@/lib/api";
import { CoverageItem } from "@/lib/types";
import { useActiveSync } from "@/lib/useActiveSync";
import { useToast } from "@/components/Toast";

const SECOES = ["dou1", "dou2", "dou3"] as const;

export default function CoveragePage() {
  const [coverage, setCoverage] = useState<CoverageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { start } = useActiveSync();
  const { toast } = useToast();

  const load = () => {
    fetchCoverage(30)
      .then(setCoverage)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSync = async (date: string, secao: string) => {
    const key = `${date}:${secao}`;
    setSyncing(key);
    try {
      const result = await triggerSync(date, secao);
      start({
        runId: result.run_id,
        dateStr: date,
        secao,
        startedAt: new Date().toISOString(),
      });
      toast(`Sync ${secao} iniciado para ${date}`, "success");
      setTimeout(() => load(), 3000);
    } catch (e: any) {
      toast(e.message || "Erro ao iniciar sync", "error");
    }
    setSyncing(null);
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6">
        <h2
          className="text-xl mb-4"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Coverage (30 dias)
        </h2>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-7 skeleton" />
            ))}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="w-full text-xs">
              <thead>
                <tr
                  style={{
                    background: "var(--color-surface)",
                    borderBottom: "2px solid var(--color-divider)",
                  }}
                >
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Data</th>
                  <th className="text-center p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>dou1</th>
                  <th className="text-center p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>dou2</th>
                  <th className="text-center p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>dou3</th>
                </tr>
              </thead>
              <tbody>
                {coverage.map((row) => (
                  <tr
                    key={row.date}
                    style={{ borderBottom: "1px solid var(--color-divider)" }}
                  >
                    <td className="p-2">{row.date}</td>
                    {SECOES.map((s) => {
                      const key = `${row.date}:${s}`;
                      const isSyncing = syncing === key;
                      return (
                        <td key={s} className="text-center p-2">
                          {row[s] ? (
                            <span
                              className="inline-flex items-center justify-center text-[10px] font-bold"
                              style={{
                                width: 22, height: 22,
                                background: "#d4edda",
                                border: "1px solid #c3e6cb",
                                color: "#155724",
                              }}
                              title={`${s} syncado`}
                            >✓</span>
                          ) : (
                            <button
                              onClick={() => handleSync(row.date, s)}
                              disabled={!!syncing}
                              className="inline-flex items-center justify-center text-[10px] font-bold cursor-pointer"
                              style={{
                                width: 22, height: 22,
                                background: isSyncing ? "#fff3cd" : "#f8d7da",
                                border: isSyncing ? "1px solid #ffc107" : "1px solid #f5c6cb",
                                color: isSyncing ? "#856404" : "#721c24",
                                opacity: syncing && !isSyncing ? 0.4 : 1,
                              }}
                              title={`Sincronizar ${s} — ${row.date}`}
                            >—</button>
                          )}
                        </td>
                      );
                    })}
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
