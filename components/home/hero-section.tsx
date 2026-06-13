import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 sm:py-16 lg:min-h-[82vh] lg:grid-cols-2 lg:py-20">
      <div className="animate-fade-up">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E5DED6] bg-white/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C56A1B] sm:text-xs sm:tracking-[0.22em]">
          Interior Design & Decor
        </p>

        <h1 className="font-display max-w-xl text-[2rem] font-semibold leading-[1.1] tracking-tight text-[#2B2B2B] sm:text-[2.6rem] sm:leading-[1.08] md:text-6xl">
          Transform your space with timeless interior solutions.
        </h1>

        <p className="mt-6 max-w-lg text-base leading-7 text-[#6F6A65]">
          Cretofit helps you create beautiful, functional spaces through quality
          interior products, design support, and renovation solutions.
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-full bg-[#C56A1B] px-7 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98]"
          >
            View Products
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-[#E5DED6] bg-white px-7 py-3.5 text-sm font-medium text-[#2B2B2B] transition-all duration-200 hover:border-[#C56A1B] hover:text-[#C56A1B]"
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-10 flex max-w-md items-center gap-5 border-t border-[#E5DED6] pt-7 sm:gap-8">
          <div>
            <p className="font-display text-xl font-semibold text-[#2B2B2B] sm:text-2xl">100+</p>
            <p className="mt-1 text-xs text-[#6F6A65]">Spaces designed</p>
          </div>
          <div className="h-10 w-px bg-[#E5DED6]" />
          <div>
            <p className="font-display text-xl font-semibold text-[#2B2B2B] sm:text-2xl">Premium</p>
            <p className="mt-1 text-xs text-[#6F6A65]">Curated pieces</p>
          </div>
          <div className="h-10 w-px bg-[#E5DED6]" />
          <div>
            <p className="font-display text-xl font-semibold text-[#2B2B2B] sm:text-2xl">Warm</p>
            <p className="mt-1 text-xs text-[#6F6A65]">Tailored service</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-up-delayed relative">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#E5DED6] shadow-card aspect-4/3">
          <Image
            src="/images/home/home-hero.jpg.png"
            alt="Beautifully designed interior space by Cretofit"
            fill
            priority
            className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
            sizes="(max-width: 1024px) 90vw, 50vw"
          />
        </div>

        {/* Floating accent card */}
        <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-[#E5DED6] bg-white px-5 py-4 shadow-card sm:block">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#C56A1B]">
            Crafted for you
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-[#2B2B2B]">
            Elegant. Functional.
          </p>
        </div>
      </div>
    </section>
  );
}
