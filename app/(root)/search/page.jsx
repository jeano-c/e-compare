"use client";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import SearchResults from "@/components/SearchResults";
import SkeletonResult from "@/components/SkeletonResult";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

function SearchResult() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const options = ["Best Match", "Top Sales", "Price: Low to High", "Price: High to Low"];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleSelect = (option) => setSelectedOption(option.value || option);

  // Old layout attempt (kept for reference)
  /*
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen">
      <div className="flex items-center justify-center w-full">
        <div className="p-10 flex justify-end w-full text-white">
  );
  */

  // Separate component to use useSearchParams inside Suspense
  /*
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
  }
  */

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
            className="w-[200px] text-sm font-vagRounded"
            controlClassName="Dropdown-control"
            menuClassName="Dropdown-menu"
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

export default SearchResult;
