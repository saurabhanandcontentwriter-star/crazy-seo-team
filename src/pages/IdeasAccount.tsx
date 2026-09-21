import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card,CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {Loader2,UserPlus,ShieldCheck,Trash2,AlertTriangle} from "lucide-react";

export default function IdeasAccount(){
  const nav=useNavigate();
  const [firstName,setFirstName]=useState(""),[middleName,setMiddleName]=useState(""),[lastName,setLastName]=useState("");
  const [state,setState]=useState(""),[country,setCountry]=useState(""),[email,setEmail]=useState("");
  const [saving,setSaving]=useState(false),[deleting,setDeleting]=useState(false),[createdId,setCreatedId]=useState("");
  const [checking,setChecking]=useState(true),[currentUserId,setCurrentUserId]=useState("");
  const [banned,setBanned]=useState<{reason:string}|null>(null);

  useEffect(()=>{
    let active=true;
    (async()=>{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){if(active)setChecking(false);return}
      if(active){setCurrentUserId(user.id);setEmail(user.email||"");}
      const {data:profile}=await supabase.from("idea_profiles").select("user_id,public_id,account_status,ban_reason,first_name,middle_name,last_name,state,country").eq("user_id",user.id).maybeSingle();
      if(!active)return;
      if(profile?.account_status==="banned") setBanned({reason:profile.ban_reason||""});
      else if(profile){
        setFirstName(profile.first_name||""); setMiddleName(profile.middle_name||""); setLastName(profile.last_name||""); setState(profile.state||""); setCountry(profile.country||"");
        const complete=Boolean(profile.first_name?.trim()&&profile.last_name?.trim()&&profile.state?.trim()&&profile.country?.trim());
        if(complete) nav("/ideas/profile/me",{replace:true});
      }
      setChecking(false);
    })();
    return()=>{active=false};
  },[nav]);

  const [code,setCode]=useState("");
  const [codeSent,setCodeSent]=useState(false);
  const [verifying,setVerifying]=useState(false);

  const makeIdeasId=()=>`CST-${Math.random().toString(36).slice(2,12).toUpperCase()}`;

  const sendCode=async()=>{
    const first=firstName.trim(),last=lastName.trim(),mail=email.trim().toLowerCase();
    if(!first||!last||!state.trim()||!country.trim()||!mail)return toast.error("First name, last name, state, country and email are required.");
    if(!/^[^\s@]+@gmail\.com$/i.test(mail))return toast.error("Please use a valid Gmail address.");
    setSaving(true);
    try{
      const existing=await supabase.from("idea_profiles").select("user_id").eq("email",mail).maybeSingle();
      if(existing.error)throw existing.error;
      if(existing.data)return toast.error("An Ideas account already exists for this Gmail. Please login with Gmail Code.");
      const {error}=await supabase.auth.signInWithOtp({email:mail,options:{shouldCreateUser:true}});
      if(error)throw error;
      setCodeSent(true);
      toast.success("Verification code sent to your Gmail.");
    }catch(e:any){toast.error(e?.message||"Could not send verification code.");}
    finally{setSaving(false);}
  };

  const submit=async()=>{
    const first=firstName.trim(),middle=middleName.trim(),last=lastName.trim(),mail=email.trim().toLowerCase(),otp=code.trim();
    if(!otp||otp.length!==6)return toast.error("Enter the 6-digit Gmail verification code.");
    setVerifying(true);
    try{
      const {data,error}=await supabase.auth.verifyOtp({email:mail,token:otp,type:"email"});
      if(error)throw error;
      if(!data.user)throw new Error("Gmail verification failed. Please request a new code.");
      const publicId=makeIdeasId();
      const profile=await supabase.from("idea_profiles").insert({
        user_id:data.user.id,email:mail,public_id:publicId,
        display_name:[first,middle,last].filter(Boolean).join(" "),
        first_name:first,middle_name:middle,last_name:last,
        state:state.trim(),country:country.trim(),location:state.trim()+", "+country.trim(),
        updated_at:new Date().toISOString()
      });
      if(profile.error){
        await supabase.auth.signOut();
        throw profile.error;
      }
      setCreatedId(publicId);
      window.alert(`SAVE YOUR UNIQUE IDEAS ID\\n\\n${publicId}\\n\\nPlease save or screenshot this ID now.`);
      toast.success("Gmail verified and Ideas account created successfully.");
    }catch(e:any){toast.error(e?.message||"Could not verify Gmail code.");}
    finally{setVerifying(false);}
  };

  const permanentlyDelete=async()=>{
    const current=await supabase.auth.getUser();
    if(!current.data.user)return nav("/ideas/account",{replace:true});
    if(!window.confirm("PERMANENT DELETE: This will permanently delete your Ideas account and linked Ideas data. This cannot be undone. Continue?"))return;
    const second=window.prompt("Type DELETE to confirm permanent account deletion.");
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

  if(checking)return <div className="min-h-screen bg-background grid place-items-center"><Loader2 className="size-8 animate-spin text-primary"/></div>;

  if(banned)return <div className="min-h-screen bg-background"><div className="container mx-auto max-w-2xl px-4 py-8 md:py-14"><Card className="rounded-[28px] border-destructive/30"><CardContent className="space-y-5 p-6 md:p-8"><div className="flex items-start gap-3"><AlertTriangle className="mt-1 text-destructive"/><div><h1 className="text-3xl font-black">Ideas Account Banned</h1><p className="mt-2 text-muted-foreground">Your Ideas account is currently banned and cannot be used for community activity.</p>{banned.reason&&<p className="mt-3 rounded-xl bg-muted p-3 text-sm"><strong>Reason:</strong> {banned.reason}</p>}</div></div><Button variant="destructive" onClick={permanentlyDelete} disabled={deleting}>{deleting?<Loader2 className="mr-2 size-4 animate-spin"/>:<Trash2 className="mr-2 size-4"/>}{deleting?"Deleting Permanently...":"Delete Account Permanently"}</Button><Button variant="ghost" className="w-full" onClick={()=>nav("/ideas")}>Back to Ideas</Button></CardContent></Card></div></div>;

  if(createdId)return <div className="min-h-screen bg-background"><div className="container mx-auto max-w-2xl px-4 py-8 md:py-14"><Card className="overflow-hidden rounded-[28px]"><div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white"><h1 className="text-3xl font-black">Your Ideas ID is Ready</h1><p className="mt-2 text-white/80">Save this unique ID. You will need it to open your Ideas account in the future.</p></div><CardContent className="space-y-5 p-6 md:p-8"><div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Your Unique Ideas ID</p><p className="mt-3 break-all text-3xl font-black tracking-wider">{createdId}</p></div><div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground"><strong className="text-foreground">Important:</strong> Please save or screenshot this ID now. Keep it private and do not lose it.</div><div className="grid gap-3 sm:grid-cols-2"><Button variant="outline" className="rounded-xl" onClick={async()=>{await navigator.clipboard.writeText(createdId);toast.success("Ideas ID copied.");}}>Copy Ideas ID</Button><Button className="rounded-xl" onClick={()=>nav("/ideas/profile/me",{replace:true})}>Continue to Profile</Button></div></CardContent></Card></div></div>;



  return <div className="min-h-screen bg-background"><div className="container mx-auto max-w-2xl px-4 py-8 md:py-14"><Card className="overflow-hidden rounded-[28px]"><div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white"><div className="flex items-center gap-3"><span className="rounded-2xl bg-white/15 p-3"><UserPlus/></span><div><h1 className="text-3xl font-black">Create Ideas Account</h1><p className="mt-1 text-white/80">Create your public community profile in one step.</p></div></div></div><CardContent className="space-y-5 p-6 md:p-8">
    <div className="grid gap-4 md:grid-cols-3"><div className="grid gap-2"><Label>First Name *</Label><Input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name"/></div><div className="grid gap-2"><Label>Middle Name</Label><Input value={middleName} onChange={e=>setMiddleName(e.target.value)} placeholder="Middle name"/></div><div className="grid gap-2"><Label>Last Name *</Label><Input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name"/></div></div>
    <div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label>State *</Label><Input value={state} onChange={e=>setState(e.target.value)} placeholder="State"/></div><div className="grid gap-2"><Label>Country *</Label><Input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country"/></div></div>
    <div className="grid gap-2"><Label>Email *</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
    <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground"><ShieldCheck className="mr-2 inline size-4 text-primary"/>A 6-digit verification code will be sent to your Gmail. Your Ideas account is created only after the code is verified.</div>
    {!codeSent ? <Button className="w-full rounded-xl" onClick={sendCode} disabled={saving}>{saving?<Loader2 className="mr-2 size-4 animate-spin"/>:<ShieldCheck className="mr-2 size-4"/>}Send Gmail Verification Code</Button> :
      <div className="space-y-3">
        <div className="grid gap-2"><Label>Gmail Verification Code *</Label><Input inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="Enter 6-digit code"/></div>
        <Button className="w-full rounded-xl" onClick={submit} disabled={verifying}>{verifying?<Loader2 className="mr-2 size-4 animate-spin"/>:<ShieldCheck className="mr-2 size-4"/>}Verify Code & Create Account</Button>
        <Button variant="outline" className="w-full rounded-xl" onClick={sendCode} disabled={saving}>Resend Code</Button>
      </div>}
    <Button variant="ghost" className="w-full" onClick={()=>nav("/ideas")}>Back to Ideas</Button>
  </CardContent></Card></div></div>;
}
