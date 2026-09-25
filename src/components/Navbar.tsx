import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, X, ArrowUpRight, Globe2, ChevronDown, Sparkles, Search, Store, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import logo from "@/assets/logo.jpeg";

const navLinks = [
  { label: "Services", path: "/services" },
  { label: "Tools", path: "/seo-tools" },
  { label: "Classifieds", path: "/classifieds" },
  { label: "ANVYA", path: "/anvya" },
  { label: "About", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "News", path: "/news" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
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
    "Focus on what you can improve today."
  ];
  useEffect(() => {
    const timer = window.setInterval(() => setQuoteDay(new Date().toDateString()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const dayNumber = Math.floor(new Date(quoteDay).getTime() / 86400000);
  const dailyQuote = dailyQuotes[((dayNumber % dailyQuotes.length) + dailyQuotes.length) % dailyQuotes.length];
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const toolsActive = isActive("/seo-tools") || isActive("/ai-tools");

  return (
    <>
      <nav className="cst-public-nav fixed top-0 left-0 right-0 z-50">
        <div className="cst-public-announcement border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-blue-50 text-slate-800">
          <div className="container mx-auto flex min-h-12 items-center justify-center gap-2 px-3 py-2 text-center">
            <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-600" />
            <div className="leading-tight"><div className="text-sm font-extrabold text-slate-950 sm:text-base">“{dailyQuote}”</div></div>
          </div>
        </div>
        <div className="cst-nav-inner">
          <div className="container mx-auto flex h-[68px] items-center justify-between px-4 lg:px-6">
            <Link id="tour-logo" to="/" className="group flex items-center gap-3"><div className="cst-brand-mark relative shrink-0"><div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-500/25 via-violet-500/20 to-cyan-400/25 blur-lg opacity-70 transition group-hover:opacity-100" /><img src={logo} alt="Crazy SEO Team" className="relative h-10 w-10 rounded-xl object-contain ring-1 ring-slate-200/80 bg-white" /></div><div className="hidden sm:block leading-none"><div className="text-[15px] font-black tracking-tight text-slate-950">Crazy SEO Team</div><div className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-slate-400">AI Search Growth</div></div></Link>
            <div id="tour-nav" className="cst-nav-pill hidden min-w-0 max-w-[52vw] items-center gap-0.5 overflow-x-auto rounded-full border border-slate-200/80 bg-slate-50/85 p-1 md:flex xl:max-w-none">
              {navLinks.map((link) => link.label === "Tools" ? (
                <div key={link.label} className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
                  <button type="button" aria-haspopup="menu" aria-expanded={toolsOpen} onClick={() => setToolsOpen((value) => !value)} className={`cst-nav-link inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold transition-all ${toolsActive ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:bg-white/80 hover:text-slate-900"}`}>Tools<ChevronDown size={13} className={`transition-transform ${toolsOpen ? "rotate-180" : ""}`} /></button>
                  {toolsOpen && <div className="absolute left-1/2 top-full w-56 -translate-x-1/2 pt-2"><div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"><Link to="/seo-tools" onClick={() => setToolsOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Search size={16} className="text-blue-600" /><span><span className="block">SEO Tools</span><span className="block text-[10px] font-medium text-slate-400">Audit, AEO, GEO, NLP & more</span></span></Link><Link to="/ai-tools" onClick={() => setToolsOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Sparkles size={16} className="text-violet-600" /><span><span className="block">AI Tools</span><span className="block text-[10px] font-medium text-slate-400">AI articles & optimization</span></span></Link></div></div>}
                </div>
              ) : <Link key={link.label} to={link.path} className={`cst-nav-link rounded-full px-3 py-2 text-[13px] font-semibold transition-all ${isActive(link.path) ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:bg-white/80 hover:text-slate-900"}`}><span className="inline-flex items-center gap-1.5">{link.label === "Classifieds" && <Store size={14} />}{link.label === "ANVYA" && <Lightbulb size={14} />} {link.label}</span></Link>)}
            </div>
            <div id="tour-cta" className="hidden items-center gap-2 md:flex"><button type="button" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><Globe2 size={15} />Global</button><Button variant="outline" onClick={() => setDialogOpen(true)} className="rounded-xl border-slate-200 bg-white/80 text-slate-800 hover:bg-slate-50">Talk to us</Button><Button onClick={() => setDialogOpen(true)} className="group rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 text-white">Talk to Our Team <ArrowUpRight size={15} /></Button></div>
            <button aria-label="Open navigation" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-sm md:hidden" onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
          {open && <div className="border-t border-slate-200/80 bg-white/95 px-4 pb-5 pt-3 shadow-xl backdrop-blur-xl md:hidden"><div className="grid gap-1">{navLinks.map((link) => link.label === "Tools" ? <div key={link.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-1"><button type="button" onClick={() => setToolsOpen((value) => !value)} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-slate-600">Tools<ChevronDown size={16} className={toolsOpen ? "rotate-180" : ""} /></button>{toolsOpen && <div className="grid gap-1 px-1 pb-1"><Link to="/seo-tools" onClick={() => { setOpen(false); setToolsOpen(false); }} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600">SEO Tools</Link><Link to="/ai-tools" onClick={() => { setOpen(false); setToolsOpen(false); }} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600">AI Tools</Link></div>}</div> : <Link key={link.label} to={link.path} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><span className="inline-flex items-center gap-2">{link.label === "Classifieds" && <Store size={16} />}{link.label === "ANVYA" && <Lightbulb size={16} />} {link.label}</span></Link>)}</div></div>}
        </div>
      </nav>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Talk to Crazy SEO Team" description="Tell us what you want to grow. Our team will get back to you with a focused SEO and AI search strategy." />
    </>
  );
};

export default Navbar;
