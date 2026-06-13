"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, PlusSquare, UploadCloud } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type FormFields = {
  name: string;
  price: string;
  quantity: string;
  description: string;
};

type ImageEntry = {
  file: File;
  preview: string;
};

const emptyForm: FormFields = { name: "", price: "", quantity: "", description: "" };

function sanitizeFilename(original: string): string {
  const lastDot = original.lastIndexOf(".");
  const ext = lastDot !== -1 ? original.slice(lastDot).toLowerCase() : "";
  const base = lastDot !== -1 ? original.slice(0, lastDot) : original;
  const clean = base
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "image";
  return clean + ext;
}

export default function AddProductPanel() {
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormFields | "images", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Revoke preview URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";

    const nonImages = selected.filter((f) => !f.type.startsWith("image/"));
    if (nonImages.length > 0) {
      setFieldErrors((prev) => ({ ...prev, images: "Only image files are allowed." }));
      return;
    }

    const combined = [...images, ...selected.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))];

    if (combined.length > 5) {
      setFieldErrors((prev) => ({ ...prev, images: "Maximum 5 images allowed." }));
      // Accept up to 5
      const trimmed = combined.slice(0, 5);
      setImages(trimmed);
      return;
    }

    setImages(combined);
    setFieldErrors((prev) => ({ ...prev, images: undefined }));
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setFieldErrors((prev) => ({ ...prev, images: undefined }));
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormFields | "images", string>> = {};

    if (!form.name.trim()) {
      errors.name = "Product name is required.";
    }

    if (form.price === "") {
      errors.price = "Price is required.";
    } else if (Number(form.price) < 0) {
      errors.price = "Price must be 0 or greater.";
    }

    if (form.quantity === "") {
      errors.quantity = "Quantity is required.";
    } else if (Number(form.quantity) < 0) {
      errors.quantity = "Quantity must be 0 or greater.";
    }

    if (images.length === 0) {
      errors.images = "At least 1 image is required.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name: form.name.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        description: form.description.trim() || null,
        is_out_of_stock: Number(form.quantity) === 0,
      })
      .select("id")
      .single();

    if (productError || !product) {
      console.error("Product insert error:", productError);
      setSubmitError("Failed to create product. Check your Supabase RLS policies and try again.");
      setSubmitting(false);
      return;
    }

    const productId = product.id as string;

    for (let i = 0; i < images.length; i++) {
      const { file } = images[i];
      const imagePath = `products/${productId}/${Date.now()}-${sanitizeFilename(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(imagePath, file);

      if (uploadError) {
        console.error(`Image ${i + 1} upload error:`, uploadError);
        await supabase.from("products").delete().eq("id", productId);
        setSubmitError(
          `Image ${i + 1} failed to upload — the product was not saved. ${uploadError.message}`
        );
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(imagePath);

      const { error: imageRecordError } = await supabase.from("product_images").insert({
        product_id: productId,
        image_url: urlData.publicUrl,
        image_path: imagePath,
        position: i,
      });

      if (imageRecordError) {
        console.error(`Image ${i + 1} record error:`, imageRecordError);
        await supabase.from("products").delete().eq("id", productId);
        setSubmitError(
          `Failed to save image ${i + 1} record — the product was not saved. ${imageRecordError.message}`
        );
        setSubmitting(false);
        return;
      }
    }

    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setForm(emptyForm);
    setImages([]);
    setFieldErrors({});
    setSubmitting(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B]">Add Product</h1>
          <p className="mt-3 text-sm text-[#6F6A65]">Add a new product to the Cretofit store.</p>
        </div>

        <div className="animate-fade-up rounded-3xl border border-[#E5DED6] bg-[#FDFCFB] px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={30} />
          </span>
          <p className="mt-6 text-lg font-semibold text-[#2B2B2B]">Product added successfully.</p>
          <p className="mt-2 text-sm text-[#6F6A65]">
            The product and its images are now live in the store.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C56A1B] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98]"
          >
            <PlusSquare size={16} />
            Add Another Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B]">Add Product</h1>
        <p className="mt-3 text-sm text-[#6F6A65]">Add a new product to the Cretofit store.</p>
      </div>

      {submitError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="grid gap-5">
        {/* Name */}
        <div>
          <input
            name="name"
            value={form.name}
            onChange={handleFieldChange}
            placeholder="Product name"
            className={`w-full rounded-full border px-5 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15 ${
              fieldErrors.name ? "border-red-400" : "border-[#E5DED6]"
            }`}
          />
          {fieldErrors.name && (
            <p className="mt-1.5 px-2 text-xs text-red-600">{fieldErrors.name}</p>
          )}
        </div>

        {/* Price + Quantity */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <input
              name="price"
              value={form.price}
              onChange={handleFieldChange}
              type="number"
              min="0"
              placeholder="Price (₦)"
              className={`w-full rounded-full border px-5 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15 ${
                fieldErrors.price ? "border-red-400" : "border-[#E5DED6]"
              }`}
            />
            {fieldErrors.price && (
              <p className="mt-1.5 px-2 text-xs text-red-600">{fieldErrors.price}</p>
            )}
          </div>

          <div>
            <input
              name="quantity"
              value={form.quantity}
              onChange={handleFieldChange}
              type="number"
              min="0"
              placeholder="Quantity"
              className={`w-full rounded-full border px-5 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15 ${
                fieldErrors.quantity ? "border-red-400" : "border-[#E5DED6]"
              }`}
            />
            {fieldErrors.quantity && (
              <p className="mt-1.5 px-2 text-xs text-red-600">{fieldErrors.quantity}</p>
            )}
          </div>
        </div>

        {/* Description (optional) */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleFieldChange}
          placeholder="Product description (optional)"
          rows={4}
          className="w-full resize-none rounded-[1.2rem] border border-[#E5DED6] px-5 py-4 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15"
        />

        {/* Image upload */}
        <div
          className={`rounded-3xl border border-dashed bg-[#F7F4F0] p-5 ${
            fieldErrors.images ? "border-red-400" : "border-[#C56A1B]"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#2B2B2B]">Product Images</p>
              <p className="mt-0.5 text-xs text-[#6F6A65]">Up to 5 images — jpg, png, webp</p>
            </div>
            <span className="text-xs font-medium text-[#C56A1B]">
              {images.length}/5 selected
            </span>
          </div>

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="mb-4 grid grid-cols-5 gap-2">
              {images.map((img, index) => (
                <div key={index} className="group relative">
                  <div className="relative h-20 overflow-hidden rounded-xl border border-[#E5DED6] bg-white">
                    <Image
                      src={img.preview}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {images.length < 5 && (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#C56A1B] bg-white py-4 text-sm font-medium text-[#C56A1B] transition hover:bg-[#F2E6DA]">
              <UploadCloud size={17} />
              Add {images.length > 0 ? "more" : ""} images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {fieldErrors.images && (
            <p className="mt-2 text-xs text-red-600">{fieldErrors.images}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[#C56A1B] px-7 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm md:w-fit"
        >
          {submitting ? "Adding product…" : "Add Product"}
        </button>
      </form>
    </div>
  );
}
