"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AddProductPanel from "@/components/admin/add-product-panel";
import ManageProductsPanel from "@/components/admin/manage-products-panel";
import ManageOrdersPanel from "@/components/admin/manage-orders-panel";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("add-product");
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("email")
        .eq("email", session.user.email)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setAuthChecked(true);
    }

    checkAuth();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (!authChecked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F7F4F0]">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-[#E5DED6] border-t-[#C56A1B]" />
        <p className="text-sm text-[#6F6A65]">Verifying access…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F4F0] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />

        <section className="rounded-4xl border border-[#E5DED6] bg-white p-6 shadow-soft sm:p-8">
          {activeTab === "add-product" && <AddProductPanel />}
          {activeTab === "manage-products" && <ManageProductsPanel />}
          {activeTab === "manage-orders" && <ManageOrdersPanel />}
        </section>
      </div>
    </main>
  );
}
