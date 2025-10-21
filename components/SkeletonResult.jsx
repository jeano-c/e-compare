import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
function SkeletonResult() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-[300px] rounded-2xl" />
      ))}
    </>
  );
}

export default SkeletonResult;
