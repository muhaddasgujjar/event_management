"use client";

import { Skeleton, QuoteRowSkeleton } from "@/components/ui/Skeleton";

export default function QuotesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="w-48 h-10 mb-2" />
        <Skeleton className="w-64 h-5" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-24 h-10 rounded-lg" />
        ))}
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-surface-2 flex">
          <Skeleton className="w-full h-4" />
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <QuoteRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
