"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }

      // Exact pattern that worked: select * (no filter), check data exists
      supabase
        .from("admin_users")
        .select("*")
        .then(({ data: rows, error }) => {
          if (error || !rows || rows.length === 0) {
            router.push("/unauthorized");
          } else {
            setAuthorized(true);
          }
          setLoading(false);
        });
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="space-y-3 w-64">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
