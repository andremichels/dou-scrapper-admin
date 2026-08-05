// ── Color tokens — single source of truth ──

// Status colors
export const status = {
  success: { bg: "#d4edda", color: "#155724", border: "#c3e6cb" },
  error:   { bg: "#f8d7da", color: "#721c24", border: "#f5c6cb" },
  warning: { bg: "#fff3cd", color: "#856404", border: "#ffc107" },
  info:    { bg: "#d1ecf1", color: "#0c5460", border: "#bee5eb" },
  neutral: { bg: "#e2e3e5", color: "#383d41", border: "#ced4da" },
} as const;

// Action colors
export const primary = { bg: "#201e1d", color: "#fff", border: "#201e1d" } as const;
export const danger = { bg: "#dc3545", color: "#fff", border: "#dc3545" } as const;
export const ghost  = { bg: "transparent", color: "var(--color-neutral-600)", border: "var(--color-divider)" } as const;

// Terminal
export const terminal = { bg: "#1a1a2e", color: "#00ff88" } as const;

// ── Typography scale ──
export const text = {
  xs:   { fontSize: 11, lineHeight: "1.4" },
  sm:   { fontSize: 13, lineHeight: "1.5" },
  base: { fontSize: 15, lineHeight: "1.6" },
  lg:   { fontSize: 20, lineHeight: "1.3" },
  xl:   { fontSize: 28, lineHeight: "1.2" },
} as const;

// ── Spacing scale (multiples of 4px) ──
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
} as const;

// ── Status badge style helper ──
export function statusStyle(s: string) {
  switch (s) {
    case "completed": return status.success;
    case "failed": return status.error;
    case "running": return status.warning;
    case "cancelled": return status.neutral;
    default: return status.neutral;
  }
}
