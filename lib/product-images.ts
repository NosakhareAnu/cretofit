export type ImageRow = {
  product_id: string;
  image_url: string;
  position: number;
};

/**
 * Build a Map<productId, firstImageUrl> from a flat list of image rows.
 * Expects rows pre-ordered by position ASC so the first entry per
 * product_id is always the lowest-position image.
 */
export function buildImageMap(images: ImageRow[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const img of images) {
    if (img.image_url && !map.has(img.product_id)) {
      map.set(img.product_id, img.image_url);
    }
  }
  return map;
}

/**
 * Extract the first valid image URL from an inline join array
 * (for single-product queries where all images are fetched together).
 */
export function getFirstImageUrl(images: unknown): string | null {
  if (!Array.isArray(images)) return null;
  const sorted = (images as { image_url: string; position: number }[])
    .filter((img) => !!img.image_url)
    .sort((a, b) => a.position - b.position);
  return sorted[0]?.image_url || null;
}
