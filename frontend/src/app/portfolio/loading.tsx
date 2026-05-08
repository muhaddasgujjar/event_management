"use client";

import { Skeleton, PortfolioCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-surface border-b border-white/5 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-6" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-24 h-10 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PortfolioCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
