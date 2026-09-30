import { ArrowUpRight, BarChart3, Search, Sparkles, Target } from "lucide-react";

const visuals = {
  discovery: (
    <svg viewBox="0 0 260 150" className="h-full w-full" role="img" aria-label="Google and AI search visibility illustration">
      <defs><linearGradient id="g1" x1="0" x2="1"><stop offset="0" stopColor="#4285F4"/><stop offset="1" stopColor="#34A853"/></linearGradient></defs>
      <rect width="260" height="150" rx="22" fill="#F8FAFC"/>
      <circle cx="72" cy="72" r="34" fill="white" stroke="#DBEAFE" strokeWidth="2"/>
      <path d="M61 55h25l8 8v27H61z" fill="none" stroke="url(#g1)" strokeWidth="5"/>
      <path d="M69 73h17M69 83h12" stroke="#4285F4" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="164" cy="55" r="22" fill="#EEF2FF"/><circle cx="164" cy="55" r="9" fill="#6366F1"/>
      <circle cx="190" cy="91" r="28" fill="#ECFEFF"/><path d="M178 91h24M190 79v24" stroke="#06B6D4" strokeWidth="5" strokeLinecap="round"/>
      <path d="M102 72h35M178 69l-8 10" stroke="#94A3B8" strokeWidth="3" strokeDasharray="5 5"/>
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 260 150" className="h-full w-full" role="img" aria-label="AI powered SEO illustration">
      <rect width="260" height="150" rx="22" fill="#FAF5FF"/>
      <circle cx="130" cy="75" r="39" fill="#EDE9FE"/>
      <path d="M111 75c0-18 10-29 25-29 14 0 25 11 25 29s-11 29-25 29c-15 0-25-11-25-29Z" fill="white" stroke="#8B5CF6" strokeWidth="4"/>
      <circle cx="122" cy="72" r="4" fill="#8B5CF6"/><circle cx="143" cy="72" r="4" fill="#8B5CF6"/>
      <path d="M121 87c6 5 14 5 20 0M91 50l8-8M169 42l8 8M91 102l8 8M169 110l8-8" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round"/>
      <path d="M52 75h25M183 75h25" stroke="#C4B5FD" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),
  intelligence: (
    <svg viewBox="0 0 260 150" className="h-full w-full" role="img" aria-label="Search intelligence analytics illustration">
      <rect width="260" height="150" rx="22" fill="#F0FDFA"/>
      <rect x="48" y="35" width="164" height="82" rx="14" fill="white" stroke="#CCFBF1" strokeWidth="2"/>
      <path d="M68 94 94 76l22 12 30-34 28 18" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="94" cy="76" r="5" fill="#10B981"/><circle cx="116" cy="88" r="5" fill="#10B981"/><circle cx="146" cy="54" r="5" fill="#10B981"/>
      <path d="M68 53h38" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 260 150" className="h-full w-full" role="img" aria-label="SEO growth and scale illustration">
      <rect width="260" height="150" rx="22" fill="#FFF7ED"/>
      <path d="M55 108h150" stroke="#FED7AA" strokeWidth="4" strokeLinecap="round"/>
      <rect x="68" y="82" width="24" height="26" rx="5" fill="#FDBA74"/>
      <rect x="105" y="68" width="24" height="40" rx="5" fill="#FB923C"/>
      <rect x="142" y="50" width="24" height="58" rx="5" fill="#F97316"/>
      <path d="m168 54 25-20M193 34h-14M193 34v14" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const features = [
  { label: "Discovery", title: "Google + AI", description: "Get discovered across traditional and AI-powered search.", visual: visuals.discovery, accent: "text-blue-600", bg: "bg-blue-50", tone: "from-cyan-400 to-blue-500" },
  { label: "Optimization", title: "AI-Powered", description: "Turn complex SEO data into clear, actionable insights.", visual: visuals.ai, accent: "text-purple-600", bg: "bg-purple-50", tone: "from-blue-400 to-purple-500" },
  { label: "Intelligence", title: "Search Intelligence", description: "Understand how your brand appears across modern search.", visual: visuals.intelligence, accent: "text-emerald-600", bg: "bg-emerald-50", tone: "from-emerald-400 to-cyan-500" },
  { label: "Growth", title: "Built to Scale", description: "Start simple. Grow your search strategy as your business grows.", visual: visuals.scale, accent: "text-orange-600", bg: "bg-orange-50", tone: "from-orange-400 to-amber-500" },
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
          <Sparkles className="h-3.5 w-3.5" /> Built for the AI-Search Era
        </div>
        <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
          Your visibility, <span className="gradient-text">ready for what’s next</span>
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-500 md:text-lg">
          Be discoverable across Google and AI-powered search platforms with data-driven SEO strategies.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {features.map(({ label, title, description, visual, accent, bg, tone }) => (
          <article key={title} className="group relative min-h-[370px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_45px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone}`} />
            <div className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2 shadow-inner`}>{visual}</div>

            <div className="relative mt-5 flex items-center justify-between">
              <span className={`rounded-full ${bg} px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${accent}`}>{label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white ${accent} transition-transform duration-300 group-hover:rotate-45`}>
                <ArrowUpRight size={17} />
              </div>
            </div>

            <div className="relative mt-5">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            <div className={`mt-5 text-sm font-bold ${accent}`}>Explore capability <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span></div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default StatsBar;
