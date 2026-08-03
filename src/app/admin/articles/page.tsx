"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { Article } from "@/lib/types";

const PAGE_SIZE = 25;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Article | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const loadPage = (p: number, q?: string) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from("articles").select("*", { count: "exact" }).order("published_date", { ascending: false });
    if (q) {
      query = query.or(`title.ilike.%${q}%,organ.ilike.%${q}%`);
    }
    query.range(from, to).then(({ data, count }) => {
      setArticles(data || []);
      setTotal(count || 0);
      setLoading(false);
    });
  };

  useEffect(() => { loadPage(0); }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadPage(0, search);
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Articles</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título ou órgão..."
              className="px-3 py-1.5 text-xs w-64"
              style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
            />
            <button type="submit" className="px-3 py-1.5 text-xs font-bold"
              style={{ background: "var(--color-accent)", color: "#fff", fontFamily: "var(--font-heading)" }}>Buscar</button>
          </form>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>Carregando...</p>
        ) : (
          <>
            <div style={{ border: "2px solid var(--color-divider)" }} className="flex-1 flex flex-col">
              <table className="w-full text-xs flex-1">
                <thead>
                  <tr style={{ background: "var(--color-surface)", borderBottom: "2px solid var(--color-divider)" }}>
                    <th className="text-left p-2 w-24" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Data</th>
                    <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Título</th>
                    <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Órgão</th>
                    <th className="text-left p-2 w-20" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Seção</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a) => (
                    <tr key={a.id} onClick={() => setSelected(a)} className="cursor-pointer"
                      style={{ borderBottom: "1px solid var(--color-divider)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--color-surface)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td className="p-2">{a.published_date}</td>
                      <td className="p-2 max-w-md truncate">{a.title}</td>
                      <td className="p-2 max-w-xs truncate">{a.organ || "—"}</td>
                      <td className="p-2">{a.section || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs">
              <span style={{ color: "var(--color-neutral-500)" }}>{total.toLocaleString()} artigos</span>
              <div className="flex gap-1">
                <button onClick={() => loadPage(page - 1)} disabled={page === 0}
                  className="px-3 py-1.5 font-bold" style={{ background: page === 0 ? "var(--color-neutral-200)" : "var(--color-surface)", border: "2px solid var(--color-divider)", color: page === 0 ? "var(--color-neutral-400)" : "var(--color-text)", fontFamily: "var(--font-heading)" }}>
                  ← Anterior
                </button>
                <span className="px-3 py-1.5" style={{ color: "var(--color-neutral-600)" }}>
                  {page + 1} de {totalPages || 1}
                </span>
                <button onClick={() => loadPage(page + 1)} disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 font-bold" style={{ background: page >= totalPages - 1 ? "var(--color-neutral-200)" : "var(--color-surface)", border: "2px solid var(--color-divider)", color: page >= totalPages - 1 ? "var(--color-neutral-400)" : "var(--color-text)", fontFamily: "var(--font-heading)" }}>
                  Próxima →
                </button>
              </div>
            </div>
          </>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setSelected(null)}>
            <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4 p-6"
              style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)" }}
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>{selected.title}</h3>
                <button onClick={() => setSelected(null)} className="text-sm px-2 py-1" style={{ border: "2px solid var(--color-divider)", fontFamily: "var(--font-heading)", fontWeight: 800 }}>✕</button>
              </div>
              <div className="text-xs space-y-2" style={{ color: "var(--color-neutral-600)" }}>
                <p>Data: {selected.published_date}</p>
                <p>Órgão: {selected.organ || "—"}</p>
                <p>Seção: {selected.section || "—"} / Edição: {selected.edition || "—"} / Pág: {selected.page || "—"}</p>
                <p>Slug: {selected.slug}</p>
                <div className="mt-4 p-3 text-xs whitespace-pre-wrap" style={{ background: "var(--color-bg)", border: "1px solid var(--color-divider)", maxHeight: "40vh", overflowY: "auto" }}>
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
