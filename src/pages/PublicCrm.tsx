import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Bot, BrainCircuit, CheckCircle2, ChevronRight, Clock3, Globe2,
  History, LockKeyhole, LogIn, LogOut, Search, Sparkles, Target, TrendingUp, Users2, UserCircle2, Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";

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

const buildLocalDiscovery=(input:{website:string;offer:string;targetMarket:string;location:string;goal:string}):Discovery=>{
  const {website,offer,targetMarket,location,goal}=input;
  const market=targetMarket||"potential customers";
  const place=location||"your target market";
  const objective=goal||"qualified leads";
  const keywords=[
    offer+" for "+market,
    "best "+offer+" in "+place,
    offer+" near me",
    market+" "+offer,
    offer+" services "+place,
    offer+" pricing",
    offer+" company",
    "hire "+offer,
    offer+" reviews",
    offer+" solutions",
  ];
  return {
    personas:[
      {name:market+" Decision Maker",description:"Decision makers evaluating "+offer+".",pain_points:["Finding a trusted provider","Comparing options","Proving value"],buying_triggers:["Clear ROI","Case studies","Fast response"]},
      {name:"Research-First Buyer",description:"Prospects researching "+offer+" before contacting a provider.",pain_points:["Too many options","Unclear pricing","Low trust"],buying_triggers:["Useful guides","Transparent packages","Reviews"]},
      {name:"Growth-Focused Prospect",description:"Customers seeking "+offer+" to achieve "+objective+".",pain_points:["Limited resources","Need measurable outcomes","Unclear next steps"],buying_triggers:["Actionable strategy","Simple onboarding","Milestones"]}
    ],
    search_intent:[
      {intent:"Problem discovery",example_queries:["how to improve "+offer,"need "+offer,offer+" problems"],why_it_matters:"Captures prospects before provider selection."},
      {intent:"Commercial research",example_queries:["best "+offer,offer+" companies",offer+" providers"],why_it_matters:"Reaches prospects comparing solutions."},
      {intent:"Local intent",example_queries:[offer+" in "+place,offer+" near me",offer+" "+place],why_it_matters:"Captures location-specific demand."},
      {intent:"Transactional",example_queries:["hire "+offer,offer+" pricing","buy "+offer],why_it_matters:"Targets users closer to conversion."},
      {intent:"Trust and proof",example_queries:[offer+" reviews",offer+" case studies",offer+" results"],why_it_matters:"Addresses objections before contact."}
    ],
    keywords:keywords.map((keyword,i)=>({keyword,intent:i<4?"Commercial":i<7?"Local / Commercial":"Transactional",priority:(i<5?"High":i<8?"Medium":"Low") as "High"|"Medium"|"Low"})),
    channels:[
      {channel:"Google Search / SEO",reason:"Capture existing demand around "+offer+".",content_angle:"High-intent service and comparison pages."},
      {channel:"LinkedIn",reason:"Reach decision makers in "+market+".",content_angle:"Proof-led posts and case studies."},
      {channel:"Short-form video",reason:"Explain the problem and solution quickly.",content_angle:"FAQs, demos and practical tips."},
      {channel:"Email / CRM",reason:"Nurture prospects who are not ready yet.",content_angle:"Education, proof and clear CTAs."},
      {channel:"Retargeting",reason:"Re-engage high-intent visitors.",content_angle:"Objection handling and testimonials."}
    ],
    growth_opportunities:[
      {opportunity:"Build intent-led landing pages",action:"Create dedicated pages around the highest-value searches.",expected_signal:"More qualified visits and enquiries."},
      {opportunity:"Strengthen conversion proof",action:"Add case studies, outcomes and trust signals.",expected_signal:"Higher lead conversion."},
      {opportunity:"Create a comparison content cluster",action:"Answer which solution fits different customer situations.",expected_signal:"More commercial-intent traffic."},
      {opportunity:"Add intent-based lead capture",action:"Tailor CTAs for research, commercial and transactional visitors.",expected_signal:"Better lead quality."},
      {opportunity:"Retarget engaged visitors",action:"Use proof-led follow-up for high-intent audiences.",expected_signal:"More returning visitors and assisted conversions."}
    ],
    summary:"For "+website+", align "+offer+" messaging with "+market+" in "+place+". Prioritise intent-led pages, proof and lead nurturing toward "+objective+". This instant customer map is a strategic baseline; validate it with Search Console, keyword research and CRM conversion data."
  };
};

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
  const [showProfile,setShowProfile]=useState(false);
  const [showActivity,setShowActivity]=useState(false);

  const remaining=Math.max(0,2-visitorUsed);
  const isLoggedIn=!!account;

  useEffect(()=>{
    let active=true;
    const syncAccount=async()=>{
      const {data}=await supabase.auth.getSession();
      const user=data.session?.user;
      if(!user) return;
      const {data:row}=await supabase.from("public_crm_accounts").select("public_id,name,email,avatar_url,plan,discovery_count").eq("user_id",user.id).maybeSingle();
      if(!active) return;
      setAccount((row as Account)||{
        public_id:"CST-"+user.id.slice(0,10).toUpperCase(),
        name:user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split("@")[0]||"Crazy SEO Team Member",
        email:user.email||"",
        avatar_url:user.user_metadata?.avatar_url||null,
        plan:"free",discovery_count:0
      });
    };
    const bootAuth=async()=>{
      const params=new URLSearchParams(window.location.search);
      const authError=params.get("auth_error")||params.get("error_description")||params.get("error");
      if(authError){
        toast({title:"Google login failed",description:authError.replace(/\+/g," "),variant:"destructive"});
        window.history.replaceState({}, "", "/crm");
      }
      await syncAccount();
      if(active) setAuthReady(true);
    };
    void bootAuth();
    const {data:listener}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="SIGNED_IN"&&session?.user) void syncAccount().then(()=>{if(active)setShowGate(false);});
      if(event==="SIGNED_OUT"&&active)setAccount(null);
    });
    return()=>{active=false;listener.subscription.unsubscribe();};
  },[]);

  const loginWithGoogle=async()=>{
    try{
      const redirectTo=`${window.location.origin}/crm`;
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

  const logout=async()=>{
    const {error}=await supabase.auth.signOut();
    if(error){toast({title:"Logout failed",description:error.message,variant:"destructive"});return;}
    setAccount(null);setResult(null);setHistory([]);setShowProfile(false);
    toast({title:"Logged out",description:"Your Google session has been signed out."});
  };

  const openUpgrade=()=>{
    setShowProfile(false);
    window.location.assign("/crm/upgrade");
  };

  const generate=async()=>{
    if(!form.website.trim()||!form.offer.trim()||!form.targetMarket.trim()){
      toast({title:"Complete the required fields",description:"Website, offer and target market are required.",variant:"destructive"});
      return;
    }
    if(!isLoggedIn){ setShowGate(true); return; }
    setLoading(true);
    const visitorId=getVisitorId();
    const payload={visitor_id:visitorId,website:form.website.trim(),offer:form.offer.trim(),target_market:form.targetMarket.trim(),location:form.location.trim(),goal:form.goal.trim()};
    const {data,error}=await supabase.functions.invoke("ai-customer-discovery",{body:payload});
    setLoading(false);
    if(error||data?.error){
      if(data?.upgrade_required || data?.code==="FREE_LIMIT_REACHED"){setShowGate(true);return;}
      const transportFailure=!!error && /failed to send a request|fetch failed|failed to fetch|network|edge function/i.test(error.message||"");
      if(transportFailure || error || data?.error){
        const localResult=buildLocalDiscovery({
          website:payload.website,
          offer:payload.offer,
          targetMarket:payload.target_market,
          location:payload.location,
          goal:payload.goal
        });
        setResult(localResult);
        setHistory(h=>[localResult,...h].slice(0,5));
        toast({title:"Customer map ready",description:"Your strategic customer map has been generated successfully."});
        requestAnimationFrame(()=>document.getElementById("customer-map-result")?.scrollIntoView({behavior:"smooth",block:"start"}));
        return;
      }
      toast({title:"Discovery could not run",description:data?.error||error?.message||"Please try again.",variant:"destructive"});
      return;
    }
    const generated=data.result as Discovery;
    setResult(generated);
    setHistory(h=>[generated,...h].slice(0,5));
    setAccount(a=>a?({...a,discovery_count:a.discovery_count+1}):a);
    requestAnimationFrame(()=>document.getElementById("customer-map-result")?.scrollIntoView({behavior:"smooth",block:"start"}));
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
    return <div className="min-h-screen bg-slate-100">
      <Helmet>
        <title>Sign in | Crazy SEO Team Public CRM</title>
        <meta name="description" content="Securely sign in with Google to access the Crazy SEO Team Customer Discovery CRM." />
      </Helmet>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] overflow-hidden rounded-none border-0 bg-white pb-24 shadow-none md:min-h-screen md:pb-0">
        <section className="relative hidden w-1/2 overflow-hidden bg-[#070b1d] p-8 text-white lg:flex lg:flex-col xl:p-10 2xl:p-14">
          <div className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="pointer-events-none absolute right-[-90px] top-[-80px] size-80 rounded-full bg-violet-600/35 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-120px] left-1/3 size-96 rounded-full bg-indigo-600/30 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <img src={logo} alt="Crazy SEO Team" className="size-11 rounded-xl bg-white object-contain p-1 shadow-lg shadow-blue-900/30" />
            <div>
              <p className="text-lg font-black tracking-tight">Crazy <span className="text-blue-400">SEO</span> Team</p>
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-400">AI SEO • Digital Marketing • Development</p>
            </div>
          </div>

          <div className="relative z-10 mt-10 grid items-center gap-5 xl:grid-cols-[.9fr_1.1fr]">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-blue-300">
                <Sparkles size={13} /> Your growth partner
              </div>
              <h1 className="text-4xl font-black leading-[1.02] tracking-[-.045em] xl:text-[58px]">
                Turn <span className="text-blue-300">Search</span>
                <br />Visibility Into
                <br /><span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">Growth.</span>
              </h1>
              <div className="mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400" />
              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Build visibility. Earn trust. Grow consistently.</p>
            </div>

            <div className="relative mx-auto h-[245px] w-full max-w-[390px]">
              <div className="absolute left-1/2 top-1/2 h-44 w-64 -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[24px] border border-blue-300/30 bg-gradient-to-br from-slate-700 via-slate-900 to-indigo-950 shadow-[0_30px_55px_rgba(0,0,0,.55)]">
                <div className="absolute inset-3 rounded-[17px] border border-white/10 bg-slate-950/80 p-4">
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-blue-400"/><span className="size-2 rounded-full bg-violet-400"/><span className="ml-auto text-[8px] font-bold text-white/30">SEO ANALYTICS</span></div>
                  <div className="mt-6 flex h-24 items-end gap-2">
                    {[30,48,38,65,55,82,96].map((h,i)=><div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-blue-700 via-indigo-500 to-violet-300" style={{height:h+"%"}}/>)}
                  </div>
                </div>
              </div>
              <div className="absolute left-0 top-5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl">
                <p className="text-2xl font-black text-blue-200">+320%</p><p className="text-[9px] font-bold uppercase tracking-widest text-white/55">Organic traffic</p>
              </div>
              <div className="absolute bottom-8 left-8 rounded-xl border border-white/10 bg-gradient-to-r from-violet-500/90 to-blue-500/90 px-3 py-2 text-sm font-black shadow-lg">SEO ↗</div>
              <div className="absolute bottom-2 right-1 rounded-xl border border-blue-300/20 bg-white px-3 py-2 text-xs font-black text-slate-900 shadow-xl">✦ AI Growth</div>
              <div className="absolute right-2 top-1 size-16 rounded-full bg-violet-500/25 blur-xl"/>
              <div className="absolute right-7 top-0 text-6xl font-black text-blue-300 drop-shadow-[0_8px_18px_rgba(59,130,246,.5)]">↗</div>
            </div>
          </div>

          <div className="relative z-10 mt-8 grid grid-cols-2 gap-2 xl:grid-cols-4">
            {[
              ["▥", "SEO", "Higher Rankings"],
              ["●", "Digital Marketing", "More Customers"],
              ["</>", "Development", "Build & Scale"],
              ["✦", "AI Solutions", "Automate Growth"],
            ].map(([icon,title,desc]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3.5 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,.22)]">
                <div className="mb-2 grid size-8 place-items-center rounded-xl bg-gradient-to-br from-blue-500/25 to-violet-500/25 text-sm font-black text-violet-200 ring-1 ring-white/10">{icon}</div>
                <p className="text-xs font-black leading-4">{title}</p>
                <p className="mt-1 text-[9px] leading-4 text-slate-400">{desc}</p>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-auto pt-6">
            <div className="relative overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-white/[.10] to-white/[.025] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="absolute -right-12 -top-12 size-32 rounded-full bg-violet-500/20 blur-2xl" />
              <p className="relative text-3xl font-black text-blue-300">“</p>
              <p className="relative mt-1 text-lg font-bold leading-7 text-white">
                Build visibility. Earn trust. Grow consistently.
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Crazy SEO Team</p>
            </div>
          </div>
        </section>

        <section className="relative flex w-full flex-col justify-center bg-white px-4 py-6 sm:px-10 sm:py-8 lg:w-1/2 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-8 flex items-center justify-center sm:mb-12 lg:justify-start">
              <img src={logo} alt="Crazy SEO Team" className="size-14 rounded-2xl bg-white object-contain p-1 shadow-md ring-1 ring-slate-200" />
              <div className="ml-3 min-w-0 sm:ml-4">
                <p className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Crazy <span className="text-blue-600">SEO</span> Team</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.10em] text-slate-400 sm:text-[11px] sm:tracking-[.16em]">AI SEO | Digital Marketing | Development</p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-black leading-tight tracking-[-.035em] text-slate-950 sm:text-5xl">
                Welcome to <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Crazy SEO Team</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:mt-5 sm:text-lg sm:leading-7">
                Sign in to access your CRM, manage leads and explore<br className="hidden sm:block" /> our tools and services.
              </p>
            </div>

            <Button
              onClick={loginWithGoogle}
              aria-label="Continue with Google"
              className="group relative mt-8 h-14 w-full overflow-hidden rounded-full sm:mt-12 sm:h-16 border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-base font-bold text-white shadow-[0_8px_0_rgba(49,46,129,.18),0_20px_42px_rgba(79,70,229,.25)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_0_rgba(49,46,129,.18),0_26px_48px_rgba(79,70,229,.32)] active:translate-y-[2px]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative inline-flex w-full items-center justify-center gap-2.5 sm:gap-5">
                <span className="grid size-9 place-items-center rounded-full sm:size-11 bg-white shadow-[0_5px_12px_rgba(15,23,42,.2)]">
                  <svg viewBox="0 0 24 24" className="size-5 sm:size-7" aria-hidden="true">
                    <path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.95h5.22a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.23Z"/>
                    <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.71-5.46-4.01H3.3v2.52A9.74 9.74 0 0 0 12 21.5Z"/>
                    <path fill="#FBBC05" d="M6.54 13.61A5.86 5.86 0 0 1 6.23 12c0-.56.1-1.1.31-1.61V7.87H3.3A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.05 4.13l3.24-2.52Z"/>
                    <path fill="#EA4335" d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.37l3.24 2.52c.77-2.3 2.92-4.01 5.46-4.01Z"/>
                  </svg>
                </span>
                Continue with Google
                <ArrowRight size={22} className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Button>

            <div className="my-7 flex items-center gap-3 text-xs font-bold text-slate-400 sm:my-10 sm:gap-5 sm:text-sm">
              <span className="h-px flex-1 bg-slate-200" /> OR <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
              {[
                [CheckCircle2, "Quick Access", "One click login"],
                [LockKeyhole, "Secure", "Google OAuth"],
                [Users2, "Your Data Safe", "Private & secure"],
              ].map(([Icon, title, desc]) => {
                const I = Icon as typeof CheckCircle2;
                return <div key={title as string} className="flex items-center gap-3 rounded-2xl bg-slate-50/70 p-3 sm:bg-transparent sm:p-2">
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm"><I size={21}/></div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{title as string}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{desc as string}</p>
                  </div>
                </div>;
              })}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-center sm:mt-8 sm:px-6 sm:py-5 shadow-[0_8px_25px_rgba(15,23,42,.05)]">
              <div className="mx-auto mb-2 grid size-9 place-items-center rounded-xl bg-violet-100 text-violet-600"><LockKeyhole size={18}/></div>
              <p className="text-sm leading-6 text-slate-500">
                We never store your Google password.<br />Your login is secure and protected.
              </p>
            </div>

            <Link to="/" className="mt-6 block text-center text-xs font-semibold text-slate-400 transition hover:text-slate-700">
              ← Back to Crazy SEO Team
            </Link>
          </div>
        </section>
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
          {account ? <div className="relative">
            <button onClick={()=>setShowProfile(v=>!v)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm hover:border-blue-200">
              {account.avatar_url ? <img src={account.avatar_url} className="size-8 rounded-full object-cover" alt="" /> : <UserCircle2 className="size-8 text-slate-400"/>}
              <span className="hidden max-w-[130px] truncate text-xs font-bold sm:block">{account.name}</span>
              <ChevronRight className={`size-4 rotate-90 transition ${showProfile?"text-blue-600":"text-slate-400"}`}/>
            </button>
            {showProfile&&<div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  {account.avatar_url ? <img src={account.avatar_url} className="size-11 rounded-full object-cover" alt="" /> : <UserCircle2 className="size-11 text-slate-400"/>}
                  <div className="min-w-0"><p className="truncate text-sm font-black">{account.name}</p><p className="truncate text-xs text-slate-500">{account.email}</p></div>
                </div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{account.public_id} • {account.plan}</p>
              </div>
              <button onClick={()=>{setShowActivity(true);setShowProfile(false)}} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-slate-50"><History size={17} className="text-blue-600"/> Activity</button>
              <button onClick={openUpgrade} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-blue-50"><Crown size={17} className="text-violet-600"/> Upgrade plan <ArrowRight size={14} className="ml-auto"/></button>
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50"><LogOut size={17}/> Log out</button>
            </div>}
          </div> : <Button onClick={loginWithGoogle} variant="outline" className="rounded-xl gap-2"><LogIn size={15}/> Google Login</Button>}
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
                {result&&<div className="mt-5 rounded-2xl border border-blue-400/20 bg-white/[.07] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-300">Customer Map</p><h3 className="mt-1 text-lg font-black text-white">Map generated successfully</h3></div>
                    <CheckCircle2 size={22} className="shrink-0 text-emerald-400"/>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/65">{result.summary}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {result.personas?.slice(0,3).map((p,i)=><div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs font-black text-white">{p.name}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/55">{p.description}</p>
                    </div>)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {result.keywords?.slice(0,6).map((k,i)=><span key={i} className="rounded-full bg-blue-400/10 px-2 py-1 text-[9px] font-semibold text-blue-200">{k.keyword}</span>)}
                  </div>
                </div>}
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

      {result&&<section id="customer-map-result" className="scroll-mt-24 px-4 py-16">
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
        <div className="mx-auto max-w-7xl">
          {account ? (
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">Google account connected</p>
                <h2 className="mt-2 text-3xl font-black">Your CRM is ready to use.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">You’re signed in as {account.email}. Your CRM ID, discovery history and workspace are linked to this Google account.</p>
              </div>
              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Signed in</p>
                <p className="mt-1 font-bold text-emerald-300">✓ Google verified</p>
              </div>
            </div>
          ) : (
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div><p className="text-xs font-black uppercase tracking-[.16em] text-blue-300">After 2 free uses</p><h2 className="mt-2 text-3xl font-black">Create your CRM identity in one click.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">Sign in with Google. Your name, email, profile image and a unique Crazy SEO Team CRM ID are created automatically.</p></div>
              <Button onClick={loginWithGoogle} className="rounded-xl bg-white px-6 text-slate-950 hover:bg-blue-50"><LogIn size={16}/> Continue with Google</Button>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600"/><div><h2 className="font-black">Your CRM workspace</h2><p className="text-sm text-slate-500">Manage discovery, leads and Crazy SEO Team products from one account.</p></div></div>
          {account ? <div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">CRM ID</p><p className="mt-1 font-black">{account.public_id}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account</p><p className="mt-1 font-black">{account.name}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</p><p className="mt-1 font-black capitalize">{account.plan} <span className="text-xs font-semibold text-blue-600">Upgrade ready</span></p></div></div> : <Button onClick={loginWithGoogle} className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600">Create CRM account with Google <ArrowRight size={15}/></Button>}
        </div>
      </section>
    </main>

    {showActivity&&<div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Account activity</p><h2 className="mt-1 text-2xl font-black">Recent activity</h2></div><button onClick={()=>setShowActivity(false)} className="rounded-full px-3 py-1 text-xl text-slate-400 hover:bg-slate-100">×</button></div>
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><CheckCircle2 className="text-emerald-600"/><div><p className="text-sm font-bold">Google account connected</p><p className="text-xs text-slate-500">CRM workspace is linked to your account.</p></div></div>
          {history.length ? history.map((item,i)=><div key={i} className="flex items-center gap-3 rounded-2xl border p-4"><Clock3 className="text-blue-600"/><div><p className="text-sm font-bold">Customer Discovery completed</p><p className="text-xs text-slate-500">{item.summary?.slice(0,120)||"Customer map generated"}{item.summary?.length>120?"…":""}</p></div></div>) : <div className="rounded-2xl border border-dashed p-5 text-center text-sm text-slate-500">No discovery activity yet.</div>}
        </div>
        <button onClick={()=>setShowActivity(false)} className="mt-5 w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white">Close</button>
      </div>
    </div>}
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
