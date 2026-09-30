import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Bot, Search, Sparkles, PenTool, Megaphone, Code2, Workflow, Target, Eye, Rocket, BarChart3, BrainCircuit, Layers3, Globe2, CheckCircle2, Database, Cpu, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

const whoWeAre = ["AI SEO Company", "SEO & Content Marketing Agency", "AI Search Optimization Specialists", "Digital Growth Experts", "Automation Experts"];
const missionEngines = ["Google Search", "Google AI Overview", "ChatGPT Search", "Gemini", "Claude", "Perplexity", "Bing Copilot"];
const whatWeDo = [
  { title: "SEO Services", desc: "Technical, on-page, off-page, local, semantic and entity SEO designed around sustainable search visibility.", image: "/images/capability-seo.svg", points: ["Technical and on-page SEO", "Semantic and entity optimization", "Local and off-page SEO", "Search visibility foundations"] },
  { title: "AI SEO Services", desc: "GEO, AEO and LLM optimization for AI search experiences across ChatGPT, Gemini, Claude and Perplexity.", image: "/images/capability-ai.svg", points: ["GEO and AEO optimization", "AI-search visibility strategy", "LLM-friendly content structure", "Answer and citation readiness"] },
  { title: "Google Ads", desc: "Search, Shopping, YouTube and Performance Max campaigns supported by conversion-focused measurement.", image: "/images/capability-ads.svg", points: ["Search and Shopping campaigns", "YouTube and Performance Max", "Conversion-focused tracking", "Campaign optimization"] },
  { title: "Content Writing", desc: "Research-led blogs, articles, landing pages, service pages and product content built for people and search.", image: "/images/capability-content.svg", points: ["SEO blogs and articles", "Landing and service pages", "Search-intent content", "Human-first brand voice"] },
  { title: "Ghostwriting", desc: "Founder, CEO and LinkedIn thought leadership that turns expertise into a consistent content presence.", image: "/images/capability-ghost.svg", points: ["Founder and CEO content", "LinkedIn thought leadership", "Personal brand strategy", "Consistent publishing systems"] },
  { title: "AI Automation", desc: "Workflow automation, AI agents and integrations that reduce repetitive work and improve operational speed.", image: "/images/capability-automation.svg", points: ["AI agents and workflows", "Process automation", "Tool and API integrations", "Operational efficiency"] },
  { title: "AI Software Development", desc: "Custom AI SaaS, dashboards, chatbots, CRMs and business applications built around real workflows.", image: "/images/capability-software.svg", points: ["Custom AI SaaS products", "Dashboards and CRMs", "AI chatbots and agents", "Business workflow software"] },
];
const principles = [
  { icon: Database, title: "Data Before Guesswork", text: "We use technical signals, search data, content performance and business context to shape strategy instead of relying on assumptions." },
  { icon: Cpu, title: "Built for AI-Era Search", text: "Modern visibility is broader than a traditional blue-link ranking. We think about entities, answers, citations, intent and machine-readable context." },
  { icon: Network, title: "One Connected Growth System", text: "SEO, content, paid acquisition, automation and software can work together instead of operating as disconnected marketing activities." },
  { icon: BrainCircuit, title: "Human + AI Collaboration", text: "Automation accelerates research and production while human judgment remains important for quality, context, brand voice and business decisions." },
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

const AboutSection = () => {
  const [flippedCapability, setFlippedCapability] = useState<string | null>(null);

  return (
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
          <div className="text-center mb-14"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary mb-3">Our Capabilities</p><h2 className="text-3xl md:text-5xl font-black mb-4">DISCOVERY, ENGINEERED.</h2><p className="text-muted-foreground max-w-2xl mx-auto leading-7">SEO, AI, content and technology working together to make brands discoverable everywhere people search.</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{whatWeDo.map(({ title, desc, image, points }) => {
            const flipped = flippedCapability === title;
            return <div key={title} className="[perspective:1200px] h-[330px]">
              <button type="button" onClick={() => setFlippedCapability((v) => (v === title ? null : title))} className="group relative h-full w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-3xl">
                <div className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
                  <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl border border-border/70 bg-card/80 p-7 shadow-lg transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-background p-2 shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
                        <img src={image} alt="" width="52" height="52" className="h-12 w-12 object-contain" />
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-7">{desc}</p>
                    <p className="mt-5 text-xs font-semibold text-primary">Click to view points →</p>
                  </div>
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-7 shadow-2xl">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold">{title}</h3>
                      <span className="text-xs font-semibold text-muted-foreground">Back</span>
                    </div>
                    <ul className="space-y-3">{points.map((point) => <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">✓</span><span>{point}</span></li>)}</ul>
                    <span className="absolute bottom-6 left-7 text-xs font-semibold text-primary">Click to flip back</span>
                  </div>
                </div>
              </button>
            </div>;
          })}</div>
          <div className="text-center mt-12"><Link to="/services"><Button size="lg" className="gradient-cta text-primary-foreground">Explore All Services</Button></Link></div>
        </div>
      </section>

      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary mb-3">The Visibility Lab</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Signals Behind Real Growth</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-7">We don't start with random tactics. We find the signals, connect the dots and turn them into action.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Search Signals", text: "Queries, intent and SERPs show what people are actively trying to discover.", icon: Search, stat: "DISCOVER" },
              { n: "02", title: "Entity Signals", text: "Facts, relationships and context help search systems understand your brand.", icon: Layers3, stat: "UNDERSTAND" },
              { n: "03", title: "Content Signals", text: "Topic gaps and weak pages reveal where useful content can create an advantage.", icon: PenTool, stat: "BUILD" },
              { n: "04", title: "Trust Signals", text: "Authority, consistency and evidence strengthen how your brand is perceived.", icon: Globe2, stat: "TRUST" },
              { n: "05", title: "Conversion Signals", text: "We connect visibility with the actions that actually matter to the business.", icon: Target, stat: "CONVERT" },
              { n: "06", title: "Automation Signals", text: "Repetitive workflows become opportunities for smarter AI-powered systems.", icon: Workflow, stat: "SCALE" },
            ].map(({ n, title, text, icon: Icon, stat }) => (
              <div key={n} className="group relative min-h-[285px] overflow-hidden rounded-[2rem] border border-border/70 bg-card p-7 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:border-primary/40 hover:shadow-2xl">
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/20" />
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                <div className="relative flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-5xl font-black tracking-tight text-muted-foreground/10 transition-colors duration-500 group-hover:text-primary/15">{n}</span>
                </div>
                <div className="relative mt-7">
                  <span className="inline-flex rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{stat}</span>
                  <h3 className="mt-3 text-xl font-bold transition-colors duration-300 group-hover:text-primary">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
                </div>
                <div className="relative mt-6 flex items-center gap-2 text-xs font-semibold text-primary opacity-70 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">Explore signal <span>→</span></div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-[1.5rem] border border-primary/15 bg-card/70 px-6 py-5 shadow-sm">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">SIGNAL</span><span className="text-muted-foreground">→</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">INSIGHT</span><span className="text-muted-foreground">→</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">ACTION</span><span className="text-muted-foreground">→</span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">IMPROVEMENT</span>
          </div>
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
};

export default AboutSection;
