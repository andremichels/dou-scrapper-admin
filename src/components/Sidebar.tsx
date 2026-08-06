"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveSync } from "@/lib/useActiveSync";
import { status as statusColors } from "@/lib/colors";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/syncs", label: "Sync History" },
  { href: "/admin/sync", label: "Manual Sync" },
  { href: "/admin/cron", label: "Cron Jobs" },
  { href: "/admin/coverage", label: "Coverage" },
  { href: "/admin/articles", label: "Articles" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  // /admin must match exactly — not /admin/syncs etc.
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { active, status } = useActiveSync();
  const isRunning = active && status && status.status === "running";

  return (
    <>
      <div className="px-5 py-4" style={{ borderBottom: "2px solid var(--color-divider)" }}>
        <h1 className="text-sm tracking-tight" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
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
              onClick={onNavigate}
              className="flex items-center gap-3 px-5 py-2 text-sm transition-colors"
              style={{
                color: active ? "var(--color-accent)" : "var(--color-neutral-600)",
                fontWeight: active ? 800 : 400,
                borderLeft: active ? "3px solid var(--color-accent)" : "3px solid transparent",
                textDecoration: "none",
              }}
            >
              {item.label}
              {item.href === "/admin/sync" && isRunning && (
                <span className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--color-accent)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-3" style={{ borderTop: "2px solid var(--color-divider)" }}>
        <button
          onClick={async () => {
            const { createBrowserClient } = await import("@supabase/ssr");
            const sb = createBrowserClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_KEY!
            );
            await sb.auth.signOut();
            window.location.href = "/login";
          }}
          className="text-xs font-bold w-full text-left"
          style={{ color: "var(--color-neutral-500)" }}
        >
          Sair
        </button>
      </div>

      {isRunning && (
        <div className="px-5 py-2 border-t" style={{ borderTop: "2px solid var(--color-divider)" }}>
          <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
            {active?.dateStr} ({active?.secao})
          </p>
          <p className="text-xs" style={{ color: "var(--color-accent)", fontFamily: "var(--font-heading)", fontWeight: 800 }}>
            {status?.articles_synced || 0} artigos
          </p>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const { active, status } = useActiveSync();
  const isRunning = active && status && status.status === "running";

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 px-3 py-2 text-sm font-bold"
        style={{ background: "var(--color-accent)", color: "#fff", border: "none" }}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* Overlay — mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="w-56 h-full flex flex-col overflow-y-auto"
            style={{
              borderRight: "2px solid var(--color-divider)",
              background: "var(--color-surface)",
            }}
          >
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-56 shrink-0 flex-col"
        style={{
          borderRight: "2px solid var(--color-divider)",
          background: "var(--color-surface)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Progress widget — fixed bottom */}
      {isRunning && (
        <Link
          href="/admin/sync"
          className="fixed z-30 flex items-center gap-3 px-4 py-3 shadow-lg cursor-pointer"
          style={{
            bottom: 16,
            left: "clamp(16px, 240px, 240px)",
            background: "var(--color-accent)",
            color: "#fff",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: 13,
          }}
          aria-live="polite"
          aria-label="Sincronização em andamento"
        >
          <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Sincronização em andamento</span>
          <span className="font-extrabold">{status?.articles_synced || 0} artigos</span>
        </Link>
      )}
    </>
  );
}
