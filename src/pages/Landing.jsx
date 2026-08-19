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
      <meta name="keywords" content="AI automation platform, AI workflow automation, best AI automation platform for businesses, AI tools to automate business processes, AI-powered workflow automation software, Whatsapp Marketing Services in Madhapur Hyderabad, Popular Whatsapp Marketing Services in Madhapur, WhatsApp Marketing Company in Hyderabad, WhatsApp Business API Provider in Hyderabad, Bulk Whatsapp Messaging Services - Hyderabad, Best WhatsApp Marketing Software in Hyderabad, WhatsApp Marketing Agency in Hyderabad, whatsapp marketing, bulk whatsapp software, whatsapp advertising, whatsapp sender pro, whatsapp marketing campaign, whatsapp promotion message, whatsapp software for bulk messaging, whatsapp bulk sms software, whatsapp bulk broadcast software, whatsapp mass marketing, online whatsapp bulk sender, whatsapp marketing for real estate, Ai powered WhatsApp Marketing in Hyderabad" />
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
