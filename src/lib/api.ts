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

export async function triggerSync(date: string, secao: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/sync?date=${date}&secao=${secao}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to trigger sync");
}
