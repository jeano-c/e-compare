import React from "react";
import { Skeleton } from "./ui/skeleton";

function CompareSkeleton() {
  return (
    <>
      {" "}
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-[500px] rounded-2xl" />
      ))}
    </>
  );
}

export default CompareSkeleton;
