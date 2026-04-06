import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

const Footer = () => (
  <footer className="py-12 px-4 border-t border-border bg-card">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="Crazy SEO Team" className="w-8 h-8 object-contain" />
            <span className="font-bold text-foreground">Crazy SEO Team</span>
          </div>
          <p className="text-sm text-muted-foreground">AI-powered digital marketing & Gen AI solutions that drive real business growth.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
            <li><Link to="/seo-tools" className="text-muted-foreground hover:text-primary transition-colors">SEO Tools</Link></li>
            <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
            <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Services</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-muted-foreground">SEO Optimization</span></li>
            <li><span className="text-muted-foreground">PPC Advertising</span></li>
            <li><span className="text-muted-foreground">Gen AI Solutions</span></li>
            <li><span className="text-muted-foreground">AI Voice Calling</span></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/payment-policy" className="text-muted-foreground hover:text-primary transition-colors">Payment Policy</Link></li>
            <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Crazy SEO Team. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm">
          <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
          <Link to="/terms-and-conditions" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
          <Link to="/payment-policy" className="text-muted-foreground hover:text-primary transition-colors">Payments</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
