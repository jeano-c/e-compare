import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
function Card({
  products,
  showCompare,
  isSelected,
  onToggle,
  isDisabled,
  onLongPress,
}) {
  const pressTimer = useRef(null);
  const pressStartTime = useRef(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (showCompare) {
      setIsPressed(false);
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    }
  }, [showCompare]);
  const handlePressStart = (e) => {
    e.preventDefault();
    setIsPressed(true);
    pressStartTime.current = Date.now();
    pressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress(products.id);
      }
      setIsPressed(false);
    }, 500);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressStartTime.current = null;
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full min-h-[300px] inner-shadow-y rounded-2xl p-4 gap-3 relative cursor-pointer transition-all duration-150",
        showCompare && "z-30",
        isDisabled && "opacity-50",
        isPressed && "scale-95", // Scale down when pressed
        "select-none" // Prevent text selection during long press
      )}
      onMouseDown={!showCompare ? handlePressStart : undefined}
      onMouseUp={!showCompare ? handlePressEnd : undefined}
      onMouseLeave={!showCompare ? handlePressEnd : undefined}
      onTouchStart={!showCompare ? handlePressStart : undefined}
      onTouchEnd={!showCompare ? handlePressEnd : undefined}
      onTouchCancel={!showCompare ? handlePressEnd : undefined}
      onClick={showCompare && !isDisabled ? onToggle : undefined}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-xl font-bold text-white truncate">
            {products.name}
          </p>
          <p className="text-white text-20 truncate">
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
          <FaRegHeart className="text-2xl text-white flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" />
        )}
      </div>

      <div>
        <img
          className="w-full h-full object-cover pointer-events-none"
          src={products.image}
          alt={products.name}
        />
      </div>

      <div className="flex justify-between items-center gap-3">
        <p className="text-white text-xl font-bold">₱ {products.price}</p>
        <button className="inner-shadow-y text-xl text-white py-2 px-3 rounded-2xl hover:opacity-80 transition-opacity">
          Buy {products.source}
        </button>
      </div>
    </div>
  );
}
export default Card;
