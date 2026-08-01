import { useEffect, useRef, useState } from "react";
import { Globe2, FileText, Eye, Users } from "lucide-react";

const stats = [
  { icon: Globe2, value: 18254, suffix: "+", label: "Websites Optimized", tone: "from-cyan-400 to-blue-500" },
  { icon: FileText, value: 215000, suffix: "+", label: "AI Articles Generated", tone: "from-blue-400 to-purple-500" },
  { icon: Eye, value: 97.6, suffix: "%", label: "AI Visibility Score", tone: "from-purple-400 to-fuchsia-500", decimals: 1 },
  { icon: Users, value: 12540, suffix: "+", label: "Happy Customers", tone: "from-fuchsia-400 to-pink-500" },
];

const useCount = (target: number, decimals = 0) => {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const start = performance.now(); const dur = 1400;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        setV(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return { v, ref, fmt: decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString() };
};

const StatCard = ({ icon: Icon, value, suffix, label, tone, decimals }: typeof stats[number]) => {
  const c = useCount(value, decimals);
  return (
    <div ref={c.ref} className="relative glass-card glass-sheen p-6 overflow-hidden group float-y-slow">
      <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${tone} opacity-20 blur-3xl group-hover:opacity-40 transition`} />
      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tone} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-3xl md:text-4xl font-black text-slate-900 tabular-nums">{c.fmt}{suffix}</p>
      <p className="text-sm text-slate-600 mt-1">{label}</p>
    </div>
  );
};

const StatsBar = () => (
  <section className="relative py-20 overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue-500/15 blur-[120px]" />
    </div>
    <div className="container mx-auto px-4 relative">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold tracking-[0.3em] text-cyan-600 uppercase mb-3">Trusted at Scale</p>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900">Powering the next wave of <span className="gradient-text">AI search visibility</span></h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
    </div>
  </section>
);

export default StatsBar;
