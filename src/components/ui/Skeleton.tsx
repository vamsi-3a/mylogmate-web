import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

/** Single shimmer bar. Combine multiple for skeleton layouts. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-full',
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
        'dark:from-surface-3 dark:via-[#2A2A2A] dark:to-surface-3',
        '[background-size:400%_100%]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

/** Card-shaped skeleton for log/session list items */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-card-lg border border-gray-200 dark:border-[#2A2A2A] p-5',
        className,
      )}
    >
      <div className="flex gap-3 mb-3">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
      <Skeleton className="h-4 w-full rounded mb-2" />
      <Skeleton className="h-4 w-5/6 rounded mb-2" />
      <Skeleton className="h-4 w-3/4 rounded" />
    </div>
  );
}

/** Metric card skeleton (for admin) */
export function MetricSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-card-lg border border-gray-200 dark:border-[#2A2A2A] p-5',
        'flex flex-col gap-3',
        className,
      )}
    >
      <Skeleton className="h-3 w-2/5 rounded" />
      <Skeleton className="h-7 w-3/5 rounded" />
      <Skeleton className="h-3 w-2/5 rounded" />
    </div>
  );
}
