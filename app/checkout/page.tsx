"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import ShopNavbar from "@/components/navigation/shop-navbar";
import Footer from "@/components/layout/footer";
import { supabase } from "@/lib/supabase";
import {
  CartItem,
  cleanInvalidCartItems,
  getCartCount,
  saveCartItems,
} from "@/lib/cart";

type DbProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  is_out_of_stock: boolean;
};

type CartProduct = {
  productId: string;
  name: string;
  price: number;
  cartQuantity: number;
  total: number;
  unavailable: boolean;
  outOfStock: boolean;
  quantityExceeded: boolean;
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [dbProducts, setDbProducts] = useState<Map<string, DbProduct>>(new Map());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [secondPhone, setSecondPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  useEffect(() => {
    const items = cleanInvalidCartItems();
    setCartItems(items);
    setCartCount(getCartCount());
    fetchProducts(items);
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
      console.error("Checkout products fetch error:", error);
      setFetchError(true);
      setLoading(false);
      return;
    }

    const map = new Map<string, DbProduct>();
    for (const row of data ?? []) {
      map.set(row.id, row as DbProduct);
    }
    setDbProducts(map);
    setLoading(false);
  }

  const cartProducts = useMemo((): CartProduct[] => {
    return cartItems.map((item) => {
      const product = dbProducts.get(item.productId);
      if (!product) {
        return {
          productId: item.productId,
          name: "Item no longer available",
          price: 0,
          cartQuantity: item.quantity,
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
        cartQuantity: item.quantity,
        total: product.price * item.quantity,
        unavailable: false,
        outOfStock,
        quantityExceeded,
      };
    });
  }, [cartItems, dbProducts]);

  const subtotal = useMemo(
    () =>
      cartProducts
        .filter((p) => !p.unavailable)
        .reduce((sum, p) => sum + p.total, 0),
    [cartProducts]
  );

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Full name is required.";
    if (!phone.trim()) errors.phone = "Phone number is required.";
    if (!address.trim()) errors.address = "Delivery address is required.";

    for (const item of cartProducts) {
      if (item.unavailable) {
        errors.cart = "Remove unavailable items from your cart before proceeding.";
        break;
      }
      const product = dbProducts.get(item.productId);
      if (product?.is_out_of_stock) {
        errors.cart = `"${item.name}" is currently out of stock.`;
        break;
      }
      if (product && item.cartQuantity > product.quantity) {
        errors.cart = `Only ${product.quantity} unit(s) of "${item.name}" are available.`;
        break;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    const productIds = cartItems.map((i) => i.productId);
    const { data: freshData, error: freshError } = await supabase
      .from("products")
      .select("id, name, price, quantity, is_out_of_stock")
      .in("id", productIds);

    if (freshError) {
      console.error("Order stock validation error:", freshError);
      setSubmitError("Could not validate stock. Please try again.");
      setSubmitting(false);
      return;
    }

    const freshMap = new Map<string, DbProduct>(
      (freshData ?? []).map((p) => [p.id, p as DbProduct])
    );

    for (const item of cartItems) {
      const product = freshMap.get(item.productId);
      if (!product) {
        setSubmitError("One or more items in your cart are no longer available.");
        setSubmitting(false);
        return;
      }
      if (product.is_out_of_stock) {
        setSubmitError(`"${product.name}" is currently out of stock.`);
        setSubmitting(false);
        return;
      }
      if (item.quantity > product.quantity) {
        setSubmitError(
          `Only ${product.quantity} unit(s) of "${product.name}" are available.`
        );
        setSubmitting(false);
        return;
      }
    }

    const orderId = crypto.randomUUID();
    const finalSubtotal = cartItems.reduce((sum, item) => {
      const p = freshMap.get(item.productId);
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);

    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      customer_name: name.trim(),
      phone: phone.trim(),
      second_phone: secondPhone.trim() || null,
      email: email.trim() || null,
      address: address.trim(),
      subtotal: finalSubtotal,
      status: "pending",
    });

    if (orderError) {
      console.error("Order insert error:", orderError);
      setSubmitError(`Failed to submit your order: ${orderError.message}`);
      setSubmitting(false);
      return;
    }

    const orderItems = cartItems.map((item) => {
      const p = freshMap.get(item.productId)!;
      return {
        order_id: orderId,
        product_id: item.productId,
        product_name: p.name,
        unit_price: p.price,
        quantity: item.quantity,
        total: p.price * item.quantity,
      };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      await supabase.from("orders").delete().eq("id", orderId);
      setSubmitError("Failed to submit your order. Please try again.");
      setSubmitting(false);
      return;
    }

    saveCartItems([]);
    setOrderSubmitted(true);
    setSubmitting(false);
  }

  if (orderSubmitted) {
    return (
      <main>
        <ShopNavbar cartCount={0} />
        <section className="mx-auto max-w-3xl px-6 py-20">
          <div className="animate-fade-up rounded-3xl border border-[#E5DED6] bg-white px-6 py-16 text-center shadow-card">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={30} />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
              Order Received
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#2B2B2B]">
              Thank you for your order.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6F6A65]">
              A Cretofit representative will contact you shortly via phone or email to
              confirm payment and arrange delivery.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C56A1B] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98]"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <ShopNavbar cartCount={cartCount} />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
            Checkout
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B] md:text-5xl">
            Confirm your order details.
          </h1>
        </div>

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="cf-skeleton h-105 rounded-3xl" />
            <div className="cf-skeleton h-64 rounded-3xl" />
          </div>
        ) : fetchError ? (
          <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-20 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={24} />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-[#2B2B2B]">Could not load your cart</h2>
            <p className="mt-2 text-sm text-[#6F6A65]">Please refresh the page.</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-20 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E6DA] text-[#C56A1B]">
              <ShoppingBag size={24} />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-[#2B2B2B]">Your cart is empty</h2>
            <p className="mt-2 text-sm text-[#6F6A65]">
              Add products to your cart before checking out.
            </p>
            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#C56A1B] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#A85716] active:scale-[0.98]"
            >
              Browse Products
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              {submitError && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {fieldErrors.cart && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {fieldErrors.cart}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-3xl border border-[#E5DED6] bg-white p-6 shadow-soft md:p-8"
              >
                <h2 className="font-display text-xl font-semibold text-[#2B2B2B]">
                  Customer Information
                </h2>

                <div className="mt-6 grid gap-5">
                  <div>
                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      placeholder="Full name"
                      className={`w-full rounded-full border px-5 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15 ${
                        fieldErrors.name ? "border-red-400" : "border-[#E5DED6]"
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1.5 px-2 text-xs text-red-600">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <input
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      placeholder="Phone number"
                      className={`w-full rounded-full border px-5 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15 ${
                        fieldErrors.phone ? "border-red-400" : "border-[#E5DED6]"
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1.5 px-2 text-xs text-red-600">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <input
                    value={secondPhone}
                    onChange={(e) => setSecondPhone(e.target.value)}
                    placeholder="Second phone number (optional)"
                    className="w-full rounded-full border border-[#E5DED6] px-5 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15"
                  />

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Email address (optional)"
                    className="w-full rounded-full border border-[#E5DED6] px-5 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15"
                  />

                  <div>
                    <textarea
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, address: "" }));
                      }}
                      placeholder="Delivery location / address"
                      rows={5}
                      className={`w-full resize-none rounded-2xl border px-5 py-4 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15 ${
                        fieldErrors.address ? "border-red-400" : "border-[#E5DED6]"
                      }`}
                    />
                    {fieldErrors.address && (
                      <p className="mt-1.5 px-2 text-xs text-red-600">{fieldErrors.address}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#C56A1B] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm"
                >
                  {submitting ? "Submitting order…" : "Confirm Order"}
                  {!submitting && <ArrowRight size={16} />}
                </button>
              </form>
            </div>

            <aside className="h-fit rounded-3xl border border-[#E5DED6] bg-white p-6 shadow-soft lg:sticky lg:top-28">
              <h2 className="font-display text-xl font-semibold text-[#2B2B2B]">Order Summary</h2>

              <div className="mt-6 space-y-4">
                {cartProducts.map((item) => {
                  const hasIssue = item.unavailable || item.outOfStock || item.quantityExceeded;
                  return (
                    <div key={item.productId} className="text-sm">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p
                            className={`font-medium ${
                              hasIssue ? "text-red-500" : "text-[#2B2B2B]"
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="mt-1 text-[#6F6A65]">Qty: {item.cartQuantity}</p>
                        </div>
                        {!item.unavailable && !item.outOfStock && (
                          <p className="font-medium text-[#C56A1B]">
                            ₦{item.total.toLocaleString()}
                          </p>
                        )}
                      </div>
                      {item.outOfStock && (
                        <p className="mt-1 text-xs text-red-500">Out of stock</p>
                      )}
                      {item.quantityExceeded && (
                        <p className="mt-1 text-xs text-amber-600">
                          Quantity exceeds available stock
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-between border-t border-[#E5DED6] pt-4">
                <span className="text-sm text-[#6F6A65]">Subtotal</span>
                <span className="font-semibold text-[#2B2B2B]">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
