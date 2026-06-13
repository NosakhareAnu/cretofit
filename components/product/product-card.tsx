"use client";

import { addToCart } from "@/lib/cart";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import ProductImage from "@/components/product/product-image";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  isOutOfStock?: boolean;
};

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  isOutOfStock = false,
}: ProductCardProps) {
  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;
    addToCart(id);
  }

  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col rounded-3xl border border-[#E5DED6] bg-white p-2.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-[#DDD2C5] hover:shadow-card sm:p-3"
    >
      <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-[#F2E6DA]">
        <ProductImage
          src={imageUrl}
          alt={name}
          fill
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-[#2B2B2B]/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            Out of stock
          </span>
        )}
      </div>

      <h3 className="line-clamp-2 px-1 text-sm font-medium leading-snug text-[#2B2B2B] transition-colors group-hover:text-[#C56A1B] sm:text-base">
        {name}
      </h3>

      <p className="mt-2 px-1 text-sm font-semibold text-[#C56A1B] sm:text-base">
        ₦{price.toLocaleString()}
      </p>

      <div className="mt-auto pt-4">
        {isOutOfStock ? (
          <div className="w-full cursor-not-allowed rounded-full border border-[#E5DED6] bg-[#F7F4F0] px-4 py-2.5 text-center text-xs font-medium text-[#9B928A] sm:text-sm">
            Unavailable
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C56A1B] px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98] sm:text-sm"
          >
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}
