import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowUpRight, CheckCircle2, Search, Sparkles, Target, TrendingUp } from "lucide-react";
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
  { slug: "e-commerce", label: "E-Commerce", img: ecommerce, text: "Turn product discovery into qualified traffic, stronger category visibility and measurable revenue.", services: ["Product SEO", "Shopping Ads", "Conversion Optimization"] },
  { slug: "education", label: "Education", img: education, text: "Build search visibility around courses, admissions, programs and the questions students actually ask.", services: ["Education SEO", "Admissions Growth", "Content Strategy"] },
  { slug: "healthcare", label: "Healthcare", img: healthcare, text: "Create trusted search visibility for healthcare organizations, locations, services and patient journeys.", services: ["Medical SEO", "Local Visibility", "Patient Growth"] },
  { slug: "real-estate", label: "Real Estate", img: realestate, text: "Capture property demand with local search, property content, technical SEO and lead-focused landing pages.", services: ["Property SEO", "Local SEO", "Lead Generation"] },
  { slug: "saas-tech", label: "SaaS & Tech", img: saas, text: "Build scalable organic acquisition across product-led, B2B and technical search journeys.", services: ["B2B SEO", "Programmatic SEO", "Demand Generation"] },
  { slug: "finance-fintech", label: "Finance & Fintech", img: finance, text: "Strengthen discovery with technically sound SEO, useful authority content and high-intent acquisition paths.", services: ["Fintech SEO", "Content Authority", "Lead Generation"] },
  { slug: "travel-hospitality", label: "Travel & Hospitality", img: travel, text: "Reach travelers across destination, property, local and booking-intent searches.", services: ["Travel SEO", "Local Visibility", "Booking Growth"] },
  { slug: "legal", label: "Legal", img: legal, text: "Build discoverability around legal services, local intent, expertise content and qualified enquiries.", services: ["Law SEO", "Local Search", "Lead Generation"] },
  { slug: "local-businesses", label: "Local Businesses", img: local, text: "Improve Maps and local organic visibility so nearby customers can find and contact you.", services: ["Maps SEO", "Local SEO", "Local Leads"] },
];

const Industries = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main>
      <section className="relative overflow-hidden px-4 pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,.14),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(139,92,246,.13),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(34,211,238,.09),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-primary">
              <Sparkles size={14} /> Industry Growth Systems
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
              Digital growth built around your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">industry.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground md:text-xl">
              Search behavior, customer journeys and competitive landscapes differ by sector. Explore focused SEO, AI search, content and acquisition systems for each market.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/services" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-500/20">
                Explore Services <ArrowUpRight size={17} />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-bold text-foreground hover:border-primary/30">
                Talk to the Team
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              { icon: Search, title: "Search Visibility", text: "Technical SEO, local search and intent-led content." },
              { icon: Sparkles, title: "AI Search", text: "Clear, structured content for modern AI discovery." },
              { icon: TrendingUp, title: "Growth Tracking", text: "Connect visibility improvements to meaningful outcomes." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/70 bg-card/75 p-5 shadow-sm backdrop-blur">
                <item.icon className="text-primary" size={21} />
                <h2 className="mt-3 font-extrabold">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-[.2em] text-primary">Explore by market</span>
              <h2 className="mt-2 text-3xl font-black md:text-5xl">Industry-specific growth playbooks</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-right">
              Choose an industry to see the core growth areas and the services mapped to that market.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <article key={industry.slug} className="group overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl">
                <div className="relative overflow-hidden bg-muted/30">
                  <img src={industry.img} alt={`${industry.label} digital growth strategy`} width="800" height="420" loading="lazy" className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.04]" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/industry-fallback.svg"; }} />
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
                    <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-white backdrop-blur">Industry SEO</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black">{industry.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{industry.text}</p>
                  <div className="mt-5 space-y-2">
                    {industry.services.map((service) => (
                      <div key={service} className="flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 size={16} className="shrink-0 text-primary" /> {service}
                      </div>
                    ))}
                  </div>
                  <Link to={`/industries/${industry.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-primary">
                    View Industry Strategy <ArrowUpRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-slate-950 px-6 py-12 text-white shadow-2xl md:px-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-[1.4fr_.6fr] md:items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">One growth system</span>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">Your industry is specific. Your growth system should be too.</h2>
              <p className="mt-5 max-w-2xl leading-7 text-slate-300">
                Combine technical SEO, useful content, AI-search readiness, local visibility and measurable acquisition into a strategy shaped around your market.
              </p>
            </div>
            <Link to="/services" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3.5 font-black text-slate-950">
              Build Your Strategy <Target size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Industries;
