import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import ToolsMarquee from "@/components/ToolsMarquee";
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
      setTimeout(() => document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" }), 100);
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

      <Suspense fallback={<div className="min-h-[35vh] bg-white" />}>
        <section id="process" className="py-24 px-4 bg-secondary/20">
          <div className="container mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">How We Work</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">A systematic path from <span className="gradient-text">discovery to growth.</span></h2>
              <p className="mt-4 text-muted-foreground text-base md:text-lg">Every engagement follows a clear operating system so strategy, execution and measurement stay connected.</p>
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
          <div className="pointer-events-none absolute inset-0"><div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" /><div className="absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" /></div>
          <div className="relative container mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">Search Growth System</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">Search is evolving. <span className="gradient-text">Your growth system should too.</span></h2>
              <p className="mt-5 text-base md:text-lg leading-8 text-muted-foreground">Connect traditional SEO with answer engines, generative search, LLM visibility, automation and continuous monitoring.</p>
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

        <section id="ai-search-topics" className="relative py-24 px-4 bg-slate-50/70">
          <div className="container mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">AI Search Topic Coverage</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">SEO, AEO, GEO and <span className="gradient-text">LLM-ready content engineering.</span></h2>
              <p className="mt-4 text-base md:text-lg leading-8 text-muted-foreground">We build useful, entity-rich and technically accessible content around the topics businesses need to be discoverable in Google Search and modern AI-powered search experiences.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["AI Search Optimization", "Improve how important pages, entities, services and expertise are understood across AI-assisted search.", "/ai-tools"],
                ["Technical SEO Services", "Strengthen crawlability, indexability, performance, internal linking, metadata and structured data.", "/services"],
                ["Generative Engine Optimization (GEO)", "Build clear topical coverage and entity context for generative search discovery.", "/services"],
                ["Content Engineering Services", "Combine search intent, semantic coverage, original information and conversion-focused content structure.", "/services"],
                ["Marketing Automation & AI Software", "Connect SEO and content workflows with automation, AI agents, analytics and software systems.", "/services"],
                ["Answer Engine Optimization (AEO)", "Structure direct, useful answers and supporting context so answer engines can interpret the page clearly.", "/services"],
                ["LLM Optimization & AI Visibility", "Make brand, service and expertise information easier for language models to interpret and cite.", "/services"],
                ["Semantic SEO & Entity Optimization", "Build topic clusters, entity relationships and internal links that reinforce topical relevance.", "/services"],
                ["AI SEO Content Strategy", "Map questions, entities, intent and content opportunities into a sustainable editorial system.", "/blog"],
                ["AI Search Content & Citation Readiness", "Create original, trustworthy and well-structured information designed for human readers and AI discovery.", "/services"]
              ].map(([title, description, href]) => (
                <a key={title} href={href} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  <span className="mt-4 inline-flex text-sm font-bold text-primary">Explore topic →</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <AdvertisingCarousel />
        <ServicesPreview />
        <AboutSection />
        <WhyChooseUs />
        <BlogSection />

        <section id="community" className="relative overflow-hidden bg-slate-950 px-4 py-24 md:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-fuchsia-600/15 blur-3xl" />
          </div>
          <div className="relative container mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-cyan-300">ANVYA Community Platform</p>
                <h2 className="text-4xl font-black tracking-tight text-white md:text-6xl">Connect. Create. <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">Grow together.</span></h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">ANVYA brings profiles, posts, communities, questions, conversations and professional discovery into one modern community experience.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 backdrop-blur">
                <p className="font-bold text-white">Built for real community discovery</p>
                <p className="mt-1">Ideas • Knowledge • People • Opportunities</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Profiles", "Create a public profile, show your expertise and help relevant people discover you."],
                ["Posts & Ideas", "Publish useful thoughts, questions, guides and original insights for the community."],
                ["Communities", "Find topic-based spaces and participate in focused conversations with shared interests."],
                ["Connections", "Discover people, follow relevant activity and turn useful conversations into collaboration."]
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur transition-transform hover:-translate-y-1">
                  <h3 className="text-lg font-extrabold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl">
              <div className="relative bg-slate-100">
                <img
                  src="/images/anvya-community.jpg"
                  alt="ANVYA community platform — profiles, posts, connections and community features"
                  className="block h-auto w-full object-contain object-center"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="grid gap-6 border-t border-slate-100 p-6 md:grid-cols-[1fr_auto] md:items-center md:px-8 md:py-7">
                <div>
                  <p className="text-xl font-black text-slate-950">Everything your community needs in one place.</p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Build your presence, publish knowledge, discover communities, meet relevant people and keep conversations moving.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="/anvya/communities" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">Explore Communities <span className="ml-2">→</span></a>
                  <a href="/anvya" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 font-bold text-slate-900 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50">Open ANVYA <span className="ml-2 text-blue-600">→</span></a>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-fuchsia-500/10 p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Community Advertising</p>
                  <h3 className="mt-1 text-xl font-black text-white">Promote a useful product, service, event or community.</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">Relevant sponsored placements can help brands reach an audience while keeping the experience useful and transparent.</p>
                </div>
                <a href="/contact" className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-3 font-extrabold text-slate-950 transition hover:bg-slate-100">Advertise With Us <span className="ml-2">→</span></a>
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
