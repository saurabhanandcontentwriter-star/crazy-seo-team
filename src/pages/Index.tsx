import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ToolsMarquee from "@/components/ToolsMarquee";
import SEOToolsSection from "@/components/SEOToolsSection";
import ServicesSection from "@/components/ServicesSection";
import StatsBar from "@/components/StatsBar";
import PortfolioSection from "@/components/PortfolioSection";
import IndustriesSection from "@/components/IndustriesSection";
import AboutSection from "@/components/AboutSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import BlogSection from "@/components/BlogSection";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as any)?.scrollTo;
    if (scrollTo) {
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SEOToolsSection />
      <ToolsMarquee />
      <ServicesSection />
      <StatsBar />
      <PortfolioSection />
      <IndustriesSection />
      <AboutSection />
      <WhyChooseUs />
      <BlogSection />
      <CTASection />
      <FAQSection />
      <Footer />
      <CookieConsent />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
