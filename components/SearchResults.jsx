"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/Card";
import axios from "axios";
import SkeletonResult from "./SkeletonResult";
import { motion, AnimatePresence } from "framer-motion";

function SearchResults({ query }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // async function GetProducts() {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(
  //       `/api/search?keyword=${encodeURIComponent(query)}`
  //     );
  //     const lazadaItems =
  //       res.data.lazada?.mods?.listItems?.map((item) => ({
  //         source: "Lazada",
  //         name: item.name,
  //         image: item.image,
  //         merchant: item.sellerName,
  //         price: parseFloat(item.price.replace(/[^\d.]/g, "")), // remove ₱, commas
  //         link:
  //           item.productUrl || `https://www.lazada.com.ph/products/${item.nid}`,
  //       })) || [];
  //     const shopeeItems =
  //       res.data.shopee?.items?.map((item) => ({
  //         source: "Shopee",
  //         name: item.item_basic.name,
  //         merchant: "shop",
  //         image: `https://down-ph.img.susercontent.com/file/${item.item_basic.image}`,
  //         price: item.item_basic.price / 100000, // Shopee prices are *100000
  //         link: `https://shopee.ph/product/${item.item_basic.shopid}/${item.item_basic.itemid}`,
  //       })) || [];
  //     const merged = [...lazadaItems, ...shopeeItems].sort(
  //       (a, b) => a.price - b.price
  //     );
  //     setProducts(merged);
  //   } catch (error) {
  //     setError(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  // useEffect(() => {
  //   if (query) GetProducts(query);
  // }, [query]);

  async function GetProducts() {
    try {
      setLoading(true);

      // simulate delay (like real API)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // --- FAKE DATA ---
      const lazadaItems = [
        {
          id: 1,
          source: "Lazada",
          name: "Wireless Mouse",
          image: "https://via.placeholder.com/200x200.png?text=Lazada+Mouse",
          merchant: "Lazada Store",
          price: 299,
          link: "https://www.lazada.com.ph/products/1",
        },
        {
          id: 2,
          source: "Lazada",
          name: "Mechanical Keyboard",
          image: "https://via.placeholder.com/200x200.png?text=Lazada+Keyboard",
          merchant: "Lazada Tech",
          price: 899,
          link: "https://www.lazada.com.ph/products/2",
        },
      ];

      const shopeeItems = [
        {
          id: 3,
          source: "Shopee",
          name: "Wireless Mouse",
          image: "https://via.placeholder.com/200x200.png?text=Shopee+Mouse",
          merchant: "Shopee Mall",
          price: 280,
          link: "https://shopee.ph/product/123/456",
        },
        {
          id: 4,
          source: "Shopee",
          name: "Mechanical Keyboard",
          image: "https://via.placeholder.com/200x200.png?text=Shopee+Keyboard",
          merchant: "Shopee Tech",
          price: 850,
          link: "https://shopee.ph/product/123/789",
        },
        {
          id: 5,
          source: "Shopee",
          name: "Mechanical Keyboard",
          image: "https://via.placeholder.com/200x200.png?text=Shopee+Keyboard",
          merchant: "Shopee Tech",
          price: 850,
          link: "https://shopee.ph/product/123/789",
        },
        {
          id: 6,
          source: "Shopee",
          name: "Mechanical Keyboard",
          image: "https://via.placeholder.com/200x200.png?text=Shopee+Keyboard",
          merchant: "Shopee Tech",
          price: 850,
          link: "https://shopee.ph/product/123/789",
        },
        {
          id: 7,
          source: "Shopee",
          name: "Mechanical Keyboard",
          image: "https://via.placeholder.com/200x200.png?text=Shopee+Keyboard",
          merchant: "Shopee Tech",
          price: 850,
          link: "https://shopee.ph/product/123/789",
        },
        {
          id: 8,
          source: "Shopee",
          name: "Mechanical Keyboard",
          image: "https://via.placeholder.com/200x200.png?text=Shopee+Keyboard",
          merchant: "Shopee Tech",
          price: 850,
          link: "https://shopee.ph/product/123/789",
        },
        {
          id: 9,
          source: "Shopee",
          name: "Mechanical Keyboard",
          image: "https://via.placeholder.com/200x200.png?text=Shopee+Keyboard",
          merchant: "Shopee Tech",
          price: 850,
          link: "https://shopee.ph/product/123/789",
        },
        {
          id: 10,
          source: "Shopee",
          name: "Mechanical Keyboard",
          image: "https://via.placeholder.com/200x200.png?text=Shopee+Keyboard",
          merchant: "Shopee Tech",
          price: 850,
          link: "https://shopee.ph/product/123/789",
        },
      ];

      const merged = [...lazadaItems, ...shopeeItems].sort(
        (a, b) => a.price - b.price
      );
      setProducts(merged);
    } catch (err) {
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
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, productId];
    });
  }
  function handleLongPress(productId) {
    setShowCompare(true);
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) return prev;

      if (prev.length < 3) return [...prev, productId];


      return [...prev.slice(1), productId];
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {}
        {loading ? (
          <SkeletonResult />
        ) : (
          products.map((product) => (
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
              onLongPress={handleLongPress}
            />
          ))
        )}
      </div>
      <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3 z-50">
        <div className="flex justify-center items-center flex-col gap-3">
          {showCompare && (
            <p className="text-white text-2xl font-bold">{`${selectedProducts.length}/3`}</p>
          )}
          <button
            onClick={() => setShowCompare(true)}
            className="glass-button text-2xl text-white px-5 py-3 rounded-full inner-shadow-y font-bold w-70 "
          >
            {showCompare ? "Compare now" : "Compare"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCompare && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="!bg-white/20 fixed bottom-0 left-0 w-full h-[85%] px-5 backdrop-blur-sm inner-shadow-y z-20"
          >
            <div className="flex justify-end items-center mb-4 mt-4">
              <button
                onClick={() => setShowCompare(false)}
                className="text-gray-300 hover:text-white text-2xl cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button className="m-4 fixed bottom-5 right-5 text-2xl text-white px-5 py-3 rounded-full compare-button font-semibold w-50 ">
        Compare
      </button>
    </>
  );
}

export default SearchResults;
