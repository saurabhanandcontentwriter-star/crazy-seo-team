import { useEffect, useState } from "react";
import { Check, ArrowLeft, Crown, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const plans=[
  {id:"pro",name:"Pro",price:"₹999",period:"/month",description:"For serious customer discovery and lead generation.",features:["50 Customer Discovery runs / month","Saved discovery history","Lead & activity tracking","Export-ready reports","Priority AI processing"],featured:true},
  {id:"business",name:"Business",price:"₹2,499",period:"/month",description:"For teams running customer discovery at scale.",features:["200 Customer Discovery runs / month","Team-ready CRM workspace","Advanced activity & analytics","Reports and lead workflows","Priority support"],featured:false},
];

export default function CrmUpgrade(){
  const navigate=useNavigate();
  const [email,setEmail]=useState("");
  const [currentPlan,setCurrentPlan]=useState("free");
  const [loading,setLoading]=useState<string|null>(null);

  useEffect(()=>{ void supabase.auth.getUser().then(({data})=>{setEmail(data.user?.email||"");}); void supabase.from("public_crm_accounts").select("plan").maybeSingle().then(({data})=>{if(data?.plan)setCurrentPlan(data.plan);}); },[]);

  const checkout=async(plan:string)=>{
    if(!email){toast({title:"Sign in required",description:"Please sign in with Google from the CRM first.",variant:"destructive"});navigate("/crm");return;}
    setLoading(plan);
    try{
      const {data,error}=await supabase.functions.invoke("create-crm-checkout",{body:{plan}});
      if(error||data?.error) throw new Error(error?.message||data?.error||"Could not start checkout.");
      if(data?.url) window.location.assign(data.url); else throw new Error("Checkout URL was not returned.");
    }catch(e){toast({title:"Checkout unavailable",description:e instanceof Error?e.message:"Please try again.",variant:"destructive"});}
    finally{setLoading(null);}
  };

  const params=new URLSearchParams(window.location.search);
  const sessionId=params.get("session_id");
  useEffect(()=>{ if(!sessionId)return; void (async()=>{setLoading("verify"); const {data,error}=await supabase.functions.invoke("verify-crm-upgrade",{body:{session_id:sessionId}}); if(error||data?.error){toast({title:"Payment verification failed",description:error?.message||data?.error,variant:"destructive"});} else {setCurrentPlan(data.plan||"pro");toast({title:"Upgrade successful",description:"Your CRM plan is now active."}); window.history.replaceState({}, "", "/crm/upgrade");} setLoading(null);})(); },[sessionId]);

  return <main className="min-h-screen bg-slate-50">
    <section className="bg-slate-950 px-4 py-14 text-white"><div className="mx-auto max-w-6xl">
      <button onClick={()=>navigate("/crm")} className="mb-8 flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white"><ArrowLeft size={16}/> Back to CRM</button>
      <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.18em] text-violet-300">CRM plans</p><h1 className="mt-3 text-4xl font-black md:text-6xl">Upgrade your Customer Discovery workspace.</h1><p className="mt-4 text-base leading-7 text-white/60">Choose a plan, complete secure Stripe Checkout, and your CRM plan is activated after payment verification.</p></div>
    </div></section>
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
      {plans.map(plan=><div key={plan.id} className={`relative rounded-3xl border bg-white p-6 shadow-sm ${plan.featured?"border-violet-400 ring-2 ring-violet-100":""}`}>
        {plan.featured&&<div className="absolute right-5 top-5 rounded-full bg-violet-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">Popular</div>}
        <div className="flex items-center gap-2"><Crown className="text-violet-600" size={20}/><h2 className="text-2xl font-black">{plan.name}</h2></div>
        <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
        <div className="mt-6"><span className="text-4xl font-black">{plan.price}</span><span className="text-sm text-slate-500">{plan.period}</span></div>
        <div className="mt-6 space-y-3">{plan.features.map(x=><div key={x} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 text-emerald-600" size={17}/><span>{x}</span></div>)}</div>
        <Button disabled={loading!==null||currentPlan===plan.id} onClick={()=>checkout(plan.id)} className="mt-8 h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600">{loading===plan.id?<><Loader2 className="animate-spin"/> Opening checkout...</>:currentPlan===plan.id?"Current plan":<>Upgrade to {plan.name} <Sparkles size={16}/></>}</Button>
      </div>)}
    </section>
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-12 text-xs text-slate-500"><ShieldCheck size={16} className="text-emerald-600"/> Payments are handled by Stripe Checkout. Your plan is activated only after server-side payment verification.</div>
  </main>;
}
