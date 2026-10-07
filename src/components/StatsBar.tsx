import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";

const features = [
  {
    label: "Discovery",
    title: "Google + AI",
    description: "Get discovered across traditional and AI-powered search.",
    points: ["Google visibility", "AI-search discovery", "Organic search growth", "Search intent targeting"],
    logos: [
      { name: "Google", src: "https://cdn.simpleicons.org/google" },
      { name: "Google Search", src: "https://cdn.simpleicons.org/googlesearchconsole" },
      { name: "Google Ads", src: "https://cdn.simpleicons.org/googleads" },
    ],
    href: "https://www.google.com/",
    tone: "from-cyan-400 to-blue-500",
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Optimization",
    title: "AI-Powered",
    description: "Turn complex SEO data into clear, actionable insights.",
    points: ["AI-assisted SEO insights", "Keyword opportunities", "Content optimization", "Actionable recommendations"],
    logos: [
      { name: "Semrush", src: "https://cdn.simpleicons.org/semrush" },
      { name: "Google Analytics", src: "https://cdn.simpleicons.org/googleanalytics" },
      { name: "Google Ads", src: "https://cdn.simpleicons.org/googleads" },
    ],
    href: "https://www.semrush.com/",
    tone: "from-blue-400 to-purple-500",
    accent: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Intelligence",
    title: "Search Intelligence",
    description: "Understand how your brand appears across modern search.",
    points: ["Search performance", "Brand visibility", "Competitor insights", "Ranking opportunities"],
    logos: [
      { name: "Google Search Console", src: "https://cdn.simpleicons.org/googlesearchconsole" },
      { name: "Semrush", src: "https://cdn.simpleicons.org/semrush" },
      { name: "Google Analytics", src: "https://cdn.simpleicons.org/googleanalytics" },
    ],
    href: "https://search.google.com/search-console/",
    tone: "from-emerald-400 to-cyan-500",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Growth",
    title: "Built to Scale",
    description: "Start simple. Grow your search strategy as your business grows.",
    points: ["Scalable SEO systems", "Performance tracking", "Conversion insights", "Long-term search growth"],
    logos: [
      { name: "Google Analytics", src: "https://cdn.simpleicons.org/googleanalytics" },
      { name: "Google Ads", src: "https://cdn.simpleicons.org/googleads" },
      { name: "Google Search Console", src: "https://cdn.simpleicons.org/googlesearchconsole" },
    ],
    href: "https://analytics.google.com/",
    tone: "from-orange-400 to-amber-500",
    accent: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const StatsBar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden py-20 [perspective:1400px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-600 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            Built for the AI-Search Era
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            Your visibility, <span className="gradient-text">ready for what’s next</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-500 md:text-lg">
            Be discoverable across Google and AI-powered search platforms with data-driven SEO strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ label, title, description, points, logos, href, tone, accent, bg }, index) => {
            const isActive = index === activeIndex;
            const isFlipped = flippedIndex === index;

            return (
              <div
                key={title}
                className="group relative min-h-[330px] [perspective:1200px]"
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div
                  className={`relative h-full min-h-[330px] w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
                >
                  <button
                    type="button"
                    aria-label={`View details for ${title}`}
                    onClick={() => setFlippedIndex(index)}
                    className={`absolute inset-0 w-full overflow-hidden rounded-[28px] border p-6 text-left backdrop-blur-xl [backface-visibility:hidden] ${isActive ? "z-10 -translate-y-3 border-white bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.18),0_0_0_2px_rgba(59,130,246,0.10)]" : "border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.10)] hover:-translate-y-3 hover:shadow-[0_30px_80px_rgba(15,23,42,0.18)]"} transition-all duration-700`}
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tone}`} />
                    <div className={`absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${tone} blur-3xl transition-opacity duration-700 ${isActive ? "opacity-30" : "opacity-10 group-hover:opacity-25"}`} />

                    <div className="relative flex items-center justify-between">
                      <span className={`rounded-full ${bg} px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${accent}`}>{label}</span>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/90 ${accent} shadow-[0_6px_16px_rgba(15,23,42,0.10)] transition-all duration-300 group-hover:rotate-45 group-hover:scale-110`}>
                        <ArrowUpRight size={18} />
                      </div>
                    </div>

                    <div className="relative mt-7 flex h-14 items-center gap-3">
                      {logos.map((logo) => (
                        <div key={logo.name} title={logo.name} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white bg-white shadow-[0_8px_18px_rgba(15,23,42,0.10)] transition-all duration-500 group-hover:-translate-y-1">
                          <img
                            src={logo.src}
                            alt={logo.name}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            width={28}
                            height={28}
                            className="h-7 w-7 object-contain"
                            onError={(event) => { event.currentTarget.style.display = "none"; }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="relative mt-7">
                      <h3 className="text-2xl font-black tracking-tight text-slate-900">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                    </div>

                    <div className={`absolute bottom-6 left-6 right-6 flex items-center justify-between text-sm font-bold ${accent}`}>
                      <span>Click to view details</span>
                      <ArrowUpRight size={16} />
                    </div>
                  </button>

                  <div
                    className="absolute inset-0 min-h-[330px] overflow-hidden rounded-[28px] border border-white/80 bg-slate-950 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tone}`} />
                    <div className="relative flex items-center justify-between">
                      <div>
                        <span className={`rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${accent}`}>{label}</span>
                        <h3 className="mt-4 text-2xl font-black">{title}</h3>
                      </div>
                      <button
                        type="button"
                        aria-label={`Back to ${title}`}
                        onClick={() => setFlippedIndex(null)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                      >
                        <ArrowLeft size={18} />
                      </button>
                    </div>

                    <ul className="relative mt-6 space-y-3">
                      {points.map((point) => (
                        <li key={point} className="flex items-center gap-3 text-sm text-slate-200">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 ${accent}`}>
                            <Check size={14} />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className={`absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-900 shadow-lg transition hover:-translate-y-0.5`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span>Explore website</span>
                      <ArrowUpRight size={17} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-7 flex justify-center gap-2" aria-label="Auto-play indicator">
          {features.map((feature, index) => (
            <button
              key={feature.title}
              type="button"
              aria-label={`Show ${feature.title}`}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${index === activeIndex ? "w-8 bg-slate-900" : "w-2 bg-slate-300"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
