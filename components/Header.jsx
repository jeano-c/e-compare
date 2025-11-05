"use client";
import { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";
import { dark } from "@clerk/themes";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { FaHeart } from "react-icons/fa";
import dynamic from "next/dynamic";
import History from "./History";
import UserLikes from "./UserLikes";
import { useClerk } from "@clerk/nextjs";

function Header({ visible = false }) {
  const { openUserProfile } = useClerk();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSearchPage = pathname === "/search";
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };
  if (visible) return null; // 👈 Hide header entirely when not visible

  return (
    <>
      <header className="flex justify-between items-center pl-13 pr-10 py-15 h-16 font font-black bg-header-gradient text-white relative z-10">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4 font-baloo text-[24px]" >
          E-COMPARE
        </div>

        {/* CENTER SEARCH BAR */}
        <div className="justify-center flex w-[40%] min-w-[300px] relative">
          {isSearchPage && (
            <form
              onSubmit={handleSearch}
              className="relative flex-[22] flex justify-center items-center"
            >
              <input
                name="q"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`glass-search w-full h-[48px] rounded-2xl text-white placeholder-white/50 text-[16px] font-normal transition-all duration-300 bg-white/5 border border-white/20 focus:border-white/50  ${
                  isFocused ? "pl-12" : "pl-6 "
                }`}
              />

              <FaMagnifyingGlass
                className={`absolute left-[16px] top-1/2 -translate-y-1/2 text-white/70 text-[16px] transition-all duration-300 ${
                  isFocused
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-3"
                }`}
              />

              <div className="flex-[1] h-[48px] search-button flex items-center justify-center rounded-r-2xl px-6">
                <button type="submit">
                  <FaMagnifyingGlass className="text-white/70 text-lg" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex justify-center items-center gap-1">
          <SignedOut>
            <Link href="/sign-in">
              <button className="font-normal text-lg text-white font-vagRounded cursor-pointer rounded-full px-5 py-3 hover:bg-white/10 ease duration-500">
                Login
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="font-normal text-lg text-white font-vagRounded cursor-pointer rounded-full px-5 py-3 hover:bg-white/10 ease duration-500">
                Sign Up
              </button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{}}>
              <UserButton.UserProfilePage
                label="History"
                url="custom-history"
                labelIcon={<FaHistory size={16} />}
              >
                <div className="p-6">
                  <h2 className="text-xl text-center font-bold mb-4">
                    Activity History
                  </h2>
                </div>
                <History />
              </UserButton.UserProfilePage>

              <UserButton.UserProfilePage
                label="User likes"
                url="custom-likes"
                labelIcon={<FaHeart size={16} />}
              >
                <UserLikes />
              </UserButton.UserProfilePage>
            </UserButton>
          </SignedIn>
        </div>
      </header>
    </>
  );
}
export default dynamic(() => Promise.resolve(Header), {
  ssr: false,
});
