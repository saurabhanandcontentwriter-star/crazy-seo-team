import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SEEN_KEY = "cst-tour-v2-done";
const PROGRESS_KEY = "cst-tour-v2-step";

export const TOUR_EVENT = "cst:start-tour";
export const startWebsiteTour = () => window.dispatchEvent(new CustomEvent(TOUR_EVENT));

type Step = {
  selector?: string;
  route?: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  { title: "Welcome to Crazy SEO Team ✨", body: "The AI SEO platform built for Google, ChatGPT, Gemini, Claude & Perplexity. This 60-second tour shows you around." },
  { selector: "#tour-logo", route: "/", title: "Homepage overview", body: "Everything starts here — live proof, services, tools and AI-generated insights." },
  { selector: "#tour-nav", route: "/", title: "AI SEO services", body: "50+ specialised services: SEO, GEO, AEO, LLM optimisation, Google Ads and AI development." },
  { selector: "#tour-nav", route: "/", title: "AI Tools", body: "Free enterprise-grade generators — meta tags, schema, sitemaps and more." },
  { selector: "#tour-cta", route: "/", title: "Website Audit Tool", body: "Run an instant AI audit of any URL and get a prioritised fix list." },
  { route: "/ai-tools", title: "AI Article Generator", body: "Generate SEO-ready long-form articles with meta, schema and FAQs in one click." },
  { route: "/news", title: "Live News", body: "AI-curated SEO news refreshed every 30 minutes, with a multilingual audio reader." },
  { selector: "#tour-chatbot", title: "Your AI concierge", body: "Chat or talk with our AI SEO assistant — streaming answers, voice in and voice out." },
  { route: "/blog", title: "Blog", body: "Deep-dive guides on AI search, technical SEO and content strategy." },
  { route: "/results", title: "Dashboard & results", body: "Track the outcomes we deliver — rankings, visibility and AI-search presence." },
  { route: "/seo-tools", title: "Reports", body: "Export SEO audit reports you can share with your team or clients." },
  { title: "Contact", body: "Ready to grow? Talk to a strategist and get a tailored AI SEO roadmap." },
  { title: "You're all set 🎉", body: "Restart this tour any time from the footer. Let's make your brand visible everywhere AI searches." },
];

type Rect = { top: number; left: number; width: number; height: number };

const WebsiteTour = () => {
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const finish = useCallback((completed: boolean) => {
    setActive(false);
    localStorage.setItem(SEEN_KEY, "1");
    localStorage.setItem(PROGRESS_KEY, completed ? "0" : String(i));
  }, [i]);

  // Auto-start on first visit (resumes saved progress)
  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY)) return;
    const t = setTimeout(() => {
      setI(Number(localStorage.getItem(PROGRESS_KEY) ?? 0) || 0);
      setActive(true);
    }, 1600);
    return () => clearTimeout(t);
  }, []);

  // Manual start / restart
  useEffect(() => {
    const on = () => { setI(0); setActive(true); };
    window.addEventListener(TOUR_EVENT, on);
    return () => window.removeEventListener(TOUR_EVENT, on);
  }, []);

  // Persist progress
  useEffect(() => { if (active) localStorage.setItem(PROGRESS_KEY, String(i)); }, [i, active]);

  const step = STEPS[i];

  // Navigate to the step's route
  useEffect(() => {
    if (!active || !step?.route || location.pathname === step.route) return;
    navigate(step.route);
  }, [active, i, step?.route, location.pathname, navigate]);

  // Measure the spotlight target
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const measure = () => {
      const el = step?.selector ? document.querySelector(step.selector) : null;
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return setRect(null);
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      setRect({ top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 });
    };
    const t = setTimeout(measure, 260);
    raf = window.setInterval(measure, 400);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t); clearInterval(raf); window.removeEventListener("resize", measure); };
  }, [active, i, step?.selector, location.pathname]);

  // Keyboard nav
  useEffect(() => {
    if (!active) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(false);
      if (e.key === "ArrowRight") setI((v) => Math.min(v + 1, STEPS.length - 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [active, finish]);

  if (typeof document === "undefined") return null;

  const last = i === STEPS.length - 1;
  const progress = ((i + 1) / STEPS.length) * 100;

  // Popup placement: below the target when possible, otherwise centered
  const popupStyle: React.CSSProperties = rect
    ? {
        top: Math.min(rect.top + rect.height + 16, window.innerHeight - 260),
        left: Math.min(Math.max(rect.left, 16), Math.max(window.innerWidth - 396, 16)),
      }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return createPortal(
    <AnimatePresence>
      {active && (
        <motion.div
          key="tour"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100]"
        >
          {/* Dark overlay with spotlight cut-out */}
          <div
            className="absolute inset-0 bg-foreground/70 backdrop-blur-[2px] transition-all duration-300"
            style={(() => {
              const mask = rect
                ? `radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent ${Math.max(rect.width, rect.height) * 0.75}px, black ${Math.max(rect.width, rect.height) * 0.75 + 40}px)`
                : undefined;
              return { WebkitMaskImage: mask, maskImage: mask } as React.CSSProperties;
            })()}
            onClick={() => finish(false)}
          />


          {/* Highlight ring */}
          {rect && (
            <motion.div
              layout
              className="pointer-events-none absolute rounded-2xl ring-2 ring-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.18)]"
              animate={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            />
          )}

          {/* Glass popup */}
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            style={popupStyle}
            className="absolute w-[min(380px,calc(100vw-32px))] rounded-3xl border border-white/40 bg-white/85 backdrop-blur-2xl p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Step {i + 1} of {STEPS.length}
                </p>
                <h3 className="mt-1 text-lg font-bold leading-snug text-slate-900">{step.title}</h3>
              </div>
              <button
                onClick={() => finish(false)}
                aria-label="Skip tour"
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => finish(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 transition"
              >
                Skip tour
              </button>
              <div className="ml-auto flex items-center gap-2">
                {i > 0 && (
                  <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setI(i - 1)}>
                    <ArrowLeft size={14} className="mr-1" /> Back
                  </Button>
                )}
                <Button
                  size="sm"
                  className="rounded-2xl"
                  onClick={() => (last ? finish(true) : setI(i + 1))}
                >
                  {last ? (<><Check size={14} className="mr-1" /> Finish tour</>) : (<>Next <ArrowRight size={14} className="ml-1" /></>)}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default WebsiteTour;
