import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import FeatureShowcaseSection from "@/components/landing/FeatureShowcaseSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

const Landing = () => (
  <div className="min-h-screen overflow-x-hidden">
    <Navbar />
    <HeroSection />
    <IntegrationsSection />
    <FeatureShowcaseSection />
    <FeaturesSection />
    <PricingSection />
    <Footer />
  </div>
);

export default Landing;
