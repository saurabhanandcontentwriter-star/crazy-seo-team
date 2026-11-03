import { useEffect, useState } from "react";
import { Check, X, RefreshCw, Mail, Phone, Briefcase, Building2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Request = {
  id:string; user_id:string; email:string; full_name:string|null; phone:string|null;
  designation:string|null; department:string|null; employee_id:string|null; employee_note:string|null;
  status:"pending"|"approved"|"rejected"; created_at:string; review_note:string|null;
};
export default function CrmHrAccessRequests(){
  const [items,setItems]=useState<Request[]>([]);
  const [loading,setLoading]=useState(true);
  const [notes,setNotes]=useState<Record<string,string>>({});
  const load=async()=>{
    setLoading(true);
    try{
      const {data,error}=await supabase.functions.invoke("crm-team-auth",{body:{action:"list-crm-access-requests"}});
      if(error){
        let message=error.message||"Employee profiles could not load";
        const context=(error as any).context;
        if(context&&typeof context.clone==="function"){try{const payload=await context.clone().json();message=payload?.error||payload?.message||message;}catch{}}
        throw new Error(message);
      }
      if(data?.error)throw new Error(data.error);
      setItems(data?.requests||[]);
    }catch(e:any){toast.error(e?.message||"Employee profiles could not load");}
    finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[]);
  const review=async(item:Request,status:"approved"|"rejected")=>{
    const note=(notes[item.id]||"").trim();
    if(status==="rejected"&&!note){toast.error("Reject करने का कारण लिखें।");return;}
    try{
      const {data,error}=await supabase.functions.invoke("crm-team-auth",{body:{
        action:"review-crm-access-request",request_id:item.id,status,review_note:note
      }});
      if(error){
        let message=error.message||"Could not review employee profile";
        const context=(error as any).context;
        if(context&&typeof context.clone==="function"){try{const payload=await context.clone().json();message=payload?.error||payload?.message||message;}catch{}}
        throw new Error(message);
      }
      if(data?.error)throw new Error(data.error);
      toast.success(status==="approved"?"Employee approved. अब CRM access मिलेगा।":"Employee request rejected.");
      await load();
    }catch(e:any){toast.error(e?.message||"Could not review employee profile");}
  };
  const pending=items.filter(x=>x.status==="pending");
  const approved=items.filter(x=>x.status==="approved");
  const rejected=items.filter(x=>x.status==="rejected");
  const card=(item:Request)=><div key={item.id} className="rounded-2xl border p-4 space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-base font-black">{item.full_name||"Employee"}</p><p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Mail size={13}/>{item.email}</p><p className="mt-1 text-xs text-muted-foreground">Submitted: {new Date(item.created_at).toLocaleString()}</p></div>
      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${item.status==="approved"?"bg-emerald-500/10 text-emerald-700":item.status==="rejected"?"bg-rose-500/10 text-rose-700":"bg-amber-500/10 text-amber-700"}`}>{item.status}</span>
    </div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl bg-muted/40 p-3"><p className="text-[10px] text-muted-foreground">Mobile</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold"><Phone size={13}/>{item.phone||"Not provided"}</p></div>
      <div className="rounded-xl bg-muted/40 p-3"><p className="text-[10px] text-muted-foreground">Designation</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold"><Briefcase size={13}/>{item.designation||"Not provided"}</p></div>
      <div className="rounded-xl bg-muted/40 p-3"><p className="text-[10px] text-muted-foreground">Department</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold"><Building2 size={13}/>{item.department||"Not provided"}</p></div>
      <div className="rounded-xl bg-muted/40 p-3"><p className="text-[10px] text-muted-foreground">Employee ID</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold"><UserRound size={13}/>{item.employee_id||"Not provided"}</p></div>
    </div>
    {item.employee_note&&<div className="rounded-xl border p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Employee note</p><p className="mt-1 text-sm">{item.employee_note}</p></div>}
    {item.review_note&&<div className="rounded-xl border border-primary/20 bg-primary/5 p-3"><p className="text-[10px] font-bold uppercase text-primary">HR note</p><p className="mt-1 text-sm">{item.review_note}</p></div>}
    {item.status==="pending"&&<div className="space-y-2"><label className="text-xs font-semibold">HR Note (Reject करने पर जरूरी)<textarea value={notes[item.id]||""} onChange={e=>setNotes(old=>({...old,[item.id]:e.target.value}))} className="mt-1 min-h-16 w-full rounded-xl border bg-background p-3 text-sm" placeholder="Approval note या rejection reason"/></label><div className="flex flex-wrap gap-2"><Button size="sm" onClick={()=>void review(item,"approved")}><Check size={14} className="mr-1"/>Approve & Allow CRM</Button><Button size="sm" variant="destructive" onClick={()=>void review(item,"rejected")}><X size={14} className="mr-1"/>Reject</Button></div></div>}
  </div>;
  return <GlassCard className="p-5">
    <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">Employee Profile Approval</h2><p className="text-xs text-muted-foreground">Employee Gmail और submitted profile जाँचें। Approve करने पर ही CRM access खुलेगा।</p></div><Button size="sm" variant="outline" onClick={()=>void load()}><RefreshCw size={14} className="mr-1"/>Refresh</Button></div>
    {loading?<p className="py-6 text-sm text-muted-foreground">Loading employee profiles…</p>:<div className="mt-5 space-y-5">
      <section><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Pending Approval</h3><span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-700">{pending.length}</span></div><div className="space-y-3">{pending.map(card)}{!pending.length&&<p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">कोई pending employee profile नहीं है।</p>}</div></section>
      <section><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Approved Employees</h3><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700">{approved.length}</span></div><div className="space-y-3">{approved.map(card)}{!approved.length&&<p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">अभी कोई approved employee नहीं है।</p>}</div></section>
      <section><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Rejected Requests</h3><span className="rounded-full bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-700">{rejected.length}</span></div><div className="space-y-3">{rejected.map(card)}{!rejected.length&&<p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">अभी कोई rejected request नहीं है।</p>}</div></section>
    </div>}
  </GlassCard>;
}
