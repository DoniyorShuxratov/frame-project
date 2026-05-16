"use client";

import React from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-primary text-content-inverse border border-brand-primary " +
    "hover:bg-brand-light hover:border-brand-light active:opacity-90",
  secondary:
    "bg-surface-item text-content-primary border border-stroke-default " +
    "hover:bg-[#e8e8e8] active:bg-[#dedede]",
  outline:
    "bg-transparent text-brand-primary border border-brand-primary " +
    "hover:bg-brand-primary hover:text-content-inverse active:opacity-90",
  ghost:
    "bg-transparent text-content-primary border border-transparent " +
    "hover:bg-surface-item",
  danger:
    "bg-error text-content-inverse border border-error " +
    "hover:opacity-90 active:opacity-80",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-small gap-1.5",
  md: "px-5 py-2.5 text-body gap-2",
  lg: "px-ds-6 py-ds-3 text-body-lg gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-gilroy font-semibold",
        "rounded-md transition-all duration-150 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
