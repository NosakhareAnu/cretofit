import type { Metadata } from "next";
import { Suspense } from "react";
import ShopNavbar from "@/components/navigation/shop-navbar";
import Footer from "@/components/layout/footer";
import ProductsContent from "./products-client";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Cretofit's curated selection of interior design products — furniture, lighting, decor, and more. Available for delivery across Lagos and Lekki.",
  alternates: { canonical: "/products" },
};

function ProductsFallback() {
  return (
    <main>
      <ShopNavbar />
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
            Products
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B] md:text-5xl">
            Shop curated interior pieces.
          </h1>
        </div>
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
      </section>
      <Footer />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsContent />
    </Suspense>
  );
}
