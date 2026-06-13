"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  AlertCircle,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import ShopNavbar from "@/components/navigation/shop-navbar";
import Footer from "@/components/layout/footer";
import { supabase } from "@/lib/supabase";
import { buildImageMap, type ImageRow } from "@/lib/product-images";
import ProductImage from "@/components/product/product-image";
import {
  CartItem,
  cleanInvalidCartItems,
  decreaseQuantity,
  getCartCount,
  getCartItems,
  increaseQuantity,
  removeFromCart,
} from "@/lib/cart";

type DbProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  is_out_of_stock: boolean;
  imageUrl: string | null;
};

type CartEntry = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  cartQty: number;
  availableQty: number | null;
  total: number;
  unavailable: boolean;
  outOfStock: boolean;
  quantityExceeded: boolean;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [dbProducts, setDbProducts] = useState<Map<string, DbProduct>>(new Map());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const items = cleanInvalidCartItems();
    setCartItems(items);
    setCartCount(getCartCount());
    fetchProducts(items);

    function handleCartUpdated() {
      setCartItems(getCartItems());
      setCartCount(getCartCount());
    }

    window.addEventListener("cart-updated", handleCartUpdated);
    return () => window.removeEventListener("cart-updated", handleCartUpdated);
  }, []);

  async function fetchProducts(items: CartItem[]) {
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    setFetchError(false);
    const productIds = items.map((i) => i.productId);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, quantity, is_out_of_stock")
      .in("id", productIds);

    if (error) {
      console.error("Cart products fetch error:", error);
      setFetchError(true);
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    const { data: imgData } = await supabase
      .from("product_images")
      .select("product_id, image_url, position")
      .in("product_id", productIds)
      .order("position", { ascending: true });
    const imageMap = buildImageMap((imgData ?? []) as ImageRow[]);

    const map = new Map<string, DbProduct>();
    for (const row of rows) {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        price: row.price,
        quantity: row.quantity,
        is_out_of_stock: row.is_out_of_stock,
        imageUrl: imageMap.get(row.id) ?? null,
      });
    }

    setDbProducts(map);
    setLoading(false);
  }

  const cartEntries = useMemo((): CartEntry[] => {
    return cartItems.map((item) => {
      const product = dbProducts.get(item.productId);

      if (!product) {
        return {
          productId: item.productId,
          name: "Item no longer available",
          price: 0,
          imageUrl: null,
          cartQty: item.quantity,
          availableQty: null,
          total: 0,
          unavailable: true,
          outOfStock: false,
          quantityExceeded: false,
        };
      }

      const outOfStock = product.is_out_of_stock || product.quantity <= 0;
      const quantityExceeded = !outOfStock && item.quantity > product.quantity;

      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        cartQty: item.quantity,
        availableQty: outOfStock ? null : product.quantity,
        total: product.price * item.quantity,
        unavailable: false,
        outOfStock,
        quantityExceeded,
      };
    });
  }, [cartItems, dbProducts]);

  const subtotal = useMemo(
    () =>
      cartEntries
        .filter((e) => !e.unavailable && !e.outOfStock)
        .reduce((sum, e) => sum + e.total, 0),
    [cartEntries]
  );

  const hasCartIssues = useMemo(
    () => cartEntries.some((e) => e.unavailable || e.outOfStock || e.quantityExceeded),
    [cartEntries]
  );

  return (
    <main>
      <ShopNavbar cartCount={cartCount} />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
            Cart
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B] md:text-5xl">
            Review your selected items.
          </h1>
        </div>

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="grid gap-4 rounded-3xl border border-[#E5DED6] bg-white p-4 sm:grid-cols-[120px_1fr]"
                >
                  <div className="cf-skeleton h-32 rounded-2xl" />
                  <div className="flex flex-col gap-3 py-1">
                    <div className="cf-skeleton h-5 w-1/2 rounded-full" />
                    <div className="cf-skeleton h-4 w-24 rounded-full" />
                    <div className="cf-skeleton mt-auto h-9 w-32 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="cf-skeleton h-48 rounded-3xl" />
          </div>
        ) : fetchError ? (
          <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-20 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={24} />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-[#2B2B2B]">Could not load cart</h2>
            <p className="mt-2 text-sm text-[#6F6A65]">Please refresh the page.</p>
          </div>
        ) : cartEntries.length === 0 ? (
          <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-20 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E6DA] text-[#C56A1B]">
              <ShoppingBag size={24} />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-[#2B2B2B]">Your cart is empty</h2>
            <p className="mt-2 text-sm text-[#6F6A65]">
              Browse products and add items to your cart.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#C56A1B] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98]"
            >
              Browse Products
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cartEntries.map((entry) => {
                const hasIssue =
                  entry.unavailable || entry.outOfStock || entry.quantityExceeded;
                const canIncrease =
                  !entry.unavailable &&
                  !entry.outOfStock &&
                  (entry.availableQty === null || entry.cartQty < entry.availableQty);

                return (
                  <div
                    key={entry.productId}
                    className={`grid gap-4 rounded-3xl border bg-white p-4 shadow-soft transition-shadow hover:shadow-card sm:grid-cols-[120px_1fr] ${
                      hasIssue ? "border-red-200 bg-red-50/30" : "border-[#E5DED6]"
                    }`}
                  >
                    <div className="flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-[#F2E6DA]">
                      <ProductImage
                        src={entry.imageUrl}
                        alt={entry.name}
                        width={120}
                        height={128}
                        placeholderText={entry.unavailable ? "Unavailable" : "No image"}
                      />
                    </div>

                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2
                            className={`font-medium ${
                              hasIssue ? "text-red-600" : "text-[#2B2B2B]"
                            }`}
                          >
                            {entry.name}
                          </h2>

                          {entry.unavailable && (
                            <p className="mt-1 text-xs text-red-500">
                              This product is no longer available. Please remove it.
                            </p>
                          )}

                          {entry.outOfStock && !entry.unavailable && (
                            <p className="mt-1 text-xs text-red-500">
                              This product is currently out of stock. Please remove it or wait for restock.
                            </p>
                          )}

                          {entry.quantityExceeded && entry.availableQty !== null && (
                            <p className="mt-1 text-xs text-amber-600">
                              Only {entry.availableQty} unit
                              {entry.availableQty === 1 ? "" : "s"} available. Please reduce quantity.
                            </p>
                          )}

                          {!hasIssue && (
                            <p className="mt-1 text-sm font-medium text-[#C56A1B]">
                              ₦{entry.price.toLocaleString()}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(entry.productId)}
                          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[#8A8178] transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remove ${entry.name}`}
                        >
                          <Trash2 size={15} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>

                      {!entry.unavailable && !entry.outOfStock && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="flex items-center overflow-hidden rounded-full border border-[#E5DED6]">
                            <button
                              onClick={() => decreaseQuantity(entry.productId)}
                              className="flex h-9 w-10 items-center justify-center text-[#2B2B2B] transition-colors hover:bg-[#F2E6DA]"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={15} />
                            </button>
                            <span className="w-10 text-center text-sm font-medium">{entry.cartQty}</span>
                            <button
                              onClick={() => increaseQuantity(entry.productId)}
                              disabled={!canIncrease}
                              className="flex h-9 w-10 items-center justify-center text-[#2B2B2B] transition-colors hover:bg-[#F2E6DA] disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <p className={`font-semibold ${entry.quantityExceeded ? "text-amber-600" : "text-[#2B2B2B]"}`}>
                            ₦{entry.total.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-3xl border border-[#E5DED6] bg-white p-6 shadow-soft lg:sticky lg:top-28">
              <h2 className="font-display text-xl font-semibold text-[#2B2B2B]">Order Summary</h2>

              <div className="mt-6 flex justify-between border-b border-[#E5DED6] pb-4 text-sm">
                <span className="text-[#6F6A65]">Subtotal</span>
                <span className="font-semibold text-[#2B2B2B]">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#9B928A]">
                Delivery and payment are arranged after our team confirms your order.
              </p>

              {hasCartIssues ? (
                <div className="mt-6">
                  <p className="mb-3 text-center text-xs text-red-600">
                    Resolve the issues above before proceeding.
                  </p>
                  <div className="flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#E5DED6] px-6 py-3.5 text-center text-sm font-medium text-[#9B928A]">
                    Proceed to Checkout
                  </div>
                </div>
              ) : (
                <Link
                  href="/checkout"
                  className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#C56A1B] px-6 py-3.5 text-center text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98]"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </Link>
              )}
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
