import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
function SkeletonResult() {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-[300px] rounded-2xl" />
        ))}
      </div>
    </>
  );
}

export default SkeletonResult;
