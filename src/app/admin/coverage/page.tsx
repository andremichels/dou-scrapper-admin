"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { fetchCoverage } from "@/lib/api";
import { CoverageItem } from "@/lib/types";

export default function CoveragePage() {
  const [coverage, setCoverage] = useState<CoverageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoverage(30)
      .then(setCoverage)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
                </tr>
              </thead>
              <tbody>
                {coverage.map((row) => (
                  <tr
                    key={row.date}
                    style={{ borderBottom: "1px solid var(--color-divider)" }}
                  >
                    <td className="p-2">{row.date}</td>
                    {(["dou1", "dou2", "dou3"] as const).map((s) => (
                      <td key={s} className="text-center p-2">
                        <span
                          className="inline-block w-4 h-4"
                          style={{
                            background: row[s] ? "#d4edda" : "#f8d7da",
                            border: row[s] ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
                          }}
                        />
                      </td>
                    ))}
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
