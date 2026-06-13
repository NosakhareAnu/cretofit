"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, AlertCircle, RefreshCw, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { buildImageMap, type ImageRow } from "@/lib/product-images";
import ProductImage from "@/components/product/product-image";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string | null;
  is_out_of_stock: boolean;
  imageUrl: string | null;
};

type EditForm = {
  name: string;
  price: string;
  quantity: string;
  description: string;
};

export default function ManageProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", price: "", quantity: "", description: "" });
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof EditForm, string>>>({});

  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setFetchError(false);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, quantity, description, is_out_of_stock")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Manage products fetch error:", error);
      setFetchError(true);
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    const productIds = rows.map((r) => r.id);

    let imageMap = new Map<string, string>();
    if (productIds.length > 0) {
      const { data: imgData } = await supabase
        .from("product_images")
        .select("product_id, image_url, position")
        .in("product_id", productIds)
        .order("position", { ascending: true });
      imageMap = buildImageMap((imgData ?? []) as ImageRow[]);
    }

    const mapped: Product[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      quantity: row.quantity,
      description: row.description,
      is_out_of_stock: row.is_out_of_stock,
      imageUrl: imageMap.get(row.id) ?? null,
    }));

    setProducts(mapped);
    setLoading(false);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: String(product.price),
      quantity: String(product.quantity),
      description: product.description ?? "",
    });
    setEditErrors({});
    setConfirmDeleteId(null);
    setActionError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditErrors({});
  }

  function validateEdit(): boolean {
    const errors: Partial<Record<keyof EditForm, string>> = {};
    if (!editForm.name.trim()) errors.name = "Name is required.";
    if (editForm.price === "" || isNaN(Number(editForm.price)) || Number(editForm.price) < 0)
      errors.price = "Valid price required.";
    if (editForm.quantity === "" || isNaN(Number(editForm.quantity)) || Number(editForm.quantity) < 0)
      errors.quantity = "Valid quantity required.";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function saveEdit(product: Product) {
    if (!validateEdit()) return;
    setSavingId(product.id);
    setActionError(null);

    const newQty = Number(editForm.quantity);
    // Quantity 0 forces out-of-stock; quantity > 0 preserves current status
    const newOutOfStock = newQty === 0 ? true : product.is_out_of_stock;

    const { error } = await supabase
      .from("products")
      .update({
        name: editForm.name.trim(),
        price: Number(editForm.price),
        quantity: newQty,
        description: editForm.description.trim() || null,
        is_out_of_stock: newOutOfStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      console.error("Product update error:", error);
      setActionError(`Failed to save changes: ${error.message}`);
      setSavingId(null);
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              name: editForm.name.trim(),
              price: Number(editForm.price),
              quantity: newQty,
              description: editForm.description.trim() || null,
              is_out_of_stock: newOutOfStock,
            }
          : p
      )
    );
    setSavingId(null);
    setEditingId(null);
  }

  async function toggleStock(product: Product) {
    // Cannot mark in-stock when quantity is 0
    if (product.quantity === 0 && product.is_out_of_stock) return;

    setTogglingId(product.id);
    setActionError(null);

    const newStatus = !product.is_out_of_stock;

    const { error } = await supabase
      .from("products")
      .update({ is_out_of_stock: newStatus, updated_at: new Date().toISOString() })
      .eq("id", product.id);

    if (error) {
      console.error("Toggle stock error:", error);
      setActionError(`Failed to update stock status: ${error.message}`);
      setTogglingId(null);
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_out_of_stock: newStatus } : p))
    );
    setTogglingId(null);
  }

  async function deleteProduct(id: string) {
    setDeletingId(id);
    setConfirmDeleteId(null);
    setActionError(null);

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Product delete error:", error);
      setActionError(`Failed to delete product: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B]">Manage Products</h1>
        <p className="mt-3 text-sm text-[#6F6A65]">
          Edit, update, or remove products from the store.
        </p>
      </div>

      {!loading && !fetchError && products.length > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-full border border-[#E5DED6] bg-white px-4 py-3 shadow-sm transition focus-within:border-[#C56A1B] focus-within:ring-2 focus-within:ring-[#C56A1B]/15">
          <Search size={16} className="shrink-0 text-[#8A8178]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name…"
            className="w-full bg-transparent text-sm text-[#2B2B2B] outline-none placeholder:text-[#9B928A]"
          />
        </div>
      )}

      {actionError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {actionError}
          <button
            onClick={() => setActionError(null)}
            className="ml-3 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-5 rounded-3xl border border-[#E5DED6] bg-[#FDFCFB] p-5 md:grid-cols-[100px_1fr]"
            >
              <div className="cf-skeleton h-24 rounded-2xl" />
              <div className="flex flex-col gap-3 py-1">
                <div className="cf-skeleton h-5 w-1/3 rounded-full" />
                <div className="cf-skeleton h-4 w-24 rounded-full" />
                <div className="cf-skeleton h-4 w-40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={24} />
          </span>
          <p className="mt-5 text-base font-semibold text-[#2B2B2B]">Could not load products</p>
          <p className="mt-2 text-sm text-[#6F6A65]">Check your Supabase RLS policies.</p>
          <button
            onClick={loadProducts}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E5DED6] px-5 py-2.5 text-sm font-medium text-[#2B2B2B] transition hover:border-[#C56A1B] hover:bg-[#F2E6DA]"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E6DA] text-[#C56A1B]">
            <Package size={24} />
          </span>
          <p className="mt-5 text-base font-semibold text-[#2B2B2B]">No products yet</p>
          <p className="mt-2 text-sm text-[#6F6A65]">Add your first product using the Add Product tab.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E6DA] text-[#C56A1B]">
            <Search size={22} />
          </span>
          <p className="mt-5 text-base font-semibold text-[#2B2B2B]">No products found</p>
          <p className="mt-2 text-sm text-[#6F6A65]">Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const isEditing = editingId === product.id;
            const isSaving = savingId === product.id;
            const isToggling = togglingId === product.id;
            const isDeleting = deletingId === product.id;
            const isConfirmingDelete = confirmDeleteId === product.id;
            const canToggleInStock = !(product.quantity === 0 && product.is_out_of_stock);

            return (
              <div
                key={product.id}
                className={`rounded-3xl border bg-[#FDFCFB] p-5 shadow-soft transition-all duration-200 ${
                  isConfirmingDelete ? "border-red-300 bg-red-50/30" : "border-[#E5DED6]"
                }`}
              >
                <div className="grid gap-5 md:grid-cols-[100px_1fr]">
                  {/* Thumbnail */}
                  <div className="flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-[#F2E6DA]">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      width={100}
                      height={96}
                      placeholderText="No image"
                    />
                  </div>

                  <div>
                    {isEditing ? (
                      /* ── Edit mode ── */
                      <div className="grid gap-4">
                        <div>
                          <input
                            value={editForm.name}
                            onChange={(e) => {
                              setEditForm((f) => ({ ...f, name: e.target.value }));
                              setEditErrors((err) => ({ ...err, name: undefined }));
                            }}
                            placeholder="Product name"
                            className={`w-full rounded-full border px-4 py-2.5 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15 ${
                              editErrors.name ? "border-red-400" : "border-[#E5DED6]"
                            }`}
                          />
                          {editErrors.name && (
                            <p className="mt-1 px-2 text-xs text-red-600">{editErrors.name}</p>
                          )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <input
                              type="number"
                              min="0"
                              value={editForm.price}
                              onChange={(e) => {
                                setEditForm((f) => ({ ...f, price: e.target.value }));
                                setEditErrors((err) => ({ ...err, price: undefined }));
                              }}
                              placeholder="Price (₦)"
                              className={`w-full rounded-full border px-4 py-2.5 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15 ${
                                editErrors.price ? "border-red-400" : "border-[#E5DED6]"
                              }`}
                            />
                            {editErrors.price && (
                              <p className="mt-1 px-2 text-xs text-red-600">{editErrors.price}</p>
                            )}
                          </div>

                          <div>
                            <input
                              type="number"
                              min="0"
                              value={editForm.quantity}
                              onChange={(e) => {
                                setEditForm((f) => ({ ...f, quantity: e.target.value }));
                                setEditErrors((err) => ({ ...err, quantity: undefined }));
                              }}
                              placeholder="Quantity"
                              className={`w-full rounded-full border px-4 py-2.5 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15 ${
                                editErrors.quantity ? "border-red-400" : "border-[#E5DED6]"
                              }`}
                            />
                            {editErrors.quantity && (
                              <p className="mt-1 px-2 text-xs text-red-600">{editErrors.quantity}</p>
                            )}
                          </div>
                        </div>

                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Description (optional)"
                          rows={3}
                          className="w-full resize-none rounded-2xl border border-[#E5DED6] px-4 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15"
                        />

                        {Number(editForm.quantity) === 0 && (
                          <p className="text-xs text-[#6F6A65]">
                            Quantity 0 will automatically mark this product as out of stock.
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(product)}
                            disabled={isSaving}
                            className="rounded-full bg-[#C56A1B] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#A85716] disabled:opacity-60"
                          >
                            {isSaving ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="rounded-full border border-[#E5DED6] px-4 py-2 text-xs font-medium text-[#2B2B2B] hover:bg-[#F2E6DA]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── View mode ── */
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-[#2B2B2B]">
                            {product.name}
                          </h2>

                          <p className="mt-1 text-sm font-medium text-[#C56A1B]">
                            ₦{product.price.toLocaleString()}
                          </p>

                          <p className="mt-2 text-sm text-[#6F6A65]">
                            Qty: {product.quantity} ·{" "}
                            <span className={product.is_out_of_stock ? "text-red-500" : "text-green-600"}>
                              {product.is_out_of_stock ? "Out of Stock" : "In Stock"}
                            </span>
                          </p>

                          {product.description && (
                            <details className="mt-3">
                              <summary className="cursor-pointer text-sm font-medium text-[#C56A1B]">
                                View description
                              </summary>
                              <p className="mt-2 text-sm leading-6 text-[#6F6A65]">
                                {product.description}
                              </p>
                            </details>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => startEdit(product)}
                            disabled={isDeleting}
                            className="rounded-full border border-[#E5DED6] px-4 py-2 text-xs font-medium text-[#2B2B2B] hover:bg-[#F2E6DA] disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => toggleStock(product)}
                            disabled={isToggling || isDeleting || !canToggleInStock}
                            title={!canToggleInStock ? "Increase quantity to mark in stock" : undefined}
                            className="rounded-full border border-[#E5DED6] px-4 py-2 text-xs font-medium text-[#2B2B2B] hover:bg-[#F2E6DA] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isToggling
                              ? "Updating…"
                              : product.is_out_of_stock
                              ? "Mark In Stock"
                              : "Mark Out of Stock"}
                          </button>

                          {isConfirmingDelete ? (
                            <>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                disabled={isDeleting}
                                className="rounded-full bg-red-500 px-4 py-2 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-60"
                              >
                                {isDeleting ? "Deleting…" : "Confirm Delete"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-full border border-[#E5DED6] px-4 py-2 text-xs font-medium text-[#2B2B2B] hover:bg-[#F2E6DA]"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setConfirmDeleteId(product.id);
                                setEditingId(null);
                              }}
                              disabled={isDeleting}
                              className="rounded-full bg-red-50 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              {isDeleting ? "Deleting…" : "Remove"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
