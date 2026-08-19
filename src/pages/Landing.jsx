import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import FeatureShowcaseSection from "@/components/landing/FeatureShowcaseSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

const Landing = () => (
  <div className="min-h-screen overflow-x-hidden">
    <Helmet>
      <title>YesTick AI | Best AI Automation Platform for Businesses</title>
      <meta name="description" content="YesTick AI is the ultimate AI automation platform. We provide AI-powered workflow automation software, intelligent business automation, and AI business tools." />
      <meta name="keywords" content="AI automation platform, AI workflow automation, best AI automation platform for businesses, AI tools to automate business processes, AI-powered workflow automation software" />
    </Helmet>
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
