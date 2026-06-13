import type { Metadata } from "next";
import MainNavbar from "@/components/navigation/main-navbar";
import HeroSection from "@/components/home/hero-section";
import FeaturedProductsSection from "@/components/home/featured-products-section";
import AboutSection from "@/components/home/about-section";
import Footer from "@/components/layout/footer";

// Rebuild the homepage (and its featured products) at most once per 60s so
// newly added/updated products appear without a full redeploy.
export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main>
      <MainNavbar />
      <HeroSection />
      <FeaturedProductsSection />
      <AboutSection />
      <Footer />
    </main>
  );
}