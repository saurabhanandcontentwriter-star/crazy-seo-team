import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Bot, BrainCircuit, CheckCircle2, ChevronRight, Clock3, Globe2,
  History, LockKeyhole, LogIn, Search, Sparkles, Target, TrendingUp, Users2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Discovery = {
  personas: { name:string; description:string; pain_points:string[]; buying_triggers:string[] }[];
  search_intent: { intent:string; example_queries:string[]; why_it_matters:string }[];
  keywords: { keyword:string; intent:string; priority:"High"|"Medium"|"Low" }[];
  channels: { channel:string; reason:string; content_angle:string }[];
  growth_opportunities: { opportunity:string; action:string; expected_signal:string }[];
  summary:string;
};

type Account = { public_id:string; name:string; email:string; avatar_url?:string|null; plan:string; discovery_count:number };

const initial={website:"",offer:"",targetMarket:"",location:"",goal:""};

const products=[
  {title:"SEO Platform",desc:"Technical SEO, AEO, GEO, keyword and visibility workflows.",href:"/seo-tools",icon:Search},
  {title:"AI Search Tools",desc:"AI-powered content, optimization and modern search workflows.",href:"/ai-tools",icon:Bot},
  {title:"ANVYA",desc:"Community, ideas, discussions and professional discovery.",href:"/anvya",icon:Sparkles},
  {title:"Classifieds",desc:"Business listings, opportunities and digital marketplace discovery.",href:"/classifieds",icon:Globe2},
];

const visitorKey="cst_public_crm_visitor_v1";
const getVisitorId=()=> {
  const current=localStorage.getItem(visitorKey);
  if(current) return current;
  const id=crypto.randomUUID();
  localStorage.setItem(visitorKey,id);
  return id;
};

