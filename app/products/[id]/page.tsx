import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import ProductDetailsClient from "./product-details-client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const { data } = await supabase
    .from("products")
    .select("name, description, product_images(image_url, position)")
    .eq("id", id)
    .single();

  if (!data) return { title: "Product" };

  const name = data.name as string;
  const description =
    (data.description as string) ||
    `Shop ${name} at Cretofit — quality interior design and decor products in Lagos, Nigeria.`;

  const rawImages = Array.isArray(data.product_images)
    ? (data.product_images as Array<{ image_url: string; position: number }>)
    : [];
  const firstImage = rawImages
    .filter((img) => !!img.image_url)
    .sort((a, b) => a.position - b.position)[0];

  return {
    title: name,
    description,
    alternates: { canonical: `/products/${id}` },
    ...(firstImage && {
      openGraph: {
        title: name,
        description,
        images: [{ url: firstImage.image_url, alt: name }],
      },
      twitter: {
        card: "summary_large_image",
        title: name,
        description,
        images: [firstImage.image_url],
      },
    }),
  };
}

export default function ProductDetailsPage() {
  return <ProductDetailsClient />;
}
