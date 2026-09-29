import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AdvertisingCarousel from "@/components/AdvertisingCarousel";
const StatsBar = lazy(() => import("@/components/StatsBar"));
const ToolsMarquee = lazy(() => import("@/components/ToolsMarquee"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ServicesPreview = lazy(() => import("@/components/ServicesPreview"));
const PortfolioSection = lazy(() => import("@/components/PortfolioSection"));
const IndustriesSection = lazy(() => import("@/components/IndustriesSection"));
const WhyChooseUs = lazy(() => import("@/components/WhyChooseUs"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));

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
      <Suspense fallback={<div className="min-h-[35vh] bg-white" />}>
        <StatsBar />
        <ToolsMarquee />
        <AboutSection />
        <ServicesPreview />
        <PortfolioSection />
        <IndustriesSection />
        <WhyChooseUs />
        <AdvertisingCarousel />
        <BlogSection />
        <CTASection />
        <FAQSection />
        <ContactSection />
        <Footer />
        <CookieConsent />
      </Suspense>
    </div>
  );
};

export default Index;
