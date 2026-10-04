import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

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
        <StatsBar />
        <ToolsMarquee />

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

        <AdvertisingCarousel />
        <ServicesPreview />
        <AboutSection />
        <WhyChooseUs />
        <BlogSection />

        <section id="community" className="px-4 py-24 md:py-28">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-blue-600">ANVYA Community</p>
                <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                  Where ideas meet <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">opportunity.</span>
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-500 md:text-right md:text-base">
                Connect, collaborate, learn and grow with creators, SEO professionals, marketers, developers and technology enthusiasts.
              </p>
            </div>

            <div className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(37,99,235,.14)]">
              <div className="relative overflow-hidden bg-slate-100">
                <img
                  src="/images/anvya-community-new.svg"
                  alt="ANVYA Community — Where Ideas Meet Opportunity"
                  className="block h-auto w-full object-contain object-center"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col gap-5 border-t border-slate-100 bg-white p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:px-8">
                <div>
                  <p className="text-lg font-extrabold text-slate-950">Join the ANVYA community.</p>
                  <p className="mt-1 text-sm text-slate-500">Share ideas, discover opportunities and build meaningful connections.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="/anvya/communities" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl">Join ANVYA <span className="ml-2">→</span></a>
                  <a href="/anvya" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50">Share Your Idea <span className="ml-2 text-blue-600">→</span></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQSection />
        <CTASection />
        <ContactSection />
        <Footer />
        <CookieConsent />
      </Suspense>
    </div>
  );
};

export default Index;
