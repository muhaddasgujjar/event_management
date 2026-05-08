"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function FinanceLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="w-56 h-10 mb-2" />
        <Skeleton className="w-80 h-5" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-36 h-10 rounded-xl" />)}
      </div>
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 bg-surface-2">
          <Skeleton className="w-full h-4" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center py-4 px-4 gap-4 border-b border-white/5">
            <Skeleton className="w-1/5 h-4" />
            <Skeleton className="w-1/5 h-4" />
            <Skeleton className="w-1/5 h-4" />
            <Skeleton className="w-1/5 h-4" />
            <Skeleton className="w-1/5 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
