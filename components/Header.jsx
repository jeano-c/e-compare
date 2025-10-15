"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";
import { dark } from "@clerk/themes";
import ShaderBackground from "./BackGround";
import Form from "next/form";
import { usePathname, useSearchParams } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";

function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSearchPage = pathname === "/search";

  // Get the search query from the URL
  const query = searchParams.get("q") || "";

  // Local state for the input
  const [search, setSearch] = useState(query);

  // Update input if URL changes
  useEffect(() => {
    setSearch(query);
  }, [query]);

  return (
    <>
      <header className=" flex justify-between items-center p-10 py-15 gap-4 h-16 font-vagRounded font-light bg-header-gradient text-white relative z-10">
        <div className="flex items-center gap-4">
          <Link href={"/"}>
            <p className="font-bold font-sans text-3xl cursor-pointer">
              E-COMPARE
            </p>
          </Link>
        </div>
        <div className="flex-1 max-w-2xl">
          {isSearchPage && (
            <Form className="flex justify-center items-center gap-0 flex-row w-full">
              <input
                name="q"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="inner-shadow-y py-5 px-5 rounded-tl-3xl rounded-bl-3xl rounded-tr-none rounded-br-none w-full"
                type="text"
                placeholder="Search..."
              />
              <div className="inner-shadow-y py-5 px-5 rounded-tl-none rounded-bl-none rounded-tr-3xl rounded-br-3xl">
                <button type="submit">
                  <FaSearch className="text-white " />
                </button>
              </div>
            </Form>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex justify-center items-center gap-5">
          <SignedOut>
            <Link href="/sign-in">
              <button className="text-2xl text-white font-bold">Sign In</button>
            </Link>
            <Link href="/sign-up">
              <button className="text-2xl text-white font-bold">Sign Up</button>
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
