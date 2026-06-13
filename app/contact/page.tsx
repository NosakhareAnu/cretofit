import type { Metadata } from "next";
import MainNavbar from "@/components/navigation/main-navbar";
import Footer from "@/components/layout/footer";
import ContactSection from "@/components/contact/contact-section";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Cretofit — call, email, or visit us in Lekki, Lagos. We're ready to help you design, furnish, and transform your space.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <MainNavbar />
      <ContactSection />
      <Footer />
    </main>
  );
}
