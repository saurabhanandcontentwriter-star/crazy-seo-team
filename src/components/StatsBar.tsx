import { Globe2, Sparkles, Search, Layers3 } from "lucide-react";

const features = [
  {
    icon: Globe2,
    label: "Google + AI",
    title: "Google + AI Search",
    description: "Get discovered across traditional and AI-powered search.",
    tone: "from-cyan-400 to-blue-500",
  },
  {
    icon: Sparkles,
    label: "AI-Powered",
    title: "AI-Powered SEO",
    description: "Turn complex SEO data into clear, actionable insights.",
    tone: "from-blue-400 to-purple-500",
  },
  {
    icon: Search,
    label: "Search Intelligence",
    title: "Search Intelligence",
    description: "Understand how your brand appears across modern search.",
    tone: "from-purple-400 to-fuchsia-500",
  },
  {
    icon: Layers3,
    label: "Built to Scale",
    title: "Built to Scale",
    description: "Start simple. Grow your search strategy as your business grows.",
    tone: "from-fuchsia-400 to-pink-500",
  },
];

const StatsBar = () => (
  <section className="relative overflow-hidden py-20">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[120px]" />
    </div>

    <div className="container relative mx-auto px-4">
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-cyan-600 uppercase">
          Built for the AI-Search Era
        </p>
        <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
          Your visibility, ready for what’s next
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {features.map(({ icon: Icon, label, title, description, tone }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/75 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
          >
            <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${tone} opacity-15 blur-3xl transition group-hover:opacity-30`} />

            <div className={`relative mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} shadow-lg`}>
              <Icon size={20} className="text-white" />
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              {label}
            </p>
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsBar;
