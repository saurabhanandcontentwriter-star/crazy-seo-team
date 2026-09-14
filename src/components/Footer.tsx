import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";
import NewsletterSignup from "./NewsletterSignup";
import { startWebsiteTour } from "./WebsiteTour";
import { ArrowUpRight, Globe2, Sparkles } from "lucide-react";

const Footer = () => (
  <footer className="cst-public-footer border-t border-slate-200/80 px-4 py-14 lg:py-20">
    <div className="container mx-auto">
      <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <img src={logo} alt="Crazy SEO Team" className="h-10 w-10 rounded-xl object-contain bg-white shadow-sm ring-1 ring-slate-200" />
            <div>
              <div className="font-black tracking-tight text-slate-950">Crazy SEO Team</div>
              <div className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-400">AI Search Growth</div>
            </div>
          </div>
          <p className="mb-5 max-w-sm text-sm leading-6 text-slate-500">AI-powered SEO, search visibility and automation for ambitious businesses building their next stage of growth.</p>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1.5 text-[11px] font-bold text-blue-700"><Globe2 size={13} /> Serving growth teams worldwide</div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-slate-700">Get free SEO insights</p>
            <NewsletterSignup source="footer" />
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-black uppercase tracking-[.14em] text-slate-900">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            {[["Services","/services"],["SEO Tools","/seo-tools"],["AI Tools","/ai-tools"],["Results","/results"],["Blog","/blog"],["Live News","/news"]].map(([label,path]) => <li key={path}><Link to={path} className="cst-footer-link text-slate-500 hover:text-blue-600">{label}</Link></li>)}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-black uppercase tracking-[.14em] text-slate-900">Capabilities</h4>
          <ul className="space-y-2.5 text-sm text-slate-500">
            <li>AI SEO & Search Visibility</li>
            <li>Technical SEO & Automation</li>
            <li>Content & Article Strategy</li>
            <li>AI Agents & Workflows</li>
            <li>Analytics & Intelligence</li>
            <li>Voice & Conversational AI</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-black uppercase tracking-[.14em] text-slate-900">Company</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about" className="cst-footer-link text-slate-500 hover:text-blue-600">About Crazy SEO Team</Link></li>
            <li><Link to="/faq" className="cst-footer-link text-slate-500 hover:text-blue-600">FAQ</Link></li>
            <li><Link to="/privacy-policy" className="cst-footer-link text-slate-500 hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" className="cst-footer-link text-slate-500 hover:text-blue-600">Terms & Conditions</Link></li>
            <li><Link to="/payment-policy" className="cst-footer-link text-slate-500 hover:text-blue-600">Payment Policy</Link></li>
            <li><button onClick={startWebsiteTour} className="cst-footer-link text-slate-500 hover:text-blue-600">Restart website tour</button></li>
          </ul>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-r from-blue-50 via-white to-violet-50 p-6 shadow-[0_24px_70px_-45px_rgba(37,99,235,.4)]">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3"><div className="mt-0.5 rounded-xl bg-white p-2 text-blue-600 shadow-sm"><Sparkles size={18}/></div><div><p className="font-bold text-slate-900">Ready to improve how your brand is discovered?</p><p className="mt-1 text-sm text-slate-500">Start with a free SEO and AI search visibility audit.</p></div></div>
          <Link to="/seo-tools" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg">Explore tools <ArrowUpRight size={15}/></Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-6 text-center md:flex-row md:text-left">
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Crazy SEO Team. All rights reserved.</p>
        <p className="text-xs font-medium text-slate-400">SEO • AI Search • Automation • Analytics</p>
      </div>
    </div>
  </footer>
);

export default Footer;
