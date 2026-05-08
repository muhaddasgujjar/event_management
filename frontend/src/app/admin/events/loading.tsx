"use client";

import { Skeleton, EventCardSkeleton } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <Skeleton className="w-48 h-10 mb-2" />
          <Skeleton className="w-64 h-5" />
        </div>
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      <div className="flex gap-2 bg-surface-2 p-1 rounded-xl w-fit">
        <Skeleton className="w-24 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
