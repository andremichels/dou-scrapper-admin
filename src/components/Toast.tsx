"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        style={{ maxWidth: "360px" }}
      >
        {toasts.map((t) => {
          const bg =
            t.type === "success" ? "#d4edda" :
            t.type === "error" ? "#f8d7da" : "#d1ecf1";
          const color =
            t.type === "success" ? "#155724" :
            t.type === "error" ? "#721c24" : "#0c5460";
          const border =
            t.type === "success" ? "#c3e6cb" :
            t.type === "error" ? "#f5c6cb" : "#bee5eb";
          return (
            <div
              key={t.id}
              className="px-4 py-2.5 text-sm"
              style={{
                background: bg,
                color,
                border: `1px solid ${border}`,
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                animation: "fadeIn 0.2s ease",
              }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
