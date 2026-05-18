interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: "Pending",    className: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25" },
  processing: { label: "Processing", className: "bg-blue-500/15 text-blue-400 border border-blue-500/25" },
  shipped:    { label: "Shipped",    className: "bg-purple-500/15 text-purple-400 border border-purple-500/25" },
  delivered:  { label: "Delivered",  className: "bg-green-500/15 text-green-400 border border-green-500/25" },
  cancelled:  { label: "Cancelled",  className: "bg-red-500/15 text-red-400 border border-red-500/25" },
  paid:       { label: "Paid",       className: "bg-green-500/15 text-green-400 border border-green-500/25" },
  unpaid:     { label: "Unpaid",     className: "bg-red-500/15 text-red-400 border border-red-500/25" },
  active:     { label: "Active",     className: "bg-green-500/15 text-green-400 border border-green-500/25" },
  draft:      { label: "Draft",      className: "bg-white/10 text-white/50 border border-white/15" },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status,
    className: "bg-white/10 text-white/50 border border-white/15",
  };
  return (
    <span
      className={[
        "inline-flex items-center font-gilroy font-semibold rounded-full capitalize",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-small px-2.5 py-1",
        cfg.className,
      ].join(" ")}
    >
      {cfg.label}
    </span>
  );
}
