import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, X, ArrowUpRight, Globe2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import logo from "@/assets/logo.jpeg";

const navLinks = [
  { label: "Services", path: "/services" },
  { label: "SEO Tools", path: "/seo-tools" },
  { label: "AI Tools", path: "/ai-tools" },
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      <nav className="cst-public-nav fixed top-0 left-0 right-0 z-50">
        <div className="cst-public-announcement border-b border-orange-200/70 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 text-orange-800">
          <div className="container mx-auto flex min-h-12 items-center justify-center gap-2.5 px-3 py-1.5 text-center">
            <GaneshIcon />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-wide text-orange-700 sm:text-base">
                Happy Ganesh Chaturdashi 2026
              </div>
              <div className="hidden text-[11px] font-medium text-orange-600/80 sm:block">
                Ganpati Bappa Morya • May Lord Ganesha bless you with wisdom, success & prosperity
              </div>
            </div>
            <span className="ml-1 hidden items-center gap-1 rounded-full border border-orange-200 bg-white/75 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-600 shadow-sm md:inline-flex">
              <PartyPopper aria-hidden="true" className="h-3 w-3" />
              Festive Greeting
            </span>
          </div>
        </div>

        <div className="cst-nav-inner">
          <div className="container mx-auto flex h-[68px] items-center justify-between px-4 lg:px-6">
            <Link id="tour-logo" to="/" className="group flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <div className="cst-brand-mark relative shrink-0">
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-500/25 via-violet-500/20 to-cyan-400/25 blur-lg opacity-70 transition group-hover:opacity-100" />
                <img src={logo} alt="Crazy SEO Team" className="relative h-10 w-10 rounded-xl object-contain ring-1 ring-slate-200/80 bg-white" />
              </div>
              <div className="hidden sm:block leading-none">
                <div className="text-[15px] font-black tracking-tight text-slate-950">Crazy SEO Team</div>
                <div className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-slate-400">AI Search Growth</div>
              </div>
            </Link>

            <div id="tour-nav" className="cst-nav-pill hidden lg:flex items-center gap-0.5 rounded-full border border-slate-200/80 bg-slate-50/85 p-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  data-active={isActive(link.path)}
                  className={`cst-nav-link rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all ${isActive(link.path) ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:bg-white/80 hover:text-slate-900"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div id="tour-cta" className="hidden md:flex items-center gap-2">
              <button type="button" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition" title="International service availability">
                <Globe2 size={15} /> Global
              </button>
              <Button variant="outline" onClick={() => setDialogOpen(true)} className="rounded-xl border-slate-200 bg-white/80 text-slate-800 hover:bg-slate-50">Talk to us</Button>
              <Button onClick={() => setDialogOpen(true)} className="group rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 text-white shadow-[0_12px_30px_-12px_hsl(239_84%_67%/.65)] hover:shadow-[0_16px_36px_-12px_hsl(239_84%_67%/.75)]">
                Start Free Audit <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </div>

            <button aria-label="Open navigation" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-sm md:hidden" onClick={() => setOpen(!open)}>
              {open ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>

          {open && (
            <div className="border-t border-slate-200/80 bg-white/95 px-4 pb-5 pt-3 shadow-xl backdrop-blur-xl md:hidden">
              <div className="grid gap-1">
                {navLinks.map((link) => (
                  <Link key={link.label} to={link.path} onClick={() => setOpen(false)} className={`rounded-xl px-4 py-3 text-sm font-semibold ${isActive(link.path) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
              <Button className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white" onClick={() => { setOpen(false); setDialogOpen(true); }}>
                Start Free Audit
              </Button>
            </div>
          )}
        </div>
      </nav>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Talk to Crazy SEO Team" description="Tell us what you want to grow. Our team will get back to you with a focused SEO and AI search strategy." />
    </>
  );
};

export default Navbar;
