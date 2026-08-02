"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◫" },
  { href: "/admin/syncs", label: "Sync History", icon: "↻" },
  { href: "/admin/sync", label: "Manual Sync", icon: "▶" },
  { href: "/admin/coverage", label: "Coverage", icon: "▦" },
  { href: "/admin/articles", label: "Articles", icon: "☰" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className="w-56 shrink-0 flex flex-col"
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
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-5 py-2 text-sm transition-colors"
            style={{
              color: isActive(item.href)
                ? "var(--color-accent)"
                : "var(--color-neutral-600)",
              fontWeight: isActive(item.href) ? 800 : 400,
              borderLeft: isActive(item.href)
                ? "3px solid var(--color-accent)"
                : "3px solid transparent",
            }}
          >
            <span className="w-4 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
