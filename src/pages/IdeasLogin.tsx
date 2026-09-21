import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogIn, UserCircle2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function IdeasLogin(){
  const nav=useNavigate();
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [ideasId,setIdeasId]=useState("");

  useEffect(()=>{
    let active=true;
    (async()=>{
      const {data:{user}}=await supabase.auth.getUser();
      if(!active)return;
      if(user){
        const {data:profile}=await supabase.from("idea_profiles").select("user_id,account_status,first_name,last_name,state,country").eq("user_id",user.id).maybeSingle();
        if(profile?.account_status==="banned"){
          toast.error("Your Ideas account is currently banned.");
          nav("/ideas/account",{replace:true});
        }else if(profile && profile.first_name?.trim() && profile.last_name?.trim() && profile.state?.trim() && profile.country?.trim()){
          nav("/ideas/profile/me",{replace:true});
        }else{
          nav("/ideas/account",{replace:true});
        }
      }
      setLoading(false);
    })();
    return()=>{active=false};
  },[nav]);

  const googleLogin=async()=>{
    setBusy(true);
    try{
      const result=await lovable.auth.signInWithOAuth("google",{
        redirect_uri: window.location.origin + "/ideas/login",
        extraParams:{prompt:"select_account"},
      });
      if(result?.error) throw result.error;
      if(!result?.redirected){
        const {data:{session}}=await supabase.auth.getSession();
        if(!session) throw new Error("Google login did not create a session.");
        const {data:profile,error}=await supabase.from("idea_profiles").select("user_id,account_status").eq("user_id",session.user.id).maybeSingle();
        if(error) throw error;
        if(!profile){
          await supabase.auth.signOut();
          throw new Error("No existing Ideas account was found for this Gmail. Please create an Ideas account first.");
        }
      }
    }catch(e:any){
      toast.error(e?.message||"Google login failed.");
      setBusy(false);
    }
  };

  const signIn=async()=>{
    const id=ideasId.trim().toUpperCase();
    if(!id)return toast.error("Enter your Ideas ID.");
    setBusy(true);
    try{
      const {data:profile,error}=await supabase.from("idea_profiles").select("user_id,public_id,account_status").eq("public_id",id).maybeSingle();
      if(error)throw error;
      if(!profile){toast.error("Ideas ID not found. Please create your Ideas ID first.");return;}
      if(profile.account_status==="banned"){toast.error("This Ideas account is currently banned.");return;}
      nav("/ideas/profile/"+profile.user_id);
    }catch(e:any){toast.error(e?.message||"Could not find this Ideas ID.");}finally{setBusy(false)}
  };

  if(loading)return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="size-8 animate-spin text-primary"/></div>;

  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-violet-50/50 grid place-items-center px-4">
    <Card className="w-full max-w-md overflow-hidden rounded-[28px] shadow-xl">
      <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white/15 p-3"><LogIn/></span>
          <div><h1 className="text-2xl font-black">Login to Ideas</h1><p className="text-sm text-white/80">Sign in with Google or use your existing Ideas ID.</p></div>
        </div>
      </div>
      <CardContent className="space-y-5 p-6 md:p-8">
        <Button className="h-12 w-full rounded-xl bg-white text-slate-900 shadow-sm hover:bg-slate-50" variant="outline" onClick={googleLogin} disabled={busy}>
          {busy?<Loader2 className="mr-2 size-4 animate-spin"/>:<Mail className="mr-2 size-4"/>}
          Continue with Google
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border"/><span>OR</span><span className="h-px flex-1 bg-border"/></div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Ideas ID</label>
            <div className="relative mt-1">
              <UserCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
              <input className="h-12 w-full rounded-xl border bg-background px-10 text-sm uppercase outline-none focus:ring-2 focus:ring-primary" value={ideasId} onChange={(e)=>setIdeasId(e.target.value)} placeholder="CST-XXXXXXXXXX" autoComplete="off" onKeyDown={(e)=>{if(e.key==="Enter")signIn()}}/>
            </div>
          </div>
          <Button className="h-12 w-full rounded-xl" onClick={signIn} disabled={busy}>
            {busy?<Loader2 className="mr-2 size-4 animate-spin"/>:<LogIn className="mr-2 size-4"/>}
            Open Ideas Account
          </Button>
        </div>
        <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          Google login is only for existing Ideas accounts. A Gmail address cannot create a new Ideas account from this login screen.
        </div>
        <Link to="/ideas/account" className="block text-center text-sm font-semibold text-primary hover:underline">Create a new Ideas ID</Link>
        <Link to="/ideas" className="block text-center text-sm text-muted-foreground hover:underline">Back to Ideas</Link>
      </CardContent>
    </Card>
  </div>;
}
