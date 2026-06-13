"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ShoppingCart,
  AlertCircle,
  PackageSearch,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductImage from "@/components/product/product-image";
import { addToCart, getCartCount } from "@/lib/cart";
import ShopNavbar from "@/components/navigation/shop-navbar";
import Footer from "@/components/layout/footer";

type ProductImage = {
  image_url: string;
  position: number;
};

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  is_out_of_stock: boolean;
  images: ProductImage[];
};

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setCartCount(getCartCount());

    function updateCartCount() {
      setCartCount(getCartCount());
    }

    window.addEventListener("cart-updated", updateCartCount);
    return () => window.removeEventListener("cart-updated", updateCartCount);
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(false);
      setNotFound(false);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select(`id, name, price, quantity, description, is_out_of_stock, product_images(image_url, position)`)
        .eq("id", id)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setNotFound(true);
        } else {
          setError(true);
        }
        setLoading(false);
        return;
      }

      const rawImages = Array.isArray(data.product_images)
        ? (data.product_images as ProductImage[])
        : [];
      const images = [...rawImages]
        .filter((img) => !!img.image_url)
        .sort((a, b) => a.position - b.position);

      setProduct({ ...data, images });
      setSelectedIndex(0);
      setLoading(false);
    }

    if (id) fetchProduct();
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (loading) {
    return (
      <main>
        <ShopNavbar cartCount={cartCount} />
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="cf-skeleton h-105 rounded-4xl" />
              <div className="mt-4 grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="cf-skeleton h-20 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <div className="cf-skeleton h-4 w-32 rounded-full" />
              <div className="cf-skeleton h-10 w-3/4 rounded-2xl" />
              <div className="cf-skeleton h-7 w-32 rounded-full" />
              <div className="cf-skeleton mt-2 h-24 rounded-2xl" />
              <div className="cf-skeleton mt-4 h-12 w-48 rounded-full" />
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (notFound) {
    return (
      <main>
        <ShopNavbar cartCount={cartCount} />
        <section className="mx-auto max-w-3xl px-6 py-24">
          <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-16 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E6DA] text-[#C56A1B]">
              <PackageSearch size={24} />
            </span>
            <h1 className="mt-5 text-xl font-semibold text-[#2B2B2B]">Product not found</h1>
            <p className="mt-2 text-sm text-[#6F6A65]">
              This product may have been removed or the link is incorrect.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#C56A1B] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#A85716]"
            >
              <ArrowLeft size={16} />
              Back to Products
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main>
        <ShopNavbar cartCount={cartCount} />
        <section className="mx-auto max-w-3xl px-6 py-24">
          <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-16 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={24} />
            </span>
            <h1 className="mt-5 text-xl font-semibold text-[#2B2B2B]">Could not load product</h1>
            <p className="mt-2 text-sm text-[#6F6A65]">Please try refreshing the page.</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const hasImages = product.images.length > 0;
  const selectedImage = hasImages ? product.images[selectedIndex] : null;
  const isUnavailable = product.is_out_of_stock || product.quantity <= 0;

  return (
    <main>
      <ShopNavbar cartCount={cartCount} />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6F6A65] transition-colors hover:text-[#C56A1B]"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="flex h-105 items-center justify-center overflow-hidden rounded-4xl border border-[#E5DED6] bg-[#F2E6DA] shadow-soft">
              <ProductImage
                src={selectedImage?.image_url}
                alt={product.name}
                width={800}
                height={600}
                priority
              />
            </div>

            {hasImages && product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.position}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`h-20 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      selectedIndex === index
                        ? "border-[#C56A1B] ring-2 ring-[#C56A1B]/15"
                        : "border-[#E5DED6] hover:border-[#C56A1B]"
                    }`}
                  >
                    <ProductImage
                      src={image.image_url}
                      alt={`${product.name} view ${index + 1}`}
                      width={120}
                      height={80}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
              Product Details
            </p>

            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#2B2B2B] md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 font-display text-3xl font-semibold text-[#C56A1B]">
              ₦{product.price.toLocaleString()}
            </p>

            {!isUnavailable && product.quantity <= 5 && (
              <p className="mt-3 text-sm font-medium text-amber-600">
                Only {product.quantity} left in stock
              </p>
            )}

            {product.description && (
              <p className="mt-6 leading-7 text-[#6F6A65]">{product.description}</p>
            )}

            <div className="mt-9">
              {isUnavailable ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-6 py-3.5 text-sm font-medium text-red-600">
                  <AlertCircle size={16} />
                  Currently out of stock
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className={`group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 active:scale-[0.98] md:w-fit ${
                    added
                      ? "bg-green-600"
                      : "bg-[#C56A1B] hover:bg-[#A85716] hover:shadow-pop"
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={16} />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Add to Cart
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
