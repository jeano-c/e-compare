"use client";
import React, { useEffect, useState } from "react";
import Card from "@/components/Card";
import axios from "axios";
import SkeletonResult from "./SkeletonResult";

function SearchResults({ query }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function GetProducts() {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/search?keyword=${encodeURIComponent(query)}`
      );
      const lazadaItems =
        res.data.lazada?.mods?.listItems?.map((item) => ({
          source: "Lazada",
          name: item.name,
          image: item.image,
          merchant: item.sellerName,
          price: parseFloat(item.price.replace(/[^\d.]/g, "")), // remove ₱, commas
          link:
            item.productUrl || `https://www.lazada.com.ph/products/${item.nid}`,
        })) || [];
      const shopeeItems =
        res.data.shopee?.items?.map((item) => ({
          source: "Shopee",
          name: item.item_basic.name,
          merchant: "shop",
          image: `https://down-ph.img.susercontent.com/file/${item.item_basic.image}`,
          price: item.item_basic.price / 100000, // Shopee prices are *100000
          link: `https://shopee.ph/product/${item.item_basic.shopid}/${item.item_basic.itemid}`,
        })) || [];
      const merged = [...lazadaItems, ...shopeeItems].sort(
        (a, b) => a.price - b.price
      );
      setProducts(merged);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (query) GetProducts(query);
  }, [query]);
  return (
    <>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {}
        {loading ? (
          <SkeletonResult />
        ) : (
          products.map((product) => (
            <Card key={product.id} products={product} />
          ))
        )}
      </div>
      <button className="m-4 fixed bottom-5 right-5 text-2xl text-white px-5 py-3 rounded-full compare-button font-semibold w-50 ">
        Compare
      </button>
    </>
  );
}

export default SearchResults;
