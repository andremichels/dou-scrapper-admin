"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveSync } from "@/lib/useActiveSync";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◫" },
  { href: "/admin/syncs", label: "Sync History", icon: "↻" },
  { href: "/admin/sync", label: "Manual Sync", icon: "▶" },
  { href: "/admin/cron", label: "Cron Jobs", icon: "⏱" },
  { href: "/admin/coverage", label: "Coverage", icon: "▦" },
  { href: "/admin/articles", label: "Articles", icon: "☰" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  // Exact match or sub-route (e.g. /admin/articles/123)
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const { active, status } = useActiveSync();

  const isRunning = active && status && status.status === "running";

  return (
    <>
      <aside
        className="w-56 shrink-0 flex flex-col hidden md:flex"
        style={{
          borderRight: "2px solid var(--color-divider)",
          background: "var(--color-surface)",
        }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "2px solid var(--color-divider)" }}
        >
          <h1
            className="text-sm tracking-tight"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              color: "var(--color-text)",
            }}
          >
            DOU Admin
          </h1>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-5 py-2 text-sm transition-colors relative"
                style={{
                  color: active ? "var(--color-accent)" : "var(--color-neutral-600)",
                  fontWeight: active ? 800 : 400,
                  borderLeft: active ? "3px solid var(--color-accent)" : "3px solid transparent",
                }}
              >
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
                {item.href === "/admin/sync" && isRunning && (
                  <span
                    className="ml-auto w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "var(--color-accent)" }}
                    title={`Sync em execução: ${active?.dateStr} (${active?.secao}) — ${status?.articles_synced || 0} artigos`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Progress widget — fixed bottom, clickable */}
      {isRunning && (
        <Link
          href="/admin/sync"
          className="fixed z-40 flex items-center gap-3 px-4 py-3 shadow-lg cursor-pointer"
          style={{
            bottom: 16,
            left: 240, // sidebar width + gap
            background: "var(--color-accent)",
            color: "#fff",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: 13,
          }}
          aria-live="polite"
          aria-label="Sincronização em andamento"
        >
          <span
            className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
          <span>Sincronização em andamento</span>
          <span className="font-extrabold">{status?.articles_synced || 0} artigos</span>
        </Link>
      )}
    </>
  );
}
