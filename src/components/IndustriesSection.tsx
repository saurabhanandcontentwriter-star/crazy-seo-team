import { Link } from "react-router-dom";
import { ArrowUpRight, Building2, GraduationCap, HeartPulse, Home, Landmark, Scale, ShoppingBag, Sparkles, Wrench, Cpu } from "lucide-react";
import healthcare from "@/assets/industries-healthcare.svg";
import realestate from "@/assets/industries-realestate.svg";
import ecommerce from "@/assets/industries-ecommerce.svg";
import saas from "@/assets/industries-saas.svg";
import education from "@/assets/industries-education.svg";
import finance from "@/assets/industries-finance.svg";
import legal from "@/assets/industries-legal.svg";
import travel from "@/assets/industries-travel.svg";
import local from "@/assets/industries-local.svg";

const industries = [
  { slug: "e-commerce", icon: ShoppingBag, label: "E-Commerce", img: ecommerce, text: "Drive more sales with SEO, content and performance marketing.", keywords: ["Product SEO", "Shopping Ads"], tone: "pink" },
  { slug: "education", icon: GraduationCap, label: "Education", img: education, text: "Increase admissions and build a stronger digital presence.", keywords: ["EdTech SEO", "Admissions"], tone: "blue" },
  { slug: "healthcare", icon: HeartPulse, label: "Healthcare", img: healthcare, text: "Reach more patients with trusted digital growth strategies.", keywords: ["Medical SEO", "Patient Growth"], tone: "pink" },
  { slug: "real-estate", icon: Building2, label: "Real Estate", img: realestate, text: "Generate quality leads and showcase properties effectively.", keywords: ["Property SEO", "Local Growth"], tone: "purple" },
  { slug: "saas-tech", icon: Cpu, label: "SaaS & Tech", img: saas, text: "Scale your product with SEO, content and B2B growth.", keywords: ["B2B SEO", "Lead Gen"], tone: "blue" },
  { slug: "finance-fintech", icon: Landmark, label: "Finance & Fintech", img: finance, text: "Build trust and acquire high-value customers digitally.", keywords: ["Fintech SEO", "Trust Signals"], tone: "green" },
  { slug: "travel-hospitality", icon: Wrench, label: "Travel & Hospitality", img: travel, text: "Attract travelers and increase bookings with targeted strategies.", keywords: ["Local SEO", "Booking Growth"], tone: "purple" },
  { slug: "legal", icon: Scale, label: "Legal", img: legal, text: "Build authority and generate qualified enquiries consistently.", keywords: ["Law SEO", "Lead Generation"], tone: "orange" },
  { slug: "local-businesses", icon: Home, label: "Local Businesses", img: local, text: "Dominate local search and attract nearby customers.", keywords: ["Maps SEO", "Local Leads"], tone: "pink" },
];

const toneStyles: Record<string, string> = {
  pink: "from-pink-500/10 to-fuchsia-500/5 border-pink-500/20",
  blue: "from-blue-500/10 to-cyan-500/5 border-blue-500/20",
  purple: "from-violet-500/10 to-purple-500/5 border-violet-500/20",
  green: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20",
  orange: "from-orange-500/10 to-amber-500/5 border-orange-500/20",
};

const IndustriesSection = () => (
  <section id="industries" className="relative overflow-hidden py-24 px-4 bg-background">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-28 left-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
    </div>

    <div className="relative container mx-auto max-w-7xl">
      <div className="mx-auto max-w-4xl text-center mb-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
          <Sparkles size={12} /> Industries We Serve
        </span>
        <h2 className="mt-5 text-4xl md:text-6xl font-black tracking-tight text-foreground">
          Tailored <span className="gradient-text">Strategies</span> for Every Sector
        </h2>
        <p className="mt-5 mx-auto max-w-3xl text-base md:text-lg leading-8 text-muted-foreground">
          We understand that every industry has unique challenges. Our customized approaches are built around your market, audience and growth goals.
        </p>
        <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {industries.map((ind, index) => (
          <Link
            to={`/industries/${ind.slug}`}
            key={ind.label}
            className={`group relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br ${toneStyles[ind.tone]} bg-card/90 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/30`}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="relative aspect-[16/9] overflow-hidden p-2">
              <div className="h-full w-full overflow-hidden rounded-[1.35rem] bg-muted/20 shadow-inner">
                <img
                  src={ind.img}
                  alt={`${ind.label} digital marketing`}
                  width="800"
                  height="420"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-primary shadow-lg backdrop-blur-md">
                <ind.icon size={21} />
              </div>
            </div>

            <div className="p-5 pt-3">
              <h3 className="text-lg font-black tracking-tight text-foreground">{ind.label}</h3>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-muted-foreground">{ind.text}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {ind.keywords.map((kw) => (
                  <span key={kw} className="rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary">
                    {kw}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-sm font-bold text-primary">Learn More</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-12">
                  <ArrowUpRight size={17} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default IndustriesSection;
