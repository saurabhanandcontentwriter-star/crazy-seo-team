import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Compass, MapPin, MessageSquare, Sparkles, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startWebsiteTour } from "./WebsiteTour";

const SEEN_KEY = "cst-welcome-v1-seen";
const GEO_CONSENT_KEY = "cst-geo-consent";
const GEO_DATA_KEY = "cst-geo-personalized";

export type VisitorPlace = {
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
  language?: string;
};

export const getStoredPlace = (): VisitorPlace | null => {
  try {
    const raw = localStorage.getItem(GEO_DATA_KEY);
    return raw ? (JSON.parse(raw) as VisitorPlace) : null;
  } catch {
    return null;
  }
};

const openChat = () => window.dispatchEvent(new CustomEvent("cst:open-chat"));

const Particles = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
    {Array.from({ length: 14 }).map((_, i) => (
      <motion.span
        key={i}
        className="absolute h-1.5 w-1.5 rounded-full bg-primary/40"
        style={{ left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%` }}
        animate={{ y: [0, -18, 0], opacity: [0.15, 0.7, 0.15] }}
        transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.25 }}
      />
    ))}
  </div>
);

const WelcomeExperience = () => {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<VisitorPlace | null>(getStoredPlace());
  const [asking, setAsking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY)) return;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    localStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  };

  const requestLocation = () => {
    if (localStorage.getItem(GEO_CONSENT_KEY) === "denied") return;
    if (!("geolocation" in navigator)) return;
    setAsking(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`,
          );
          const d = await res.json();
          const next: VisitorPlace = {
            city: d.city || d.locality || undefined,
            region: d.principalSubdivision || undefined,
            country: d.countryName || undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
          };
          localStorage.setItem(GEO_CONSENT_KEY, "granted");
          localStorage.setItem(GEO_DATA_KEY, JSON.stringify(next));
          setPlace(next);
        } catch {
          /* silent */
        } finally {
          setAsking(false);
        }
      },
      () => {
        // Denied — never ask again, continue normally
        localStorage.setItem(GEO_CONSENT_KEY, "denied");
        setAsking(false);
      },
      { timeout: 10000 },
    );
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={close} />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/50 bg-white/85 backdrop-blur-2xl p-6 shadow-2xl"
          >
            <Particles />

            <button
              onClick={close}
              aria-label="Close welcome"
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <X size={16} />
            </button>

            <div className="relative">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg"
                >
                  <Sparkles size={20} />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Welcome to Crazy SEO Team!</h2>
                  <p className="text-xs text-slate-500">The AI SEO platform for Google, ChatGPT, Gemini & AI search</p>
                </div>
              </div>

              {place?.city ? (
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Hello from {place.city}, {place.country} 👋
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    We'll personalize local SEO recommendations, local keywords, Google Business Profile tips and
                    regional case studies for you.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <span className="rounded-lg bg-white/70 px-2 py-1">🌍 {place.country ?? "—"}</span>
                    <span className="rounded-lg bg-white/70 px-2 py-1">🏙 {place.region ?? "—"}</span>
                    <span className="rounded-lg bg-white/70 px-2 py-1">📍 {place.city}</span>
                    <span className="rounded-lg bg-white/70 px-2 py-1">🕒 {place.timezone}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <p className="text-sm text-slate-700">
                    Allow location access to personalize your AI SEO experience.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 rounded-2xl"
                    disabled={asking}
                    onClick={requestLocation}
                  >
                    <MapPin size={14} className="mr-1.5" />
                    {asking ? "Detecting…" : "Allow location"}
                  </Button>
                </div>
              )}

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button className="rounded-2xl" onClick={() => { close(); startWebsiteTour(); }}>
                  <Compass size={15} className="mr-1.5" /> Start website tour
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => { close(); openChat(); }}>
                  <MessageSquare size={15} className="mr-1.5" /> Talk to AI assistant
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => { close(); navigate("/ai-tools"); }}>
                  <Wand2 size={15} className="mr-1.5" /> Explore AI tools
                </Button>
                <Button variant="ghost" className="rounded-2xl" onClick={close}>
                  Close
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

export default WelcomeExperience;
