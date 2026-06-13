import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { buildImageMap, type ImageRow } from "@/lib/product-images";
import ProductImage from "@/components/product/product-image";

export default async function FeaturedProductsSection() {
  const { data: rows } = await supabase
    .from("products")
    .select("id, name, price")
    .eq("is_out_of_stock", false)
    .gt("quantity", 0)
    .order("created_at", { ascending: false })
    .limit(4);

  const productRows = rows ?? [];
  const productIds = productRows.map((r) => r.id);

  let imageMap = new Map<string, string>();
  if (productIds.length > 0) {
    const { data: imgData } = await supabase
      .from("product_images")
      .select("product_id, image_url, position")
      .in("product_id", productIds)
      .order("position", { ascending: true });
    imageMap = buildImageMap((imgData ?? []) as ImageRow[]);
  }

  const products = productRows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    price: row.price as number,
    imageUrl: imageMap.get(row.id) ?? null,
  }));

  if (products.length === 0) return null;

  const gridCols =
    products.length === 4
      ? "grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6"
      : "grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6";

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:mb-10 lg:mb-12">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
            Featured Products
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#2B2B2B] sm:text-3xl md:text-4xl">
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

      <div className={`grid ${gridCols}`}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group rounded-2xl sm:rounded-3xl border border-[#E5DED6] bg-white p-2 sm:p-3 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
          >
            <div className="relative mb-2.5 sm:mb-4 aspect-square overflow-hidden rounded-xl sm:rounded-2xl">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                fill
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 25vw"
              />
            </div>

            <h3 className="px-0.5 sm:px-1 text-sm sm:text-base font-medium text-[#2B2B2B] transition-colors group-hover:text-[#C56A1B] line-clamp-2 leading-snug">
              {product.name}
            </h3>
            <p className="mt-1 sm:mt-2 px-0.5 sm:px-1 text-sm sm:text-base font-semibold text-[#C56A1B]">
              ₦{Number(product.price).toLocaleString()}
            </p>
          </Link>
        ))}
      </div>

      <Link
        href="/products"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C56A1B] px-6 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#A85716] active:scale-[0.98] sm:hidden"
      >
        View Our Products
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
