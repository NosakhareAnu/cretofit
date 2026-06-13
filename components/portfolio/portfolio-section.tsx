import Image from "next/image";

const portfolioImages = [
  "1073125c619d4c5693efec521042d2a3.jpg",
  "acc28bf5210645f6863504b9ae16899c.jpg",
  "546c68278ce34fe9a213d282216f9569.jpg",
  "60a640f787bd4e568ea5414b9fea48b4.jpg",
  "c5014b3bf738458493b210dd9f8de084.jpg",
  "2da3f9a01c114aebad281561a31fd059.jpg",
  "9acf616da2f34c228acea190ed2ce1d5.jpg",
  "c899099fc96441cb8fda436ee5bfdb2f.jpg",
  "6437b4ec000d49bc9fd515ea4ac39145.jpg",
  "1586321ff40746059ef5f1cf7176cf56.jpg",
  "d9190acc589644a79d253a6f071aa6bc.jpg",
  "9bbb1afc8ee34743903185716c4b1d9d.jpg",
  "e234b0be73684d71b6a6df2b73b149c2.jpg",
  "396c4d40d11f48759e716dc0a02ee76b.jpg",
  "97466bfb9e3042109c69beb472d5f7c4.jpg",
  "6b39e9467a60481bb12bb5b8fa241828.jpg",
  "ab1a0cccce5b4e76adb385b6e151f260.jpg",
  "48edbfcd26eb451ba3fedabcbb008bfb.jpg",
  "2bf65ba426604f83bea07a7574cb5e25.jpg",
  "5bbe3bd340bd4a888217a5ed27a0074d.jpg",
  "ea4f67acb7fb40cd91401d55265b6f76.jpg",
  "d9543262742e4a1bb8d86605f8c93727.jpg",
];

export default function PortfolioSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-14 max-w-2xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
          Portfolio
        </p>

        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-[#2B2B2B] md:text-5xl">
          Spaces designed with detail, comfort, and purpose.
        </h1>

        <p className="mt-5 text-base leading-7 text-[#6F6A65]">
          Explore selected interior design works and completed spaces by
          Cretofit — each one shaped by a client&rsquo;s vision and our
          commitment to quality.
        </p>
      </div>

      {/* Masonry gallery — CSS columns for natural mixed-aspect-ratio layout */}
      <div className="columns-2 gap-4 md:columns-3 md:gap-6">
        {portfolioImages.map((filename, i) => (
          <div
            key={filename}
            className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-[#E5DED6] shadow-soft transition-all duration-300 hover:shadow-card md:mb-6"
          >
            <Image
              src={`/portfolio/${filename}`}
              alt={`Cretofit interior design project ${i + 1}`}
              width={0}
              height={0}
              sizes="(max-width: 768px) 50vw, 33vw"
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
