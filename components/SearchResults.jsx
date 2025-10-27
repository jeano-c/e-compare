"use client";
import React, { useEffect, useState, useRef } from "react";
import Card from "@/components/Card";
import SkeletonResult from "./SkeletonResult";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

function SearchResults({ query, onToggleHeader }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showClose, setShowClose] = useState(true);
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAddingOneMore, setIsAddingOneMore] = useState(false);
  const [lockedProducts, setLockedProducts] = useState([]); // store locked IDs

  // 🧠 Save snapshot of minimized products
  const minimizedSnapshot = useRef([]);
  useEffect(() => {
    if (typeof onToggleHeader === "function") {
      onToggleHeader(!showComparisonTable); // false → hide, true → show
    }

    // restore header if this component unmounts
    return () => {
      if (typeof onToggleHeader === "function") {
        onToggleHeader(true);
      }
    };
  }, [showComparisonTable, onToggleHeader]);
  // Fetch Products (simulated)
  // async function GetProducts() {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(
  //       `/api/search?keyword=${encodeURIComponent(query)}`,
  //       { signal } // 👈 attach abort signal here
  //     );

  //     const lazadaItems =
  //       res.data.lazada?.mods?.listItems?.map((item, index) => ({
  //         id: `lazada-${item.itemId || index}`,
  //         source: "Lazada",
  //         name: item.name,
  //         image: item.image,
  //         merchant: item.sellerName,
  //         price: parseFloat(item.price.replace(/[^\d.]/g, "")),
  //         link: item.itemUrl,
  //       })) || [];

  //     const shopeeItems =
  //       res.data.shopee?.items?.map((item, index) => ({
  //         id: `shopee-${item.item_basic.itemid || index}`,
  //         source: "Shopee",
  //         name: item.item_basic.name,
  //         merchant: "shop",
  //         image: `https://down-ph.img.susercontent.com/file/${item.item_basic.image}`,
  //         price: item.item_basic.price / 100000,
  //         link: `https://shopee.ph/product/${item.item_basic.shopid}/${item.item_basic.itemid}`,
  //       })) || [];

  //     const merged = [...lazadaItems, ...shopeeItems].sort(
  //       (a, b) => a.price - b.price
  //     );
  //     setProducts(merged);
  //     ScrapeAllProducts(merged);
  //   } catch (error) {
  //     if (axios.isCancel(error)) {
  //       console.log("❌ Request canceled");
  //       toast.error(`${error}`);
  //     } else {
  //       console.error("Error fetching products:", error);
  //       toast.error(`${error}`);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function GetProducts() {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const lazadaItems = [
        {
          id: 1,
          source: "Lazada",
          link: "//www.lazada.com.ph/products/pdp-i5061537266.html",
          name: "Wireless Mouse",
          image: "https://placehold.co/400",
          merchant: "Lazada Store",
          price: 299,
        },
        {
          id: 2,
          source: "Lazada",
          name: "Mechanical Keyboard",
          link: "//www.lazada.com.ph/products/pdp-i5061537266.html",
          image: "https://placehold.co/400",
          merchant: "Lazada Tech",
          price: 899,
        },
      ];

      const shopeeItems = Array.from({ length: 8 }).map((_, i) => ({
        id: i + 3,
        source: "Shopee",
        name: "Mechanical Keyboard",
        link: "https://shopee.ph/product/1023426474/29541632312",
        image: "https://placehold.co/400",
        merchant: "Shopee Tech",
        price: 850,
      }));

      const newProducts = [...lazadaItems, ...shopeeItems];
      setProducts(newProducts);
      ScrapeAllProducts(newProducts);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }


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
      const isLocked = lockedProducts.includes(productId);
      const alreadySelected = prev.includes(productId);

      //  Prevent toggling locked products
      if (isLocked) return prev;

      //  Allow unselecting only if not locked
      if (alreadySelected) return prev.filter((id) => id !== productId);

      //  If in "Add one more" mode
      if (isAddingOneMore) {
        if (prev.length >= 3) return prev;

        const newSelected = [...prev, productId];

        // Automatically return to compare view once third is selected
        if (newSelected.length === 3) {
          setTimeout(() => {
            setIsAddingOneMore(false);
            setLockedProducts([]);
            setShowComparisonTable(true);
          }, 300);
        }

        return newSelected;
      }

      //  Normal behavior
      if (prev.length >= 3) return prev;
      return [...prev, productId];
    });
  }
  // Hide/show ✕ based on scroll
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

  async function ScrapeAllProducts(products) {
    if (!products?.length) return;

    const lazadaProducts = products.filter((p) => p.source === "Lazada");
    const shopeeProducts = products.filter((p) => p.source === "Shopee");

    const batchArray = (arr, batchSize = 5) => {
      const batches = [];
      for (let i = 0; i < arr.length; i += batchSize) {
        batches.push(arr.slice(i, i + batchSize));
      }
      return batches;
    };

    for (const batch of batchArray(lazadaProducts, 5)) {
      await GetTruePrice(batch);
    }
    for (const batch of batchArray(shopeeProducts, 5)) {
      await GetTruePrice2(batch);
    }
  }

  async function GetTruePrice(products) {
    if (!products?.length) return;

    for (let i = 0; i < products.length; i += 5) {
      const batch = products.slice(i, i + 5);

      const urls = batch
        .map((p) => (p.link.startsWith("//") ? "https:" + p.link : p.link))
        .filter(Boolean);
      const encodedUrls = encodeURIComponent(JSON.stringify(urls));
      try {
        const res = await axios.post(`/api/test?urls=${encodedUrls}`);
        console.log(`✅ Batch ${i / 5 + 1}`, res.data);
      } catch (error) {
        console.error(`❌ Batch ${i / 5 + 1} failed:`, error);
        toast?.error(error.message || "Failed to fetch batch");
      }
    }
  }

  async function GetTruePrice2(products) {
    if (!products?.length) return;

    for (let i = 0; i < products.length; i += 5) {
      const batch = products.slice(i, i + 5);

      const payload = {
        urls: batch.map((product) => product.link), // use batch, not products
      };

      try {
        const res = await axios.post(`/api/test-next`, payload); // POST JSON
        console.log(`✅ Shopee Batch ${i / 5 + 1}`, res.data);
      } catch (error) {
        console.error(`❌ Shopee Batch ${i / 5 + 1} failed:`, error);
        toast?.error(error.message || "Failed to fetch batch");
      }
    }
  }

