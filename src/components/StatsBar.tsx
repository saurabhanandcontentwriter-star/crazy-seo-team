import { ArrowUpRight } from "lucide-react";

const features = [
  {
    label: "Discovery",
    title: "Google + AI",
    description: "Get discovered across traditional and AI-powered search.",
    logos: [
      { name: "Google Search Console", src: "https://cdn.simpleicons.org/googlesearchconsole" },
      { name: "Google Analytics", src: "https://cdn.simpleicons.org/googleanalytics" },
      { name: "Google Ads", src: "https://cdn.simpleicons.org/googleads" },
    ],
    tone: "from-cyan-400 to-blue-500",
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Optimization",
    title: "AI-Powered",
    description: "Turn complex SEO data into clear, actionable insights.",
    logos: [
      { name: "SEMrush", src: "https://cdn.simpleicons.org/semrush" },
      { name: "Google Analytics", src: "https://cdn.simpleicons.org/googleanalytics" },
      { name: "Google Ads", src: "https://cdn.simpleicons.org/googleads" },
    ],
    tone: "from-blue-400 to-purple-500",
    accent: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Intelligence",
    title: "Search Intelligence",
    description: "Understand how your brand appears across modern search.",
    logos: [
      { name: "Google Search Console", src: "https://cdn.simpleicons.org/googlesearchconsole" },
      { name: "SEMrush", src: "https://cdn.simpleicons.org/semrush" },
      { name: "Google Analytics", src: "https://cdn.simpleicons.org/googleanalytics" },
    ],
    tone: "from-emerald-400 to-cyan-500",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Growth",
    title: "Built to Scale",
    description: "Start simple. Grow your search strategy as your business grows.",
    logos: [
      { name: "Google Analytics", src: "https://cdn.simpleicons.org/googleanalytics" },
      { name: "Google Ads", src: "https://cdn.simpleicons.org/googleads" },
      { name: "Google Search Console", src: "https://cdn.simpleicons.org/googlesearchconsole" },
    ],
    tone: "from-orange-400 to-amber-500",
    accent: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const StatsBar = () => (
  <section className="relative overflow-hidden py-20">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-0 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />
    </div>

    <div className="container relative mx-auto px-4">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-600 shadow-sm backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
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
        {features.map(({ label, title, description, logos, tone, accent, bg }) => (
          <article
            key={title}
            className="group relative min-h-[330px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone}`} />
            <div className={`absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${tone} opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-25`} />

            <div className="relative flex items-center justify-between">
              <span className={`rounded-full ${bg} px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${accent}`}>
                {label}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 ${accent} transition-transform duration-300 group-hover:rotate-45`}>
                <ArrowUpRight size={17} />
              </div>
            </div>

            <div className="relative mt-7 flex h-14 items-center gap-3">
              {logos.map((logo) => (
                <div
                  key={logo.name}
                  title={logo.name}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className="h-7 w-7 object-contain"
                  />
                </div>
              ))}
            </div>

            <div className="relative mt-7">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            <div className={`absolute bottom-6 left-6 text-sm font-bold ${accent}`}>
              Explore capability <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default StatsBar;
