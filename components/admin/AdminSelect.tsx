"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface AdminSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  className?: string;
  disabled?: boolean;
}

export function AdminSelect({
  value,
  onChange,
  options,
  className = "",
  disabled = false,
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="flex items-center gap-2 w-full h-10 px-3 font-gilroy text-sm text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        style={{
          background: "rgba(0,0,0,0.4)",
          border: `1px solid ${open ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)"}`,
          borderRadius: 10,
          transition: "border-color 150ms",
        }}
      >
        <span className="flex-1 text-left truncate">{current?.label ?? value}</span>
        <ChevronDown
          size={14}
          className={`text-white/40 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full py-1.5"
          style={{
            background: "#0A0A0A",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            minWidth: "100%",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="flex items-center w-full font-gilroy text-sm transition-colors mx-1.5"
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  width: "calc(100% - 12px)",
                  background: isSelected ? "rgba(27,156,252,0.15)" : undefined,
                  color: isSelected ? "#1B9CFC" : "white",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.background = "";
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
