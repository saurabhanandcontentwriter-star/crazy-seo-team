import { useEffect, useMemo, useState } from "react";
import { Clock3, Coffee, LogIn, LogOut, ShieldCheck, TimerReset, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Attendance, DAILY_TARGET_SECONDS, endBreak, formatDuration, getTodayAttendance, getWorkingHours, punchIn, punchOut, startBreak, startOvertime } from "@/lib/attendance";

export default function PunchClock({ onAttendanceChange }: { onAttendanceChange?: (attendance: Attendance | null) => void }) {
  const [attendance,setAttendance]=useState<Attendance|null>(null);
  const [workingHours,setWorkingHours]=useState("8 घंटे प्रतिदिन");
  const [busy,setBusy]=useState(false);
  const [now,setNow]=useState(Date.now());
  const apply=(a:Attendance|null)=>{setAttendance(a);onAttendanceChange?.(a);};
  const load=async()=>{try{const [a,h]=await Promise.all([getTodayAttendance(),getWorkingHours()]);apply(a);setWorkingHours(h);}catch(e:any){toast.error(e?.message||"उपस्थिति लोड नहीं हुई।");}};
  useEffect(()=>{void load();const id=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(id);},[]);
  const active=attendance?.status==="punched_in";
  const gross=attendance?.punch_in?Math.max(0,Math.floor((now-new Date(attendance.punch_in).getTime())/1000)):0;
  const liveBreak=attendance?.break_status==="on_break"&&attendance.break_started_at?Math.max(0,Math.floor((now-new Date(attendance.break_started_at).getTime())/1000)):0;
  const net=attendance?.punch_out?Number(attendance.total_seconds||0):Math.max(0,gross-Number(attendance?.total_break_seconds||0)-liveBreak);
  const reachedTarget=net>=DAILY_TARGET_SECONDS;
  const onBreak=attendance?.break_status==="on_break";
  const overtime=!!attendance?.overtime_started_at;
  const action=async(fn:()=>Promise<Attendance>,success:string)=>{setBusy(true);try{apply(await fn());toast.success(success);}catch(e:any){toast.error(e?.message||"कार्रवाई पूरी नहीं हुई।");}finally{setBusy(false);}};
  const beginBreak=(reason:"Lunch"|"Break")=>{if(!attendance)return;void action(()=>startBreak(attendance,reason),reason==="Lunch"?"लंच ब्रेक शुरू हुआ।":"शॉर्ट ब्रेक शुरू हुआ।");};
  const finishBreak=()=>{if(!attendance)return;void action(()=>endBreak(attendance),"ब्रेक समाप्त। काम का समय फिर शुरू हुआ।");};
  const beginOvertime=()=>{if(!attendance)return;if(!window.confirm("8 घंटे पूरे हो गए हैं। क्या आप अलग ओवरटाइम शुरू करना चाहते हैं?"))return;void action(()=>startOvertime(attendance),"ओवरटाइम शुरू हो गया।");};
  const finishWork=()=>{if(!attendance)return;if(onBreak){toast.error("पहले ब्रेक समाप्त करें।");return;}void action(()=>punchOut(attendance),"Punch Out दर्ज हो गया।");};
  const status=useMemo(()=>!active?"आज Punch In नहीं किया":onBreak?"ब्रेक जारी है":reachedTarget&&!overtime?"8 घंटे पूरे — CRM लॉक":overtime?"ओवरटाइम जारी है":"काम जारी है",[active,onBreak,reachedTarget,overtime]);
  return <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-2.5 py-1.5 shadow-sm">
    <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Clock3 size={15}/></div>
    <div className="hidden md:block min-w-[190px] leading-tight">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">नियमित समय: {workingHours}</p>
      <p className="text-xs font-semibold tabular-nums">{status}</p>
      {active&&<p className="text-[10px] text-muted-foreground">काम: {formatDuration(Math.min(net,DAILY_TARGET_SECONDS))} · ब्रेक: {formatDuration(Number(attendance?.total_break_seconds||0)+liveBreak)}</p>}
      {overtime&&<p className="text-[10px] font-semibold text-amber-600">ओवरटाइम: {formatDuration(Math.max(0,net-DAILY_TARGET_SECONDS))}</p>}
    </div>
    {(!attendance||attendance.status==="punched_out")&&<Button size="sm" onClick={()=>void action(()=>punchIn(),"Punch In दर्ज हो गया। CRM खुल गया।")} disabled={busy} className="h-8 rounded-xl gap-1.5"><LogIn size={14}/> Punch In</Button>}
    {active&&onBreak&&<Button size="sm" onClick={finishBreak} disabled={busy} className="h-8 rounded-xl gap-1.5"><TimerReset size={14}/> ब्रेक समाप्त</Button>}
    {active&&!onBreak&&<><Button size="sm" variant="secondary" onClick={()=>beginBreak("Lunch")} disabled={busy||reachedTarget} className="h-8 rounded-xl gap-1.5"><Utensils size={14}/> Lunch</Button><Button size="sm" variant="secondary" onClick={()=>beginBreak("Break")} disabled={busy||reachedTarget} className="h-8 rounded-xl gap-1.5"><Coffee size={14}/> Break</Button></>}
    {active&&reachedTarget&&!overtime&&!onBreak&&<Button size="sm" onClick={beginOvertime} disabled={busy} className="h-8 rounded-xl gap-1.5">ओवरटाइम शुरू करें</Button>}
    {active&&<Button size="sm" variant="destructive" onClick={finishWork} disabled={busy||!!onBreak} className="h-8 rounded-xl gap-1.5"><LogOut size={14}/> Punch Out</Button>}
    {attendance?.status==="punched_out"&&<span className="rounded-xl bg-muted px-3 py-2 text-xs font-semibold">आज की शिफ्ट पूरी</span>}
    <ShieldCheck size={14} className={active&&!onBreak&&(!reachedTarget||overtime)?"text-emerald-500":"text-muted-foreground"} title="उपस्थिति स्थिति"/>
  </div>;
}
