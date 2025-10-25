import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";

function Card({
  products,
  showCompare,
  isSelected,
  onToggle,
  isDisabled,
  onLongPress,
}) {
  const pressTimer = useRef(null);
  const [isPressed, setIsPressed] = useState(false);
  const [liked, setLiked] = useState(false);

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

  const handleLike = (e) => {
    e.stopPropagation(); //
    setLiked((prev) => !prev);
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full min-h-[450px] max-h-[550px] glass-button rounded-2xl p-4 gap-3 relative cursor-pointer transition-all duration-150 select-none inner-shadow-y",
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
      <div className="flex justify-between items-start gap-3">
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
      <div className="flex-1 flex items-center justify-center">
        <img
          className="w-full aspect-square object-cover pointer-events-none rounded-xl"
          src={products.image}
          alt={products.name}
        />
      </div>

      {/* Price and Button */}
      <div className="flex justify-between items-center gap-3 mb-4">
        <p className="text-white text-xl font-bold">₱ {products.price}</p>
        <button className="w-[116px] h-[44px] text-[16px] compare-button text-white rounded-2xl hover:opacity-80 transition-opacity">
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default Card;
