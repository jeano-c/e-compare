"use client";
import React, { useEffect, useState, useRef } from "react";
import Card from "@/components/Card";
import SkeletonResult from "./SkeletonResult";
import { motion, AnimatePresence } from "framer-motion";

function SearchResults({ query }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showClose, setShowClose] = useState(true);
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // 🧠 Save snapshot of minimized products
  const minimizedSnapshot = useRef([]);

  // Fetch Products (simulated)
  async function GetProducts() {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const lazadaItems = [
        {
          id: 1,
          source: "Lazada",
          name: "Wireless Mouse",
          image: "/iphone.webp",
          merchant: "Lazada Store",
          price: 299,
          specs: "8GB RAM",
        },
        {
          id: 2,
          source: "Lazada",
          name: "Mechanical Keyboard",
          image: "/iphone.webp",
          merchant: "Lazada Tech",
          price: 899,
          specs: "26GB Storage",
        },
      ];

      const shopeeItems = Array.from({ length: 8 }).map((_, i) => ({
        id: i + 3,
        source: "Shopee",
        name: "Mechanical Keyboard",
        image: "/iphone.webp",
        merchant: "Shopee Tech",
        price: 850,
        specs: "65GB SSD",
      }));

      setProducts([...lazadaItems, ...shopeeItems]);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (query) GetProducts(query);
  }, [query]);

  function handleToggle(productId) {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) return prev.filter((id) => id !== productId);
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

  return (
    <>
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
          {(showCompare || showComparisonTable) && showClose && (
            <motion.div
              key="top-buttons"
              className="absolute top-4 right-10 flex gap-4 z-[101]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: -5 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* ━ Minimize Button */}
              {showComparisonTable && (
                <button
                  onClick={() => {
                    // ✅ Save snapshot before minimizing
                    minimizedSnapshot.current = [...selectedProducts];
                    setIsMinimized(true);
                    setShowComparisonTable(false);
                    setShowCompare(true);
                  }}
                  className="text-white text-[26px] font-vagRounded font-light cursor-pointer"
                  title="Minimize"
                >
                  ━
                </button>
              )}

              {/* ✕ Close Button */}
              <button
                onClick={() => {
                  setShowCompare(false);
                  setShowComparisonTable(false);
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

        {/* Product & Comparison Views */}
        <div className="pt-20 px-6 pb-20">
          {loading ? (
            <div className="flex flex-col justify-center items-center gap-4 mt-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-t-white border-gray-400 rounded-full"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="text-white text-lg font-vagRounded tracking-wide"
              >
                Loading Products...
              </motion.p>
              <div className="mt-10 flex justify-center items-center w-full">
                <SkeletonResult />
              </div>
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
              className="bg-white/10 p-6 rounded-2xl text-white backdrop-blur-lg"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                Product Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-500 rounded-lg text-sm">
                  <thead>
                    <tr className="bg-white/20">
                      <th className="p-3 text-left">Feature</th>
                      {selectedProducts.map((id) => {
                        const p = products.find((x) => x.id === id);
                        return (
                          <th key={p.id} className="p-3 text-center">
                            <div className="flex flex-col items-center">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-20 h-20 rounded-lg mb-2"
                              />
                              <p className="font-semibold">{p.name}</p>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {["Price", "Merchant", "Source", "Specs"].map((feature) => (
                      <tr key={feature}>
                        <td className="p-3 border-t border-gray-600 font-semibold">
                          {feature}
                        </td>
                        {selectedProducts.map((id) => {
                          const p = products.find((x) => x.id === id);
                          return (
                            <td
                              key={p.id + feature}
                              className="p-3 border-t border-gray-600 text-center"
                            >
                              {feature === "Price"
                                ? `₱${p.price}`
                                : p[feature.toLowerCase()]}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

          {showCompare && !showComparisonTable && (
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
      </div>

      {/* 🧩 Minimized Bar */}
      {isMinimized && minimizedSnapshot.current.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="absolute top-50 left-20 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2 p-3 pl-5 shadow-lg border border-white/20 cursor-pointer z-50"
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
