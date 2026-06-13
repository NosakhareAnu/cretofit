"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/products", label: "Products" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact Us" },
];

export default function MainNavbar() {
  const [open, setOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E5DED6] bg-[#F7F4F0]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">

        {/* Brand lockup */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
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
            <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9B928A] sm:block">
              Interior Design & Decor
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-9 text-sm font-medium text-[#2B2B2B] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative transition-colors hover:text-[#C56A1B] after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-[#C56A1B] after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/products"
            className="rounded-full bg-[#C56A1B] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98]"
          >
            Shop Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#2B2B2B] transition hover:bg-[#F2E6DA] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-[#E5DED6] transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          open ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-[#2B2B2B] transition hover:bg-[#F2E6DA] hover:text-[#C56A1B]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-2xl bg-[#C56A1B] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#A85716]"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
