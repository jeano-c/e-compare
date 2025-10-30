"use client";
import React, { useEffect, useState, useRef } from "react";
import Card from "@/components/Card";
import SkeletonResult from "./SkeletonResult";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

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
  const [comparisonResults, setComparisonResults] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [likedProducts, setLikedProducts] = useState([]);

  const minimizedSnapshot = useRef([]);
  useEffect(() => {
    if (typeof onToggleHeader === "function") {
      onToggleHeader(!showComparisonTable); // false → hide, true → show
    }
  });

  // async function GetProducts(signal) {
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
      await new Promise((resolve) => setTimeout(resolve, 10000));

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
      if (isLocked) return prev;
      if (alreadySelected) return prev.filter((id) => id !== productId);
      if (isAddingOneMore) {
        if (prev.length >= 3) return prev;

        const newSelected = [...prev, productId];
        if (newSelected.length === 3) {
          setTimeout(() => {
            setIsAddingOneMore(false);
            setLockedProducts([]);
            setShowComparisonTable(true);
          }, 300);
        }

        return newSelected;
      }

      if (prev.length >= 3) return prev;
      return [...prev, productId];
    });
  }
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
        urls: batch.map((product) => product.link),
      };

      try {
        const res = await axios.post(`/api/test-next`, payload);
        console.log(`✅ Shopee Batch ${i / 5 + 1}`, res.data);
      } catch (error) {
        console.error(`❌ Shopee Batch ${i / 5 + 1} failed:`, error);
        toast?.error(error.message || "Failed to fetch batch");
      }
    }
  }

  // async function CompareAction() {
  //   try {
  //     const selected = products.filter((p) => selectedProducts.includes(p.id));
  //     const urls = selected
  //       .map((p) => (p.link.startsWith("//") ? "https:" + p.link : p.link))
  //       .filter(Boolean);

  //     if (!urls.length) {
  //       toast.error("No valid URLs found for selected products");
  //       return;
  //     }
  //     const res = await axios.post("/api/test-next", { urls });
  //     console.log("✅ Compare Results:", res.data);
  //     toast.success("Comparison data fetched!");
  //   } catch (error) {
  //     console.error("❌ CompareAction failed:", error);
  //     toast.error(
  //       error.response?.data?.error || "Failed to fetch comparison data"
  //     );
  //   }
  // }

  async function CompareAction() {
    try {
      const selected = products.filter((p) => selectedProducts.includes(p.id));
      const urls = selected.map((p) =>
        p.link.startsWith("//") ? "https:" + p.link : p.link
      );

      if (!urls.length) {
        toast.error("No valid URLs selected");
        return;
      }

      toast.loading("Fetching comparison data...");

      
      await new Promise((resolve) => setTimeout(resolve, 2000));

      
      const mockResults = urls.map((url, i) => ({
        url,
        title: `Mock Product ${i + 1}`,
        brand: i % 2 === 0 ? "Logitech" : "Rakk",
        description: "This is a mocked product description.",
        rating: (Math.random() * 5).toFixed(1),
        currency: "PHP",
        lowestPrice: 799 + i * 100,
        highestPrice: 999 + i * 100,
        variations: [
          {
            name: "Black / Red",
            price: (799 + i * 100).toFixed(2),
            priceBeforeDiscount: (899 + i * 100).toFixed(2),
            stock: 12,
            sold: 45 + i * 5,
          },
          {
            name: "White / Blue",
            price: (849 + i * 100).toFixed(2),
            priceBeforeDiscount: (949 + i * 100).toFixed(2),
            stock: 8,
            sold: 20 + i * 2,
          },
        ],
      }));

      console.log("🧪 Mock comparison results:", mockResults);
      toast.dismiss();
      toast.success("Mock comparison data loaded!");

      // 👇 show in your component if you track results in state
      setComparisonResults(mockResults);
    } catch (error) {
      console.error("❌ Mock CompareAction failed:", error);
      toast.error("Something went wrong");
    }
  }
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await axios.get("/api/likes");
        setLikedProducts(res.data.likedProducts || []);
      } catch (err) {
        console.error("Error fetching likes", err);
      }
    };

    fetchLikes();
  }, [query]);

  return (
    <>
      {!showComparisonTable && (
        <motion.div
          key="motion-container"
          initial={false}
          animate={
            showCompare
              ? { y: 0, backdropFilter: "blur(35px)" }
              : { y: 0, backdropFilter: "blur(0px)" }
          }
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className={`relative z-30 min-h-screen ${
            showCompare ? "inner-shadow-y" : "bg-transparent"
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
            ) : (
              products.map((product) => (
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
                  isLiked={likedProducts.some((item) => item.id === product.id)}
                  onLikeToggle={(isLiked) => {
                    setLikedProducts(
                      (prev) =>
                        isLiked
                          ? [...prev, product] 
                          : prev.filter((p) => p.id !== product.id) 
                    );
                  }}
                />
              ))
            )}
          </div>
        </motion.div>
      )}

      {showComparisonTable && (
        <motion.div
          key="comparison-view"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-lg border border-white/20 relative w-full min-h-screen p-0 text-white flex flex-col overflow-hidden z-40"
        >
          <motion.div
            key="top-buttons"
            className="absolute top-4 right-10 flex gap-4 z-[101]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -5 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ━ Minimize */}
            <button
              onClick={() => {
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

            {/* ✕ Close */}
            <button
              onClick={() => {
                setShowCompare(false);
                setShowComparisonTable(false);
                setSelectedProducts([]);
                setIsMinimized(false);
                setComparisonResults([]);
                setSelectedVariations({});
                minimizedSnapshot.current = [];
              }}
              className="text-white text-[36px] font-vagRounded font-light cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </motion.div>

          <h2 className="text-2xl font-bold mb-8 text-center z-10 mt-16">
            Product Comparison
          </h2>

          <div className="overflow-x-hidden overflow-hidden relative z-10">
            <div className="w-3/4 mx-auto flex gap-4">
              {comparisonResults.map((result, index) => {
                const p = products.find(
                  (x) => x.id === selectedProducts[index]
                );
                const selectedVar = selectedVariations[p?.id];
                const displayPrice = selectedVar
                  ? selectedVar.price
                  : `${result.lowestPrice} - ${result.highestPrice}`;

                return (
                  <div
                    key={p?.id || index}
                    className="flex flex-col flex-1 min-w-[220px]"
                  >
                    <div className="glass-button1 rounded-t-[23px]">
                      <div className="flex justify-center items-center flex-col p-4">
                        <img
                          src={p?.image}
                          alt={result.title}
                          className="w-32 h-32 object-contain rounded-lg"
                        />
                        <p className="font-semibold text-center mt-3">
                          {result.title}
                        </p>
                        {result.brand && (
                          <p className="text-xs text-white/60 mt-1">
                            {result.brand}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs opacity-60">
                          Price
                        </span>
                        <span>₱{displayPrice}</span>
                      </div>
                    </div>

                    <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs opacity-60">
                          Rating
                        </span>
                        <span>{result.rating || "-"} ⭐</span>
                      </div>
                    </div>

                    <div className="glass-button1 h-16 rounded-0 flex items-center justify-center text-center">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs opacity-60">
                          Source
                        </span>
                        <span>{p?.source || "-"}</span>
                      </div>
                    </div>

                    <div className="glass-button1 min-h-24 rounded-0 flex items-center justify-center text-center p-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs opacity-60">
                          Description
                        </span>
                        <span className="text-xs mt-1 line-clamp-3">
                          {result.description || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="glass-button1 py-3 min-h-16 h-auto rounded-0 flex flex-col items-center justify-center text-center relative">
                      <span className="font-semibold text-xs opacity-60 mb-2">
                        Variations
                      </span>
                      <Dropdown
                        options={result.variations.map(
                          (variation) =>
                            `${variation.name} — ₱${variation.price}`
                        )}
                        onChange={(option) => {
                          const [name] = option.value.split(" — ₱");
                          const selected = result.variations.find(
                            (v) => v.name === name
                          );
                          setSelectedVariations((prev) => ({
                            ...prev,
                            [p.id]: selected,
                          }));
                        }}
                        value={
                          selectedVar
                            ? `${selectedVar.name} — ₱${selectedVar.price}`
                            : "Select variation "
                        }
                        placeholder="Select a variation"
                        className="w-full text-sm font-vagRounded"
                        controlClassName=""
                        menuClassName="!absolute !static "
                        arrowClassName="text-white"
                      />
                    </div>

                    <div className="text-center pt-6">
                      <button
                        onClick={() =>
                          window.open(
                            p?.source === "Lazada"
                              ? "https://www.lazada.com.ph/"
                              : "https://shopee.ph/",
                            "_blank"
                          )
                        }
                        className={`${
                          p?.source === "Lazada"
                            ? "bg-pink-700/20 hover:bg-pink-800/20"
                            : "bg-orange-700/20 hover:bg-orange-800/20"
                        } text-white text-sm px-5 py-2 rounded-full shadow-md compare-button1`}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedProducts.length === 2 && (
            <span
              onClick={() => {
                setLockedProducts([...selectedProducts]);
                setIsAddingOneMore(true);
                setShowComparisonTable(false);
                setShowCompare(true);
              }}
              className="absolute top-[180px] right-[40px] text-white/80 text-[15px] 
            font-medium hover:text-gray-300 cursor-pointer select-none z-50"
            >
              + Add 1 more item
            </span>
          )}
        </motion.div>
      )}

      <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3 z-50">
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
            disabled={
              selectedProducts.length < 2 || selectedProducts.length > 3
            }
            onClick={async () => {
              await CompareAction();
              setShowComparisonTable(true);
            }}
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
