"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { fetchCronJobs, createCronJob, updateCronJob, deleteCronJob, triggerCronNow } from "@/lib/api";
import type { CronJob } from "@/lib/types";

const SECOES = ["dou1", "dou2", "dou3"] as const;

const PRESETS: { label: string; schedule: string }[] = [
  { label: "Diário 06h (dias úteis)", schedule: "0 6 * * 1-5" },
  { label: "Diário 08h (dias úteis)", schedule: "0 8 * * 1-5" },
  { label: "Diário 20h (dias úteis)", schedule: "0 20 * * 1-5" },
  { label: "A cada 6h", schedule: "0 */6 * * *" },
  { label: "Sábado 08h", schedule: "0 8 * * 6" },
];

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR");
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [secao, setSecao] = useState<string>("dou3");
  const [schedule, setSchedule] = useState("0 6 * * 1-5");
  const [creating, setCreating] = useState(false);
  const [running, setRunning] = useState<number | null>(null);

  const load = () => {
    fetchCronJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { load(); }, [running]); // refresh after triggering

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createCronJob(secao, schedule);
      setSchedule("0 6 * * 1-5");
      load();
    } catch (e: any) {
      alert(e.message);
    }
    setCreating(false);
  };

  const handleToggle = async (job: CronJob) => {
    await updateCronJob(job.id, { enabled: !job.enabled });
    load();
  };

  const handleDelete = async (job: CronJob) => {
    if (!confirm(`Remover cron job #${job.id} (${job.secao})?`)) return;
    await deleteCronJob(job.id);
    load();
  };

  const handleRunNow = async (job: CronJob) => {
    setRunning(job.id);
    try {
      const result = await triggerCronNow(job.id);
      alert(`Sync disparado: ${result.secao} para ${result.date}`);
    } catch (e: any) {
      alert(e.message);
    }
    setRunning(null);
    load();
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar />
      <main className="flex-1 p-6 overflow-x-auto">
        <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>
          Cron Jobs
        </h2>

        {/* Create form */}
        <div className="mb-6 p-4" style={{ border: "2px solid var(--color-divider)", background: "var(--color-surface)" }}>
          <h3 className="text-sm mb-3" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>
            Novo Cron Job
          </h3>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--color-neutral-600)" }}>Seção</label>
              <select
                value={secao}
                onChange={(e) => setSecao(e.target.value)}
                className="px-3 py-2 text-sm"
                style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)" }}
              >
                {SECOES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs mb-1" style={{ color: "var(--color-neutral-600)" }}>Schedule (cron)</label>
              <input
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-3 py-2 text-sm"
                style={{ border: "2px solid var(--color-divider)", background: "var(--color-bg)", fontFamily: "monospace" }}
                placeholder="0 6 * * 1-5"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 text-sm font-bold"
              style={{ background: "var(--color-accent)", color: "#fff", border: "none", opacity: creating ? 0.6 : 1 }}
            >
              {creating ? "..." : "Criar"}
            </button>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.schedule}
                onClick={() => setSchedule(p.schedule)}
                className="px-2 py-1 text-xs"
                style={{
                  border: schedule === p.schedule ? "2px solid var(--color-accent)" : "1px solid var(--color-divider)",
                  background: schedule === p.schedule ? "var(--color-accent)" : "transparent",
                  color: schedule === p.schedule ? "#fff" : "var(--color-neutral-600)",
                  fontWeight: schedule === p.schedule ? 800 : 400,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job list */}
        {loading ? (
          <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>Carregando...</p>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center" style={{ border: "2px solid var(--color-divider)", color: "var(--color-neutral-500)" }}>
            <p className="text-sm mb-2">Nenhum cron job configurado.</p>
            <p className="text-xs">Crie um acima e depois execute o SQL em supabase/migrations/cron_jobs.sql</p>
          </div>
        ) : (
          <div style={{ border: "2px solid var(--color-divider)" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--color-surface)", borderBottom: "2px solid var(--color-divider)" }}>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>#</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Seção</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Schedule</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Status</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Último run</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Próximo run</th>
                  <th className="text-left p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: "1px solid var(--color-divider)" }}>
                    <td className="p-2" style={{ color: "var(--color-neutral-500)" }}>{job.id}</td>
                    <td className="p-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>{job.secao}</td>
                    <td className="p-2" style={{ fontFamily: "monospace" }}>{job.schedule}</td>
                    <td className="p-2">
                      <span
                        className="px-2 py-0.5 text-xs"
                        style={{
                          background: job.enabled ? "#d4edda" : "#f8d7da",
                          color: job.enabled ? "#155724" : "#721c24",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                        }}
                      >
                        {job.enabled ? "ativo" : "pausado"}
                      </span>
                    </td>
                    <td className="p-2" style={{ color: "var(--color-neutral-500)" }}>{fmtDate(job.last_run_at)}</td>
                    <td className="p-2" style={{ color: "var(--color-neutral-500)" }}>{fmtDate(job.next_run_at)}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => handleToggle(job)}
                        className="px-2 py-0.5 text-xs font-bold"
                        style={{
                          background: job.enabled ? "#f8d7da" : "#d4edda",
                          color: job.enabled ? "#721c24" : "#155724",
                          border: "1px solid " + (job.enabled ? "#f5c6cb" : "#c3e6cb"),
                        }}
                      >
                        {job.enabled ? "Pausar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleRunNow(job)}
                        disabled={running === job.id}
                        className="px-2 py-0.5 text-xs font-bold"
                        style={{
                          background: "var(--color-accent)",
                          color: "#fff",
                          border: "1px solid var(--color-accent)",
                          opacity: running === job.id ? 0.6 : 1,
                        }}
                      >
                        {running === job.id ? "..." : "▶ Run now"}
                      </button>
                      <button
                        onClick={() => handleDelete(job)}
                        className="px-2 py-0.5 text-xs"
                        style={{
                          background: "transparent",
                          color: "var(--color-neutral-500)",
                          border: "1px solid var(--color-divider)",
                        }}
                      >
                        ✕
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
