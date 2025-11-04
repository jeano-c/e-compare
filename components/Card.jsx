"use client";
import { cn } from "@/lib/utils";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function Card({
  products,
  showCompare,
  isSelected,
  onToggle,
  isDisabled,
  onLongPress,
  isLiked,
  onLikeToggle,
}) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const pressTimer = useRef(null);
  const [isPressed, setIsPressed] = useState(false);
  const [liked, setLiked] = useState(isLiked);

  useEffect(() => {
    if (showCompare && pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      setIsPressed(false);
    }
  }, [showCompare]);

  const handlePressStart = (e) => {
    e.preventDefault();
    setIsPressed(true);
    pressTimer.current = setTimeout(() => {
      if (onLongPress) onLongPress(products.id);
      setIsPressed(false);
    }, 500);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    onLikeToggle(newLiked);

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      if (newLiked) {
        await axios.post("/api/likes", {
          snapshot: {
            id: products.id,
            source: products.source,
            name: products.name,
            merchant: products.merchant,
            image: products.image,
            price: products.price,
            link: products.link,
          },
        });
        console.log("❤️ Like saved!");
      } else {
        await axios.delete(`/api/likes`, {
          data: { product_id: products.id },
        });
        console.log("💔 Like removed!");
      }
    } catch (error) {
      console.error("Error saving like:", error);
      setLiked(!newLiked); // revert UI if failed
      onLikeToggle(!newLiked);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full  glass-button rounded-2xl p-4 gap-3 relative cursor-pointer transition-all duration-150 select-none inner-shadow-y",
        showCompare && "z-30",
        isDisabled && "opacity-50",
        isPressed && "scale-95"
      )}
      onMouseDown={!showCompare ? handlePressStart : undefined}
      onMouseUp={!showCompare ? handlePressEnd : undefined}
      onMouseLeave={!showCompare ? handlePressEnd : undefined}
      onTouchStart={!showCompare ? handlePressStart : undefined}
      onTouchEnd={!showCompare ? handlePressEnd : undefined}
      onTouchCancel={!showCompare ? handlePressEnd : undefined}
      onClick={showCompare && !isDisabled ? onToggle : undefined}
    >
      {/* Header Section */}
      <div className="flex justify-center items-start">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-xl font-bold text-white truncate">
            {products.name}
          </p>
          <p className="text-white text-[14px] truncate">
            {products.merchant || "merchant"}
          </p>
        </div>

        {showCompare ? (
          <input
            type="checkbox"
            className="glass-checkbox cursor-pointer"
            checked={isSelected}
            onChange={onToggle}
            disabled={isDisabled && !isSelected}
          />
        ) : (
          <button
            type="button"
            onClick={handleLike}
            className="transition-transform hover:scale-110"
          >
            {liked ? (
              <FaHeart className="text-2xl text-red-500" />
            ) : (
              <FaRegHeart className="text-2xl text-white" />
            )}
          </button>
        )}
      </div>

      {/* Image Section */}
      <div className="flex items-center justify-center">
        <img
          className="w-full aspect-square object-cover pointer-events-none rounded-xl"
          src={products.image}
          alt={products.name}
        />
      </div>

      {/* Price and Button */}
      <div className="flex justify-between items-center ml-2">
        <div className="flex flex-col items-start">
          <p className="text-white text-xl font-medium">₱ {products.price}</p>
          
        </div>
        <button className="w-[116px] h-[44px] text-[16px] compare-button text-white rounded-2xl hover:opacity-80 transition-opacity">
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default Card;
