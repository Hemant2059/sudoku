"use client";

import { useState, useCallback, useRef, useEffect, createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  message: string;
  type: "error" | "success" | "info";
}

interface ToastContextValue {
  toast: (message: string, type?: "error" | "success" | "info") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: "error" | "success" | "info" = "error") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-200 max-w-sm",
              t.type === "error" && "bg-red-600 text-white",
              t.type === "success" && "bg-emerald-600 text-white",
              t.type === "info" && "bg-zinc-800 text-white dark:bg-zinc-700",
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
