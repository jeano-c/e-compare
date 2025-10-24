"use client";

import { Suspense } from "react";
import SearchResults from "@/components/SearchResults";
import SkeletonResult from "@/components/SkeletonResult";
import Dropdown from "react-dropdown";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import "react-dropdown/style.css";

// Separate component to use useSearchParams inside Suspense
function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const options = [
    "Best Match",
    "Top Sales",
    "Price: Low to High",
    "Price: High to Low",
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleSelect = (option) => {
    setSelectedOption(option.value);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen h-fit">
      <div className="px-10 mt-10 items-center justify-center flex w-full">
        <div className="flex justify-end w-full text-white">
          <div className="font-vagRounded py-1 text-[16px] text-white">
            <p>Sort by:</p>
          </div>
          <Dropdown
            options={options}
            onChange={handleSelect}
            value={selectedOption}
            placeholder="Select an option"
            className="w-[200px] text-sm font-vagRounded"
            controlClassName="Dropdown-control"
            menuClassName="bg-transparent text-white backdrop-blur-md"
            arrowClassName="text-white"
          />
        </div>
      </div>
      <div className="w-full">
        <SearchResults query={q} sortBy={selectedOption} />
      </div>
    </div>
  );
}

function SearchResult() {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="px-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 pt-20">
            <SkeletonResult />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

export default SearchResult;