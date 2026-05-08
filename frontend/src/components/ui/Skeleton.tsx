export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface-2 animate-pulse rounded-md ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-surface border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <Skeleton className="w-16 h-10" />
    </div>
  );
}

export function QuoteRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-4 border-b border-white/5 w-full">
      <Skeleton className="w-10 h-4" />
      <Skeleton className="flex-1 h-4" />
      <Skeleton className="w-32 h-4" />
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-24 h-6 rounded-full" />
      <Skeleton className="w-24 h-4" />
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-surface border border-white/5 p-5 rounded-xl flex flex-col gap-3">
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-full h-4 mt-2" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="w-24 h-6 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}

export function PortfolioCardSkeleton() {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden flex flex-col h-80">
      <Skeleton className="w-full h-48 rounded-none" />
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton className="w-3/4 h-6" />
        <Skeleton className="w-full h-4 flex-grow" />
      </div>
    </div>
  );
}
