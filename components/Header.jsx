"use client";

import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FaHistory, FaSearch } from "react-icons/fa";
import { dark } from "@clerk/themes";
import ShaderBackground from "./BackGround";
import Form from "next/form";
import { usePathname, useSearchParams } from "next/navigation";

function Header() {
  const { user } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSearchPage = pathname === "/search";

  // Track focus state for search input
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
    
      <header className="flex justify-between items-center p-15 py-15 h-16 font font-black bg-header-gradient text-white relative z-10">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          <Link href={"/"}>
            <p className="font-baloo text-3xl cursor-pointer">E-COMPARE</p>
          </Link>
        </div>

        {/* CENTER SEARCH BAR */}
        <div className="justify-center flex w-[40%] min-w-[300px] relative">
          {isSearchPage && (
            <Form className="relative flex-[22] flex justify-center items-center">
              <input
                name="q"
                type="text"
                placeholder="Search"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`glass-search w-full h-[48px] rounded-2xl text-white placeholder-white/50 text-[16px] font-normal transition-all duration-300 bg-white/5 border border-white/20 focus:border-white/50  ${
                  isFocused ? "pl-12" : "pl-6 "
                }`}
              />

              {/* Magnifying Glass for search bar - slides in/out when focused */}
              <FaMagnifyingGlass
                className={`absolute left-[16px] top-1/2 -translate-y-1/2 text-white/70 text-[16px] transition-all duration-300 ${
                  isFocused
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-3"
                }`}
              />

              {/* Search button - slides in/out when focused */}
              <div className="flex-[1] h-[48px] search-button flex items-center justify-center rounded-r-2xl px-6"> 
                <button type="submit"> <FaSearch className="text-white " /> </button> </div> 
            </Form>
          )}
          
        </div>
         

        {/* RIGHT SIDE */}
        <div className="flex justify-center items-center gap-5">
          <SignedOut>
            <Link href="/sign-in">
              <button className="font-normal text-[24px] text-white font-vagRounded">
                Login
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="font-normal text-[24px] text-white font-vagRounded">
                Sign Up
              </button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{ baseTheme: dark }}>
              <UserButton.UserProfilePage
                appearance={{ baseTheme: dark }}
                label="History"
                url="custom-history"
                labelIcon={<FaHistory size={16} />}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Activity History</h2>
                </div>
              </UserButton.UserProfilePage>
            </UserButton>
          </SignedIn>
        </div>
      </header>
    </>
  );
}

export default Header;
