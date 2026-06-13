"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, PackageSearch } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCartCount } from "@/lib/cart";
import { buildImageMap, type ImageRow } from "@/lib/product-images";
import ShopNavbar from "@/components/navigation/shop-navbar";
import ProductCard from "@/components/product/product-card";
import Footer from "@/components/layout/footer";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
};

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());

    function updateCartCount() {
      setCartCount(getCartCount());
    }

    window.addEventListener("cart-updated", updateCartCount);
    return () => window.removeEventListener("cart-updated", updateCartCount);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(false);

      let query = supabase
        .from("products")
        .select("id, name, price")
        .eq("is_out_of_stock", false)
        .gt("quantity", 0)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Products fetch error:", fetchError);
        setError(true);
        setLoading(false);
        return;
      }

      const rows = data ?? [];
      const productIds = rows.map((r) => r.id);

      let imageMap = new Map<string, string>();
      if (productIds.length > 0) {
        const { data: imgData } = await supabase
          .from("product_images")
          .select("product_id, image_url, position")
          .in("product_id", productIds)
          .order("position", { ascending: true });
        imageMap = buildImageMap((imgData ?? []) as ImageRow[]);
      }

      const mapped: Product[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        price: row.price,
        imageUrl: imageMap.get(row.id) ?? null,
      }));

      setProducts(mapped);
      setLoading(false);
    }

    fetchProducts();
  }, [searchQuery]);

  return (
    <main>
      <ShopNavbar initialSearchValue={searchQuery} cartCount={cartCount} />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
            Products
          </p>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B] md:text-5xl">
            Shop curated interior pieces.
          </h1>
        </div>

        {searchQuery && !loading && (
          <p className="mb-6 text-sm text-[#6F6A65]">
            Showing results for{" "}
            <span className="font-medium text-[#2B2B2B]">&ldquo;{searchQuery}&rdquo;</span>
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-[#E5DED6] bg-white p-2.5 shadow-soft sm:p-3"
              >
                <div className="cf-skeleton mb-4 aspect-square rounded-2xl" />
                <div className="cf-skeleton mx-1 h-4 w-3/4 rounded-full" />
                <div className="cf-skeleton mx-1 mt-2.5 h-4 w-1/3 rounded-full" />
                <div className="cf-skeleton mx-1 mt-4 h-9 rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-20 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={24} />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-[#2B2B2B]">
              Could not load products
            </h2>
            <p className="mt-2 text-sm text-[#6F6A65]">
              Please try refreshing the page.
            </p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-20 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E6DA] text-[#C56A1B]">
              <PackageSearch size={24} />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-[#2B2B2B]">
              No products found
            </h2>
            <p className="mt-2 text-sm text-[#6F6A65]">
              {searchQuery
                ? "Try searching for another product name."
                : "New pieces are on their way — check back soon."}
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
