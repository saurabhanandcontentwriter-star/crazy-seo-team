import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Sparkles, FileText, Newspaper, BookOpen, UserCheck, PenTool, MousePointerClick, Code2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import ContactFormDialog from "@/components/ContactFormDialog";
import { servicesByCategory, categoryOrder, type ServiceCategory } from "@/data/services";

const ICONS: Record<ServiceCategory, typeof Search> = {
  "SEO Services": Search,
  "AI SEO Services": Sparkles,
  "Content Writing": FileText,
  "Article Writing": Newspaper,
  "Blog Writing": BookOpen,
  "Ghostwriting": UserCheck,
  "Copywriting": PenTool,
  "Google Ads": MousePointerClick,
  "AI Software Development": Code2,
};

const GRADIENTS: Record<ServiceCategory, string> = {
  "SEO Services": "from-[hsl(230,80%,56%)] to-[hsl(270,80%,60%)]",
  "AI SEO Services": "from-[hsl(270,80%,55%)] to-[hsl(330,80%,55%)]",
  "Content Writing": "from-[hsl(200,80%,50%)] to-[hsl(230,80%,56%)]",
  "Article Writing": "from-[hsl(145,60%,45%)] to-[hsl(200,80%,50%)]",
  "Blog Writing": "from-[hsl(190,70%,45%)] to-[hsl(230,80%,56%)]",
  "Ghostwriting": "from-[hsl(280,70%,55%)] to-[hsl(330,80%,55%)]",
  "Copywriting": "from-[hsl(330,80%,55%)] to-[hsl(15,90%,55%)]",
  "Google Ads": "from-[hsl(40,90%,55%)] to-[hsl(15,90%,55%)]",
  "AI Software Development": "from-[hsl(230,80%,56%)] to-[hsl(330,80%,55%)]",
};

const TAGLINE: Record<ServiceCategory, string> = {
  "SEO Services": "Rank #1 on Google with AI-powered SEO.",
  "AI SEO Services": "Win visibility in ChatGPT, Gemini, Claude & Perplexity.",
  "Content Writing": "SEO + AI-optimized content that ranks and converts.",
  "Article Writing": "Research-grade articles that earn links and AI citations.",
  "Blog Writing": "Weekly blog programs that compound traffic month after month.",
  "Ghostwriting": "Thought leadership content in your authentic voice.",
  "Copywriting": "Conversion copy backed by research and proven frameworks.",
  "Google Ads": "Profitable PPC across Search, Shopping, YouTube & PMax.",
  "AI Software Development": "Custom AI apps, agents, chatbots and SaaS platforms.",
};

const ServicesSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const grouped = servicesByCategory();

  return (
    <>
      <Helmet>
        <title>Services — AI SEO, GEO, Content, Google Ads & AI Development | Crazy SEO Team</title>
        <meta
          name="description"
          content="Complete services hub: Technical & AI SEO, GEO/AEO/LLM SEO, content & blog writing, ghostwriting, copywriting, Google Ads, and custom AI software development."
        />
        <link rel="canonical" href="/services" />
      </Helmet>

      <section id="services" className="py-16 px-4">
        <div className="container mx-auto">
          <p className="text-sm font-semibold text-primary text-center mb-2">Our Expertise</p>
          <h1 className="text-3xl md:text-5xl font-black text-center text-foreground mb-3">
            Complete <span className="gradient-text">Services Hub</span>
          </h1>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            55+ specialized services across SEO, AI search, content, Google Ads, and AI software development — built for 2026.
          </p>

          {categoryOrder.map((cat) => {
            const items = grouped[cat] || [];
            const Icon = ICONS[cat];
            const gradient = GRADIENTS[cat];
            return (
              <div key={cat} className="mb-14">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
                    <Icon size={20} className="text-[hsl(0,0%,100%)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">{cat}</h2>
                    <p className="text-sm text-muted-foreground">{TAGLINE[cat]}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/services/${s.slug}`}
                      className="group p-5 rounded-xl border border-border bg-card hover:shadow-xl hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {s.title}
                        </h3>
                        <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{s.tagline}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="text-center mt-12">
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg gradient-bg text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Get a Custom Plan <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Get Started With Our Services"
        description="Tell us which service interests you and we'll create a custom plan."
      />
    </>
  );
};

export default ServicesSection;
