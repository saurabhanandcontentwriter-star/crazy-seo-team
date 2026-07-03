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


const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link id="tour-logo" to="/" className="flex items-center gap-2.5 group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 blur-md opacity-70 group-hover:opacity-100 transition" />
              <img src={logo} alt="Crazy SEO Team" className="relative w-9 h-9 object-contain rounded-xl" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Crazy SEO Team</span>
          </Link>

          <div id="tour-nav" className="hidden md:flex items-center gap-1 rounded-full glass-light px-2 py-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${location.pathname === link.path ? "bg-white/10 text-white shadow-inner" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div id="tour-cta" className="hidden md:flex items-center gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(true)} className="border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl">Connect</Button>
            <Button onClick={() => setDialogOpen(true)}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-95 shadow-[0_8px_30px_-8px_hsl(230_90%_60%/0.6)]">
              Start Free Audit
            </Button>
          </div>

          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>


        {open && (
          <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
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
      </nav>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Connect With Our Experts" description="Fill in your details and we'll get back to you within 24 hours with a custom strategy." />
    </>
  );
};

export default Navbar;
