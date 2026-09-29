import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ToolsMarquee from "@/components/ToolsMarquee";
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
import ServicesPreview from "@/components/ServicesPreview";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const reveal = Array.from(document.querySelectorAll<HTMLElement>(".cst-3d-site section"));
    reveal.forEach((el) => el.classList.add("cst-reveal"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("cst-reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    reveal.forEach((el) => observer.observe(el));
    const scrollTo = (location.state as any)?.scrollTo;
    if (scrollTo) {
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    return () => observer.disconnect();
  }, [location.state]);

  return (
    <div className="min-h-screen text-slate-900 cst-3d-site">
      <Helmet>
        <title>AI SEO Platform for Google &amp; AI Search | Crazy SEO Team</title>
        <meta name="description" content="Boost visibility in Google, ChatGPT, Gemini and AI Search with AI SEO, GEO, AEO and LLM optimization from Crazy SEO Team." />
        <link rel="canonical" href="https://crazyseoteam.in/" />
      </Helmet>
      <Navbar />
      <HeroSection />
      <StatsBar />
      <ToolsMarquee />
      <AboutSection />
      <ServicesPreview />
      <PortfolioSection />
      <IndustriesSection />
      <WhyChooseUs />
      <TestimonialsSection />
      <BlogSection />
      <CTASection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
