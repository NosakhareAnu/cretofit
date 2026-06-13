import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

const featuredProducts = [
  {
    id: 1,
    name: "Modern Lounge Chair",
    price: "₦180,000",
  },
  {
    id: 2,
    name: "Wooden Center Table",
    price: "₦95,000",
  },
  {
    id: 3,
    name: "Decorative Wall Panel",
    price: "₦75,000",
  },
];

export default function FeaturedProductsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
            Featured Products
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B] md:text-4xl">
            Curated pieces for refined spaces.
          </h2>
        </div>

        <Link
          href="/products"
          className="group hidden items-center gap-2 rounded-full border border-[#E5DED6] bg-white px-6 py-3 text-sm font-medium text-[#2B2B2B] transition-all duration-200 hover:border-[#C56A1B] hover:text-[#C56A1B] sm:inline-flex"
        >
          View Our Products
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {featuredProducts.map((product) => (
          <div
            key={product.id}
            className="group rounded-3xl border border-[#E5DED6] bg-white p-3 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
          >
            <div className="cf-placeholder mb-5 flex h-64 items-center justify-center overflow-hidden rounded-2xl">
              <ImageIcon
                size={26}
                strokeWidth={1.4}
                className="text-[#C56A1B] opacity-70 transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <h3 className="px-1 text-lg font-medium text-[#2B2B2B] transition-colors group-hover:text-[#C56A1B]">
              {product.name}
            </h3>
            <p className="mt-2 px-1 font-semibold text-[#C56A1B]">{product.price}</p>
          </div>
        ))}
      </div>

      <Link
        href="/products"
        className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C56A1B] px-6 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#A85716] active:scale-[0.98] sm:hidden"
      >
        View Our Products
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
