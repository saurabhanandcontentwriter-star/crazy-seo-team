import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";

type EmployeeProfile = { full_name:string; phone:string; designation:string; department:string; employee_id:string; employee_note:string };
const emptyProfile:EmployeeProfile = {full_name:"",phone:"",designation:"",department:"",employee_id:"",employee_note:""};

export default function CrmEmployeeLogin() {
  const navigate = useNavigate();
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [signedEmail,setSignedEmail]=useState("");
  const [profile,setProfile]=useState<EmployeeProfile>(emptyProfile);
  const [status,setStatus]=useState<"not_requested"|"pending"|"approved"|"rejected">("not_requested");
  const OAUTH_PENDING_KEY="cst_employee_google_oauth_pending";

  useEffect(()=>{
    let cancelled=false;
    const loadEmployeeAccess=async()=>{
      try{
        const {data:{session}}=await supabase.auth.getSession();
        if(!session?.user){if(!cancelled)setLoading(false);return;}
        const {data,error}=await supabase.functions.invoke("crm-team-auth",{body:{action:"get-employee-access"}});
        if(error)throw error;
        if(data?.error)throw new Error(data.error);
        if(cancelled)return;
        setSignedEmail(session.user.email||"");
        setStatus(data?.status||"not_requested");
        if(data?.profile)setProfile({
          full_name:data.profile.full_name||session.user.user_metadata?.full_name||session.user.user_metadata?.name||"",
          phone:data.profile.phone||"",
          designation:data.profile.designation||"",
          department:data.profile.department||"",
          employee_id:data.profile.employee_id||"",
          employee_note:data.profile.employee_note||"",
        });
        else setProfile(p=>({...p,full_name:session.user.user_metadata?.full_name||session.user.user_metadata?.name||""}));
        if(data?.success===true){sessionStorage.removeItem(OAUTH_PENDING_KEY);navigate("/admin/crm",{replace:true});return;}
      }catch(error){if(!cancelled)toast.error(error instanceof Error?error.message:"Account verification failed.");}
      finally{if(!cancelled)setLoading(false);}
    };
    void loadEmployeeAccess();
    return()=>{cancelled=true;};
  },[navigate]);

  const continueWithGoogle=async()=>{
    setBusy(true);
    try{
      await supabase.auth.signOut({scope:"local"}).catch(()=>undefined);
      sessionStorage.setItem(OAUTH_PENDING_KEY,"1");
      const {data,error}=await supabase.auth.signInWithOAuth({
        provider:"google",
        options:{redirectTo:`${window.location.origin}/employee/login`,queryParams:{prompt:"select_account"}},
      });
      if(error)throw error;
      if(data?.url)window.location.assign(data.url);
      else{sessionStorage.removeItem(OAUTH_PENDING_KEY);setBusy(false);}
    }catch(error){
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      toast.error(error instanceof Error?error.message:"Google login शुरू नहीं हो सका।");
      setBusy(false);
    }
  };

  const submitProfile=async()=>{
    if(!profile.full_name.trim()||!profile.phone.trim()||!profile.designation.trim()||!profile.department.trim()){
      toast.error("नाम, मोबाइल, पद और विभाग भरना जरूरी है।");return;
    }
    setBusy(true);
    try{
      const {data,error}=await supabase.functions.invoke("crm-team-auth",{
        body:{action:"submit-employee-profile",...profile},
      });
      if(error){
        let message=error.message||"Profile submit नहीं हुआ।";
        const context=(error as any).context;
        if(context&&typeof context.clone==="function"){try{const payload=await context.clone().json();message=payload?.error||payload?.message||message;}catch{}}
        throw new Error(message);
      }
      if(data?.error)throw new Error(data.error);
      setStatus(data?.status||"pending");
      toast.success("Profile HR Panel में भेज दिया गया है। HR approval के बाद CRM खुलेगा।");
    }catch(error){toast.error(error instanceof Error?error.message:"Profile submit नहीं हुआ।");}
    finally{setBusy(false);}
  };

  const update=(key:keyof EmployeeProfile,value:string)=>setProfile(p=>({...p,[key]:value}));

  if(loading)return <main className="min-h-screen grid place-items-center bg-background"><Loader2 className="animate-spin text-primary" size={28}/></main>;

  return <main className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
    <GlassCard className="w-full max-w-xl p-6 md:p-8">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole size={26}/></div>
      <div className="text-center">
        <h1 className="text-2xl font-black">Crazy SEO Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">Employee Portal · Gmail Verification</p>
      </div>
      {!signedEmail?<button type="button" onClick={continueWithGoogle} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border bg-background px-4 py-3 font-semibold hover:bg-muted disabled:opacity-50">
        <span className="grid size-7 place-items-center rounded-full bg-white text-sm font-black shadow-sm">G</span>{busy?"Google खुल रहा है...":"Gmail से लॉगिन करें"}
      </button>:<>
        <div className="mt-5 rounded-xl border bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">Google account</p><p className="font-semibold">{signedEmail}</p>
        </div>
        {status==="approved"?<div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center"><p className="font-bold text-emerald-700">HR approval मिल गया है।</p><button onClick={()=>navigate("/admin/crm",{replace:true})} className="mt-3 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Open CRM</button></div>
        :status==="pending"&&profile.phone&&profile.designation&&profile.department?<div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"><p className="font-bold">HR Approval Pending</p><p className="mt-1 text-sm">आपका Profile HR Panel में भेजा जा चुका है। HR के approve करने के बाद CRM खुलेगा।</p><button onClick={()=>void loadAgain()} className="mt-3 text-sm font-semibold text-primary">Approval status refresh करें</button></div>
        :<div className="mt-6">
          <div className="mb-4 flex items-center gap-2"><UserRound size={18}/><div><h2 className="font-black">Employee Profile Form</h2><p className="text-xs text-muted-foreground">यह जानकारी HR Panel में approval के लिए जाएगी।</p></div></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">पूरा नाम *<input value={profile.full_name} onChange={e=>update("full_name",e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3 text-sm" placeholder="Employee full name"/></label>
            <label className="text-xs font-semibold">मोबाइल नंबर *<input value={profile.phone} onChange={e=>update("phone",e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3 text-sm" placeholder="Mobile number" inputMode="tel"/></label>
            <label className="text-xs font-semibold">पद / Designation *<input value={profile.designation} onChange={e=>update("designation",e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3 text-sm" placeholder="SEO Executive"/></label>
            <label className="text-xs font-semibold">विभाग / Department *<input value={profile.department} onChange={e=>update("department",e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3 text-sm" placeholder="SEO / Content / Sales"/></label>
            <label className="text-xs font-semibold sm:col-span-2">Employee ID (यदि मिला हो)<input value={profile.employee_id} onChange={e=>update("employee_id",e.target.value)} className="mt-1 w-full rounded-xl border bg-background p-3 text-sm" placeholder="Optional"/></label>
            <label className="text-xs font-semibold sm:col-span-2">HR के लिए अतिरिक्त जानकारी<textarea value={profile.employee_note} onChange={e=>update("employee_note",e.target.value)} className="mt-1 min-h-20 w-full rounded-xl border bg-background p-3 text-sm" placeholder="Optional"/></label>
          </div>
          <button type="button" onClick={submitProfile} disabled={busy} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">{busy?"Submitting...":"Submit Profile for HR Approval"}</button>
        </div>}
      </>}
      <p className="mt-4 text-center text-xs text-muted-foreground">HR approval के बिना Employee CRM access नहीं मिलेगा।</p>
    </GlassCard>
  </main>;

  async function loadAgain(){
    setLoading(true);
    try{
      const {data,error}=await supabase.functions.invoke("crm-team-auth",{body:{action:"get-employee-access"}});
      if(error)throw error;
      setStatus(data?.status||"not_requested");
      if(data?.success===true)navigate("/admin/crm",{replace:true});
      else if(data?.profile)setProfile(p=>({...p,full_name:data.profile.full_name||p.full_name,phone:data.profile.phone||"",designation:data.profile.designation||"",department:data.profile.department||"",employee_id:data.profile.employee_id||"",employee_note:data.profile.employee_note||""}));
    }catch(error){toast.error(error instanceof Error?error.message:"Status refresh failed.");}
    finally{setLoading(false);}
  }
}
