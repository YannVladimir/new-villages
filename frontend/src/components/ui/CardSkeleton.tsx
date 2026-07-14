import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}
