"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { fetchCoverage, triggerSync } from "@/lib/api";
import { CoverageItem } from "@/lib/types";
import { useActiveSync } from "@/lib/useActiveSync";

const SECOES = ["dou1", "dou2", "dou3"] as const;

export default function CoveragePage() {
  const [coverage, setCoverage] = useState<CoverageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null); // "date:secao"
  const { start } = useActiveSync();

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
      setTimeout(() => load(), 3000);
    } catch (e: any) {
      alert(e.message || "Erro ao iniciar sync");
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
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Data</th>
                  <th className="text-center p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>dou1</th>
                  <th className="text-center p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>dou2</th>
                  <th className="text-center p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>dou3</th>
                  <th className="text-center p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}></th>
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
                              className="inline-block w-4 h-4"
                              style={{
                                background: "#d4edda",
                                border: "1px solid #c3e6cb",
                              }}
                              title={`${s} syncado`}
                            />
                          ) : (
                            <button
                              onClick={() => handleSync(row.date, s)}
                              disabled={!!syncing}
                              className="inline-block w-4 h-4 cursor-pointer"
                              style={{
                                background: isSyncing ? "#fff3cd" : "#f8d7da",
                                border: isSyncing ? "1px solid #ffc107" : "1px solid #f5c6cb",
                                opacity: syncing && !isSyncing ? 0.4 : 1,
                              }}
                              title={`Sync ${s} para ${row.date}`}
                            />
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center p-2">
                      <button
                        onClick={() => {
                          SECOES.forEach((s) => {
                            if (!row[s]) handleSync(row.date, s);
                          });
                        }}
                        disabled={!!syncing || SECOES.every((s) => row[s])}
                        className="px-2 py-0.5 text-xs font-bold"
                        style={{
                          background: SECOES.every((s) => row[s])
                            ? "var(--color-divider)"
                            : syncing
                            ? "#fff3cd"
                            : "var(--color-accent)",
                          color: SECOES.every((s) => row[s])
                            ? "var(--color-neutral-500)"
                            : "#fff",
                          border: "none",
                          cursor: SECOES.every((s) => row[s]) ? "default" : "pointer",
                        }}
                      >
                        Sync all
                      </button>
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
