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

        <section id="community" className="relative overflow-hidden bg-[#04060b] px-4 py-24 md:py-32">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[8%] top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[110px]" />
            <div className="absolute right-[4%] top-1/3 h-[30rem] w-[30rem] rounded-full bg-violet-600/10 blur-[120px]" />
            <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />
          </div>

          <style>{`
            @keyframes anvyaFloat { 0%,100% { transform:translate3d(0,0,0) } 50% { transform:translate3d(0,-9px,0) } }
            @keyframes anvyaFloat2 { 0%,100% { transform:translate3d(0,0,0) rotate(0deg) } 50% { transform:translate3d(0,10px,0) rotate(1deg) } }
            @keyframes anvyaPulse { 0%,100% { opacity:.35; transform:scale(.95) } 50% { opacity:.8; transform:scale(1.08) } }
            @keyframes anvyaShine { from { transform:translateX(-120%) } to { transform:translateX(220%) } }
            .anvya-float { animation:anvyaFloat 6s ease-in-out infinite }
            .anvya-float-2 { animation:anvyaFloat2 7s ease-in-out infinite }
            .anvya-pulse { animation:anvyaPulse 4s ease-in-out infinite }
            .anvya-card:hover .anvya-shine { animation:anvyaShine 1s ease-out }
            @media (prefers-reduced-motion:reduce) {
              .anvya-float,.anvya-float-2,.anvya-pulse { animation:none!important }
            }
          `}</style>

          <div className="relative container mx-auto max-w-7xl">
            <div className="mx-auto max-w-5xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/[0.045] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200 shadow-[0_0_40px_rgba(34,211,238,.08)] backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]" />
                ANVYA Community Platform
              </div>
              <h2 className="mt-7 text-5xl font-black tracking-[-0.04em] text-white md:text-7xl">
                Your people.
                <span className="block bg-gradient-to-r from-cyan-200 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">Your conversations.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-400 md:text-lg">
                A modern community space to build your profile, share ideas, discover people, join communities and turn meaningful conversations into real connections.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="/anvya" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_12px_45px_rgba(255,255,255,.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(255,255,255,.18)]">
                  Explore ANVYA <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
                <a href="/anvya/communities" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.08]">
                  Explore Communities
                </a>
              </div>
            </div>

            <div className="relative mx-auto mt-16 max-w-6xl">
              <div className="anvya-pulse pointer-events-none absolute -inset-8 rounded-[44px] bg-gradient-to-r from-cyan-500/10 via-blue-500/15 to-fuchsia-500/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.035] p-2 shadow-[0_40px_120px_rgba(0,0,0,.55)] backdrop-blur-2xl md:p-3">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white">
                  <img
                    src="/images/anvya-community.jpg"
                    alt="ANVYA community platform — profiles, posts, connections and community features"
                    className="block h-auto w-full object-contain"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-white/5" />
                </div>

                <div className="grid gap-3 p-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Discover</p>
                    <p className="mt-1 text-sm font-bold text-white">Find people & communities</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Create</p>
                    <p className="mt-1 text-sm font-bold text-white">Share ideas that matter</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Connect</p>
                    <p className="mt-1 text-sm font-bold text-white">Build useful relationships</p>
                  </div>
                </div>
              </div>

              <div className="anvya-float absolute -left-3 top-10 hidden w-48 rounded-2xl border border-white/10 bg-[#0b101b]/90 p-4 shadow-2xl backdrop-blur-2xl lg:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">✦</div>
                  <div><p className="text-xs font-bold text-white">New idea</p><p className="text-[11px] text-slate-500">Just shared</p></div>
                </div>
              </div>
              <div className="anvya-float-2 absolute -right-3 bottom-24 hidden w-52 rounded-2xl border border-white/10 bg-[#0b101b]/90 p-4 shadow-2xl backdrop-blur-2xl lg:block">
                <div className="flex items-center justify-between">
                  <div><p className="text-[11px] uppercase tracking-wider text-slate-500">Community</p><p className="mt-1 text-sm font-bold text-white">Real connections</p></div>
                  <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">Active</span>
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["01", "Profiles", "Build your identity and let relevant people discover your expertise.", "01"],
                ["02", "Ideas & Posts", "Publish thoughts, questions, guides and original knowledge.", "02"],
                ["03", "Communities", "Join focused spaces and participate in conversations you care about.", "03"],
                ["04", "Connections", "Follow activity and turn valuable conversations into opportunities.", "04"]
              ].map(([number, title, description]) => (
                <div key={title} className="anvya-card group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_rgba(0,0,0,.3)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-3 hover:border-cyan-300/20 hover:bg-white/[0.075] hover:shadow-[0_30px_90px_rgba(0,0,0,.42)]">
                  <div className="anvya-shine pointer-events-none absolute -left-full top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[0.18em] text-cyan-300/70">{number}</span>
                    <span className="h-2 w-2 rounded-full bg-cyan-300/70 shadow-[0_0_14px_rgba(103,232,249,.8)]" />
                  </div>
                  <h3 className="mt-8 text-xl font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
                  <div className="mt-7 flex items-center text-xs font-bold text-slate-500 transition-colors group-hover:text-cyan-200">Explore <span className="ml-2 transition-transform group-hover:translate-x-1">→</span></div>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-[28px] border border-blue-400/15 bg-gradient-to-r from-blue-500/[0.08] via-violet-500/[0.10] to-fuchsia-500/[0.08] p-6 shadow-2xl backdrop-blur-xl md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">For brands & creators</p>
                  <h3 className="mt-2 text-2xl font-black text-white">Put your message where conversations happen.</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Promote a useful product, service, event or community through relevant, clearly labelled placements.</p>
                </div>
                <a href="/contact" className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:shadow-xl">Advertise With Us <span className="ml-2">→</span></a>
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
