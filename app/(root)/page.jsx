"use client";
import Footer from "@/components/Footer";
import { useUser } from "@clerk/nextjs";
import { FaMagnifyingGlass } from "react-icons/fa6";
import lazada from "@/public/lazada.svg";
import shopee from "@/public/shopee.svg";
import Form from "next/form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/search?q=${encodeURIComponent(search)}`);
  }
  return (
    <>
      <div
        className="min-h-screen scrollbar-custom 
      "
      >
        <div className="py-15 px-16">
          <h1 className="font-vagRounded font-semibold text-2xl text-white">
            Welcome {user?.username || user?.firstName}
          </h1>
        </div>
        <div className="min-h-80 flex justify-center items-center w-full flex-col gap-10">
          <div className="relative" style={{ width: "50%" }}>
            <Form onSubmit={handleSubmit}>
              <input
                className="glass-input w-full"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="Start your smart online shopping"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Form>
            <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          </div>
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
      {/* ✅ Footer renders below header */}
      <Footer />
    </>
  );
}

export default HomePage;
