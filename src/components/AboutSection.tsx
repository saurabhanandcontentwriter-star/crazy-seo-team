import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Bot, Search, Sparkles, PenTool, Megaphone, Code2, Workflow, Target, Eye, Rocket, BarChart3, BrainCircuit, Layers3, Globe2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const whoWeAre = ["AI SEO Company", "SEO & Content Marketing Agency", "AI Search Optimization Specialists", "Digital Growth Experts", "Automation Experts"];
const missionEngines = ["Google Search", "Google AI Overview", "ChatGPT Search", "Gemini", "Claude", "Perplexity", "Bing Copilot"];
const whatWeDo = [
  { icon: Search, title: "SEO Services", desc: "Technical, on-page, off-page, local, semantic and entity SEO designed around sustainable search visibility." },
  { icon: Sparkles, title: "AI SEO Services", desc: "GEO, AEO and LLM optimization for AI search experiences across ChatGPT, Gemini, Claude and Perplexity." },
  { icon: Megaphone, title: "Google Ads", desc: "Search, Shopping, YouTube and Performance Max campaigns supported by conversion-focused measurement." },
  { icon: PenTool, title: "Content Writing", desc: "Research-led blogs, articles, landing pages, service pages and product content built for people and search." },
  { icon: Bot, title: "Ghostwriting", desc: "Founder, CEO and LinkedIn thought leadership that turns expertise into a consistent content presence." },
  { icon: Workflow, title: "AI Automation", desc: "Workflow automation, AI agents and integrations that reduce repetitive work and improve operational speed." },
  { icon: Code2, title: "AI Software Development", desc: "Custom AI SaaS, dashboards, chatbots, CRMs and business applications built around real workflows." },
];
const counters = [
  { value: 12500, suffix: "+", label: "SEO Audits Completed" },
  { value: 45000, suffix: "+", label: "Articles Published" },
  { value: 1000000, suffix: "+", label: "Keywords Ranked" },
  { value: 8700, suffix: "+", label: "AI Visibility Improvements" },
  { value: 500, suffix: "+", label: "Projects Delivered" },
];
const principles = [
  { icon: BarChart3, title: "Data Before Guesswork", text: "We use technical signals, search data, content performance and business context to shape strategy instead of relying on assumptions." },
  { icon: BrainCircuit, title: "Built for AI-Era Search", text: "Modern visibility is broader than a traditional blue-link ranking. We think about entities, answers, citations, intent and machine-readable context." },
  { icon: Layers3, title: "One Connected Growth System", text: "SEO, content, paid acquisition, automation and software can work together instead of operating as disconnected marketing activities." },
  { icon: Globe2, title: "Human + AI Collaboration", text: "Automation accelerates research and production while human judgment remains important for quality, context, brand voice and business decisions." },
];
const formatNumber = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K` : n.toString();

const Counter = ({ target, suffix, label }: { target: number; suffix: string; label: string }) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (t: number) => { const p = Math.min((t - start) / 1600, 1); setValue(Math.floor(p * target)); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
    }), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <div ref={ref} className="p-6 glass-card glass-sheen text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"><p className="text-4xl md:text-5xl font-black gradient-text">{formatNumber(value)}{suffix}</p><p className="text-sm text-muted-foreground mt-2">{label}</p></div>;
};

const AboutSection = () => (
  <>
    <Helmet>
      <title>About Crazy SEO Team | AI SEO, Digital Growth & AI Search</title>
      <meta name="description" content="Discover Crazy SEO Team — an AI-powered SEO and digital growth agency focused on Google, AI Overviews, ChatGPT, Gemini, Claude, Perplexity, content, automation and custom AI software." />
      <meta name="keywords" content="About Crazy SEO Team, AI SEO company, AI search optimization, GEO, AEO, LLM SEO, digital growth agency, SEO company, AI automation" />
      <link rel="canonical" href="https://crazyseoteam.in/about" />
      <meta property="og:title" content="About Crazy SEO Team | AI SEO & Digital Growth" />
      <meta property="og:description" content="Meet Crazy SEO Team and discover our approach to SEO, AI search visibility, content, automation and AI software development." />
      <meta property="og:url" content="https://crazyseoteam.in/about" />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="About Crazy SEO Team | AI SEO & Digital Growth" />
      <meta name="twitter:description" content="SEO, AI SEO, content, automation and AI software built for the modern search ecosystem." />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org", "@type": "AboutPage", name: "About Crazy SEO Team", url: "https://crazyseoteam.in/about",
        description: "About Crazy SEO Team, an AI-powered SEO and digital growth agency.", mainEntity: { "@type": "Organization", name: "Crazy SEO Team", url: "https://crazyseoteam.in/", description: "AI-powered SEO, AI search optimization, content, advertising, automation and AI software development agency." }
      })}</script>
    </Helmet>

    <main className="overflow-hidden">
      <section className="relative py-24 md:py-32 bg-background">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-[0.16em] uppercase mb-7"><Sparkles className="w-4 h-4" /> About Crazy SEO Team</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground mb-7 leading-[1.05]">The AI SEO Company Built for the <span className="gradient-text">Generative Search Era</span></h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-8 max-w-3xl mx-auto">Crazy SEO Team is an AI-powered SEO and digital growth agency helping businesses build visibility across Google, AI Overviews and generative search. We combine technical SEO, AI search optimization, content engineering, paid growth, automation and custom software into one connected growth system.</p>
          <div className="flex flex-wrap justify-center gap-2.5 mt-9">{whoWeAre.map((t) => <span key={t} className="px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border text-sm text-foreground shadow-sm hover:-translate-y-1 transition-transform">{t}</span>)}</div>
          <div className="mt-12 flex flex-wrap justify-center gap-4"><Link to="/services"><Button size="lg" className="gradient-cta text-primary-foreground">Explore Our Services</Button></Link><Link to="/contact"><Button size="lg" variant="outline">Talk to Our Team</Button></Link></div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-2 gap-7">
          <div className="p-8 md:p-10 glass-card glass-sheen hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5"><Target className="w-6 h-6 text-primary" /></div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-8 mb-6">Our mission is to help businesses increase meaningful visibility across every search surface that matters — from traditional Google results to AI-generated answers and conversational discovery.</p>
            <div className="flex flex-wrap gap-2">{missionEngines.map((e) => <span key={e} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">{e}</span>)}</div>
          </div>
          <div className="p-8 md:p-10 glass-card glass-sheen hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-5"><Eye className="w-6 h-6 text-accent" /></div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-8">We are building toward an AI-powered digital growth platform where brands can plan, produce, optimize and measure search performance in one place — with technology that keeps evolving as the search ecosystem evolves.</p>
            <div className="mt-7 flex items-center gap-3 text-sm font-semibold"><Rocket className="w-5 h-5 text-accent" /> Built for the next decade of search.</div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="max-w-3xl mb-14"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary mb-3">Our Story</p><h2 className="text-3xl md:text-5xl font-black mb-6">Why Crazy SEO Team Exists</h2><p className="text-lg text-muted-foreground leading-8">Search is no longer only a list of blue links. People discover brands through traditional search, AI answers, social content, maps, marketplaces and conversational assistants. That shift creates a new visibility challenge: businesses need their information to be useful to people and understandable to search systems.</p></div>
          <div className="space-y-7 text-muted-foreground leading-8 text-lg">
            <p>Crazy SEO Team was built around that change. Instead of treating SEO, content, advertising and technology as separate departments, we bring them together around a common goal: helping businesses become easier to discover, understand and trust.</p>
            <p>Our work combines technical foundations with content strategy, semantic relevance, structured data, conversion thinking and AI-search optimization. The result is a more connected approach to digital growth that can support both current search demand and emerging AI discovery experiences.</p>
            <p>We also believe technology should remove repetitive work rather than make marketing more complicated. That is why our capabilities extend into AI automation, agents, dashboards, CRM systems, SaaS products and custom integrations.</p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary mb-3">How We Think</p><h2 className="text-3xl md:text-5xl font-black mb-4">A Modern Approach to Digital Growth</h2><p className="text-muted-foreground max-w-2xl mx-auto leading-7">Our principles keep strategy grounded while technology, search and AI continue to change.</p></div>
          <div className="grid md:grid-cols-2 gap-6">{principles.map(({ icon: Icon, title, text }) => <div key={title} className="p-7 glass-card glass-sheen hover:-translate-y-2 transition-all duration-500"><div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5"><Icon className="w-5 h-5 text-primary" /></div><h3 className="text-xl font-bold mb-3">{title}</h3><p className="text-muted-foreground leading-7">{text}</p></div>)}</div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary mb-3">Capabilities</p><h2 className="text-3xl md:text-5xl font-black mb-4">What We Do</h2><p className="text-muted-foreground max-w-2xl mx-auto leading-7">A full-stack growth engine covering SEO, AI search, content, advertising, automation and custom AI software.</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{whatWeDo.map(({ icon: Icon, title, desc }) => <div key={title} className="group p-7 glass-card glass-sheen transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"><Icon className="w-5 h-5 text-primary" /></div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-sm text-muted-foreground leading-7">{desc}</p></div>)}</div>
          <div className="text-center mt-12"><Link to="/services"><Button size="lg" className="gradient-cta text-primary-foreground">Explore All Services</Button></Link></div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary mb-3">Our Work</p><h2 className="text-3xl md:text-5xl font-black mb-4">Results in Numbers</h2><p className="text-muted-foreground max-w-2xl mx-auto">Compounding activity across SEO, AI search, content and digital growth programs.</p></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">{counters.map((c) => <Counter key={c.label} target={c.value} suffix={c.suffix} label={c.label} />)}</div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary mb-3">Why Work With Us</p><h2 className="text-3xl md:text-5xl font-black mb-4">From Visibility to Business Growth</h2><p className="text-muted-foreground max-w-2xl mx-auto leading-7">The goal is not simply to generate traffic. The goal is to build a digital system that supports discovery, trust, conversion and long-term growth.</p></div>
          <div className="grid md:grid-cols-3 gap-6">{[
            ["Understand", "We study your market, search intent, technical environment, competitors and customer journey."],
            ["Build", "We turn the strategy into technical improvements, content, campaigns, automation and useful digital experiences."],
            ["Measure", "We monitor meaningful visibility and performance signals, then use what we learn to improve the next cycle."],
          ].map(([title, text]) => <div key={title} className="p-7 rounded-3xl border border-border bg-card hover:border-primary/40 transition-colors"><div className="flex items-center gap-2 mb-4"><CheckCircle2 className="w-5 h-5 text-primary" /><h3 className="text-xl font-bold">{title}</h3></div><p className="text-muted-foreground leading-7">{text}</p></div>)}</div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl text-center"><div className="p-8 md:p-12 rounded-[2rem] glass-card glass-sheen"><Rocket className="w-10 h-10 text-primary mx-auto mb-5" /><h2 className="text-3xl md:text-5xl font-black mb-5">Ready for the Next Search Era?</h2><p className="text-muted-foreground text-lg leading-8 max-w-2xl mx-auto mb-8">Whether you need SEO, AI search visibility, content, paid growth, automation or custom AI software, Crazy SEO Team can help map the right digital growth path for your business.</p><div className="flex flex-wrap justify-center gap-4"><Link to="/services"><Button size="lg" className="gradient-cta text-primary-foreground">Explore Services</Button></Link><Link to="/contact"><Button size="lg" variant="outline">Talk to Our Team</Button></Link></div></div></div>
      </section>
    </main>
  </>
);

export default AboutSection;
