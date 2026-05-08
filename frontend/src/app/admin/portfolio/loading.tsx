"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function PortfolioLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="w-40 h-10 mb-2" />
        <Skeleton className="w-72 h-5" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-2xl overflow-hidden bg-surface border border-white/5">
            <Skeleton className="w-full aspect-video" />
            <div className="p-4 space-y-2">
              <Skeleton className="w-3/4 h-5" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
