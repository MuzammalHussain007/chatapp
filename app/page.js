"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-b-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-lg font-semibold">
        Error: {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg font-medium">
        No products found.
      </div>
    );
  }

  return (
    <div className="mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-purple-700">
        Our Products
      </h1>

      <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition duration-300 cursor-pointer flex flex-col"
          >
            {/* Image */}
            <div className="h-56 overflow-hidden">
              <img
                 
                src={product.imageUrl}
                alt={product.title}
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {product.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              </div>

              {/* Price and actions */}
              <div className="mt-auto flex items-center justify-between">
                <p className="text-xl font-bold text-purple-600">
                  ${product.price.toFixed(2)}
                </p>
                <button className="bg-purple-600 text-white py-1.5 px-4 rounded-full hover:bg-purple-700 transition">
                  Buy Now
                </button>
              </div>               
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
