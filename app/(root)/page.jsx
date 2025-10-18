"use client";
import Footer from "@/components/Footer";
import { useUser } from "@clerk/nextjs";
import { FaMagnifyingGlass } from "react-icons/fa6";
import lazada from "@/public/lazada.svg";
import shopee from "@/public/shopee.svg";
import Form from "next/form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [fadeText, setFadeText] = useState("");
  const [fadeState, setFadeState] = useState("fade-in"); // 'fade-in' | 'fade-out'

  useEffect(() => {
    const textOptions = [
      'Start your <span class="font-bold ">smart</span> online shopping.',
      'Compare <span class="font-semibold">prices</span> easily.',
      'Find the <span class="font-bold">best deals</span> today.',
      'Shop confidently with <span class="font-baloo">E-Compare</span>.',
    ];

    let index = 0;
    setFadeText(textOptions[index]);

    const interval = setInterval(() => {
      setFadeState("fade-out");
      setTimeout(() => {
        index = (index + 1) % textOptions.length;
        setFadeText(textOptions[index]);
        setFadeState("fade-in");
      }, 500); // fade-out duration
    }, 7000); // each phrase visible for 7s

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <>
      <div className="min-h-screen">
        <div className="py-15 px-16"></div>

        <div className="min-h-80 flex justify-center items-center w-full flex-col gap-10">
          {/* Search Section */}

          <div className="flex flex-row justify-center items-center w-full">
            <div className="flex w-[40%] relative">

              {/* Fading Placeholder */}
              {!search && (
                <div
                  className={`absolute left-12 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none z-10 transition-opacity duration-500 ${
                    fadeState === "fade-in" ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ whiteSpace: "nowrap" }}
                  dangerouslySetInnerHTML={{ __html: fadeText }}
                />
              )}

            {/* Input box */}
{/* Input box */}
<div className="relative flex-[22]">
  <Form onSubmit={handleSubmit}>
    <input
      className="glass-search w-full h-[48px] rounded-l-2xl text-white placeholder-white/50 pl-12 text-[16px] font-normal"
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <FaMagnifyingGlass className="absolute left-[20px] top-1/2 -translate-y-1/2 text-white/50 text-[16px]" />
  </Form>
</div>
              {/* Search Button */}
              <Form onClick={handleSubmit}>
                <button
                  type="button"
                  onClick={() => handleSubmit("SearchResults")}
                  className="flex-[1] h-[48px] search-button flex items-center justify-center rounded-r-2xl px-6"
                >
                  <FaMagnifyingGlass className="text-white/70 text-lg" />
                </button>
              </Form>
            </div>
          </div>

          {/* Below content */}
          <div
            className="flex justify-center items-center flex-row gap-3 font-vagRounded text-white font-medium text-1xl"
            style={{ width: "40%" }}
          >
            <p>Powered by </p>
            <Image src={lazada} alt="Lazada" width={24} height={24} />
            <Image src={shopee} alt="Shopee" width={16} height={16} />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default HomePage;
