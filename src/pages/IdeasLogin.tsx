import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";

const sessionKey = "ideas_direct_profile";

export default function IdeasLogin(){
  const nav=useNavigate();
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[email,setEmail]=useState("");

  useEffect(()=>{(async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(user){
      const {data:profile}=await supabase.from("idea_profiles").select("account_status").eq("user_id",user.id).maybeSingle();
      if(profile?.account_status==="banned"){await supabase.auth.signOut();toast.error("Your Ideas account is banned.");}
      else if(profile){nav("/ideas/profile/me",{replace:true});return}
    }
    const raw=sessionStorage.getItem(sessionKey);
    if(raw){try{const p=JSON.parse(raw);if(p?.email) setEmail(p.email)}catch{}}
    setLoading(false);
  })()},[nav]);

  const login=async()=>{
    const mail=email.trim().toLowerCase();
    if(!mail)return toast.error("Enter your Gmail address.");
    if(!/^[^\s@]+@gmail\.com$/i.test(mail))return toast.error("Please use a valid Gmail address.");
    setBusy(true);
    try{
      const {data:existing,error}=await supabase.from("idea_profiles").select("public_id,email,display_name,first_name,middle_name,last_name,state,country,location").eq("email",mail).maybeSingle();
      if(error)throw error;
      if(!existing)throw new Error("No existing Ideas account was found for this Gmail. Please create an Ideas account first.");
      const {data:authUser}=await supabase.auth.getUser();
      const {error:registryError}=await supabase.from("idea_account_registry").insert({public_id:existing.public_id,email:existing.email||mail,display_name:existing.display_name,first_name:existing.first_name,middle_name:existing.middle_name,last_name:existing.last_name,state:existing.state,country:existing.country,location:existing.location,user_id:authUser.user?.id||null,last_seen_at:new Date().toISOString()});
      if(registryError && !/duplicate key|already exists/i.test(registryError.message)) throw registryError;
      sessionStorage.setItem(sessionKey,JSON.stringify(existing));
      toast.success("Ideas account opened.");
      nav("/ideas/account",{replace:true});
    }catch(e:any){toast.error(e?.message||"Could not open Ideas account.");}
    finally{setBusy(false)}
  };

  if(loading)return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="size-8 animate-spin text-primary"/></div>;
  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-violet-50/50 grid place-items-center px-4"><Card className="w-full max-w-md overflow-hidden rounded-[28px] shadow-xl"><div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white"><h1 className="text-2xl font-black">Login to Ideas</h1><p className="mt-1 text-sm text-white/80">Enter your Gmail and open your Ideas account directly.</p></div><CardContent className="space-y-5 p-6 md:p-8"><div><label className="text-sm font-semibold">Gmail address</label><div className="relative mt-1"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><input type="email" className="h-12 w-full rounded-xl border bg-background pl-10 pr-3 outline-none focus:ring-2 focus:ring-primary" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@gmail.com"/></div></div><div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">Direct mode: no OTP, no verification email and no magic link.</div><Button className="h-12 w-full rounded-xl" onClick={login} disabled={busy}>{busy?<Loader2 className="mr-2 size-4 animate-spin"/>:<LogIn className="mr-2 size-4"/>}Open Ideas Account</Button><Link to="/ideas/account" className="block text-center text-sm font-semibold text-primary hover:underline">Create a new Ideas ID</Link><Link to="/ideas" className="block text-center text-sm text-muted-foreground hover:underline">Back to Ideas</Link></CardContent></Card></div>
}
