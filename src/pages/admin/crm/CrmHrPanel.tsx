import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, IndianRupee, UserRound, WalletCards, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { indiaDate } from "@/lib/attendance";

type Member = { id:string; auth_user_id:string|null; name:string; email:string; login_id:string|null; position:string|null };
type Profile = { id:string; user_id:string; joining_date:string|null; designation:string|null; department:string|null; monthly_salary:number; paid_leave_balance:number };
type Holiday = { id:string; holiday_date:string; name:string; reason:string|null };
type Leave = { id:string; user_id:string; leave_type:"paid"|"unpaid"; start_date:string; end_date:string; total_days:number; reason:string; status:"pending"|"approved"|"rejected"; review_note:string|null; created_at:string };

const workingDays = (start:string,end:string,holidays:Set<string>) => {
  let d = new Date(start+"T00:00:00"), last = new Date(end+"T00:00:00"), n=0;
  while(d<=last){ const day=d.getDay(); const key=d.toISOString().slice(0,10); if(day!==0&&day!==6&&!holidays.has(key)) n++; d.setDate(d.getDate()+1); }
  return n;
};
const monthRange = (value:string) => { const [y,m]=value.split("-").map(Number); const start=`${y}-${String(m).padStart(2,"0")}-01`; const last=new Date(y,m,0).getDate(); return {start,end:`${y}-${String(m).padStart(2,"0")}-${String(last).padStart(2,"0")}`}; };
const money = (n:number) => `₹${Math.max(0,Number(n)||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`;

