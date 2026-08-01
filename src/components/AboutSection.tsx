import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Bot,
  Search,
  Sparkles,
  PenTool,
  Megaphone,
  Code2,
  Workflow,
  Target,
  Eye,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const whoWeAre = [
  "AI SEO Company",
  "SEO & Content Marketing Agency",
  "AI Search Optimization Specialists",
  "Digital Growth Experts",
  "Automation Experts",
];

const missionEngines = [
  "Google Search",
  "Google AI Overview",
  "ChatGPT Search",
  "Gemini",
  "Claude",
  "Perplexity",
  "Bing Copilot",
];

const whatWeDo = [
  { icon: Search, title: "SEO Services", desc: "Technical, on-page, off-page, local & entity SEO." },
  { icon: Sparkles, title: "AI SEO Services", desc: "GEO, AEO & LLM SEO for ChatGPT, Gemini, Claude & Perplexity." },
  { icon: Megaphone, title: "Google Ads", desc: "Search, Shopping, YouTube & Performance Max campaigns." },
  { icon: PenTool, title: "Content Writing", desc: "SEO blogs, landing pages, service pages & product copy." },
  { icon: Bot, title: "Ghostwriting", desc: "CEO, founder & LinkedIn thought leadership content." },
  { icon: Workflow, title: "AI Automation", desc: "Workflow automation, AI agents & integrations." },
  { icon: Code2, title: "AI Software Development", desc: "Custom AI SaaS, chatbots, CRMs & enterprise apps." },
];

const counters = [
  { value: 12500, suffix: "+", label: "SEO Audits Completed" },
  { value: 45000, suffix: "+", label: "Articles Published" },
  { value: 1000000, suffix: "+", label: "Keywords Ranked" },
  { value: 8700, suffix: "+", label: "AI Visibility Improvements" },
  { value: 500, suffix: "+", label: "Projects Delivered" },
];

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return n.toString();
};

const Counter = ({ target, suffix, label }: { target: number; suffix: string; label: string }) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1800;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min((t - start) / duration, 1);
              setValue(Math.floor(p * target));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="p-6 glass-card text-center">
      <p className="text-4xl md:text-5xl font-black gradient-text">
        {formatNumber(value)}
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </div>
  );
};

const AboutSection = () => (
  <>
    <Helmet>
      <title>About Crazy SEO Team — AI SEO & Digital Growth Agency</title>
      <meta
        name="description"
        content="Crazy SEO Team is an AI-powered SEO, content marketing, Google Ads, and AI software development agency helping brands win in Google, ChatGPT, Gemini, Claude & Perplexity."
      />
      <link rel="canonical" href="https://nimble-echo-engine.lovable.app/about" />
      <meta property="og:title" content="About Crazy SEO Team — AI SEO & Digital Growth Agency" />
      <meta
        property="og:description"
        content="AI SEO specialists optimizing brands across Google, ChatGPT, Gemini, Claude & Perplexity."
      />
      <meta property="og:url" content="https://nimble-echo-engine.lovable.app/about" />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Crazy SEO Team",
        url: "https://nimble-echo-engine.lovable.app",
        description:
          "AI-powered SEO, content marketing, Google Ads and AI software development agency.",
        sameAs: [],
      })}</script>
    </Helmet>

    {/* Hero / Who We Are */}
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
          About Crazy SEO Team
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 leading-tight">
          The AI SEO Company Built for the{" "}
          <span className="gradient-text">Generative Search Era</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Crazy SEO Team is an AI-powered SEO and digital growth agency helping businesses dominate
          Google, AI Overviews, and every major generative search engine. We blend technical SEO,
          AI search optimization, content engineering, and automation to deliver measurable growth.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {whoWeAre.map((t) => (
            <span
              key={t}
              className="px-4 py-2 rounded-full bg-card border border-border text-sm text-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-2 gap-6">
        <div className="p-8 glass-card">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-5">
            Help businesses increase visibility across every search surface that matters — from
            Google's classic SERPs to AI-generated answers.
          </p>
          <div className="flex flex-wrap gap-2">
            {missionEngines.map((e) => (
              <span
                key={e}
                className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        <div className="p-8 glass-card">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
            <Eye className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            To become the world's leading AI-powered SEO and digital growth platform — where every
            brand can plan, produce, optimize, and measure search performance in one place.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-foreground/80">
            <Rocket className="w-4 h-4 text-accent" />
            Built for the next decade of search.
          </div>
        </div>
      </div>
    </section>

    {/* What We Do */}
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-3">What We Do</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A full-stack growth engine — SEO, AI SEO, content, ads, automation, and custom AI
            software under one roof.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {whatWeDo.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 glass-card glass-sheen"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/services">
            <Button size="lg" className="gradient-cta text-primary-foreground">
              Explore All Services
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Results / Counters */}
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-3">Results in Numbers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compounding outcomes across SEO, AI search, and content programs.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {counters.map((c) => (
            <Counter key={c.label} target={c.value} suffix={c.suffix} label={c.label} />
          ))}
        </div>
      </div>
    </section>
  </>
);

export default AboutSection;
