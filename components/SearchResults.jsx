"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/Card";
import SkeletonResult from "./SkeletonResult";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function SearchResults({ query }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showClose, setShowClose] = useState(true);

  async function GetProducts(signal) {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/search?keyword=${encodeURIComponent(query)}`,
        { signal } // 👈 attach abort signal here
      );

      const lazadaItems =
        res.data.lazada?.mods?.listItems?.map((item, index) => ({
          id: `lazada-${item.itemId || index}`,
          source: "Lazada",
          name: item.name,
          image: item.image,
          merchant: item.sellerName,
          price: parseFloat(item.price.replace(/[^\d.]/g, "")),
          link:
            item.productUrl || `https://www.lazada.com.ph/products/${item.nid}`,
        })) || [];

      const shopeeItems =
        res.data.shopee?.items?.map((item, index) => ({
          id: `shopee-${item.item_basic.itemid || index}`,
          source: "Shopee",
          name: item.item_basic.name,
          merchant: "shop",
          image: `https://down-ph.img.susercontent.com/file/${item.item_basic.image}`,
          price: item.item_basic.price / 100000,
          link: `https://shopee.ph/product/${item.item_basic.shopid}/${item.item_basic.itemid}`,
        })) || [];

      const merged = [...lazadaItems, ...shopeeItems].sort(
        (a, b) => a.price - b.price
      );
      setProducts(merged);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("❌ Request canceled");
      } else {
        console.error("Error fetching products:", error);
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // async function GetProducts() {
  //   try {
  //     setLoading(true);
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     const lazadaItems = [
  //       {
  //         id: 1,
  //         source: "Lazada",
  //         name: "Wireless Mouse",
  //         image: "https://placehold.co/400",
  //         merchant: "Lazada Store",
  //         price: 299,
  //       },
  //       {
  //         id: 2,
  //         source: "Lazada",
  //         name: "Mechanical Keyboard",
  //         image: "https://placehold.co/400",
  //         merchant: "Lazada Tech",
  //         price: 899,
  //       },
  //     ];

  //     const shopeeItems = Array.from({ length: 8 }).map((_, i) => ({
  //       id: i + 3,
  //       source: "Shopee",
  //       name: "Mechanical Keyboard",
  //       image: "https://placehold.co/400",
  //       merchant: "Shopee Tech",
  //       price: 850,
  //     }));

  //     setProducts([...lazadaItems, ...shopeeItems]);
  //   } catch {
  //     setError("Failed to fetch data");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();
    const delay = setTimeout(() => GetProducts(controller.signal), 400);

    return () => {
      controller.abort();
      clearTimeout(delay);
    };
  }, [query]);

  function handleToggle(productId) {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, productId];
    });
  }

  // Hide/show ✕ on scroll direction
  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowClose(currentScroll < lastScrollY);
      lastScrollY = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* The motion.div acts as the main scroll container */}
      <motion.div
        key="motion-container"
        initial={false}
        animate={
          showCompare
            ? { y: 0, backdropFilter: "blur(6px)" }
            : { y: 0, backdropFilter: "blur(0px)" }
        }
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={`relative z-30 min-h-screen ${
          showCompare ? "bg-white/10 inner-shadow-y" : "bg-transparent"
        }`}
        style={{
          top: "5px", // leave space for your header
          overflow: "visible",
        }}
      >
        {/* ✕ button appears only when Compare is active */}
        <AnimatePresence>
          {showCompare && showClose && (
            <motion.button
              key="close-button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                setShowCompare(false);
                setSelectedProducts([]); // Reset selected cards when closing
              }}
              className=" absolute top-5 right-8 text-white text-[36px] font-vagRounded font-light cursor-pointer z-[101]"
            >
              ✕
            </motion.button>
          )}
        </AnimatePresence>
        {/* Search results (stay the same content) */}
        <div className="pt-20 px-6 pb-20">
          {loading ? (
            <div className="px-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              <SkeletonResult />
            </div>
          ) : (
            <div className="px-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 auto-rows-max">
              {products.map((product) => (
                <Card
                  showCompare={showCompare}
                  key={product.id}
                  products={product}
                  isSelected={selectedProducts.includes(product.id)}
                  onToggle={() => handleToggle(product.id)}
                  isDisabled={
                    selectedProducts.length >= 3 &&
                    !selectedProducts.includes(product.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Compare Button */}
      <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3 z-50">
        <div className="flex justify-center items-center flex-col gap-3">
          {showCompare && (
            <p className="text-white text-2xl font-bold">
              {`${selectedProducts.length}/3`}
            </p>
          )}
          <button
            onClick={() => setShowCompare(true)}
            className="text-cent text-[24px] text-semibold text-white rounded-full font-bold w-[215px] h-[52px] !mr-12 compare-button"
          >
            {showCompare ? "Compare now" : "Compare"}
          </button>
        </div>
      </div>
    </>
  );
}

export default SearchResults;
