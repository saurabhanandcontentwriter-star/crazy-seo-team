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
  const [email,setEmail]=useState(""),[code,setCode]=useState(""),[sent,setSent]=useState(false);

  useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(user){const {data:profile}=await supabase.from("idea_profiles").select("account_status,first_name,last_name,state,country").eq("user_id",user.id).maybeSingle();if(profile?.account_status==="banned"){await supabase.auth.signOut();toast.error("Your Ideas account is banned.");}else if(profile){nav("/ideas/profile/me",{replace:true});}}setLoading(false)})()},[nav]);

  const sendCode=async()=>{
    const mail=email.trim().toLowerCase();
    if(!mail)return toast.error("Enter your Gmail address.");
    setBusy(true);
    try{
      const {data:existing,error:lookupError}=await supabase.from("idea_profiles").select("user_id").eq("email",mail).maybeSingle();
      if(lookupError)throw lookupError;
      if(!existing)throw new Error("No existing Ideas account was found for this Gmail. Please create an Ideas account first.");
      const {error}=await supabase.auth.signInWithOtp({email:mail,options:{shouldCreateUser:false,emailRedirectTo:"https://crazyseoteam.in/ideas/login"}});
      if(error)throw error;
      setSent(true);toast.success("Verification code sent to your Gmail.");
    }catch(e:any){toast.error(e?.message||"Could not send verification code.");}finally{setBusy(false)}
  };

  const verify=async()=>{
    if(!email.trim()||!/^\d{6}$/.test(code.trim()))return toast.error("Enter the 6-digit verification code.");
    setBusy(true);
    try{
      const {error}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:code.trim(),type:"email"});
      if(error)throw error;
      const {data:{user}}=await supabase.auth.getUser();
      if(!user)throw new Error("Verification succeeded but no session was created.");
      const {data:profile}=await supabase.from("idea_profiles").select("account_status,first_name,last_name,state,country").eq("user_id",user.id).maybeSingle();
      if(!profile)throw new Error("No existing Ideas account was found for this Gmail.");
      if(profile.account_status==="banned"){await supabase.auth.signOut();throw new Error("This Ideas account is banned.");}
      nav("/ideas/profile/me",{replace:true});
    }catch(e:any){toast.error(e?.message||"Invalid or expired verification code.");}finally{setBusy(false)}
  };

  if(loading)return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="size-8 animate-spin text-primary"/></div>;
  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-violet-50/50 grid place-items-center px-4"><Card className="w-full max-w-md overflow-hidden rounded-[28px] shadow-xl"><div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white"><h1 className="text-2xl font-black">Login to Ideas</h1><p className="mt-1 text-sm text-white/80">Gmail verification code is required.</p></div><CardContent className="space-y-5 p-6 md:p-8"><div><label className="text-sm font-semibold">Gmail address</label><div className="relative mt-1"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><input type="email" className="h-12 w-full rounded-xl border bg-background pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@gmail.com" disabled={sent}/></div></div>{sent&&<div><label className="text-sm font-semibold">Verification code</label><input inputMode="numeric" maxLength={6} className="mt-1 h-12 w-full rounded-xl border bg-background px-3 text-center text-2xl font-bold tracking-[0.35em] outline-none focus:ring-2 focus:ring-primary" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="000000"/></div>}<Button className="h-12 w-full rounded-xl" onClick={sent?verify:sendCode} disabled={busy}>{busy?<Loader2 className="mr-2 size-4 animate-spin"/>:<LogIn className="mr-2 size-4"/>}{sent?"Verify & Login":"Send Verification Code"}</Button>{sent&&<Button variant="outline" className="w-full rounded-xl" onClick={()=>{setSent(false);setCode("")}} disabled={busy}>Change Gmail</Button>}<div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">Only an existing Ideas account can log in. A new Gmail cannot create an account from this login screen.</div><Link to="/ideas/account" className="block text-center text-sm font-semibold text-primary hover:underline">Create a new Ideas ID</Link><Link to="/ideas" className="block text-center text-sm text-muted-foreground hover:underline">Back to Ideas</Link></CardContent></Card></div>;
}