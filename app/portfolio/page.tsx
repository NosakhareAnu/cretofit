import type { Metadata } from "next";
import MainNavbar from "@/components/navigation/main-navbar";
import Footer from "@/components/layout/footer";
import PortfolioSection from "@/components/portfolio/portfolio-section";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore Cretofit's portfolio of completed interior design projects in Lagos and Lekki — beautifully styled homes, offices, and commercial spaces.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <main>
      <MainNavbar />
      <PortfolioSection />
      <Footer />
    </main>
  );
}
