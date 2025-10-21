import SearchResults from "@/components/SearchResults";
import SkeletonResult from "@/components/SkeletonResult";
import { Skeleton } from "@/components/ui/skeleton";

async function SearchResult({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q || "";

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-10 py-5 h-fit">
      <div className="flex w-full">
        <div className="flex justify-end w-full gap-5">
          <p className="font-bold text-white">Sort By</p>
        </div>
      </div>
      <div className="w-full mt-8">
        <SearchResults query={q} />
      </div>
    </div>
  );
}

export default SearchResult;
