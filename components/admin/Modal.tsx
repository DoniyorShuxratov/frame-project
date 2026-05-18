"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZE: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${SIZE[size]} border border-white/10 rounded-xl shadow-2xl`}
        style={{ background: "#0A0A0A" }}
      >
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="font-gilroy font-semibold text-white" style={{ fontSize: 18 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/[0.15]"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-7 py-7">{children}</div>
      </div>
    </div>
  );
}
