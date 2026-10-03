import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Play, Bot, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";
import logo from "@/assets/logo.jpeg";

const HeroSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seo, setSeo] = useState(87);
  const [ai, setAi] = useState(92);
  const [llm, setLlm] = useState(89);
  const searchPlatforms = ["Google", "Bing", "ChatGPT", "Gemini", "Perplexity AI", "AI Tools", "AI Search"];

  useEffect(() => {
    const t = setInterval(() => {
      setSeo((v) => Math.max(85, Math.min(99, v + (Math.random() > 0.5 ? 1 : -1))));
      setAi((v) => Math.max(85, Math.min(99, v + (Math.random() > 0.5 ? 1 : -1))));
      setLlm((v) => Math.max(85, Math.min(99, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.32),transparent_35%),radial-gradient(circle_at_75%_0%,rgba(124,58,237,.38),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(37,99,235,.2),transparent_40%)]" />
        <div className="relative z-10 grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
          <div className="relative flex flex-col justify-center overflow-hidden px-7 py-12 text-white sm:px-10 lg:px-12 xl:px-16">
            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-violet-600/35 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-3">
                <img src={logo} alt="Crazy SEO Team" className="size-14 rounded-2xl bg-white object-contain p-1 shadow-lg" />
                <div>
                  <p className="text-2xl font-black tracking-tight">Crazy <span className="text-blue-400">SEO</span> Team</p>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/60">AI SEO | Digital Marketing | Development</p>
                </div>
              </div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-blue-300">
                <Sparkles size={13} /> Your growth partner
              </div>
              <h1 className="max-w-2xl text-5xl font-black leading-[.98] tracking-[-.045em] md:text-6xl xl:text-7xl">
                Turn <span className="text-blue-300">Search</span><br />Visibility Into<br />
                <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">Growth.</span>
              </h1>
              <div className="mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400" />
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Build visibility. Earn trust. Grow consistently with AI SEO, GEO, AEO and LLM optimization.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setDialogOpen(true)} className="rounded-full bg-gradient-to-r from-blue-500 to-violet-600 px-7 py-6 font-bold text-white shadow-[0_15px_35px_rgba(79,70,229,.3)] hover:-translate-y-1">
                  Start Free Audit <ArrowRight size={18} />
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full border-white/15 bg-white/5 px-7 py-6 text-white hover:bg-white/10">
                  <Play size={16} /> Try AI Writer
                </Button>
              </div>
              <div className="mt-9 grid grid-cols-2 gap-2 xl:grid-cols-4">
                {[["▥","SEO","Higher Rankings"],["●","Digital Marketing","More Customers"],["</>","Development","Build & Scale"],["✦","AI Solutions","Automate Growth"]].map(([icon,title,desc])=>(
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/[.06] p-3.5 backdrop-blur-md">
                    <div className="mb-2 grid size-8 place-items-center rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 text-sm font-black text-violet-200">{icon}</div>
                    <p className="text-xs font-black">{title}</p><p className="mt-1 text-[9px] text-slate-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex items-center overflow-hidden bg-white px-7 py-12 sm:px-10 lg:px-12 xl:px-16">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl" />
            <div className="relative mx-auto w-full max-w-xl">
              <div className="mb-10 flex items-center justify-center lg:justify-start">
                <div className="flex items-center gap-3">
                  <img src="/images/logo.png" alt="Crazy SEO Team" className="size-12 rounded-xl object-contain shadow-sm ring-1 ring-slate-200" />
                  <div><p className="text-xl font-black text-slate-950">Crazy <span className="text-blue-600">SEO</span> Team</p><p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">AI Search Growth</p></div>
                </div>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">AI SEO Platform · 2026</p>
                <h2 className="mt-3 text-4xl font-black tracking-[-.035em] text-slate-950 sm:text-5xl">
                  Search is evolving.<br /><span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Your growth system should too.</span>
                </h2>
                <p className="mt-5 text-base leading-7 text-slate-500">Track SEO, AI visibility and LLM performance across the modern search stack.</p>
              </div>

              <div className="mt-9 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_25px_65px_rgba(15,23,42,.12)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg"><Bot size={18}/></div><div><p className="text-sm font-black text-slate-900">AI SEO Dashboard</p><p className="text-[10px] font-bold text-emerald-600">● Live monitoring</p></div></div>
                  <div className="flex gap-1.5"><span className="size-2 rounded-full bg-red-400"/><span className="size-2 rounded-full bg-amber-400"/><span className="size-2 rounded-full bg-emerald-400"/></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[["SEO Score",seo,"from-cyan-500 to-blue-600"],["AI Visibility",ai,"from-purple-500 to-fuchsia-600"],["LLM Score",llm,"from-blue-500 to-purple-600"]].map(([label,value,tone])=>(
                    <div key={label as string} className="rounded-2xl border border-slate-100 bg-slate-50 p-3"><p className="text-2xl font-black text-slate-900">{value}</p><p className="mt-1 text-[10px] text-slate-500">{label as string}</p><div className="mt-2 h-1 rounded-full bg-slate-200"><div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{width:`${value}%`}} /></div></div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold text-slate-700"><Activity size={12} className="mr-1 inline text-blue-600"/> Traffic Overview</p><p className="text-[10px] font-bold text-emerald-600">+23.4% ↑</p></div>
                  <div className="mt-3 flex h-20 items-end gap-2">{[35,48,42,64,57,78,92,86,100].map((h,i)=><div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-violet-400" style={{height:h+"%"}}/>)}</div>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 p-3"><div className="grid size-9 place-items-center rounded-xl bg-white text-violet-600 shadow-sm"><Sparkles size={16}/></div><div><p className="text-xs font-black text-slate-900">AI recommends 3 fixes</p><p className="text-[10px] text-slate-500">Core Web Vitals · FAQ schema · Meta titles</p></div></div>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-500 lg:justify-start">
                {searchPlatforms.slice(0,5).map((name,i)=><span key={name} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">{name}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default HeroSection;
