"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSyncStatus } from "./api";
import { SyncRun } from "./types";

const STORAGE_KEY = "dou_active_sync";

export interface ActiveSync {
  runId: number;
  dateStr: string;
  secao: string;
  startedAt: string;
}

export function getActiveSync(): ActiveSync | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveSync(sync: ActiveSync | null) {
  if (sync) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sync));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function useActiveSync() {
  const [active, setActive] = useState<ActiveSync | null>(null);
  const [status, setStatus] = useState<SyncRun | null>(null);

  // Init from sessionStorage
  useEffect(() => {
    const stored = getActiveSync();
    if (stored) {
      setActive(stored);
      // Check if it's still running
      fetchSyncStatus(stored.runId).then((s) => {
        setStatus(s);
        if (s.status === "completed" || s.status === "failed") {
          setActiveSync(null);
          setActive(null);
        }
      }).catch(() => {});
    }
  }, []);

  // Poll while active
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(async () => {
      try {
        const s = await fetchSyncStatus(active.runId);
        setStatus(s);
        if (s.status === "completed" || s.status === "failed") {
          // Keep for 30s then clear
          setTimeout(() => {
            setActiveSync(null);
            setActive(null);
          }, 30000);
          clearInterval(interval);
        }
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [active?.runId]);

  const start = useCallback((sync: ActiveSync) => {
    setActiveSync(sync);
    setActive(sync);
  }, []);

  const clear = useCallback(() => {
    setActiveSync(null);
    setActive(null);
  }, []);

  return { active, status, start, clear };
}
