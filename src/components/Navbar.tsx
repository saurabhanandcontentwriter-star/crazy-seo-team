import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import logo from "@/assets/logo.jpeg";

const navLinks = [
  { label: "Services", path: "/services" },
  { label: "SEO Tools", path: "/seo-tools" },
  { label: "AI Tools", path: "/ai-tools" },
  { label: "About Us", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "News", path: "/news" },
  { label: "FAQ", path: "/faq" },
];

const GaneshIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className="h-9 w-9 shrink-0 drop-shadow-sm">
    <circle cx="32" cy="32" r="30" fill="currentColor" opacity="0.12" />
    <path d="M20 27c-6-7-12-4-12 2 0 6 5 9 11 6M44 27c6-7 12-4 12 2 0 6-5 9-11 6" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M19 25c1-9 7-14 13-14s12 5 13 14v10c0 10-7 17-13 17s-13-7-13-17V25Z" fill="currentColor" opacity="0.9" />
    <path d="M28 22c-2 8 1 12 5 13 4 1 7 4 6 9-1 5-6 7-10 5" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <circle cx="27" cy="27" r="1.8" fill="white" />
    <circle cx="37" cy="27" r="1.8" fill="white" />
    <path d="M25 19c2-3 4-4 7-4s5 1 7 4" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="relative overflow-hidden border-b border-orange-200/70 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(251,146,60,0.16),transparent_28%),radial-gradient(circle_at_80%_50%,rgba(245,158,11,0.14),transparent_28%)]" />
          <div className="relative container mx-auto flex min-h-11 items-center justify-center gap-2 px-3 py-1.5 text-center">
            <GaneshIcon />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-wide text-orange-700 sm:text-base">
                Happy Ganesh Chaturdashi 2026
              </div>
              <div className="hidden text-[11px] font-medium text-orange-600/80 sm:block">
                Ganpati Bappa Morya • May Lord Ganesha bless you with wisdom, success & prosperity
              </div>
            </div>
            <GaneshIcon />
          </div>
        </div>

        <div className="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <Link id="tour-logo" to="/" className="flex items-center gap-2.5 group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 blur-md opacity-40 group-hover:opacity-70 transition" />
                <img src={logo} alt="Crazy SEO Team" className="relative w-9 h-9 object-contain rounded-xl" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">Crazy SEO Team</span>
            </Link>

            <div id="tour-nav" className="hidden md:flex items-center gap-1 rounded-full bg-slate-100/80 border border-slate-200/60 px-2 py-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${location.pathname === link.path ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-white/60"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div id="tour-cta" className="hidden md:flex items-center gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(true)} className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50 rounded-xl">Connect</Button>
              <Button onClick={() => setDialogOpen(true)}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-95 shadow-[0_8px_30px_-8px_hsl(226_83%_55%/0.5)]">
                Start Free Audit
              </Button>
            </div>

            <button className="md:hidden text-slate-900" onClick={() => setOpen(!open)}>
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {open && (
            <div className="md:hidden bg-white border-b border-slate-200 px-4 pb-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Button className="w-full gradient-bg text-primary-foreground" onClick={() => { setOpen(false); setDialogOpen(true); }}>
                Connect Now
              </Button>
            </div>
          )}
        </div>
      </nav>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Connect With Our Experts" description="Fill in your details and we'll get back to you within 24 hours with a custom strategy." />
    </>
  );
};

export default Navbar;
