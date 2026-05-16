import React from "react";

type BadgeVariant = "default" | "info" | "success" | "warning" | "error" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-brand-primary text-content-inverse",
  info:    "bg-info-bg text-info border border-stroke-focus",
  success: "bg-success-bg text-success border border-success",
  warning: "bg-warning-bg text-warning border border-warning",
  error:   "bg-error-bg text-error border border-error",
  neutral: "bg-surface-item text-content-secondary border border-stroke-default",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-gilroy font-semibold text-xs",
        "px-2 py-0.5 rounded-sm",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
