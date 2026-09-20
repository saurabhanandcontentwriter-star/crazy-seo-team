import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogIn, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function IdeasLogin(){
  const nav=useNavigate();
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [email,setEmail]=useState("");

  useEffect(()=>{
    let active=true;
    (async()=>{
      const {data:{user}}=await supabase.auth.getUser();
      if(!active)return;
      if(user){
        const {data:profile}=await supabase.from("idea_profiles").select("user_id,account_status").eq("user_id",user.id).maybeSingle();
        if(profile?.account_status==="banned"){
          toast.error("Your Ideas account is currently banned.");
          nav("/ideas/account",{replace:true});
        }else if(profile){
          nav("/ideas/profile/me",{replace:true});
        }else{
          nav("/ideas/account",{replace:true});
        }
      }
      setLoading(false);
    })();
    return()=>{active=false};
  },[nav]);

  const signIn=async()=>{
    const mail=email.trim().toLowerCase();
    if(!mail)return toast.error("Enter your Ideas account email.");
    setBusy(true);
    const {error}=await supabase.auth.signInWithOtp({
      email:mail,
      options:{emailRedirectTo:window.location.origin+"/ideas/login"}
    });
    if(error)toast.error(error.message);
    else toast.success("Login link sent. Check your email and open the link to continue.");
    setBusy(false);
  };

  if(loading)return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="size-8 animate-spin text-primary"/></div>;

  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-violet-50/50 grid place-items-center px-4">
    <Card className="w-full max-w-md overflow-hidden rounded-[28px] shadow-xl">
      <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white/15 p-3"><LogIn/></span>
          <div><h1 className="text-2xl font-black">Login to Ideas</h1><p className="text-sm text-white/80">Sign in to post, comment, like and join discussions.</p></div>
        </div>
      </div>
      <CardContent className="space-y-5 p-6 md:p-8">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Ideas Account Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
              <input className="h-12 w-full rounded-xl border bg-background px-10 text-sm outline-none focus:ring-2 focus:ring-primary" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/>
            </div>
          </div>
          <Button className="h-12 w-full rounded-xl" onClick={signIn} disabled={busy}>
            {busy?<Loader2 className="mr-2 size-4 animate-spin"/>:<LogIn className="mr-2 size-4"/>}
            Send Login Link
          </Button>
        </div>
        <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          <ShieldCheck className="mr-2 inline size-4 text-primary"/>
          Your Ideas account uses secure Supabase email authentication. Enter the email used for your Ideas ID and we will send a secure login link. No password is required.
        </div>
        <Link to="/ideas/account" className="block text-center text-sm font-semibold text-primary hover:underline">Create a new Ideas ID</Link>
        <Link to="/ideas" className="block text-center text-sm text-muted-foreground hover:underline">Back to Ideas</Link>
      </CardContent>
    </Card>
  </div>;
}
