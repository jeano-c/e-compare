import React from "react";
import { FaRegHeart } from "react-icons/fa";
function Card({ product }) {
  return (
    <div className="flex flex-col w-full min-h-[300px] inner-shadow-y rounded-2xl p-4 gap-3">
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-xl font-bold text-white truncate">
            {product.name}
          </p>
          <p className="text-white text-20 truncate">{product.merchant}</p>
        </div>
        <FaRegHeart className="text-2xl text-white flex-shrink-0" />
      </div>
      <div>
        <img className="rounded-2xl" src="/iphone.webp" alt="" />
      </div>
      <div className="flex justify-between items-center gap-3 ">
        <p className="text-white text-xl font-bold">{product.price}</p>
        <button className="inner-shadow-y text-xl text-white py-2 px-3 rounded-2xl">Buy Now</button>
      </div>
    </div>
  );
}

export default Card;
