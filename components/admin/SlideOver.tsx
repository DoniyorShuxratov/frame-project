"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

const WIDTH: Record<string, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function SlideOver({ open, onClose, title, children, width = "lg" }: SlideOverProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full ${WIDTH[width]} border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "#0A0A0A" }}
      >
        <div
          className="flex items-center justify-between px-7 py-5 flex-shrink-0"
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
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
