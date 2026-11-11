import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Sparkles, FileText, Newspaper, BookOpen, UserCheck, PenTool, MousePointerClick, Code2, ShoppingCart } from "lucide-react";
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
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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
                    <div
                      key={s.slug}
                      className="group p-5 rounded-xl border border-border bg-card hover:shadow-xl hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                    >
                      <Link to={`/services/${s.slug}`} className="block">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{s.title}</h3>
                          <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{s.tagline}</p>
                      </Link>
                      <button type="button" onClick={() => setSelectedServices((current) => current.includes(s.title) ? current : [...current, s.title])} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg gradient-bg px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                        <ShoppingCart size={15} /> {selectedServices.includes(s.title) ? "Added to Cart" : "Add to Cart"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-12 rounded-2xl border border-primary/20 bg-card p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-bold text-foreground flex items-center gap-2"><ShoppingCart size={18} /> Your Service Cart</p><p className="text-sm text-muted-foreground">{selectedServices.length} service{selectedServices.length === 1 ? "" : "s"} selected · No prices or payment</p></div>
              <button type="button" disabled={!selectedServices.length} onClick={() => setDialogOpen(true)} className="rounded-lg gradient-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">Submit Enquiry <ArrowRight size={16} className="inline ml-1" /></button>
            </div>
            {selectedServices.length > 0 ? <ul className="mt-4 grid gap-2 sm:grid-cols-2">{selectedServices.map((service) => <li key={service} className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm"><span>{service}</span><button type="button" onClick={() => setSelectedServices((items) => items.filter((item) => item !== service))} className="text-xs font-semibold text-destructive">Remove</button></li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">Add one or more services above to start your enquiry.</p>}
          </div>
        </div>
      </section>

      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Submit your service enquiry"
        description="Your selected services will be added to one CRM enquiry. No pricing or payment is required."
        source="services_add_to_cart"
        defaultService={selectedServices.join(", ")}
        onSuccess={(id) => { setSelectedServices([]); navigate(`/track-enquiry/${id}`); }}
      />
    </>
  );
};

export default ServicesSection;
