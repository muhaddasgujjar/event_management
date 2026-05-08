"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="pt-20">
      <div className="bg-surface border-b border-white/5 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-20 space-y-32">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex flex-col ${i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"} gap-12 items-center`}>
            <Skeleton className="w-full md:w-1/2 aspect-[4/3] rounded-2xl" />
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <Skeleton className="w-3/4 h-10" />
              <Skeleton className="w-full h-6" />
              <Skeleton className="w-full h-24" />
              <Skeleton className="w-40 h-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
