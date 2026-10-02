import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  Search,
  Store,
  Lightbulb,
  Bot,
  FileText,
  Newspaper,
  Building2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import logo from "@/assets/logo.jpeg";
import { servicesByCategory, categoryOrder } from "@/data/services";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<"product" | "solutions" | "resources" | "industries" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quoteDay, setQuoteDay] = useState(() => new Date().toDateString());

  const dailyQuotes = [
    "Small steps every day create big results.",
    "Build with purpose. Improve with consistency.",
    "Your next breakthrough starts with one focused action.",
    "Stay curious, keep learning, keep moving forward.",
    "Progress beats perfection when you keep showing up.",
    "Think bigger. Start smaller. Execute today.",
    "Good work compounds when you stay consistent.",
    "Turn ideas into action, and action into growth.",
    "Keep learning, keep building, keep becoming better.",
    "Focus on what you can improve today.",
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setQuoteDay(new Date().toDateString()), 60000);
    return () => window.clearInterval(timer);
  }, []);


  const dayNumber = Math.floor(new Date(quoteDay).getTime() / 86400000);
  const dailyQuote = dailyQuotes[((dayNumber % dailyQuotes.length) + dailyQuotes.length) % dailyQuotes.length];
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const productActive = isActive("/seo-tools") || isActive("/ai-tools");
  const solutionsActive = isActive("/services");
  const resourcesActive =
    isActive("/blog") || isActive("/news") || isActive("/about") || isActive("/classifieds");
  const industriesActive = location.pathname.startsWith("/industries/");

  const serviceGroups = categoryOrder.map((category) => ({
    category,
    items: (servicesByCategory()[category] || []).slice(0, 6),
  }));

  const industries = [
    { label: "E-Commerce", slug: "e-commerce" },
    { label: "Education", slug: "education" },
    { label: "Healthcare", slug: "healthcare" },
    { label: "Real Estate", slug: "real-estate" },
    { label: "SaaS & Tech", slug: "saas-tech" },
    { label: "Finance & Fintech", slug: "finance-fintech" },
    { label: "Travel & Hospitality", slug: "travel-hospitality" },
    { label: "Legal", slug: "legal" },
    { label: "Local Businesses", slug: "local-businesses" },
  ];

  const closeMenus = () => setMenu(null);
  const openContact = () => {
    closeMenus();
    setDialogOpen(true);
  };

  const openPublicCrm = async () => {
    closeMenus();
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      window.location.href = "/crm";
      return;
    }
    try {
      const productionOrigin = "https://www.crazyseoteam.in";
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const redirectTo = `${isLocal ? window.location.origin : productionOrigin}/crm`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
      if (data?.url) window.location.assign(data.url);
    } catch (error) {
      console.error("Google CRM login failed:", error);
    }
  };

  return (
    <>
      <nav className="cst-public-nav fixed left-0 right-0 top-0 z-50">
        <div className="cst-public-announcement border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-blue-50 text-slate-800">
          <div className="container mx-auto flex min-h-10 items-center justify-center gap-2 px-3 py-2 text-center">
            <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-600" />
            <div className="text-sm font-extrabold leading-tight text-slate-950 sm:text-[15px]">
              “{dailyQuote}”
            </div>
          </div>
        </div>

        <div className="cst-nav-inner border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
          <div className="container mx-auto flex h-[68px] items-center justify-between px-4 lg:px-6">
            <Link
              id="tour-logo"
              to="/"
              onClick={closeMenus}
              className="group flex shrink-0 items-center gap-3"
            >
              <div className="cst-brand-mark relative shrink-0">
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-500/25 via-violet-500/20 to-cyan-400/25 blur-lg opacity-70 transition group-hover:opacity-100" />
                <img
                  src={logo}
                  alt="Crazy SEO Team"
                  className="relative h-10 w-10 rounded-xl bg-white object-contain ring-1 ring-slate-200/80"
                />
              </div>
              <div className="hidden leading-none sm:block">
                <div className="text-[15px] font-black tracking-tight text-slate-950">Crazy SEO Team</div>
                <div className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-slate-400">
                  AI Search Growth
                </div>
              </div>
            </Link>

            <div
              id="tour-nav"
              className="hidden min-w-0 flex-1 items-center justify-center gap-1 px-4 md:flex"
            >
              <Link
                to="/"
                onClick={closeMenus}
                className={`cst-nav-link rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all ${location.pathname === "/" ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                Home
              </Link>
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menu === "product"}
                  onClick={() => setMenu(menu === "product" ? null : "product")}
                  className={`cst-nav-link inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all ${productActive || menu === "product" ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  Product <ChevronDown size={13} className={menu === "product" ? "rotate-180" : ""} />
                </button>
                {menu === "product" && (
                  <div className="absolute left-1/2 top-full z-[60] w-[520px] -translate-x-1/2 pt-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                      <div className="grid grid-cols-2 gap-2">
                        <Link to="/seo-tools" onClick={closeMenus} className="group rounded-xl p-3 hover:bg-slate-50">
                          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Search size={18} />
                          </div>
                          <p className="text-sm font-bold text-slate-900">SEO Platform</p>
                          <p className="mt-1 text-[11px] leading-4 text-slate-500">Audits, AEO, GEO, NLP, keywords & technical SEO.</p>
                        </Link>
                        <Link to="/ai-tools" onClick={closeMenus} className="group rounded-xl p-3 hover:bg-slate-50">
                          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <Bot size={18} />
                          </div>
                          <p className="text-sm font-bold text-slate-900">AI Search Tools</p>
                          <p className="mt-1 text-[11px] leading-4 text-slate-500">AI content, optimization and modern search workflows.</p>
                        </Link>
                      </div>
                      <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5">
                        <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Built for modern search</p>
                        <p className="mt-1 text-xs font-semibold text-slate-700">Google + ChatGPT + Gemini + AI search visibility</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menu === "solutions"}
                  onClick={() => setMenu(menu === "solutions" ? null : "solutions")}
                  className={`cst-nav-link inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all ${solutionsActive || menu === "solutions" ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  Solutions <ChevronDown size={13} className={menu === "solutions" ? "rotate-180" : ""} />
                </button>
                {menu === "solutions" && (
                  <div className="fixed left-1/2 top-[108px] z-[60] w-[760px] max-w-[calc(100vw-2rem)] -translate-x-1/2 pt-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Solutions for growth teams</p>
                          <p className="text-[11px] text-slate-400">Choose the SEO and AI search workflow you need.</p>
                        </div>
                        <Link to="/services" onClick={closeMenus} className="rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold text-white">
                          Explore all
                        </Link>
                      </div>
                      <div className="grid max-h-[calc(100vh-180px)] grid-cols-3 gap-3 overflow-y-auto">
                        {serviceGroups.map(({ category, items }) => (
                          <div key={category} className="rounded-xl bg-slate-50 p-2.5">
                            <Link to="/services" onClick={closeMenus} className="mb-1 block px-2 text-[10px] font-black uppercase tracking-wide text-blue-600">
                              {category}
                            </Link>
                            {items.map((service) => (
                              <Link
                                key={service.slug}
                                to={`/services/${service.slug}`}
                                onClick={closeMenus}
                                className="block rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-950"
                              >
                                {service.title}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menu === "industries"}
                  onClick={() => setMenu(menu === "industries" ? null : "industries")}
                  className={`cst-nav-link inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all ${industriesActive || menu === "industries" ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  Industries <ChevronDown size={13} className={menu === "industries" ? "rotate-180" : ""} />
                </button>
                {menu === "industries" && (
                  <div className="absolute left-1/2 top-full z-[60] w-64 -translate-x-1/2 pt-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                      {industries.map((industry) => (
                        <Link
                          key={industry.slug}
                          to={`/industries/${industry.slug}`}
                          onClick={closeMenus}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Building2 size={15} className="text-slate-400" />
                          {industry.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menu === "resources"}
                  onClick={() => setMenu(menu === "resources" ? null : "resources")}
                  className={`cst-nav-link inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all ${resourcesActive || menu === "resources" ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  Resources <ChevronDown size={13} className={menu === "resources" ? "rotate-180" : ""} />
                </button>
                {menu === "resources" && (
                  <div className="absolute left-1/2 top-full z-[60] w-72 -translate-x-1/2 pt-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                      <Link to="/blog" onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                        <BookOpen size={17} className="text-blue-600" />
                        <span><span className="block text-sm font-bold text-slate-800">Blog</span><span className="block text-[10px] text-slate-400">SEO & AI search insights</span></span>
                      </Link>
                      <Link to="/news" onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                        <Newspaper size={17} className="text-violet-600" />
                        <span><span className="block text-sm font-bold text-slate-800">AI Search News</span><span className="block text-[10px] text-slate-400">Latest industry updates</span></span>
                      </Link>
                      <Link to="/classifieds" onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                        <Store size={17} className="text-emerald-600" />
                        <span><span className="block text-sm font-bold text-slate-800">Classifieds</span><span className="block text-[10px] text-slate-400">Business listings & opportunities</span></span>
                      </Link>
                      <Link to="/about" onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                        <FileText size={17} className="text-slate-500" />
                        <span><span className="block text-sm font-bold text-slate-800">About Crazy SEO Team</span><span className="block text-[10px] text-slate-400">Our company & approach</span></span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/anvya"
                onClick={closeMenus}
                className={`cst-nav-link rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all ${isActive("/anvya") ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <span className="inline-flex items-center gap-1.5"><Lightbulb size={14} />ANVYA</span>
              </Link>
            </div>

            <div id="tour-cta" className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" onClick={openPublicCrm} className="rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                Talk to us
              </Button>
              <Button onClick={openPublicCrm} className="group rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 text-white shadow-sm">
                Gmail Login <ArrowUpRight size={15} />
              </Button>
            </div>

            <button
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-sm md:hidden"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>

          {open && (
            <div className="border-t border-slate-200/80 bg-white/95 px-4 pb-5 pt-3 shadow-xl backdrop-blur-xl md:hidden">
              <div className="grid gap-1">
                {[
                  { key: "product" as const, label: "Product", icon: Search },
                  { key: "solutions" as const, label: "Solutions", icon: BarChart3 },
                  { key: "industries" as const, label: "Industries", icon: Building2 },
                  { key: "resources" as const, label: "Resources", icon: FileText },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="rounded-xl border border-slate-100 bg-slate-50/60 p-1">
                    <button
                      type="button"
                      onClick={() => setMenu(menu === key ? null : key)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-slate-700"
                    >
                      <span className="inline-flex items-center gap-2"><Icon size={16} />{label}</span>
                      <ChevronDown size={16} className={menu === key ? "rotate-180" : ""} />
                    </button>
                    {menu === key && key === "product" && (
                      <div className="grid gap-1 px-1 pb-1">
                        <Link to="/seo-tools" onClick={() => { setOpen(false); closeMenus(); }} className="rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">SEO Platform</Link>
                        <Link to="/ai-tools" onClick={() => { setOpen(false); closeMenus(); }} className="rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">AI Search Tools</Link>
                      </div>
                    )}
                    {menu === key && key === "solutions" && (
                      <div className="grid gap-1 px-1 pb-1">
                        <Link to="/services" onClick={() => { setOpen(false); closeMenus(); }} className="rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-blue-700">Explore all solutions</Link>
                        {serviceGroups.map(({ category, items }) => (
                          <div key={category} className="rounded-lg bg-white px-2 py-2">
                            <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">{category}</p>
                            {items.map((service) => (
                              <Link key={service.slug} to={`/services/${service.slug}`} onClick={() => { setOpen(false); closeMenus(); }} className="block rounded-lg px-2 py-2 text-sm font-medium text-slate-600">{service.title}</Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    {menu === key && key === "industries" && (
                      <div className="grid gap-1 px-1 pb-1">
                        {industries.map((industry) => (
                          <Link key={industry.slug} to={`/industries/${industry.slug}`} onClick={() => { setOpen(false); closeMenus(); }} className="rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-slate-600">{industry.label}</Link>
                        ))}
                      </div>
                    )}
                    {menu === key && key === "resources" && (
                      <div className="grid gap-1 px-1 pb-1">
                        {[
                          ["/blog", "Blog"],
                          ["/news", "AI Search News"],
                          ["/classifieds", "Classifieds"],
                          ["/about", "About Crazy SEO Team"],
                        ].map(([path, label]) => (
                          <Link key={path} to={path} onClick={() => { setOpen(false); closeMenus(); }} className="rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-slate-600">{label}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Link to="/anvya" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <span className="inline-flex items-center gap-2"><Lightbulb size={16} />ANVYA</span>
                </Link>
                <div className="mt-2 border-t border-slate-100 pt-3">
                  <Button onClick={openPublicCrm} className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
                    Gmail Login
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Talk to Crazy SEO Team"
        description="Tell us what you want to grow. Our team will get back to you with a focused SEO and AI search strategy."
      />
    </>
  );
};

export default Navbar;
