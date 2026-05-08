"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function EquipmentLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <Skeleton className="w-48 h-10 mb-2" />
          <Skeleton className="w-64 h-5" />
        </div>
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="w-full h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
