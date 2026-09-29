import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Megaphone, Target, BarChart3, Sparkles } from "lucide-react";

const platforms = [
  { name: "Instagram Ads", label: "Visual campaigns", description: "Reels, Stories and feed campaigns built for attention.", accent: "#E1306C", icon: "instagram" },
  { name: "LinkedIn Ads", label: "B2B growth", description: "Reach professionals with precise business audience targeting.", accent: "#0A66C2", icon: "linkedin" },
  { name: "Google Ads", label: "High-intent search", description: "Capture demand when customers are actively searching.", accent: "#4285F4", icon: "google" },
  { name: "Facebook Ads", label: "Social reach", description: "Scale campaigns across audiences with conversion-focused creative.", accent: "#1877F2", icon: "facebook" },
  { name: "Meta Ads", label: "Cross-platform", description: "Manage Facebook and Instagram growth from one strategy.", accent: "#0866FF", icon: "meta" },
  { name: "YouTube Ads", label: "Video campaigns", description: "Turn video creative into measurable awareness and action.", accent: "#FF0000", icon: "youtube" },
  { name: "X Ads", label: "Conversation", description: "Join relevant conversations with timely paid campaigns.", accent: "#111827", icon: "x" },
];

const Icon = ({ type }: { type: string }) => {
  if (type === "instagram") return <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-700 text-2xl text-white">◎</div>;
  if (type === "linkedin") return <svg viewBox="0 0 24 24" className="h-11 w-11"><rect width="24" height="24" rx="4" fill="#0A66C2"/><path fill="white" d="M6.1 8.1A1.6 1.6 0 1 0 6.1 4.9a1.6 1.6 0 0 0 0 3.2ZM4.8 9.4h2.6V19H4.8V9.4Zm4.2 0h2.5v1.3h.04c.35-.67 1.2-1.65 2.78-1.65 2.97 0 3.52 1.95 3.52 4.48V19h-2.6v-4.84c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.84 1.25-1.84 2.55V19H9V9.4Z"/></svg>;
  if (type === "google") return <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl font-black shadow-sm"><span className="text-blue-500">G</span></div>;
  if (type === "facebook") return <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1877F2] text-3xl font-black text-white">f</div>;
  if (type === "meta") return <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-3xl font-black text-[#0866FF]">∞</div>;
  if (type === "youtube") return <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF0000] text-lg text-white">▶</div>;
  return <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-2xl font-semibold text-white">𝕏</div>;
};

const AdvertisingCarousel = () => {
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);
  const go = (direction: number) => setActive((current) => (current + direction + platforms.length) % platforms.length);
  useEffect(() => { if (paused) return; const timer = window.setInterval(() => go(1), 4200); return () => window.clearInterval(timer); }, [paused]);

  return <section id="advertising-platforms" className="relative overflow-hidden px-4 py-24">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(99,102,241,.16),transparent_48%)]" />
    <div className="relative mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-indigo-700"><Megaphone size={14} /> Advertising Platforms</span>
        <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Run smarter ads across <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">every platform</span></h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">One strategy for Google, Instagram, LinkedIn, Meta, Facebook and YouTube — designed, launched and optimized around measurable business goals.</p>
      </div>
      <div className="relative h-[430px] md:h-[500px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="absolute inset-x-0 top-1/2 h-72 -translate-y-1/2 rounded-[50%] bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 [perspective:1400px]">
          {platforms.map((platform, index) => {
            let offset = index - active;
            if (offset > 3) offset -= platforms.length;
            if (offset < -3) offset += platforms.length;
            const abs = Math.abs(offset);
            const isActive = offset === 0;
            return <article key={platform.name} className="absolute left-1/2 top-1/2 w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-700 ease-out md:w-[310px] md:p-6"
              style={{ transform: "translateX(" + (offset * 260) + "px) translateY(-50%) rotateY(" + (offset * -14) + "deg) scale(" + (isActive ? 1 : Math.max(.72, 1 - abs * .09)) + ")", opacity: abs > 2 ? 0 : isActive ? 1 : .7, zIndex: 20 - abs, boxShadow: isActive ? "0 28px 70px -20px " + platform.accent + "66" : "0 18px 50px -28px rgba(15,23,42,.3)" }}>
              <div className="flex items-start justify-between"><div className="rounded-2xl border border-slate-100 bg-slate-50 p-3"><Icon type={platform.icon} /></div><span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: platform.accent + "15", color: platform.accent }}>{platform.label}</span></div>
              <h3 className="mt-6 text-xl font-black text-slate-950">{platform.name}</h3><p className="mt-2 min-h-[54px] text-sm leading-6 text-slate-500">{platform.description}</p>
              <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-white"><div className="flex items-center justify-between text-xs"><span>Campaign health</span><span className="font-bold">Optimized</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full" style={{ width: (72 + ((index * 9) % 25)) + "%", background: platform.accent }} /></div><div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-white/60"><span>Creative testing</span><span className="text-right">Audience signals</span></div></div>
            </article>;
          })}
        </div>
        <button type="button" aria-label="Previous advertising platform" onClick={() => go(-1)} className="absolute left-0 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white md:left-4"><ChevronLeft size={22} /></button>
        <button type="button" aria-label="Next advertising platform" onClick={() => go(1)} className="absolute right-0 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white md:right-4"><ChevronRight size={22} /></button>
      </div>
      <div className="mt-4 flex justify-center gap-2">{platforms.map((platform, index) => <button key={platform.name} type="button" aria-label={"Show " + platform.name} onClick={() => setActive(index)} className={"h-2.5 rounded-full transition-all " + (active === index ? "w-8 bg-slate-950" : "w-2.5 bg-slate-300 hover:bg-slate-400")} />)}</div>
      <div className="mt-14 grid gap-4 sm:grid-cols-3">{[{ icon: Target, title: "Precise targeting", text: "Match campaigns to intent, role, interest and audience signals." }, { icon: BarChart3, title: "Performance driven", text: "Track clicks, leads, conversions and campaign efficiency." }, { icon: Sparkles, title: "Creative testing", text: "Test hooks, formats and messages across channels." }].map((item) => <div key={item.title} className="rounded-2xl border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur"><item.icon className="mb-3 text-indigo-600" size={22} /><div className="font-bold text-slate-900">{item.title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{item.text}</div></div>)}</div>
    </div>
  </section>;
};

export default AdvertisingCarousel;