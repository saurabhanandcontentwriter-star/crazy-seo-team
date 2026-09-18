import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CircleCheck, Clock3, Gift, UserRound, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { indiaDate } from "@/lib/attendance";

type Holiday = { id:string; holiday_date:string; name:string; reason:string|null };
type Leave = { id:string; user_id:string; leave_type:"paid"|"unpaid"; start_date:string; end_date:string; total_days:number; reason:string; status:"pending"|"approved"|"rejected" };
type Member = { auth_user_id:string|null; name:string; login_id:string|null };

const pad=(n:number)=>String(n).padStart(2,"0");
const iso=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const monthLabel=(value:string)=>new Date(value+"-01T00:00:00").toLocaleDateString("en-IN",{month:"long",year:"numeric"});
const addMonth=(value:string,delta:number)=>{const [y,m]=value.split("-").map(Number);const d=new Date(y,m-1+delta,1);return `${d.getFullYear()}-${pad(d.getMonth()+1)}`;};

export default function CrmLeaveCalendar(){
  const [user,setUser]=useState<any>(null);
  const [admin,setAdmin]=useState(false);
  const [holidays,setHolidays]=useState<Holiday[]>([]);
  const [leaves,setLeaves]=useState<Leave[]>([]);
  const [members,setMembers]=useState<Member[]>([]);
  const [month,setMonth]=useState(indiaDate().slice(0,7));
  const [loading,setLoading]=useState(true);

  const load=async()=>{
    setLoading(true);
    try{
      const {data:ud,error:ue}=await supabase.auth.getUser();
      if(ue) throw ue;
      if(!ud.user) throw new Error("Please sign in again.");
      setUser(ud.user);
      const {data:role}=await (supabase as any).from("user_roles").select("role").eq("user_id",ud.user.id).eq("role","admin").maybeSingle();
      setAdmin(!!role);
      const [h,l,m]=await Promise.all([
        (supabase as any).from("crm_holidays").select("id,holiday_date,name,reason").order("holiday_date"),
        (supabase as any).from("crm_leave_requests").select("id,user_id,leave_type,start_date,end_date,total_days,reason,status").order("start_date"),
        (supabase as any).from("crm_team_members").select("auth_user_id,name,login_id").eq("status","active").order("name")
      ]);
      for(const x of [h,l,m]) if(x.error) throw x.error;
      setHolidays(h.data||[]); setLeaves(l.data||[]); setMembers(m.data||[]);
    }catch(e:any){toast.error(e?.message||"Leave calendar could not load");}
    finally{setLoading(false);}
  };
  useEffect(()=>{void load()},[]);

  const [year,monthNo]=month.split("-").map(Number);
  const first=new Date(year,monthNo-1,1);
  const daysInMonth=new Date(year,monthNo,0).getDate();
  const offset=(first.getDay()+6)%7;
  const cells=useMemo(()=>Array.from({length:offset+daysInMonth},(_,i)=>i<offset?null:new Date(year,monthNo-1,i-offset+1)),[year,monthNo,offset,daysInMonth]);
  const holidayMap=useMemo(()=>new Map(holidays.map(h=>[h.holiday_date,h])),[holidays]);

  const monthLeaves=useMemo(()=>leaves.filter(l=>l.start_date<=`${month}-${pad(daysInMonth)}`&&l.end_date>=`${month}-01` && (admin || l.user_id===user?.id)),[leaves,month,daysInMonth,admin,user]);
  const leaveForDate=(date:string)=>monthLeaves.filter(l=>l.start_date<=date&&l.end_date>=date);
  const memberName=(uid:string)=>members.find(m=>m.auth_user_id===uid)?.name||"Team member";

  if(loading) return <GlassCard className="p-5"><p className="text-sm text-muted-foreground">Loading leave calendar…</p></GlassCard>;

  return <GlassCard className="p-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-primary/10 p-2 text-primary"><CalendarDays size={22}/></div><div><p className="font-black text-lg">Leave Calendar</p><p className="text-xs text-muted-foreground">{admin?"All team members' approved and pending leave":"Your leave, company holidays and working days"} · Monday–Friday working days</p></div></div>
      <div className="flex items-center gap-2"><Button variant="outline" size="icon" className="rounded-xl" onClick={()=>setMonth(addMonth(month,-1))}><ChevronLeft size={16}/></Button><div className="min-w-36 text-center text-sm font-black">{monthLabel(month)}</div><Button variant="outline" size="icon" className="rounded-xl" onClick={()=>setMonth(addMonth(month,1))}><ChevronRight size={16}/></Button><Button variant="outline" className="rounded-xl" onClick={()=>setMonth(indiaDate().slice(0,7))}>Today</Button></div>
    </div>

    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
      <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Paid Leave</span>
      <span className="rounded-full bg-rose-500/10 px-3 py-1 text-rose-600">Unpaid Leave</span>
      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-600">Pending</span>
      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-600">Company Holiday</span>
      <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Weekend / OFF</span>
    </div>

    <div className="mt-4 grid grid-cols-7 overflow-hidden rounded-2xl border">
      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><div key={d} className="border-b bg-muted/30 p-2 text-center text-[10px] font-black uppercase text-muted-foreground">{d}</div>)}
      {cells.map((date,i)=>{
        if(!date) return <div key={"blank-"+i} className="min-h-24 border-r border-b bg-muted/10 sm:min-h-28"/>;
        const key=iso(date); const weekend=date.getDay()===0||date.getDay()===6; const holiday=holidayMap.get(key); const dayLeaves=leaveForDate(key);
        return <div key={key} className={`min-h-24 border-r border-b p-2 align-top sm:min-h-28 ${weekend?"bg-muted/30":""} ${holiday?"bg-blue-500/5":""}`}>
          <div className="flex items-center justify-between"><span className={`text-xs font-black ${key===indiaDate()?"rounded-full bg-primary px-2 py-1 text-primary-foreground":""}`}>{date.getDate()}</span>{holiday&&<Gift size={13} className="text-blue-600"/>}</div>
          {holiday&&<div className="mt-2 rounded-lg bg-blue-500/10 p-1.5 text-[9px] font-bold text-blue-700"><div>{holiday.name}</div>{holiday.reason&&<div className="font-normal opacity-80">{holiday.reason}</div>}</div>}
          {weekend&&<div className="mt-2 text-[9px] font-bold text-muted-foreground">OFF</div>}
          <div className="mt-1 space-y-1">{dayLeaves.map(l=><div key={l.id} className={`rounded-lg p-1.5 text-[9px] font-bold ${l.status==="pending"?"bg-amber-500/10 text-amber-700":l.leave_type==="paid"?"bg-primary/10 text-primary":"bg-rose-500/10 text-rose-600"}`}><div className="flex items-center gap-1">{l.status==="approved"?<CircleCheck size={10}/>:l.status==="rejected"?<XCircle size={10}/>:<Clock3 size={10}/>}<span>{admin?memberName(l.user_id):l.leave_type==="paid"?"Paid Leave":"Unpaid Leave"}</span></div><div className="mt-0.5 capitalize">{l.status}</div></div>)}</div>
        </div>;
      })}
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border bg-muted/20 p-4"><div className="flex items-center gap-2"><UserRound size={16} className="text-primary"/><p className="text-xs font-black">Leave Requests</p></div><p className="mt-1 text-2xl font-black">{monthLeaves.length}</p><p className="text-[10px] text-muted-foreground">in this month</p></div>
      <div className="rounded-2xl border bg-muted/20 p-4"><div className="flex items-center gap-2"><Gift size={16} className="text-blue-600"/><p className="text-xs font-black">Company Holidays</p></div><p className="mt-1 text-2xl font-black">{holidays.filter(h=>h.holiday_date.startsWith(month)).length}</p><p className="text-[10px] text-muted-foreground">listed for this month</p></div>
      <div className="rounded-2xl border bg-muted/20 p-4"><div className="flex items-center gap-2"><Clock3 size={16} className="text-amber-600"/><p className="text-xs font-black">Pending</p></div><p className="mt-1 text-2xl font-black">{monthLeaves.filter(l=>l.status==="pending").length}</p><p className="text-[10px] text-muted-foreground">awaiting approval</p></div>
    </div>
  </GlassCard>;
}
