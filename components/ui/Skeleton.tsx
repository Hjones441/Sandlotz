export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-white/8 rounded-xl ${className}`}
    />
  )
}

export function ActivityCardSkeleton() {
  return (
    <div className="sz-card p-4 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-3 w-40 rounded-lg" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-16 rounded-lg" />
        <Skeleton className="h-3 w-10 rounded-lg" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="sz-card p-5 space-y-2">
      <Skeleton className="h-3 w-20 rounded-lg" />
      <Skeleton className="h-8 w-16 rounded-lg" />
    </div>
  )
}
