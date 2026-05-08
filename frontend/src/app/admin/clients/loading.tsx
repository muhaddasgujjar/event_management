"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="w-48 h-10 mb-2" />
        <Skeleton className="w-64 h-5" />
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-white/5 bg-surface-2">
          <Skeleton className="w-full h-4" />
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center py-4 px-6 gap-4">
              <Skeleton className="w-1/4 h-4" />
              <Skeleton className="w-1/4 h-4" />
              <Skeleton className="w-1/4 h-4" />
              <Skeleton className="w-1/4 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
