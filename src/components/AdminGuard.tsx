"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "authorized" | "denied">("loading");
  const [debug, setDebug] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );

    supabase.auth.getUser().then(({ data: authData, error: authError }) => {
      const info: any = {};
      
      if (authError) {
        info.authError = authError.message;
      }
      
      if (!authData.user) {
        info.noUser = true;
        setDebug(info);
        router.push("/login");
        return;
      }

      info.userId = authData.user.id;
      info.userEmail = authData.user.email;

      supabase
        .from("admin_users")
        .select("*")
        .then(({ data, error, status }) => {
          info.queryStatus = status;
          info.rowCount = data?.length ?? 0;
          info.rows = data;
          if (error) {
            info.queryError = error.message;
            info.queryErrorCode = (error as any).code;
          }
          
          console.log("AdminGuard debug:", info);
          setDebug(info);

          if (error || !data || data.length === 0) {
            setState("denied");
          } else {
            setState("authorized");
          }
        });
    });
  }, [router]);

  if (state === "loading") {
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

  if (state === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--color-bg)" }}>
        <div className="max-w-md w-full p-6 space-y-4" style={{ border: "2px solid var(--color-divider)", background: "var(--color-surface)" }}>
          <h1 className="text-lg" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-accent)" }}>
            Acesso negado (debug)
          </h1>
          <div className="text-xs space-y-2 font-mono" style={{ color: "var(--color-neutral-600)", wordBreak: "break-all" }}>
            <div><strong>User ID:</strong> {debug.userId || "—"}</div>
            <div><strong>Email:</strong> {debug.userEmail || "—"}</div>
            <div><strong>Query status:</strong> {debug.queryStatus ?? "—"}</div>
            <div><strong>Rows found:</strong> {debug.rowCount ?? "—"}</div>
            <div><strong>Query error:</strong> {debug.queryError || "—"}</div>
            <div><strong>Error code:</strong> {debug.queryErrorCode || "—"}</div>
            <div><strong>Auth error:</strong> {debug.authError || "—"}</div>
            <div><strong>Rows:</strong> <pre className="text-[10px] mt-1">{JSON.stringify(debug.rows, null, 2)}</pre></div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 text-sm font-bold"
            style={{ background: "var(--color-accent)", color: "#fff", border: "none", fontFamily: "var(--font-heading)" }}
          >
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
