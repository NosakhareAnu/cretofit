"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

type ProductImageProps = {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  placeholderText?: string;
};

/**
 * Wrapper around next/image for Supabase Storage product images.
 *
 * - unoptimized: bypasses the Next.js proxy optimizer, which can time out
 *   on first load and produce intermittent blanks. Supabase Storage already
 *   serves images via CDN, so no optimization is needed.
 * - onError: tracks the failed URL so the placeholder is shown only for
 *   that URL; a different src automatically retries.
 * - Placeholder: a warm gradient surface with an icon, so a missing image
 *   reads as intentional rather than an unfinished gray box.
 */
export default function ProductImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className = "h-full w-full object-cover transition-transform duration-500 ease-out",
  priority = false,
  placeholderText = "Product Image",
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const shouldShowPlaceholder = !src || src === failedSrc;

  if (shouldShowPlaceholder) {
    return (
      <div className="cf-placeholder flex h-full w-full flex-col items-center justify-center gap-2 text-[#C56A1B]">
        <ImageIcon size={22} strokeWidth={1.5} className="opacity-70" />
        <span className="text-[11px] font-medium uppercase tracking-[0.18em]">
          {placeholderText}
        </span>
      </div>
    );
  }

  const sharedProps = {
    src,
    sizes,
    className,
    priority,
    unoptimized: true as const,
    onError: () => setFailedSrc(src),
  };

  if (fill) {
    return <Image alt={alt} {...sharedProps} fill />;
  }

  return (
    <Image alt={alt} {...sharedProps} width={width ?? 400} height={height ?? 300} />
  );
}
