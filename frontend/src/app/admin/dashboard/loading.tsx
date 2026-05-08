"use client";

import { StatCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="w-48 h-10 mb-2" />
        <Skeleton className="w-64 h-5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="w-full h-80 rounded-2xl" />
          <Skeleton className="w-full h-64 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="w-full h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
