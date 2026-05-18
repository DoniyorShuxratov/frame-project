interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-white/[0.06] rounded-md ${className}`} />
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-[#1e293b] border border-white/10 rounded-xl p-5 space-y-3 ${className}`}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-t border-white/5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32 flex-1" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
