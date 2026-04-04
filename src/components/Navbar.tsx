import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import logo from "@/assets/logo.jpeg";

const navLinks = [
  { label: "Services", id: "services" },
  { label: "SEO Tools", id: "seo-tools" },
  { label: "About Us", id: "about" },
  { label: "Results", id: "results" },
  { label: "Blog", id: "blog" },
  { label: "FAQ", id: "faq" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (id: string) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <button onClick={() => location.pathname === "/" ? window.scrollTo({ top: 0, behavior: "smooth" }) : navigate("/")} className="flex items-center gap-2">
            <img src={logo} alt="Crazy SEO Team" className="w-10 h-10 object-contain" />
            <span className="font-bold text-lg text-foreground">Crazy SEO Team</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => handleNavClick(link.id)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(true)}>Connect Now</Button>
            <Button className="gradient-bg text-primary-foreground hover:opacity-90" onClick={() => setDialogOpen(true)}>
              Get Free Audit
            </Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => handleNavClick(link.id)} className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground">
                {link.label}
              </button>
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
