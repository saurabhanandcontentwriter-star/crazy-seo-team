import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import IndustriesSection from "@/components/IndustriesSection";

const StatsBar = lazy(() => import("@/components/StatsBar"));
const ToolsMarquee = lazy(() => import("@/components/ToolsMarquee"));
const ServicesPreview = lazy(() => import("@/components/ServicesPreview"));
const WhyChooseUs = lazy(() => import("@/components/WhyChooseUs"));
const AdvertisingCarousel = lazy(() => import("@/components/AdvertisingCarousel"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const BlogSection = lazy(() => import("@/components/BlogSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));

const processSteps = [
  ["01", "Discover", "Understand your market, audience, goals and current search visibility."],
  ["02", "Audit", "Find technical, content, authority and conversion opportunities."],
  ["03", "Strategize", "Build a focused SEO, AI search and growth roadmap."],
  ["04", "Execute", "Ship improvements across technical SEO, content, search and campaigns."],
  ["05", "Optimize", "Use performance data to refine priorities and improve outcomes."],
  ["06", "Scale", "Expand what works with automation, monitoring and continuous growth."],
];

const searchSystems = [
  ["SEO", "Google Search", "Technical foundations, content and authority that improve organic discovery."],
  ["AEO", "Answer Engines", "Structure useful information so search systems can understand and answer it."],
  ["GEO", "Generative Search", "Improve visibility across AI-powered discovery and generative search experiences."],
  ["LLM", "AI Visibility", "Make important brand, service and expertise signals easier for AI systems to interpret."],
  ["Automation", "Always On", "Automate recurring checks, reporting and operational workflows."],
  ["Monitoring", "Measure & Improve", "Track visibility, traffic, leads and technical signals continuously."],
];

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
        {/* 01 — Trust and platform ecosystem */}
        <StatsBar />
        <ToolsMarquee />

        {/* 02 — What we do */}
        <ServicesPreview />

        {/* 03 — How we work */}
        <section id="process" className="py-24 px-4 bg-secondary/20">
          <div className="container mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">How We Work</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                A systematic path from <span className="gradient-text">discovery to growth.</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-base md:text-lg">
                Every engagement follows a clear operating system so strategy, execution and measurement stay connected.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {processSteps.map(([number, title, description]) => (
                <div key={number} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="text-xs font-black tracking-[0.2em] text-primary">{number}</div>
                  <h3 className="mt-3 text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 04 — Who we serve */}
        <IndustriesSection />

        {/* 05 — SEO, AEO, GEO and AI visibility system */}
        <section id="search-growth-system" className="relative overflow-hidden py-24 px-4">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          </div>
          <div className="relative container mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">Search Growth System</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                Search is evolving. <span className="gradient-text">Your growth system should too.</span>
              </h2>
              <p className="mt-5 text-base md:text-lg leading-8 text-muted-foreground">
                Connect traditional SEO with answer engines, generative search, LLM visibility, automation and continuous monitoring.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {searchSystems.map(([label, title, description]) => (
                <div key={label} className="rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur-sm shadow-sm">
                  <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{label}</span>
                  <h3 className="mt-4 text-xl font-bold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 06 — Paid growth and campaign capability */}
        <AdvertisingCarousel />

        {/* 07 — Workbench / active projects */}
        <ServicesPreview />

        {/* 08 — About and operating principles */}
        <AboutSection />
        <WhyChooseUs />

        {/* 09 — Evidence and learning */}
        <BlogSection />

        {/* 10 — Community */}
        <section id="community" className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-cyan-500/10 p-8 md:p-12 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">ANVYA Community</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-black text-foreground">Ideas, discussions and practical growth knowledge.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Explore the ANVYA community and connect with the wider digital, SEO and technology ecosystem.
              </p>
              <a href="/anvya/communities" className="mt-7 inline-flex rounded-xl gradient-bg px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Join the Community
              </a>
            </div>
          </div>
        </section>

        {/* 11 — Common questions */}
        <FAQSection />

        {/* 12 — Final conversion and contact */}
        <CTASection />
        <ContactSection />

        <Footer />
        <CookieConsent />
      </Suspense>
    </div>
  );
};

export default Index;
