import MainNavbar from "@/components/navigation/main-navbar";
import HeroSection from "@/components/home/hero-section";
import FeaturedProductsSection from "@/components/home/featured-products-section";
import AboutSection from "@/components/home/about-section";
import Footer from "@/components/layout/footer";

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