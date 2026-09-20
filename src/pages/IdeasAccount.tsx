import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card,CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {Loader2,UserPlus,ShieldCheck,Trash2,AlertTriangle} from "lucide-react";

function generatePassword(){
  const bytes=new Uint8Array(24); crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("")+"A9!";
}

export default function IdeasAccount(){
  const nav=useNavigate();
  const [firstName,setFirstName]=useState(""),[middleName,setMiddleName]=useState(""),[lastName,setLastName]=useState("");
  const [state,setState]=useState(""),[country,setCountry]=useState(""),[email,setEmail]=useState("");
  const [saving,setSaving]=useState(false),[deleting,setDeleting]=useState(false);

  const submit=async()=>{
    const first=firstName.trim(),middle=middleName.trim(),last=lastName.trim(),mail=email.trim().toLowerCase();
    if(!first||!last||!state.trim()||!country.trim()||!mail)return toast.error("First name, last name, state, country and email are required.");
    setSaving(true);
    try{
      const existing=await supabase.auth.getUser();
      if(existing.data.user)return toast.error("You already have an Ideas ID. Open your Profile to edit it.");
      const {data,error}=await supabase.functions.invoke("idea-create-account",{body:{firstName:first,middleName:middle,lastName:last,state:state.trim(),country:country.trim(),email:mail}});
      if(error)throw error;if(data?.error)throw new Error(data.error);if(!data?.password)throw new Error("Account was created but automatic login credentials were not returned.");
      const login=await supabase.auth.signInWithPassword({email:mail,password:data.password});if(login.error)throw login.error;
      toast.success("Account created and logged in successfully.");nav("/ideas/profile/me",{replace:true});
    }catch(e:any){toast.error(e?.message||"Could not create account.")}finally{setSaving(false)}
  };

  const permanentlyDelete=async()=>{
    const current=await supabase.auth.getUser();
    if(!current.data.user)return nav("/ideas/account",{replace:true});
    const first=window.confirm("PERMANENT DELETE: This will permanently delete your Ideas account and linked Ideas data. This cannot be undone. Continue?");
    if(!first)return;
    const second=window.prompt('Type DELETE to confirm permanent account deletion.');
    if(second!=="DELETE")return toast.error("Deletion cancelled. You must type DELETE.");
    setDeleting(true);
    try{
      const {data,error}=await supabase.functions.invoke("crm-ideas-users",{body:{action:"delete_self"}});
      if(error){
        let message=error.message;
        const ctx=(error as any).context;
        if(ctx){const body=await ctx.json().catch(()=>null);if(body?.error)message=body.error;}
        throw new Error(message);
      }
      if(data?.error)throw new Error(data.error);
      await supabase.auth.signOut();
      toast.success("Your Ideas account was permanently deleted.");
      nav("/ideas",{replace:true});
    }catch(e:any){toast.error(e?.message||"Could not permanently delete the account.")}finally{setDeleting(false)}
  };

  return <div className="min-h-screen bg-background">
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-14">
      <Card className="overflow-hidden rounded-[28px]">
        <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white">
          <div className="flex items-center gap-3"><span className="rounded-2xl bg-white/15 p-3"><UserPlus/></span><div><h1 className="text-3xl font-black">Create Ideas Account</h1><p className="mt-1 text-white/80">Create your public community profile in one step.</p></div></div>
        </div>
        <CardContent className="space-y-5 p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2"><Label>First Name *</Label><Input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name"/></div>
            <div className="grid gap-2"><Label>Middle Name</Label><Input value={middleName} onChange={e=>setMiddleName(e.target.value)} placeholder="Middle name"/></div>
            <div className="grid gap-2"><Label>Last Name *</Label><Input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name"/></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2"><Label>State *</Label><Input value={state} onChange={e=>setState(e.target.value)} placeholder="State"/></div>
            <div className="grid gap-2"><Label>Country *</Label><Input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country"/></div>
          </div>
          <div className="grid gap-2"><Label>Email *</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
          <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground"><ShieldCheck className="mr-2 inline size-4 text-primary"/>No password field is required. A secure random password is generated automatically and the account is logged in after submission.</div>
          <Button className="w-full rounded-xl" onClick={submit} disabled={saving||deleting}>{saving?<Loader2 className="mr-2 size-4 animate-spin"/>:<UserPlus className="mr-2 size-4"/>}Create Account & Continue</Button>
          <Button variant="ghost" className="w-full" onClick={()=>nav("/ideas")}>Back to Ideas</Button>
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-start gap-3"><AlertTriangle className="mt-1 text-destructive"/><div className="flex-1"><h2 className="font-black">Delete Ideas Account</h2><p className="mt-1 text-sm text-muted-foreground">Permanently delete your Ideas ID, profile, posts and linked Ideas account data. This action cannot be undone.</p><Button variant="destructive" className="mt-4" onClick={permanentlyDelete} disabled={deleting||saving}>{deleting?<Loader2 className="mr-2 size-4 animate-spin"/>:<Trash2 className="mr-2 size-4"/>}{deleting?"Deleting Permanently...":"Delete Account Permanently"}</Button></div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>;
}
