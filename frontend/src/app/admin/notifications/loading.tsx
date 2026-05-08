"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <Skeleton className="w-48 h-10 mb-2" />
          <Skeleton className="w-64 h-5" />
        </div>
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface-2 border border-white/5 p-4 rounded-xl flex gap-4">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-3/4 h-5" />
              <Skeleton className="w-1/4 h-4" />
            </div>
            <Skeleton className="w-20 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
