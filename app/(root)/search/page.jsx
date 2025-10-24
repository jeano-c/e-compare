"use client";

import { useState } from "react";
import SearchResults from "@/components/SearchResults";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

function SearchResult({ searchParams }) {
  const q = searchParams?.q || "";

  const options = [
    "Best Match",
    "Top Sales",
    "Price: Low to High",
    "Price: High to Low",
  ];
  const [selectedOption, setSelectedOption] = useState(options[0]);

  const handleSelect = (option) => {
    setSelectedOption(option.value);
    // You can pass this to SearchResults if needed
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen h-fit">
      <div className="px-10 mt-10 items-center justify-center flex w-full">
        <div className=" flex justify-end w-full  text-white">
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
      <div className="w-full pd ">
        <SearchResults query={q} sortBy={selectedOption} />
      </div>
    </div>
  );
}

export default SearchResult;
