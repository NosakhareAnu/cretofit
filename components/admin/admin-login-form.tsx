"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !authData.user) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const { data: adminRow, error: adminCheckError } = await supabase
      .from("admin_users")
      .select("email")
      .eq("email", authData.user.email)
      .maybeSingle();

    if (adminCheckError) {
      console.error("Admin check error:", adminCheckError);
      await supabase.auth.signOut();
      setError("Could not verify admin access. Please try again.");
      setLoading(false);
      return;
    }

    if (!adminRow) {
      await supabase.auth.signOut();
      setError("You are not authorized to access the admin panel.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-[#E5DED6] bg-white p-8 shadow-card md:p-10">
      <div className="mb-8">
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C56A1B]/10 text-[#C56A1B]">
          <Lock size={22} />
        </span>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#C56A1B]">
          Admin Panel
        </p>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#2B2B2B]">
          Admin Login
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#6F6A65]">
          Authorized administrators only.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#2B2B2B]">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter admin email"
            className="w-full rounded-full border border-[#E5DED6] px-5 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#2B2B2B]">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-full border border-[#E5DED6] px-5 py-3 text-sm outline-none transition focus:border-[#C56A1B] focus:ring-2 focus:ring-[#C56A1B]/15"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#C56A1B] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#A85716] hover:shadow-pop active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
