"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  className = "",
  wrapperClassName = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-1.5 w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-gilroy font-semibold text-small text-content-primary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "font-gilroy text-body bg-surface-card text-content-primary",
          "border border-stroke-default px-4 py-ds-2.5 outline-none w-full rounded-md",
          "placeholder:text-content-secondary placeholder:font-normal",
          "focus:border-stroke-focus transition-colors duration-150",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          error ? "border-stroke-error focus:border-error" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && (
        <p className="text-error text-small font-gilroy flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-content-secondary text-small font-gilroy">{hint}</p>
      )}
    </div>
  );
}
