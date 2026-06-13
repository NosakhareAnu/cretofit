import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E5DED6] bg-[#2B2B2B] text-[#F7F4F0]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.5fr_1fr_1.3fr]">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#C56A1B]">
            Cretofit
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#D8D0C8]">
            Interior design, renovation, and curated decor solutions crafted for
            modern spaces that feel intentional, warm, and timeless.
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#BEB6AE]">
            Quick Links
          </h3>
          <div className="flex flex-col gap-3.5 text-sm text-[#D8D0C8]">
            <Link href="/products" className="w-fit transition-colors hover:text-[#C56A1B]">
              Products
            </Link>
            <Link href="/portfolio" className="w-fit transition-colors hover:text-[#C56A1B]">
              Portfolio
            </Link>
            <Link href="/contact" className="w-fit transition-colors hover:text-[#C56A1B]">
              Contact Us
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#BEB6AE]">
            Get in Touch
          </h3>
          <div className="space-y-4 text-sm text-[#D8D0C8]">
            <p className="flex items-start gap-3">
              <Phone size={15} className="mt-0.5 shrink-0 text-[#C56A1B]" />
              <span className="flex flex-col gap-1">
                <a href="tel:07086447310" className="transition-colors hover:text-[#C56A1B]">
                  07086447310
                </a>
                <a href="tel:08024343207" className="transition-colors hover:text-[#C56A1B]">
                  08024343207
                </a>
              </span>
            </p>
            <p className="flex items-center gap-3">
              <Mail size={15} className="shrink-0 text-[#C56A1B]" />
              <a
                href="mailto:cretofit@yahoo.com"
                className="transition-colors hover:text-[#C56A1B]"
              >
                cretofit@yahoo.com
              </a>
            </p>
            <p className="flex items-start gap-3">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#C56A1B]" />
              <span>
                Bashiru Olusesi Ave, LGA, Lekki Penninsula II, Lekki 101223,
                Lagos
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-[#BEB6AE]">
        © {new Date().getFullYear()} Cretofit. All rights reserved.
      </div>
    </footer>
  );
}