return (
  <>
    {/*  Product Container (Hidden when in comparison view) */}
    {!showComparisonTable && (
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
        style={{ top: "5px", overflow: "visible" }}
      >
        {/* ✕ and ━ Buttons */}
        <AnimatePresence>
          {showCompare && showClose && (
            <motion.div
              key="top-buttons"
              className="absolute top-4 right-10 flex gap-4 z-[101]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: -5 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* ✕ Close Button */}
              <button
                onClick={() => {
                  setShowCompare(false);
                  setSelectedProducts([]);
                  setIsMinimized(false);
                  minimizedSnapshot.current = [];
                }}
                className="text-white text-[36px] font-vagRounded font-light cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
<div className="text-center px-10 pt-20 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
  {loading ? (
    <div className="col-span-full flex flex-col justify-center items-center gap-4 min-h-[60vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-t-white border-gray-400 rounded-full"
      />
      <p className="text-white text-lg font-vagRounded tracking-wide">
        Loading Products...
      </p>
              <SkeletonResult />
            </div>
          ) : error ? (
            <p className="text-center text-red-400 font-vagRounded mt-10">
              {error}
            </p>
          ) : showComparisonTable ? (
            <motion.div
              key="comparison-view"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative w-full min-h-screen p-6 rounded-2xl text-white flex flex-col overflow-hidden"
            >
              {/* Background Gradient + Glow Blobs */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#361c7a] via-[#1e0f45] to-[#000000] opacity-80 rounded-2xl"></div>
              <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-purple-600/30 blur-[160px] rounded-full"></div>
              <div className="absolute -top-20 right-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full"></div>

              {/* Foreground */}
              <h2 className="text-2xl font-bold mb-8 text-center z-10">
                Product Comparison
              </h2>

        <div className="overflow-x-auto relative z-10">
          <table className="min-w-full border-collapse rounded-lg text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left font-semibold"></th>
                {selectedProducts.map((id) => {
                  const p = products.find((x) => x.id === id);
                  return (
                    <th key={p.id} className="p-3 text-center align-top">
                      <div className="flex justify-center items-center flex-col relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 w-[220px] mx-auto shadow-lg mb-4">
                        <img
                          src={p.image}
                          alt={p.name}
                          className=" w-32 h-32 object-contain rounded-lg"
                        />
                        <p className="font-semibold text-center mt-3">
                          {p.name}
                        </p>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {["Price", "Merchant", "Source", "Specs"].map((feature) => (
                <tr key={feature}>
                  <td className="p-3 border-t border-gray-700 font-semibold">
                    {feature}
                  </td>
                  {selectedProducts.map((id) => {
                    const p = products.find((x) => x.id === id);
                    return (
                      <td
                        key={p.id + feature}
                        className="p-3 border-t border-gray-700 text-center align-middle"
                      >
                        {feature === "Price"
                          ? `₱${p.price}`
                          : p[feature.toLowerCase()] || "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}

                    {/* Buy Now Buttons Row */}
                    <tr>
                      <td></td>
                      {selectedProducts.map((id) => {
                        const p = products.find((x) => x.id === id);
                        return (
                          <td key={p.id + "buy"} className="text-center pt-6">

                            <button onClick={() => window.open(
                              p.source === "Lazada"
                                ? "https://www.lazada.com.ph/"
                                : "https://shopee.ph/",
                              "_blank"
                            )}

                              className={
                                p.source === "Lazada"
                                  ? "bg-pink-600 hover:bg-pink-700 text-white text-sm px-5 py-2 rounded-full shadow-md"
                                  : "bg-orange-600 hover:bg-orange-700 text-white text-sm px-5 py-2 rounded-full shadow-md"
                              }
                            >
                              Buy Now

                            </button>
                          </td>

                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Floating “+ Add 1 more item” text */}
              {selectedProducts.length === 2 && (
                <span
                  onClick={() => {
                    setLockedProducts([...selectedProducts]);
                    setIsAddingOneMore(true);
                    setShowComparisonTable(false);
                    setShowCompare(true);
                  }}
                  className="absolute top-[180px] right-[40px] text-white-400 text-[15px] font-medium 
                  hover:text-gray-300 cursor-pointer select-none z-50"
                  style={{
                    background: "none",
                    lineHeight: "1.2",
                  }}
                >
                  + Add 1 more item
                </span>
              )}


            </motion.div>

          ) : (
            <div className="px-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  showCompare={showCompare}
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
    )}

      {/*Compare Buttons */}
      <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3 z-50">
        <div className="flex flex-col items-center gap-3">
          {!showCompare && !isMinimized && (
            <button
              onClick={() => setShowCompare(true)}
              className="compare-button transition-all text-center text-[20px] text-white rounded-full font-bold w-[215px] h-[52px]"
            >
              Compare
            </button>
          )}

      {showCompare && !showComparisonTable && !isAddingOneMore && (
        <button
          disabled={selectedProducts.length < 2 || selectedProducts.length > 3}
          onClick={() => setShowComparisonTable(true)}
          className={`text-center text-[20px] rounded-full font-bold w-[215px] h-[52px] compare-button ${
            selectedProducts.length >= 2 && selectedProducts.length <= 3
              ? "text-white bg-blue-500 hover:bg-black-200"
              : "text-gray-300 bg-gray-300 cursor-not-allowed pointer-events-none"
          }`}
        >
          Compare Now
        </button>
      )}
    </div>

      {/* 🧩 Minimized Bar */}
      {isMinimized && minimizedSnapshot.current.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="absolute top-30 left-5 bg-white/10 backdrop-blur-md rounded-full flex 
          items-center gap-2 p-3 pl-5 shadow-lg border border-white/20 cursor-pointer z-50"
          onClick={() => {
            setShowCompare(true);
            setIsMinimized(false);
            setShowComparisonTable(true);
            setSelectedProducts(minimizedSnapshot.current);
          }}
        >
          {minimizedSnapshot.current.map((id) => {
            const p = products.find((x) => x.id === id);
            return (
              <img
                key={p.id}
                src={p.image}
                alt={p.name}
                className="w-8 h-8 rounded-lg border border-white/30"
              />
            );
          })}
          <span className="ml-2 text-white/70 text-sm">(Click to reopen)</span>


        </motion.div>
      )}
    </>
  );
}

export default SearchResults;
