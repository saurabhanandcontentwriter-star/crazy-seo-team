import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, X, ArrowUpRight, Globe2, PartyPopper, ChevronDown, Sparkles, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import logo from "@/assets/logo.jpeg";

const navLinks = [
  { label: "Services", path: "/services" },
  { label: "Tools", path: "/seo-tools" },
  { label: "Classifieds", path: "/classifieds" },
  { label: "About", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "News", path: "/news" },
];

const GaneshIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="h-9 w-9 shrink-0 drop-shadow-sm">
    <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.12" />
    <path d="M20 27c-6-7-12-4-12 2 0 6 5 9 11 6M44 27c6-7 12-4 12 2 0 6-5 9-11 6" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M23 25c1-8 6-12 9-12s8 4 9 12v10c0 8-5 14-9 14s-9-6-9-14z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M32 36c-2 3-2 7 0 10 2-3 2-7 0-10Z" fill="currentColor" />
    <path d="M27 22c2 2 8 2 10 0M26 29h2M36 29h2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M29 17h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const toolsActive = isActive("/seo-tools") || isActive("/ai-tools");

  return (
    <>
      <nav className="cst-public-nav fixed top-0 left-0 right-0 z-50">
        <div className="cst-public-announcement border-b border-orange-200/70 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 text-orange-800">
          <div className="container mx-auto flex min-h-12 items-center justify-center gap-2.5 px-3 py-1.5 text-center">
            <GaneshIcon />
            <div className="leading-tight"><div className="text-sm font-extrabold tracking-wide text-orange-700 sm:text-base">Happy Ganesh Chaturdashi 2026</div><div className="hidden text-[11px] font-medium text-orange-600/80 sm:block">Ganpati Bappa Morya • May Lord Ganesha bless you with wisdom, success & prosperity</div></div>
            <span className="ml-1 hidden items-center gap-1 rounded-full border border-orange-200 bg-white/75 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-600 shadow-sm md:inline-flex"><PartyPopper aria-hidden="true" className="h-3 w-3" />Festive Greeting</span>
          </div>
        </div>
        <div className="cst-nav-inner">
          <div className="container mx-auto flex h-[68px] items-center justify-between px-4 lg:px-6">
            <Link id="tour-logo" to="/" className="group flex items-center gap-3"><div className="cst-brand-mark relative shrink-0"><div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-500/25 via-violet-500/20 to-cyan-400/25 blur-lg opacity-70 transition group-hover:opacity-100" /><img src={logo} alt="Crazy SEO Team" className="relative h-10 w-10 rounded-xl object-contain ring-1 ring-slate-200/80 bg-white" /></div><div className="hidden sm:block leading-none"><div className="text-[15px] font-black tracking-tight text-slate-950">Crazy SEO Team</div><div className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-slate-400">AI Search Growth</div></div></Link>
            <div id="tour-nav" className="cst-nav-pill hidden items-center gap-0.5 rounded-full border border-slate-200/80 bg-slate-50/85 p-1 lg:flex">
              {navLinks.map((link) => link.label === "Tools" ? (
                <div key={link.label} className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
                  <button type="button" aria-haspopup="menu" aria-expanded={toolsOpen} onClick={() => setToolsOpen((value) => !value)} className={`cst-nav-link inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold transition-all ${toolsActive ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:bg-white/80 hover:text-slate-900"}`}>Tools<ChevronDown size={13} className={`transition-transform ${toolsOpen ? "rotate-180" : ""}`} /></button>
                  {toolsOpen && <div className="absolute left-1/2 top-full w-56 -translate-x-1/2 pt-2"><div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"><Link to="/seo-tools" onClick={() => setToolsOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Search size={16} className="text-blue-600" /><span><span className="block">SEO Tools</span><span className="block text-[10px] font-medium text-slate-400">Audit, AEO, GEO, NLP & more</span></span></Link><Link to="/ai-tools" onClick={() => setToolsOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Sparkles size={16} className="text-violet-600" /><span><span className="block">AI Tools</span><span className="block text-[10px] font-medium text-slate-400">AI articles & optimization</span></span></Link></div></div>}
                </div>
              ) : <Link key={link.label} to={link.path} className={`cst-nav-link rounded-full px-3 py-2 text-[13px] font-semibold transition-all ${isActive(link.path) ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:bg-white/80 hover:text-slate-900"}`}><span className="inline-flex items-center gap-1.5">{link.label === "Classifieds" && <Store size={14} />} {link.label}</span></Link>)}
            </div>
            <div id="tour-cta" className="hidden items-center gap-2 md:flex"><button type="button" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><Globe2 size={15} />Global</button><Button variant="outline" onClick={() => setDialogOpen(true)} className="rounded-xl border-slate-200 bg-white/80 text-slate-800 hover:bg-slate-50">Talk to us</Button><Button onClick={() => setDialogOpen(true)} className="group rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 text-white">Start Free Audit <ArrowUpRight size={15} /></Button></div>
            <button aria-label="Open navigation" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-sm md:hidden" onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
          </div>
          {open && <div className="border-t border-slate-200/80 bg-white/95 px-4 pb-5 pt-3 shadow-xl backdrop-blur-xl md:hidden"><div className="grid gap-1">{navLinks.map((link) => link.label === "Tools" ? <div key={link.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-1"><button type="button" onClick={() => setToolsOpen((value) => !value)} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-slate-600">Tools<ChevronDown size={16} className={toolsOpen ? "rotate-180" : ""} /></button>{toolsOpen && <div className="grid gap-1 px-1 pb-1"><Link to="/seo-tools" onClick={() => { setOpen(false); setToolsOpen(false); }} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600">SEO Tools</Link><Link to="/ai-tools" onClick={() => { setOpen(false); setToolsOpen(false); }} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600">AI Tools</Link></div>}</div> : <Link key={link.label} to={link.path} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><span className="inline-flex items-center gap-2">{link.label === "Classifieds" && <Store size={16} />} {link.label}</span></Link>)}</div></div>}
        </div>
      </nav>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Talk to Crazy SEO Team" description="Tell us what you want to grow. Our team will get back to you with a focused SEO and AI search strategy." />
    </>
  );
};

export default Navbar;
