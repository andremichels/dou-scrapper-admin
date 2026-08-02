"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { Article } from "@/lib/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Article | null>(null);

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .order("published_date", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setArticles(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6">
        <h2
          className="text-xl mb-4"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Articles
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
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Título</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Órgão</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Seção</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="cursor-pointer"
                    style={{
                      borderBottom: "1px solid var(--color-divider)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--color-surface)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td className="p-2">{a.published_date}</td>
                    <td className="p-2 max-w-md truncate">{a.title}</td>
                    <td className="p-2 max-w-xs truncate">{a.organ || "—"}</td>
                    <td className="p-2">{a.section || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Article detail modal */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setSelected(null)}
          >
            <div
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4 p-6"
              style={{
                background: "var(--color-surface)",
                border: "2px solid var(--color-divider)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3
                  className="text-lg"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
                >
                  {selected.title}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm px-2 py-1"
                  style={{
                    border: "2px solid var(--color-divider)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800,
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="text-xs space-y-2" style={{ color: "var(--color-neutral-600)" }}>
                <p>Data: {selected.published_date}</p>
                <p>Órgão: {selected.organ || "—"}</p>
                <p>Seção: {selected.section || "—"} / Edição: {selected.edition || "—"} / Pág: {selected.page || "—"}</p>
                <p>Slug: {selected.slug}</p>
                <div
                  className="mt-4 p-3 text-xs whitespace-pre-wrap"
                  style={{ background: "var(--color-bg)", border: "1px solid var(--color-divider)", maxHeight: "40vh", overflowY: "auto" }}
                >
                  {selected.content?.slice(0, 5000)}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
