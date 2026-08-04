import { AdminStats, SyncRun, CoverageItem } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://editalis-api.smartpeople.us";

export async function fetchStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/api/v1/admin/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchSyncs(limit = 50, offset = 0): Promise<SyncRun[]> {
  const res = await fetch(`${API_BASE}/api/v1/admin/syncs?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch syncs");
  return res.json();
}

export async function fetchCoverage(days = 30): Promise<CoverageItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/admin/coverage?days=${days}`);
  if (!res.ok) throw new Error("Failed to fetch coverage");
  return res.json();
}

export async function triggerSync(date: string, secao: string): Promise<{ run_id: number }> {
  const res = await fetch(`${API_BASE}/api/v1/sync?date=${date}&secao=${secao}`, { method: "POST" });
  if (res.status === 409) {
    const body = await res.json();
    throw new Error(body.detail || "Já existe um sync em execução");
  }
  if (!res.ok) throw new Error("Failed to trigger sync");
  return res.json();
}

export async function fetchSyncStatus(runId: number): Promise<SyncRun> {
  const res = await fetch(`${API_BASE}/api/v1/admin/sync-status/${runId}`);
  if (!res.ok) throw new Error("Failed to fetch sync status");
  return res.json();
}

export async function stopSync(runId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/sync-stop/${runId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to stop sync");
}

// ── Cron jobs ──

import type { CronJob } from "./types";

export async function fetchCronJobs(): Promise<CronJob[]> {
  const res = await fetch(`${API_BASE}/api/v1/admin/cron`);
  if (!res.ok) throw new Error("Failed to fetch cron jobs");
  return res.json();
}

export async function createCronJob(secao: string, schedule: string): Promise<CronJob> {
  const res = await fetch(`${API_BASE}/api/v1/admin/cron`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secao, schedule, enabled: true }),
  });
  if (!res.ok) throw new Error("Failed to create cron job");
  return res.json();
}

export async function updateCronJob(id: number, data: { secao?: string; schedule?: string; enabled?: boolean }): Promise<CronJob> {
  const res = await fetch(`${API_BASE}/api/v1/admin/cron/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update cron job");
  return res.json();
}

export async function deleteCronJob(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/cron/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete cron job");
}

export async function triggerCronNow(id: number): Promise<{ triggered: boolean; id: number; secao: string; date: string }> {
  const res = await fetch(`${API_BASE}/api/v1/admin/cron/${id}/run`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger cron job");
  return res.json();
}