export default function PublicCrm(){
  const [form,setForm]=useState(initial);
  const [result,setResult]=useState<Discovery|null>(null);
  const [visitorUsed,setVisitorUsed]=useState(0);
  const [account,setAccount]=useState<Account|null>(null);
  const [loading,setLoading]=useState(false);
  const [showGate,setShowGate]=useState(false);
  const [history,setHistory]=useState<Discovery[]>([]);
  const [authReady,setAuthReady]=useState(false);

  const remaining=Math.max(0,2-visitorUsed);
  const isLoggedIn=!!account;

  useEffect(()=>{
    let active=true;
    const boot=async()=>{
      const params=new URLSearchParams(window.location.search);
      const code=params.get("code");
      const authError=params.get("auth_error");

      if(authError){
        toast({title:"Google login failed",description:authError,variant:"destructive"});
        window.history.replaceState({}, "", "/crm");
      }

      if(code){
        const {error}=await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState({}, "", "/crm");
        if(error){
          toast({title:"Google login failed",description:error.message,variant:"destructive"});
        }
      }

      const {data}=await supabase.auth.getSession();
      if(!active) return;
      if(data.session?.user){
        const {data:row}=await (supabase as any).rpc("ensure_public_crm_account");
        if(active && row) setAccount(row as Account);
      }
      if(active) setAuthReady(true);
    };

    void boot();

    const {data:listener}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="SIGNED_IN" && session?.user){
        setTimeout(async()=>{
          const {data:row}=await (supabase as any).rpc("ensure_public_crm_account");
          if(active && row) setAccount(row as Account);
          if(active) setShowGate(false);
        },0);
      }
    });

    return()=>{
      active=false;
      listener.subscription.unsubscribe();
    };
  },[]);

  const loginWithGoogle=async()=>{
    try{
      const redirectTo=window.location.origin+"/crm";
      const {data,error}=await supabase.auth.signInWithOAuth({
        provider:"google",
        options:{redirectTo,queryParams:{prompt:"select_account"}}
      });
      if(error) throw error;
      if(data?.url) window.location.assign(data.url);
    }catch(error){
      toast({
        title:"Google login failed",
        description:error instanceof Error?error.message:"Please try again.",
        variant:"destructive"
      });
    }
  };

  const generate=async()=>{
    if(!form.website.trim()||!form.offer.trim()||!form.targetMarket.trim()){
      toast({title:"Complete the required fields",description:"Website, offer and target market are required.",variant:"destructive"});
      return;
    }
    if(!isLoggedIn){ setShowGate(true); return; }
    setLoading(true);
    const visitorId=getVisitorId();
    const {data,error}=await supabase.functions.invoke("ai-customer-discovery",{
      body:{visitor_id:visitorId,website:form.website.trim(),offer:form.offer.trim(),target_market:form.targetMarket.trim(),location:form.location.trim(),goal:form.goal.trim()}
    });
    setLoading(false);
    if(error||data?.error){
      if(data?.upgrade_required || data?.code==="FREE_LIMIT_REACHED"){setShowGate(true);return;}
      toast({title:"Discovery could not run",description:data?.error||error?.message||"Please try again.",variant:"destructive"});
      return;
    }
    setResult(data.result as Discovery);
    setHistory(h=>[data.result as Discovery,...h].slice(0,5));
    setAccount(a=>a?({...a,discovery_count:a.discovery_count+1}):a);
  };

  const mapText=form.location.trim()||"Global market";
  const stats=useMemo(()=>[
    [account?.public_id||"—","", "Your CRM ID"],
    [account?.discovery_count??0,"","Discoveries completed"],
    [account?.plan||"Free","", "CRM plan"],
  ],[visitorUsed,account]);

  if (!authReady) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="text-center"><div className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"/><p className="mt-4 text-sm font-semibold text-slate-500">Opening CRM...</p></div></div>;
  }

  if (!account) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Helmet><title>Sign in to Customer Discovery CRM | Crazy SEO Team</title></Helmet>
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-2xl font-black text-white">C</div>
        <p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-blue-600">Crazy SEO Team CRM</p>
        <h1 className="mt-2 text-3xl font-black">Sign in to continue</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Use your Google account to open Customer Discovery. Your CRM ID is created automatically after login.</p>
        <Button onClick={loginWithGoogle} className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600"><LogIn size={17}/> Continue with Google</Button>
        <Link to="/" className="mt-4 inline-block text-xs font-semibold text-slate-400 hover:text-slate-700">Back to Crazy SEO Team</Link>
      </div>
    </div>;
  }

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <Helmet>
      <title>Customer Discovery CRM | Crazy SEO Team</title>
      <meta name="description" content="Customer Discovery CRM by Crazy SEO Team. Sign in securely with Google to discover customers, save research and use the CRM workspace."/>
      <link rel="canonical" href="https://crazyseoteam.in/crm"/>
    </Helmet>

    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white font-black">C</div>
          <div><div className="text-sm font-black">Crazy SEO Team</div><div className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Public CRM</div></div>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/" className="hidden text-sm font-semibold text-slate-500 hover:text-slate-900 sm:block">Back to website</Link>
          {account ? <div className="flex items-center gap-2 rounded-full border bg-white px-2 py-1.5"><img src={account.avatar_url||""} className="size-7 rounded-full bg-slate-100 object-cover" alt="" onError={e=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/><span className="hidden max-w-[130px] truncate text-xs font-bold sm:block">{account.name}</span></div> : <Button onClick={loginWithGoogle} variant="outline" className="rounded-xl gap-2"><LogIn size={15}/> Google Login</Button>}
        </div>
      </div>
    </header>

    <main>
      <section className="relative overflow-hidden bg-white px-4 pb-16 pt-14 md:pt-20">
        <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-blue-500/10 blur-3xl"/>
        <div className="pointer-events-none absolute right-0 top-10 size-96 rounded-full bg-violet-500/10 blur-3xl"/>
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[.12em] text-blue-700"><BrainCircuit size={14}/> AI Customer Discovery</div>
              <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-tight md:text-7xl">Find your customers.<br/><span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Build your CRM.</span></h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">Sign in securely with Google to open your Crazy SEO Team CRM. Your CRM identity is created automatically and Customer Discovery is ready from one dashboard.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#discovery" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20">Try Customer Discovery <ArrowRight size={16}/></a>
                {!account&&<Button onClick={loginWithGoogle} variant="outline" className="rounded-xl px-6 py-3.5"><LogIn size={16}/> Continue with Google</Button>}
              </div>
              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {stats.map(([a,b,c])=><div key={c} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xl font-black">{a}<span className="text-sm text-slate-400">{b}</span></div><div className="mt-1 text-[11px] font-semibold text-slate-500">{c}</div></div>)}
              </div>
            </div>
            <div id="discovery" className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_rgba(37,99,235,.12)]">
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-blue-300">Customer Discovery</p><h2 className="mt-1 text-2xl font-black">Build a customer map</h2></div><div className="rounded-xl bg-white/10 px-3 py-2 text-center"><div className="text-lg font-black">{isLoggedIn?"CRM":"Login"}</div><div className="text-[9px] uppercase tracking-widest text-white/60">{isLoggedIn?"active":"required"}</div></div></div>
                <div className="mt-5 space-y-3">
                  <Input value={form.website} onChange={e=>setForm({...form,website:e.target.value})} placeholder="Website URL" className="h-11 border-white/10 bg-white/10 text-white placeholder:text-white/40"/>
                  <Textarea value={form.offer} onChange={e=>setForm({...form,offer:e.target.value})} placeholder="What do you sell? (SEO, SaaS, agency, product...)" className="min-h-20 border-white/10 bg-white/10 text-white placeholder:text-white/40"/>
                  <Textarea value={form.targetMarket} onChange={e=>setForm({...form,targetMarket:e.target.value})} placeholder="Who are your target customers?" className="min-h-16 border-white/10 bg-white/10 text-white placeholder:text-white/40"/>
                  <div className="grid gap-3 sm:grid-cols-2"><Input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Location (optional)" className="border-white/10 bg-white/10 text-white placeholder:text-white/40"/><Input value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})} placeholder="Growth goal (optional)" className="border-white/10 bg-white/10 text-white placeholder:text-white/40"/></div>
                  <Button onClick={generate} disabled={loading||!isLoggedIn} className="h-11 w-full rounded-xl bg-white text-slate-950 hover:bg-blue-50">{loading?"Generating customer map...":!isLoggedIn?"Sign in with Google to continue":"Generate Customer Map"}</Button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-white/60"><LockKeyhole size={13}/> Google sign-in is required. Your CRM account is created automatically.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-blue-600">Crazy SEO Team ecosystem</p><h2 className="mt-2 text-3xl font-black">Products & digital tools</h2></div><Link to="/services" className="text-sm font-bold text-blue-600">Explore services <ChevronRight size={15} className="inline"/></Link></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{products.map(p=>{const Icon=p.icon;return <Link key={p.title} to={p.href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl"><div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={19}/></div><h3 className="mt-4 font-black">{p.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{p.desc}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-blue-600">Open product <ArrowRight size={13}/></span></Link>})}</div>
        </div>
      </section>

      {result&&<section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8"><p className="text-xs font-black uppercase tracking-[.16em] text-blue-600">AI result</p><h2 className="mt-2 text-3xl font-black">Your customer map</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{result.summary}</p></div>
          <div className="grid gap-5 lg:grid-cols-3">{result.personas?.map((p,i)=><div key={i} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Users2 size={17} className="text-blue-600"/><h3 className="font-black">{p.name}</h3></div><p className="mt-2 text-sm text-slate-500">{p.description}</p><div className="mt-4 text-xs font-black">Pain points</div><ul className="mt-2 space-y-1 text-xs text-slate-500">{(p.pain_points||[]).slice(0,4).map((x,j)=><li key={j}>• {x}</li>)}</ul></div>)}</div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-2"><Search size={17} className="text-blue-600"/><h3 className="font-black">Search intent</h3></div><div className="mt-4 space-y-2">{result.search_intent?.map((x,i)=><div key={i} className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-bold">{x.intent}</p><p className="mt-1 text-xs text-slate-500">{x.why_it_matters}</p><div className="mt-2 flex flex-wrap gap-1">{x.example_queries?.slice(0,3).map((q,j)=><span key={j} className="rounded-full bg-white px-2 py-1 text-[10px]">{q}</span>)}</div></div>)}</div></div>
            <div className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-2"><TrendingUp size={17} className="text-blue-600"/><h3 className="font-black">Keyword opportunities</h3></div><div className="mt-4 space-y-2">{result.keywords?.map((k,i)=><div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"><span className="text-sm font-semibold">{k.keyword}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black">{k.priority}</span></div>)}</div></div>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-2"><Target size={17} className="text-blue-600"/><h3 className="font-black">Growth opportunities</h3></div><div className="mt-4 space-y-2">{result.growth_opportunities?.map((x,i)=><div key={i} className="rounded-xl border p-3"><p className="text-sm font-bold">{x.opportunity}</p><p className="mt-1 text-xs text-slate-500">{x.action}</p></div>)}</div></div>
            <div className="rounded-2xl border bg-white p-5"><div className="flex items-center gap-2"><Bot size={17} className="text-blue-600"/><h3 className="font-black">Recommended channels</h3></div><div className="mt-4 space-y-2">{result.channels?.map((x,i)=><div key={i} className="rounded-xl border p-3"><p className="text-sm font-bold">{x.channel}</p><p className="mt-1 text-xs text-slate-500">{x.reason}</p></div>)}</div></div>
          </div>
        </div>
      </section>}

      <section className="bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-blue-300">After 2 free uses</p><h2 className="mt-2 text-3xl font-black">Create your CRM identity in one click.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">Sign in with Google. Your name, email, profile image and a unique Crazy SEO Team CRM ID are created automatically.</p></div>
          <Button onClick={loginWithGoogle} className="rounded-xl bg-white px-6 text-slate-950 hover:bg-blue-50"><LogIn size={16}/> Continue with Google</Button>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600"/><div><h2 className="font-black">Your CRM workspace</h2><p className="text-sm text-slate-500">Manage discovery, leads and Crazy SEO Team products from one account.</p></div></div>
          {account ? <div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">CRM ID</p><p className="mt-1 font-black">{account.public_id}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account</p><p className="mt-1 font-black">{account.name}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</p><p className="mt-1 font-black capitalize">{account.plan} <span className="text-xs font-semibold text-blue-600">Upgrade ready</span></p></div></div> : <Button onClick={loginWithGoogle} className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600">Create CRM account with Google <ArrowRight size={15}/></Button>}
        </div>
      </section>
    </main>

    {showGate&&<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><LockKeyhole size={25}/></div>
        <h2 className="mt-5 text-center text-2xl font-black">Your 2 free discoveries are complete.</h2>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">Sign in with Google to create your CRM ID automatically and continue with your saved account.</p>
        <Button onClick={loginWithGoogle} className="mt-6 h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600"><LogIn size={16}/> Continue with Google</Button>
        <button onClick={()=>setShowGate(false)} className="mt-3 w-full text-xs font-semibold text-slate-400">Not now</button>
      </div>
    </div>}
  </div>;
}
