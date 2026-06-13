"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, AlertCircle, RefreshCw, ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase";

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  second_phone: string | null;
  email: string | null;
  address: string;
  subtotal: number;
  status: string;
  created_at: string;
  items: OrderItem[];
};

type OrderStatus = "pending" | "in_progress" | "completed" | "declined";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  declined: "Declined",
};

const STATUS_BADGES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-[#F2E6DA] text-[#A85716] border-[#E5C9A8]",
  completed: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-600 border-red-200",
};

function isKnownStatus(s: string): s is OrderStatus {
  return s === "pending" || s === "in_progress" || s === "completed" || s === "declined";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ManageOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        (o.second_phone?.toLowerCase().includes(q) ?? false)
    );
  }, [orders, searchQuery]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setFetchError(false);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `id, customer_name, phone, second_phone, email, address, subtotal, status, created_at,
         order_items(product_name, quantity, unit_price, total)`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error);
      setFetchError(true);
      setLoading(false);
      return;
    }

    const mapped: Order[] = (data ?? []).map((row) => ({
      id: row.id,
      customer_name: row.customer_name,
      phone: row.phone,
      second_phone: row.second_phone ?? null,
      email: row.email ?? null,
      address: row.address,
      subtotal: row.subtotal,
      status: row.status,
      created_at: row.created_at,
      items: (row.order_items as OrderItem[]) ?? [],
    }));

    setOrders(mapped);
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    setActionError(null);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Order status update error:", error);
      setActionError(`Failed to update order: ${error.message}`);
      setUpdatingId(null);
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setUpdatingId(null);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B]">Manage Orders</h1>
        <p className="mt-3 text-sm text-[#6F6A65]">
          Review customer orders and update their status.
        </p>
      </div>

      {!loading && !fetchError && orders.length > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-full border border-[#E5DED6] bg-white px-4 py-3 shadow-sm transition focus-within:border-[#C56A1B] focus-within:ring-2 focus-within:ring-[#C56A1B]/15">
          <Search size={16} className="shrink-0 text-[#8A8178]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or phone…"
            className="w-full bg-transparent text-sm text-[#2B2B2B] outline-none placeholder:text-[#9B928A]"
          />
        </div>
      )}

      {actionError && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-3 underline">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-[#E5DED6] bg-[#FDFCFB] p-5">
              <div className="cf-skeleton h-4 w-20 rounded-full" />
              <div className="cf-skeleton mt-3 h-5 w-1/3 rounded-full" />
              <div className="cf-skeleton mt-4 h-4 w-2/3 rounded-full" />
              <div className="cf-skeleton mt-2 h-4 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={24} />
          </span>
          <p className="mt-5 text-base font-semibold text-[#2B2B2B]">Could not load orders</p>
          <p className="mt-2 text-sm text-[#6F6A65]">Check your Supabase RLS policies.</p>
          <button
            onClick={loadOrders}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E5DED6] px-5 py-2.5 text-sm font-medium text-[#2B2B2B] transition hover:border-[#C56A1B] hover:bg-[#F2E6DA]"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E6DA] text-[#C56A1B]">
            <ClipboardList size={24} />
          </span>
          <p className="mt-5 text-base font-semibold text-[#2B2B2B]">No orders yet</p>
          <p className="mt-2 text-sm text-[#6F6A65]">
            Orders placed through the checkout will appear here.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-[#E5DED6] bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2E6DA] text-[#C56A1B]">
            <Search size={22} />
          </span>
          <p className="mt-5 text-base font-semibold text-[#2B2B2B]">No orders found</p>
          <p className="mt-2 text-sm text-[#6F6A65]">Try a different search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingId === order.id;
            const status = isKnownStatus(order.status) ? order.status : "pending";
            const badgeClass = STATUS_BADGES[status];
            const label = STATUS_LABELS[status];

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-[#E5DED6] bg-[#FDFCFB] p-5 shadow-soft transition-shadow hover:shadow-card"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${badgeClass}`}
                    >
                      {label}
                    </span>

                    <h2 className="mt-3 text-lg font-semibold text-[#2B2B2B]">
                      {order.customer_name}
                    </h2>

                    <div className="mt-3 space-y-1 text-sm text-[#6F6A65]">
                      <p>{order.phone}</p>
                      {order.second_phone && <p>{order.second_phone}</p>}
                      {order.email && <p>{order.email}</p>}
                      <p>{order.address}</p>
                    </div>

                    {order.items.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-[#2B2B2B]">Ordered Items</p>
                        <ul className="mt-2 space-y-1 text-sm text-[#6F6A65]">
                          {order.items.map((item, i) => (
                            <li key={i}>
                              • {item.product_name} × {item.quantity} —{" "}
                              ₦{item.total.toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4">
                      <p className="font-semibold text-[#C56A1B]">
                        ₦{order.subtotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#9B928A]">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, "in_progress")}
                          disabled={isUpdating}
                          className="rounded-full bg-[#C56A1B] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#A85716] disabled:opacity-60"
                        >
                          {isUpdating ? "Updating…" : "Acknowledge"}
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "declined")}
                          disabled={isUpdating}
                          className="rounded-full bg-red-50 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {status === "in_progress" && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, "completed")}
                          disabled={isUpdating}
                          className="rounded-full bg-green-50 px-4 py-2 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-60"
                        >
                          {isUpdating ? "Updating…" : "Mark Complete"}
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "declined")}
                          disabled={isUpdating}
                          className="rounded-full bg-red-50 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {(status === "completed" || status === "declined") && (
                      <span className="rounded-full border border-[#E5DED6] px-4 py-2 text-xs text-[#9B928A]">
                        {label}
                      </span>
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
