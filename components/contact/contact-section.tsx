import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
          Contact Us
        </p>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B] md:text-5xl">
          Let&rsquo;s help bring your space to life.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#6F6A65]">
          Whether you&rsquo;re renovating, furnishing, or starting fresh, our
          team is ready to supply and design interiors tailored to you.
        </p>
      </div>

      {/* Image panel */}
      <div className="relative mb-14 h-80 overflow-hidden rounded-[2.5rem] border border-[#E5DED6] shadow-card">
        <Image
          src="/images/home/contact-about.jpg.png"
          alt="Cretofit interior design space"
          fill
          className="object-cover object-center"
          sizes="(max-width: 1280px) 90vw, 1024px"
        />
      </div>

      {/* Contact cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Phone */}
        <div className="group rounded-3xl border border-[#E5DED6] bg-white p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#C56A1B]/10 text-[#C56A1B] transition-transform duration-300 group-hover:scale-110">
            <Phone size={20} />
          </span>
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#9B928A]">
            Phone
          </h3>
          <div className="mt-2 flex flex-col gap-1 text-base font-medium text-[#2B2B2B]">
            <a
              href="tel:07086447310"
              className="transition-colors hover:text-[#C56A1B]"
            >
              07086447310
            </a>
            <a
              href="tel:08024343207"
              className="transition-colors hover:text-[#C56A1B]"
            >
              08024343207
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="group rounded-3xl border border-[#E5DED6] bg-white p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#C56A1B]/10 text-[#C56A1B] transition-transform duration-300 group-hover:scale-110">
            <Mail size={20} />
          </span>
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#9B928A]">
            Email
          </h3>
          <div className="mt-2">
            <a
              href="mailto:cretofit@yahoo.com"
              className="break-all text-base font-medium text-[#2B2B2B] transition-colors hover:text-[#C56A1B]"
            >
              cretofit@yahoo.com
            </a>
          </div>
        </div>

        {/* Address */}
        <div className="group rounded-3xl border border-[#E5DED6] bg-white p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#C56A1B]/10 text-[#C56A1B] transition-transform duration-300 group-hover:scale-110">
            <MapPin size={20} />
          </span>
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#9B928A]">
            Address
          </h3>
          <p className="mt-2 text-base font-medium leading-6 text-[#2B2B2B]">
            Bashiru Olusesi Ave, LGA, Lekki Penninsula II, Lekki 101223, Lagos
          </p>
        </div>
      </div>
    </section>
  );
}
