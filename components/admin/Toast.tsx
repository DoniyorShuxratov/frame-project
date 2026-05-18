"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error" | "info" | "warning";
}

interface ToastContextType {
  toast: (opts: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const VARIANT_CONFIG = {
  success: { icon: CheckCircle,   border: "border-green-500/30",  bg: "bg-green-500/10",  icon_cls: "text-green-400" },
  error:   { icon: AlertCircle,   border: "border-red-500/30",    bg: "bg-red-500/10",    icon_cls: "text-red-400" },
  warning: { icon: AlertTriangle, border: "border-yellow-500/30", bg: "bg-yellow-500/10", icon_cls: "text-yellow-400" },
  info:    { icon: Info,          border: "border-blue-500/30",   bg: "bg-blue-500/10",   icon_cls: "text-blue-400" },
};

function Toast({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const cfg = VARIANT_CONFIG[item.variant ?? "info"];
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), 4500);
    return () => clearTimeout(t);
  }, [item.id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.border} ${cfg.bg} bg-[#1e293b] shadow-xl min-w-[300px] max-w-[380px]`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.icon_cls}`} />
      <div className="flex-1 min-w-0">
        <p className="font-gilroy font-semibold text-small text-white">{item.title}</p>
        {item.description && (
          <p className="font-gilroy text-small text-white/55 mt-0.5 leading-snug">{item.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="text-white/30 hover:text-white transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((opts: Omit<ToastItem, "id">) => {
    setToasts((prev) => [
      ...prev,
      { ...opts, id: Math.random().toString(36).slice(2) },
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast item={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
