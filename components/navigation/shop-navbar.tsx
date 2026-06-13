"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

type ShopNavbarProps = {
  initialSearchValue?: string;
  cartCount?: number;
};

export default function ShopNavbar({
  initialSearchValue = "",
  cartCount = 0,
}: ShopNavbarProps) {
  const [searchValue, setSearchValue] = useState(initialSearchValue);
  const [logoError, setLogoError] = useState(false);
  const router = useRouter();

  function handleSearch() {
    const trimmedSearch = searchValue.trim();

    if (!trimmedSearch) {
      router.push("/products");
      return;
    }

    router.push(`/products?search=${encodeURIComponent(trimmedSearch)}`);
  }

  function handleClearSearch() {
    setSearchValue("");
    router.push("/products");
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E5DED6] bg-[#F7F4F0]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-2">
        <div className="flex items-center justify-between gap-4">

          {/* Brand lockup */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            {!logoError && (
              <Image
                src="/brand/cretofit-logo-mark.png"
                alt=""
                width={120}
                height={40}
                priority
                className="h-11 w-auto object-contain md:h-14"
                onError={() => setLogoError(true)}
              />
            )}
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold tracking-tight text-[#C56A1B] md:text-xl">
                Cretofit
              </span>
              <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9B928A] md:block">
                Interior Design & Decor
              </span>
            </div>
          </Link>

          {/* Search — desktop center */}
          <div className="hidden max-w-xl flex-1 md:block">
            <SearchBox
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="group relative flex shrink-0 items-center gap-2 rounded-full border border-[#E5DED6] bg-white px-4 py-2.5 text-sm font-medium text-[#2B2B2B] shadow-sm transition-all duration-200 hover:border-[#C56A1B] hover:text-[#C56A1B]"
          >
            <ShoppingCart size={18} className="transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Cart</span>

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C56A1B] px-1 text-xs font-medium text-white shadow-pop">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search — mobile full width */}
        <div className="mt-3 md:hidden">
          <SearchBox
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        </div>
      </div>
    </nav>
  );
}

function SearchBox({
  value,
  onChange,
  onSearch,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-[#E5DED6] bg-white px-4 py-3 shadow-sm transition focus-within:border-[#C56A1B] focus-within:ring-2 focus-within:ring-[#C56A1B]/15">
      <button
        type="button"
        onClick={onSearch}
        className="text-[#8A8178] transition hover:text-[#C56A1B]"
        aria-label="Search products"
      >
        <Search size={18} />
      </button>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSearch();
          }
        }}
        placeholder="Search products..."
        className="w-full bg-transparent text-sm text-[#2B2B2B] outline-none placeholder:text-[#9B928A]"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          className="text-[#8A8178] transition hover:text-[#C56A1B]"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
