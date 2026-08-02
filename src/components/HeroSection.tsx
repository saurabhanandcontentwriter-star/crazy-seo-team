import { useState, useEffect, useMemo } from "react";
import { ArrowRight, Sparkles, Play, TrendingUp, Bot, Zap, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ContactFormDialog from "@/components/ContactFormDialog";

const HeroSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seo, setSeo] = useState(87);
  const [ai, setAi] = useState(92);
  const [llm, setLlm] = useState(89);

  useEffect(() => {
    const t = setInterval(() => {
      setSeo((v) => Math.max(85, Math.min(99, v + (Math.random() > 0.5 ? 1 : -1))));
      setAi((v) => Math.max(85, Math.min(99, v + (Math.random() > 0.5 ? 1 : -1))));
      setLlm((v) => Math.max(85, Math.min(99, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const particles = useMemo(() => Array.from({ length: 22 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${55 + Math.random() * 45}%`,
    dur: `${9 + Math.random() * 10}s`,
    delay: `${Math.random() * 6}s`,
    px: `${(Math.random() - 0.5) * 80}px`,
    py: `${-100 - Math.random() * 200}px`,
    key: i,
  })), []);

  return (
    <>
      <section className="relative pt-32 pb-24 overflow-hidden mesh-bg animate-mesh">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
          backgroundImage: "linear-gradient(hsl(226 60% 70% / 0.18) 1px, transparent 1px), linear-gradient(90deg, hsl(226 60% 70% / 0.18) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }} />
        {/* Ambient blobs */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-blue-400/30 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full bg-purple-400/30 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-1/4 w-[320px] h-[320px] rounded-full bg-cyan-300/25 blur-[100px]" />

        {/* Floating particles */}
        {particles.map((p) => (
          <span key={p.key} className="particle" style={{
            left: p.left, top: p.top,
            animationDuration: p.dur, animationDelay: p.delay,
            // @ts-expect-error css var
            "--px": p.px, "--py": p.py,
          }} />
        ))}

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: copy */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold text-slate-700 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Sparkles size={12} className="text-blue-600" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Next-Gen AI SEO Platform · 2026
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight text-slate-900">
                The AI SEO Platform for{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600">
                  Google, ChatGPT,
                </span>{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-purple-600 to-blue-600">
                  Gemini & AI Search
                </span>
              </h1>

              <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
                Rank higher across Google and every AI search engine with an all-in-one platform for
                <strong className="text-slate-900"> AI SEO, GEO, AEO & LLM Optimization</strong> — built for the 2026 search stack.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Button size="lg" onClick={() => setDialogOpen(true)}
                  className="relative group bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base px-8 py-6 rounded-2xl hover:opacity-95 transition-transform hover:scale-[1.02] shadow-[0_10px_40px_-10px_hsl(230_90%_60%/0.7)]">
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/50 to-purple-500/50 blur-xl opacity-0 group-hover:opacity-100 transition" />
                  <span className="relative flex items-center gap-2">Start Free Audit <ArrowRight size={18} /></span>
                </Button>
                <Button size="lg" variant="outline"
                  onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                  className="glass text-slate-900 border-slate-200 hover:bg-white text-base px-8 py-6 rounded-2xl gap-2">
                  <Play size={16} className="text-blue-600" /> Try AI Writer
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg">
                {[
                  { v: "1M+", l: "Keywords Ranked" },
                  { v: "215k+", l: "AI Articles" },
                  { v: "97.6%", l: "AI Visibility" },
                ].map((s) => (
                  <div key={s.l} className="glass rounded-2xl p-4">
                    <p className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{s.v}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: dashboard preview */}
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}
              className="relative">
              {/* Orbit rings behind card */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[420px] h-[420px] rounded-full border border-blue-400/30 animate-ring" />
                <div className="absolute w-[320px] h-[320px] rounded-full border border-purple-400/30 animate-ring" style={{ animationDelay: "0.6s" }} />
                <div className="absolute w-[220px] h-[220px] rounded-full border border-cyan-400/30 animate-ring" style={{ animationDelay: "1.2s" }} />
              </div>

              <div className="relative glass rounded-3xl p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">AI SEO Dashboard</p>
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "SEO Score", value: seo, icon: TrendingUp, tone: "from-cyan-500 to-blue-600" },
                    { label: "AI Visibility", value: ai, icon: Zap, tone: "from-purple-500 to-fuchsia-600" },
                    { label: "LLM Score", value: llm, icon: ShieldCheck, tone: "from-blue-500 to-purple-600" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-2xl bg-white/70 border border-slate-200/70 p-3 backdrop-blur">
                      <div className="flex items-center justify-between mb-2">
                        <m.icon size={14} className="text-blue-600" />
                        <span className="text-[9px] font-bold text-emerald-600">EXC</span>
                      </div>
                      <p className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br ${m.tone}`}>{m.value}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.label}</p>
                      <div className="mt-2 h-1 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${m.tone} transition-all duration-700`} style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="mt-4 rounded-2xl bg-white/70 border border-slate-200/70 p-4 backdrop-blur">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-700 font-semibold flex items-center gap-1.5"><Activity size={12} className="text-blue-600" /> Traffic Overview</p>
                    <p className="text-[10px] font-bold text-emerald-600">+23.4% ↑</p>
                  </div>
                  <svg viewBox="0 0 300 80" className="w-full h-20">
                    <defs>
                      <linearGradient id="hero-grad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="hsl(226 83% 55%)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="hsl(262 83% 60%)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,60 C40,40 60,55 90,35 C120,20 150,45 180,30 C210,18 240,32 300,10 L300,80 L0,80 Z" fill="url(#hero-grad)" />
                    <path d="M0,60 C40,40 60,55 90,35 C120,20 150,45 180,30 C210,18 240,32 300,10" fill="none" stroke="hsl(226 83% 55%)" strokeWidth="2" />
                  </svg>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/60 p-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">AI recommends 3 fixes</p>
                    <p className="text-[10px] text-slate-500 truncate">Fix Core Web Vitals · Add FAQ schema · Refresh meta titles</p>
                  </div>
                </div>
              </div>

              {/* Floating pills */}
              <div className="absolute -top-4 -right-2 glass rounded-full px-3 py-1.5 text-[11px] text-slate-900 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ChatGPT Ranking
              </div>
              <div className="absolute -bottom-4 -left-2 glass rounded-full px-3 py-1.5 text-[11px] text-slate-900 font-semibold flex items-center gap-1.5">
                <Bot size={12} className="text-blue-600" /> Gemini · Claude · Perplexity
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default HeroSection;
