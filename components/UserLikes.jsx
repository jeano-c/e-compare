"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "./Card";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function UserLikes() {
  const [likedProducts, setLikedProducts] = useState([]);
  const [loaded, setLoaded] = useState(false); // ✅ prevent multiple fetches
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded) return; // already fetched, skip
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const fetchLikes = async () => {
      try {
        const res = await axios.get("/api/likes");
        setLikedProducts(res.data.likedProducts || []);
        setLoaded(true); // ✅ mark as fetched
      } catch (err) {
        console.error("Failed to fetch likes:", err);
      }
    };

    fetchLikes();
  }, [isSignedIn, loaded, router]);

  if (!isSignedIn) return null;
  if (!loaded)
    return <p className="text-white text-center">Loading likes...</p>;

  return (
    <div className="p-2 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {likedProducts.length === 0 ? (
        <p className="text-white text-center w-full">
          💔 You haven’t liked any products yet.
        </p>
      ) : (
        likedProducts.map((item) => (
          <Card
            key={item.id}
            products={item}
            showCompare={false}
            isLiked={true}
            onLikeToggle={() => {}}
            
          />
        ))
      )}
    </div>
  );
}

export default UserLikes;
