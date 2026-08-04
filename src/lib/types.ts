export interface AdminStats {
  total_articles: number;
  articles_today: number;
  articles_this_week: number;
  total_syncs: number;
  syncs_today: number;
  last_sync_at: string | null;
  coverage_pct: number;
}

export interface SyncRun {
  id: number;
  date_str: string;
  secao: string;
  status: string;
  articles_synced: number;
  articles_skipped: number;
  total_articles: number;
  triggered_by: string;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface CoverageItem {
  date: string;
  dou1: boolean;
  dou2: boolean;
  dou3: boolean;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  published_date: string;
  organ: string | null;
  section: string | null;
  edition: string | null;
  page: string | null;
  content: string;
  created_at: string;
}

export interface CronJob {
  id: number;
  secao: string;
  schedule: string;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}
