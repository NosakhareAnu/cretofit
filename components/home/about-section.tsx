import Image from "next/image";
import { Check } from "lucide-react";

const highlights = [
  "Quality interior products and furniture",
  "Tailored design and renovation support",
  "A focus on comfort, function, and aesthetics",
];

export default function AboutSection() {
  return (
    <section className="bg-[#F2E6DA]/40">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left - Image */}
          <div className="relative h-80 overflow-hidden rounded-[2.5rem] border border-[#E5DED6] shadow-card sm:h-96 lg:h-110">
            <Image
              src="/images/home/home-about.jpg.png"
              alt="Cretofit interior design studio and showroom"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 90vw, 50vw"
            />
          </div>

          {/* Right - Text */}
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
              About Cretofit
            </p>

            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B] md:text-4xl">
              Designing spaces that reflect style and function.
            </h2>

            <p className="mt-6 text-base leading-7 text-[#6F6A65]">
              At Cretofit, we specialize in delivering modern interior solutions
              tailored to your lifestyle. From furniture pieces to complete
              transformations, we focus on quality, comfort, and aesthetics.
            </p>

            <p className="mt-4 text-base leading-7 text-[#6F6A65]">
              Our goal is simple — to help you create spaces that feel
              intentional, functional, and beautifully designed.
            </p>

            <ul className="mt-8 space-y-4">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#2B2B2B]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C56A1B]/12 text-[#C56A1B]">
                    <Check size={13} strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
