"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export const STATUS_OPTIONS = [
  { value: "pending",    color: "#F59E0B", label: "Pending" },
  { value: "processing", color: "#3B82F6", label: "Processing" },
  { value: "shipped",    color: "#8B5CF6", label: "Shipped" },
  { value: "delivered",  color: "#10B981", label: "Delivered" },
  { value: "cancelled",  color: "#EF4444", label: "Cancelled" },
] as const;

const STATUS_MAP = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, { color: o.color, label: o.label }])
);

export function StatusSelect({
  value,
  onChange,
  compact = false,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = STATUS_MAP[value] ?? { color: "#9CA3AF", label: value };

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
    <div ref={ref} className="relative">
      <style>{`
        @keyframes statusDropdownIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .status-dropdown-menu { animation: statusDropdownIn 150ms ease-out; }
      `}</style>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        style={{
          background: "#0A0A0A",
          border: `1px solid ${open ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)"}`,
          borderRadius: 10,
          transition: "border-color 150ms",
        }}
        className={[
          "flex items-center gap-2 font-gilroy font-medium text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm w-full",
        ].join(" ")}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.color }}
        />
        <span className="flex-1 text-left capitalize">{cfg.label}</span>
        <ChevronDown
          size={compact ? 12 : 14}
          className={[
            "text-white/40 transition-transform duration-150",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      {open && (
        <div
          className="status-dropdown-menu absolute z-50 mt-1 py-1.5 min-w-[150px]"
          style={{
            background: "#0A0A0A",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            right: compact ? 0 : undefined,
            left: compact ? undefined : 0,
          }}
        >
          {STATUS_OPTIONS.map(({ value: key, color, label }) => {
            const isSelected = value === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => { onChange(key); setOpen(false); }}
                className="flex items-center gap-2.5 font-gilroy text-sm mx-1.5 transition-colors"
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
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
