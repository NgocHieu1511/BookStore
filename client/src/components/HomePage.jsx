import { useEffect, useState } from "react";

import { listCategory } from "../config/categoryRequest";
import { listProducts } from "../config/productRequest";
import ProductCard from "./ProductCard";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await listCategory();

        setCategories(res.metadata || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await listProducts();

        setProducts(res.metadata || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchCategory();
    fetchProducts();
  }, []);

  return (
    <section className="w-full bg-white py-[48px]">
      <div className="mx-auto flex max-w-[1260px] gap-[56px]">
        {/* =========================
            DANH MỤC
        ========================= */}
        <aside className="w-[260px] shrink-0">
          <div className="overflow-hidden rounded-[10px] border border-gray-300 bg-white">
            {/* Tiêu đề */}
            <div className="flex h-[73px] items-center border-b border-gray-300 bg-[#eef3ff] px-[20px]">
              <h2 className="text-[22px] font-bold text-[#111827]">Danh mục</h2>
            </div>

            {/* Danh sách danh mục */}
            {categories.length > 0 ? (
              categories.map((category) => {
                return (
                  <div
                    key={category._id}
                    className="
                      flex
                      min-h-[67px]
                      items-center
                      gap-[18px]
                      border-b
                      border-gray-300
                      px-[20px]
                      last:border-b-0
                      cursor-pointer
                      transition
                      hover:bg-orange-50
                    "
                  >
                    <img
                      src={category.imageCategory}
                      alt={category.nameCategory}
                      className="h-[40px] w-[40px] rounded-full object-cover"
                    />

                    <span
                      className="
                        text-[18px]
                        font-medium
                        leading-[24px]
                        text-[#111827]
                      "
                    >
                      {category.nameCategory}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="p-5 text-gray-500">No categories found.</p>
            )}
          </div>
        </aside>

        {/* =========================
            NEW ARRIVALS
        ========================= */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <div className="mb-[30px] flex items-center justify-between">
            <h1
              className="
                font-serif
                text-[32px]
                leading-[38px]
                text-[#071b3a]
              "
            >
              New Arrivals
            </h1>

            <button
              className="
                text-[16px]
                font-medium
                text-[#b65300]
                transition
                hover:text-[#8f4100]
              "
            >
              View All
            </button>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <div
              className="
                grid
                grid-cols-5
                gap-x-[20px]
                gap-y-[40px]
              "
            >
              {products.map((item) => (
                <ProductCard key={item._id} dataItem={item} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products found.</p>
          )}
        </main>
      </div>
    </section>
  );
}

export default HomePage;
