import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function IdeasLogin(){
  const nav=useNavigate();
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);

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
    setBusy(true);
    try{
      const {data:{user}}=await supabase.auth.getUser();
      if(user){
        const {data:profile}=await supabase.from("idea_profiles").select("user_id,account_status").eq("user_id",user.id).maybeSingle();
        if(profile?.account_status==="banned"){toast.error("This Ideas account is currently banned.");return;}
        if(profile){nav("/ideas/profile/me",{replace:true});return;}
      }
      nav("/ideas/account",{replace:true});
    }catch(e:any){toast.error(e?.message||"Could not open your Ideas account.");}
    finally{setBusy(false);}
  };

  if(loading)return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="size-8 animate-spin text-primary"/></div>;

  return <div className="min-h-screen bg-gradient-to-b from-background via-background to-violet-50/50 grid place-items-center px-4">
    <Card className="w-full max-w-md overflow-hidden rounded-[28px] shadow-xl">
      <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white/15 p-3"><LogIn/></span>
          <div><h1 className="text-2xl font-black">Login to Ideas</h1><p className="text-sm text-white/80">Open your existing Ideas account.</p></div>
        </div>
      </div>
      <CardContent className="space-y-5 p-6 md:p-8">
        <div className="space-y-3">
          <Button className="h-12 w-full rounded-xl" onClick={signIn} disabled={busy}>
            {busy?<Loader2 className="mr-2 size-4 animate-spin"/>:<LogIn className="mr-2 size-4"/>}
            Login / Open Account
          </Button>
        </div>
        <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          If you already have an Ideas ID, your account will open. If you do not have an Ideas ID yet, create one first.
        </div>
        <Link to="/ideas/account" className="block text-center text-sm font-semibold text-primary hover:underline">Create a new Ideas ID</Link>
        <Link to="/ideas" className="block text-center text-sm text-muted-foreground hover:underline">Back to Ideas</Link>
      </CardContent>
    </Card>
  </div>;
}
