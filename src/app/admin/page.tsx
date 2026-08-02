"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { fetchStats } from "@/lib/api";
import { AdminStats } from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Total de Artigos", value: stats.total_articles.toLocaleString() },
        { label: "Artigos Hoje", value: stats.articles_today.toLocaleString() },
        { label: "Artigos (7 dias)", value: stats.articles_this_week.toLocaleString() },
        { label: "Total de Syncs", value: stats.total_syncs.toLocaleString() },
        { label: "Syncs Hoje", value: stats.syncs_today.toLocaleString() },
        { label: "Cobertura (30d)", value: `${stats.coverage_pct}%` },
      ]
    : [];

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6">
        <h2
          className="text-xl mb-6"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Dashboard
        </h2>

        {loading ? (
          <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
            Carregando...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="p-4"
                  style={{
                    background: "var(--color-surface)",
                    border: "2px solid var(--color-divider)",
                  }}
                >
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--color-neutral-500)" }}
                  >
                    {card.label}
                  </p>
                  <p
                    className="text-2xl"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      color: "var(--color-text)",
                    }}
                  >
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="p-4"
              style={{
                background: "var(--color-surface)",
                border: "2px solid var(--color-divider)",
              }}
            >
              <h3
                className="text-sm mb-2"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
              >
                API Status
              </h3>
              <div className="flex gap-6 text-xs">
                <span style={{ color: "var(--color-neutral-600)" }}>
                  ◉ Último sync:{" "}
                  {stats?.last_sync_at
                    ? new Date(stats.last_sync_at).toLocaleString("pt-BR")
                    : "N/A"}
                </span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
