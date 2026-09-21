import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";

export default function IdeasLogin(){
  const nav=useNavigate();
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
  const [email,setEmail]=useState(""),[sent,setSent]=useState(false);
  const [resendCooldown,setResendCooldown]=useState(0);

  useEffect(()=>{
    if(resendCooldown<=0)return;
    const timer=window.setInterval(()=>setResendCooldown(v=>Math.max(0,v-1)),1000);
    return()=>window.clearInterval(timer);
  },[resendCooldown]);

  useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(user){const {data:profile}=await supabase.from("idea_profiles").select("account_status,first_name,last_name,state,country").eq("user_id",user.id).maybeSingle();if(profile?.account_status==="banned"){await supabase.auth.signOut();toast.error("Your Ideas account is banned.");}else if(profile){nav("/ideas/profile/me",{replace:true});}}setLoading(false)})()},[nav]);

  const sendCode=async()=>{
    const mail=email.trim().toLowerCase();
    if(!mail)return toast.error("Enter your Gmail address.");
    
    if(resendCooldown>0)return toast.info(`Please wait ${resendCooldown}s before requesting another code.`);
    setBusy(true);
    try{
      const {data:existing,error:lookupError}=await supabase.from("idea_profiles").select("user_id").eq("email",mail).maybeSingle();
      if(lookupError)throw lookupError;
      if(!existing)throw new Error("No existing Ideas account was found for this Gmail. Please create an Ideas account first.");
      const {error}=await supabase.auth.signInWithOtp({email:mail,options:{shouldCreateUser:false,emailRedirectTo:"https://crazyseoteam.in/ideas/login"}});
      if(error)throw error;
      setSent(true);setResendCooldown(60);toast.success("Verification code sent to your Gmail.");
    }catch(e:any){toast.error(e?.message||"Could not send verification code.");}finally{setBusy(false)}
  };

  if(loading)return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="size-8 animate-spin text-primary"/></div>;
  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-violet-50/50 grid place-items-center px-4"><Card className="w-full max-w-md overflow-hidden rounded-[28px] shadow-xl"><div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white"><h1 className="text-2xl font-black">Login to Ideas</h1><p className="mt-1 text-sm text-white/80">Click the Gmail verification link to login.</p></div><CardContent className="space-y-5 p-6 md:p-8"><div><label className="text-sm font-semibold">Gmail address</label><div className="relative mt-1"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><input type="email" className="h-12 w-full rounded-xl border bg-background pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@gmail.com"/></div></div>{sent&&<div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">Check your Gmail and click the verification link. This page will open your Ideas profile automatically.</div>}<Button className="h-12 w-full rounded-xl" onClick={sendCode} disabled={busy}>{busy?<Loader2 className="mr-2 size-4 animate-spin"/>:<LogIn className="mr-2 size-4"/>}{sent?"Send Again":"Send Gmail Login Link"}</Button><div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">Only an existing Ideas account can log in.</div><Link to="/ideas/account" className="block text-center text-sm font-semibold text-primary hover:underline">Create a new Ideas ID</Link><Link to="/ideas" className="block text-center text-sm text-muted-foreground hover:underline">Back to Ideas</Link></CardContent></Card></div>
}