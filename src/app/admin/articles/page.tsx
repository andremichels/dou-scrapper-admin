"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { Article } from "@/lib/types";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";

const PAGE_SIZE = 25;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Article | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [goPage, setGoPage] = useState("");
  const { toast } = useToast();

  const loadPage = (p: number, q?: string, s?: string, from?: string, to?: string) => {
    setPage(p);
    setLoading(true);
    setError(null);
    const start = p * PAGE_SIZE;
    const end = start + PAGE_SIZE - 1;
    let query = supabase.from("articles").select("*", { count: "exact" }).order("published_date", { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,organ.ilike.%${q}%`);
    }
    if (s) {
      query = query.ilike("section", `%${s}%`);
    }
    if (from) query = query.gte("published_date", from);
    if (to) query = query.lte("published_date", to);

    query.range(start, end).then(({ data, count, error: err }) => {
      if (err) {
        setError(err.message);
        toast("Erro ao carregar artigos", "error");
      } else {
        setArticles(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    });
  };

  useEffect(() => { loadPage(0); }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPage(0, search, section, dateFrom, dateTo);
  };

  const handleGoPage = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(goPage, 10);
    if (n >= 1 && n <= totalPages) {
      loadPage(n - 1, search, section, dateFrom, dateTo);
      setGoPage("");
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Articles</h2>
          <form onSubmit={handleSearch} className="flex gap-2 flex-wrap items-end">
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título ou órgão..."
              className="px-3 py-1.5 text-xs w-56"
              style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
            />
            <select value={section} onChange={e => setSection(e.target.value)}
              className="px-2 py-1.5 text-xs"
              style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}>
              <option value="">Todas seções</option>
              <option value="Seção: 1">Seção 1</option>
              <option value="Seção: 2">Seção 2</option>
              <option value="Seção: 3">Seção 3</option>
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-2 py-1.5 text-xs"
              style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
              title="Data início" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-2 py-1.5 text-xs"
              style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
              title="Data fim" />
            <Button type="submit" variant="primary" size="sm">Buscar</Button>
          </form>
        </div>

        {error && (
          <div className="mb-3 p-3 text-xs" style={{ background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" }}>
            {error}
            <button onClick={() => loadPage(0, search, section, dateFrom, dateTo)} className="ml-3 underline font-bold">Tentar novamente</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse" style={{ background: "var(--color-divider)" }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ border: "2px solid var(--color-divider)" }} className="flex-1 flex flex-col overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
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
                      <td className="p-2">{a.published_date ? new Date(a.published_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</td>
                      <td className="p-2 max-w-md truncate" title={a.title}>{a.title}</td>
                      <td className="p-2 max-w-xs truncate" title={a.organ || ""}>{a.organ || "—"}</td>
                      <td className="p-2">{a.section || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs">
              <span style={{ color: "var(--color-neutral-500)" }}>{total.toLocaleString()} artigos</span>
              <div className="flex gap-2 items-center">
                <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => loadPage(page - 1, search, section, dateFrom, dateTo)}>← Anterior</Button>
                <span style={{ color: "var(--color-neutral-600)" }}>{page + 1} de {totalPages}</span>
                <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => loadPage(page + 1, search, section, dateFrom, dateTo)}>Próxima →</Button>
                <form onSubmit={handleGoPage} className="flex gap-1 items-center">
                  <input
                    type="number" min={1} max={totalPages}
                    value={goPage} onChange={e => setGoPage(e.target.value)}
                    placeholder={`1–${totalPages}`}
                    className="w-14 px-2 py-1 text-xs text-center"
                    style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
                  />
                  <Button variant="ghost" size="sm" type="submit">Ir</Button>
                </form>
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
