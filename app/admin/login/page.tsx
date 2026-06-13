import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminLoginForm from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F7F4F0] px-6 py-12">
      {/* Soft warm ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#C56A1B]/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6F6A65] transition-colors hover:text-[#C56A1B]"
        >
          <ArrowLeft size={16} />
          Back to site
        </Link>

        <AdminLoginForm />
      </div>
    </main>
  );
}
