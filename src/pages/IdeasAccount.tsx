import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card,CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {Loader2,UserPlus,ShieldCheck} from "lucide-react";

function generatePassword(){
  const bytes=new Uint8Array(24); crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("")+"A9!";
}

export default function IdeasAccount(){
  const nav=useNavigate();
  const [firstName,setFirstName]=useState("");
  const [middleName,setMiddleName]=useState("");
  const [lastName,setLastName]=useState("");
  const [state,setState]=useState("");
  const [country,setCountry]=useState("");
  const [email,setEmail]=useState("");
  const [saving,setSaving]=useState(false);

  const submit=async()=>{
    const first=firstName.trim(), middle=middleName.trim(), last=lastName.trim(), mail=email.trim().toLowerCase();
    if(!first||!last||!state.trim()||!country.trim()||!mail) return toast.error("First name, last name, state, country and email are required.");
    setSaving(true);
    try{
      const existing=await supabase.auth.getUser();
      if(existing.data.user) return toast.error("You are already logged in. Use Account/Profile to edit your details.");
      const password=generatePassword();
      const {data,error}=await supabase.auth.signUp({
        email:mail,
        password,
        options:{data:{first_name:first,middle_name:middle,last_name:last,full_name:[first,middle,last].filter(Boolean).join(" "),state:state.trim(),country:country.trim()}}
      });
      if(error) throw error;
      const user=data.user;
      if(!user) throw new Error("Account could not be created.");
      if(!data.session){
        const login=await supabase.auth.signInWithPassword({email:mail,password});
        if(login.error) throw new Error("Account created, but automatic login was blocked. Please check email confirmation settings.");
      }
      const current=(await supabase.auth.getUser()).data.user;
      if(!current) throw new Error("Automatic login failed.");
      const profile={user_id:current.id,display_name:[first,middle,last].filter(Boolean).join(" "),first_name:first,middle_name:middle,last_name:last,state:state.trim(),country:country.trim(),location:[state.trim(),country.trim()].filter(Boolean).join(", "),updated_at:new Date().toISOString()};
      const {error:profileError}=await supabase.from("idea_profiles").upsert(profile);
      if(profileError) throw profileError;
      toast.success("Account created and logged in successfully.");
      nav("/ideas/profile/me",{replace:true});
    }catch(e:any){toast.error(e?.message||"Could not create account.")}finally{setSaving(false)}
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
          <Button className="w-full rounded-xl" onClick={submit} disabled={saving}>{saving?<Loader2 className="mr-2 size-4 animate-spin"/>:<UserPlus className="mr-2 size-4"/>}Create Account & Continue</Button>
          <Button variant="ghost" className="w-full" onClick={()=>nav("/ideas")}>Back to Ideas</Button>
        </CardContent>
      </Card>
    </div>
  </div>;
}