export default function CrmHrPanel(){
  const [user,setUser]=useState<any>(null); const [admin,setAdmin]=useState(false); const [members,setMembers]=useState<Member[]>([]);
  const [profiles,setProfiles]=useState<Profile[]>([]); const [holidays,setHolidays]=useState<Holiday[]>([]); const [leaves,setLeaves]=useState<Leave[]>([]);
  const [tab,setTab]=useState<"leave"|"profile"|"salary">("leave"); const [month,setMonth]=useState(indiaDate().slice(0,7)); const [loading,setLoading]=useState(true);
  const [form,setForm]=useState({type:"paid" as "paid"|"unpaid",start:indiaDate(),end:indiaDate(),reason:""});
  const [saving,setSaving]=useState(false); const [salaryDraft,setSalaryDraft]=useState<Record<string,string>>({});

  const load=async()=>{
    setLoading(true); try{
      const {data:ud,error:ue}=await supabase.auth.getUser(); if(ue) throw ue; if(!ud.user) throw new Error("Please sign in again."); setUser(ud.user);
      const {data:role}=await (supabase as any).from("user_roles").select("role").eq("user_id",ud.user.id).eq("role","admin").maybeSingle(); setAdmin(!!role);
      const [tm,p,h,l]=await Promise.all([
        (supabase as any).from("crm_team_members").select("id,auth_user_id,name,email,login_id,position").eq("status","active").order("name"),
        (supabase as any).from("crm_employee_profiles").select("*"),
        (supabase as any).from("crm_holidays").select("*").order("holiday_date"),
        (supabase as any).from("crm_leave_requests").select("*").order("created_at",{ascending:false})
      ]);
      for(const x of [tm,p,h,l]) if(x.error) throw x.error;
      setMembers(tm.data||[]); setProfiles(p.data||[]); setHolidays(h.data||[]); setLeaves(l.data||[]);
    }catch(e:any){toast.error(e?.message||"HR data could not load");} finally{setLoading(false);}
  };
  useEffect(()=>{void load()},[]);

  const myMember=useMemo(()=>members.find(m=>m.auth_user_id===user?.id),[members,user]);
  const myProfile=useMemo(()=>profiles.find(p=>p.user_id===user?.id),[profiles,user]);
  const holidaySet=useMemo(()=>new Set(holidays.map(h=>h.holiday_date)),[holidays]);
  const visibleLeaves=useMemo(()=>admin?leaves:leaves.filter(l=>l.user_id===user?.id),[admin,leaves,user]);
  const range=monthRange(month);
  const monthWorking=useMemo(()=>workingDays(range.start,range.end,holidaySet),[range,holidaySet]);
  const approvedPaid=useMemo(()=>visibleLeaves.filter(l=>l.user_id===user?.id&&l.status==="approved"&&l.leave_type==="paid"&&l.start_date<=range.end&&l.end_date>=range.start).reduce((n,l)=>n+workingDays(l.start_date>range.start?l.start_date:range.start,l.end_date<range.end?l.end_date:range.end,holidaySet),0),[visibleLeaves,range,holidaySet,user]);
  const approvedUnpaid=useMemo(()=>visibleLeaves.filter(l=>l.user_id===user?.id&&l.status==="approved"&&l.leave_type==="unpaid"&&l.start_date<=range.end&&l.end_date>=range.start).reduce((n,l)=>n+workingDays(l.start_date>range.start?l.start_date:range.start,l.end_date<range.end?l.end_date:range.end,holidaySet),0),[visibleLeaves,range,holidaySet,user]);

  const applyLeave=async()=>{
    if(!form.reason.trim()) return toast.error("Leave reason is required.");
    const days=workingDays(form.start,form.end,holidaySet); if(days<1) return toast.error("Selected dates contain no working day.");
    if(form.type==="paid" && myProfile && days>myProfile.paid_leave_balance) return toast.error(`Paid leave balance is only ${myProfile.paid_leave_balance} days.`);
    setSaving(true); try{
      const overlap=leaves.some(l=>l.user_id===user?.id&&l.status!=="rejected"&&l.start_date<=form.end&&l.end_date>=form.start);
      if(overlap) throw new Error("These dates overlap an existing leave request.");
      const {error}=await (supabase as any).from("crm_leave_requests").insert({user_id:user.id,leave_type:form.type,start_date:form.start,end_date:form.end,total_days:days,reason:form.reason.trim(),status:"pending"});
      if(error) throw error; toast.success("Leave application submitted."); setForm({...form,reason:""}); await load();
    }catch(e:any){toast.error(e?.message||"Could not apply leave");}finally{setSaving(false);}
  };

  const review=async(id:string,status:"approved"|"rejected")=>{
    try{const {error}=await (supabase as any).from("crm_leave_requests").update({status,reviewed_by:user.id,reviewed_at:new Date().toISOString()}).eq("id",id); if(error) throw error; toast.success(`Leave ${status}.`); await load();}catch(e:any){toast.error(e?.message||"Could not update leave");}
  };

  const saveSalary=async(uid:string)=>{
    const value=Number(salaryDraft[uid]); if(!Number.isFinite(value)||value<0) return toast.error("Enter a valid salary.");
    try{const {data,error}=await (supabase as any).from("crm_employee_profiles").update({monthly_salary:value,updated_at:new Date().toISOString()}).eq("user_id",uid).select("*").single(); if(error) throw error; setProfiles(p=>p.map(x=>x.user_id===uid?data:x)); toast.success("Salary updated.");}catch(e:any){toast.error(e?.message||"Could not update salary");}
  };

  const monthAttendance=async()=>{
    if(!user) return null;
    const {data,error}=await (supabase as any).from("crm_attendance").select("work_date,punch_in").eq("user_id",user.id).gte("work_date",range.start).lte("work_date",range.end);
    if(error) throw error; return (data||[]).filter((x:any)=>x.punch_in).length;
  };
  const [present,setPresent]=useState(0);
  useEffect(()=>{let on=true;(async()=>{try{const n=await monthAttendance();if(on&&n!==null)setPresent(n)}catch{}})();return()=>{on=false}},[month,user]);

  const netIncome=useMemo(()=>{const salary=Number(myProfile?.monthly_salary||0); const absent=Math.max(0,monthWorking-present-approvedPaid-approvedUnpaid); const deduction=monthWorking?approvedUnpaid*(salary/monthWorking):0; return {salary,absent,net:Math.max(0,salary-deduction)}},[myProfile,monthWorking,present,approvedPaid,approvedUnpaid]);

  if(loading) return <GlassCard className="p-5"><p className="text-sm text-muted-foreground">Loading HR & salary data…</p></GlassCard>;

  const tabs=[["leave","Leave & Approvals"],["profile","My Profile"],["salary","Monthly Income"]] as const;
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2 rounded-2xl border bg-background/60 p-1">{tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`rounded-xl px-4 py-2 text-xs font-bold ${tab===id?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-muted"}`}>{label}</button>)}</div>

    {tab==="leave" && <div className="grid gap-4 xl:grid-cols-3">
      <GlassCard className="p-5"><p className="font-black text-lg">Apply Leave</p><p className="text-xs text-muted-foreground mt-1">Paid / unpaid leave with reason and working-day calculation.</p>
        <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={()=>setForm({...form,type:"paid"})} className={`rounded-xl border p-3 text-left text-xs font-bold ${form.type==="paid"?"border-primary bg-primary/10":"bg-background"}`}>Paid Leave<span className="block mt-1 text-[10px] font-normal text-muted-foreground">Balance: {myProfile?.paid_leave_balance??0} days</span></button><button onClick={()=>setForm({...form,type:"unpaid"})} className={`rounded-xl border p-3 text-left text-xs font-bold ${form.type==="unpaid"?"border-primary bg-primary/10":"bg-background"}`}>Unpaid Leave<span className="block mt-1 text-[10px] font-normal text-muted-foreground">Salary deduction applies</span></button></div>
        <div className="mt-3 grid gap-2"><label className="text-xs font-bold">From<input type="date" value={form.start} onChange={e=>setForm({...form,start:e.target.value})} className="mt-1 w-full rounded-xl border bg-background p-2 text-sm"/></label><label className="text-xs font-bold">To<input type="date" value={form.end} onChange={e=>setForm({...form,end:e.target.value})} className="mt-1 w-full rounded-xl border bg-background p-2 text-sm"/></label><label className="text-xs font-bold">Reason<textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Reason for leave…" className="mt-1 min-h-24 w-full rounded-xl border bg-background p-3 text-sm"/></label><Button onClick={applyLeave} disabled={saving} className="rounded-xl">{saving?"Submitting…":"Submit Leave Request"}</Button></div>
      </GlassCard>
      <GlassCard className="p-5 xl:col-span-2"><div className="flex items-center justify-between"><div><p className="font-black text-lg">{admin?"All Leave Requests":"My Leave History"}</p><p className="text-xs text-muted-foreground">Pending, approved and rejected requests.</p></div><Clock3 size={20} className="text-primary"/></div>
        <div className="mt-4 space-y-2">{visibleLeaves.map(l=>{const m=members.find(x=>x.auth_user_id===l.user_id);return <div key={l.id} className="rounded-2xl border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold">{admin?m?.name||"Team member":"Leave request"} <span className="ml-1 rounded-full bg-muted px-2 py-1 text-[10px] uppercase">{l.leave_type}</span></p><p className="text-xs text-muted-foreground">{l.start_date} → {l.end_date} · {l.total_days} working day(s)</p><p className="mt-1 text-xs">{l.reason}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${l.status==="approved"?"bg-emerald-500/10 text-emerald-600":l.status==="rejected"?"bg-rose-500/10 text-rose-600":"bg-amber-500/10 text-amber-600"}`}>{l.status}</span></div>{admin&&l.status==="pending"&&<div className="mt-2 flex gap-2"><Button size="sm" className="rounded-xl" onClick={()=>review(l.id,"approved")}><CheckCircle2 size={13} className="mr-1"/>Approve</Button><Button size="sm" variant="destructive" className="rounded-xl" onClick={()=>review(l.id,"rejected")}><XCircle size={13} className="mr-1"/>Reject</Button></div>}</div>})}{!visibleLeaves.length&&<p className="py-8 text-center text-sm text-muted-foreground">No leave requests yet.</p>}</div>
      </GlassCard>
    </div>}

    {tab==="profile" && <GlassCard className="p-5"><div className="flex items-center gap-2"><UserRound size={20} className="text-primary"/><div><p className="font-black text-lg">Employee Profile</p><p className="text-xs text-muted-foreground">Your employment information and leave balance.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[["Name",myMember?.name||"—"],["Team ID",myMember?.login_id||"—"],["Email",myMember?.email||user?.email||"—"],["Joining Date",myProfile?.joining_date||"Not set"],["Designation",myProfile?.designation||myMember?.position||"—"],["Department",myProfile?.department||"CRM"],["Monthly Salary",admin?money(myProfile?.monthly_salary||0):"Private · visible to you only"],["Paid Leave Balance",`${myProfile?.paid_leave_balance??0} days`],["Unpaid Leave (approved)",`${approvedUnpaid} days in selected month`]].map(([k,v])=><div key={k} className="rounded-2xl border bg-muted/20 p-4"><p className="text-[10px] uppercase font-bold text-muted-foreground">{k}</p><p className="mt-1 text-sm font-black">{v}</p></div>)}</div></GlassCard>}

    {tab==="salary" && <div className="space-y-4">
      <GlassCard className="p-5"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div className="flex items-center gap-2"><WalletCards size={20} className="text-primary"/><p className="font-black text-lg">Monthly Income</p></div><p className="text-xs text-muted-foreground">Working days exclude weekends and company holidays. Paid leave does not reduce salary; approved unpaid leave is prorated.</p></div><Input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="w-full sm:w-44 rounded-xl"/></div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3"><div className="rounded-2xl border p-4"><p className="text-[10px] uppercase text-muted-foreground">Monthly Salary</p><p className="text-xl font-black">{money(netIncome.salary)}</p></div><div className="rounded-2xl border p-4"><p className="text-[10px] uppercase text-muted-foreground">Working Days</p><p className="text-xl font-black">{monthWorking}</p></div><div className="rounded-2xl border p-4"><p className="text-[10px] uppercase text-muted-foreground">Present / Leave</p><p className="text-xl font-black">{present} / {approvedPaid+approvedUnpaid}</p></div><div className="rounded-2xl border p-4"><p className="text-[10px] uppercase text-muted-foreground">Net Income</p><p className="text-xl font-black text-emerald-600">{money(netIncome.net)}</p></div></div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs"><div className="rounded-xl bg-emerald-500/10 p-3">Paid Leave: <b>{approvedPaid}</b></div><div className="rounded-xl bg-rose-500/10 p-3">Unpaid Leave: <b>{approvedUnpaid}</b></div><div className="rounded-xl bg-amber-500/10 p-3">Absent: <b>{netIncome.absent}</b></div><div className="rounded-xl bg-blue-500/10 p-3">Holidays: <b>{holidays.filter(h=>h.holiday_date>=range.start&&h.holiday_date<=range.end&&new Date(h.holiday_date+"T00:00:00").getDay()!==0&&new Date(h.holiday_date+"T00:00:00").getDay()!==6).length}</b></div></div>
      </GlassCard>
      {admin&&<GlassCard className="p-5"><p className="font-black text-lg">Admin Salary Management</p><p className="text-xs text-muted-foreground">Set monthly salary and paid leave balance for each CRM employee. Salary is not exposed to team members.</p><div className="mt-4 space-y-2">{members.map(m=>{const p=profiles.find(x=>x.user_id===m.auth_user_id);if(!p)return null;return <div key={m.id} className="flex flex-col md:flex-row md:items-center gap-2 rounded-2xl border p-3"><div className="flex-1"><p className="text-sm font-bold">{m.name}</p><p className="text-[10px] text-muted-foreground">{m.login_id||m.email}</p></div><Input className="md:w-40 rounded-xl" type="number" min="0" placeholder="Monthly salary" value={salaryDraft[m.auth_user_id!]??String(p.monthly_salary||0)} onChange={e=>setSalaryDraft({...salaryDraft,[m.auth_user_id!]:e.target.value})}/><span className="text-xs text-muted-foreground">Paid leave: {p.paid_leave_balance}</span><Button size="sm" className="rounded-xl" onClick={()=>saveSalary(m.auth_user_id!)}>Save</Button></div>})}</div></GlassCard>}
    </div>}
  </div>;
}
