import React from "react";
import Card from "@/components/Card";
const dummyData = [
  {
    id: 1,
    name: "This is some very long text that will be cut off",
    shopName: "Shop One",
    price: "$25",
    merchant: "Merchant X",
  },
  {
    id: 2,
    name: "Product B",
    shopName: "Shop Two",
    price: "$40",
    merchant: "Merchant Y",
  },
  {
    id: 3,
    name: "Product C",
    shopName: "Shop Three",
    price: "$15",
    merchant: "Merchant Z",
  },
  {
    id: 4,
    name: "Product D",
    shopName: "Shop Four",
    price: "$60",
    merchant: "Merchant X",
  },
  {
    id: 5,
    name: "Product E",
    shopName: "Shop Five",
    price: "$30",
    merchant: "Merchant Y",
  },
];
function SearchResults() {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {dummyData.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
      <button className="fixed bottom-5 right-5 text-2xl text-white px-5 py-3 rounded-full inner-shadow-y font-bold w-50 ">
        Compare
      </button>

    </>
  );
}

export default SearchResults;
