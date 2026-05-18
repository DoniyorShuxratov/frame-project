import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-white/20" />
      </div>
      <h3 className="font-gilroy font-semibold text-h5 text-white mb-1.5">{title}</h3>
      {description && (
        <p className="font-gilroy text-small text-white/40 mb-6 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
