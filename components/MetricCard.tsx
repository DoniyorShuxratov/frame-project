import React from "react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

export function MetricCard({ title, value, change, changeType, icon }: MetricCardProps) {
  const changeColor =
    changeType === "up"   ? "text-success"
    : changeType === "down" ? "text-error"
    : "text-content-secondary";

  const changeBg =
    changeType === "up"   ? "bg-success-bg"
    : changeType === "down" ? "bg-error-bg"
    : "bg-surface-item";

  return (
    <div className="bg-surface-card border border-stroke-default rounded-xl p-ds-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-label font-gilroy font-semibold text-content-secondary uppercase tracking-widest">
            {title}
          </p>
          <p className="text-h2 font-gilroy font-bold text-content-primary mt-ds-1.5">
            {value}
          </p>
          <div className={`inline-flex items-center gap-1 mt-ds-1.5 px-2 py-0.5 rounded-sm ${changeBg}`}>
            {changeType === "up" && (
              <svg className={`w-3 h-3 ${changeColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {changeType === "down" && (
              <svg className={`w-3 h-3 ${changeColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span className={`text-xs font-gilroy font-semibold ${changeColor}`}>
              {change}
            </span>
          </div>
        </div>
        <div className="w-11 h-11 flex items-center justify-center bg-brand-bg text-brand-primary rounded-lg flex-shrink-0 ml-3">
          {icon}
        </div>
      </div>
    </div>
  );
}
