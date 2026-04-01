import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="py-10 px-4 border-t border-border">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <img src={logo} alt="Crazy SEO Team" className="w-8 h-8 object-contain" />
        <span className="font-bold text-foreground">Crazy SEO Team</span>
      </div>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Crazy SEO Team. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
