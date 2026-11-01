import { useEffect, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/crm/CrmUI";
import { Outlet, useLocation } from "react-router-dom";
import PunchClock from "./PunchClock";
import { Attendance, DAILY_TARGET_SECONDS, getTodayAttendance } from "@/lib/attendance";

export default function AdminWorkGate() {
  const location=useLocation();
  const [attendance,setAttendance]=useState<Attendance|null>(null);
  const [now,setNow]=useState(Date.now());
  const isCrm=location.pathname==="/admin/crm"||location.pathname.startsWith("/admin/crm/");
  const isAttendance=location.pathname==="/admin/attendance";
  useEffect(()=>{getTodayAttendance().then(setAttendance).catch(()=>setAttendance(null));},[location.pathname]);
  useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(id);},[]);
  const active=attendance?.status==="punched_in";
  const gross=attendance?.punch_in?Math.max(0,Math.floor((now-new Date(attendance.punch_in).getTime())/1000)):0;
  const currentBreak=attendance?.break_status==="on_break"&&attendance.break_started_at?Math.max(0,Math.floor((now-new Date(attendance.break_started_at).getTime())/1000)):0;
  const net=Math.max(0,gross-Number(attendance?.total_break_seconds||0)-currentBreak);
  const overtimeAllowed=!!attendance?.overtime_started_at;
  const locked=!!active&&(attendance?.break_status==="on_break"||(net>=DAILY_TARGET_SECONDS&&!overtimeAllowed));
  if(isAttendance)return <Outlet/>;
  return <div className="space-y-4">
    {isCrm&&<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-3 py-2.5">
      <div><p className="text-xs font-bold">कर्मचारी उपस्थिति</p><p className="text-[10px] text-muted-foreground">Punch In / Punch Out, Lunch और Break यहीं से दर्ज करें। नियमित काम 8 घंटे है।</p></div>
      <PunchClock onAttendanceChange={setAttendance}/>
    </div>}
    {isCrm&&(!active||locked)?<GlassCard className="p-8 md:p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><LockKeyhole size={26}/></div>
      <h2 className="text-2xl font-black">CRM अभी लॉक है</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
        {!active?"CRM इस्तेमाल करने से पहले Punch In करें।":attendance?.break_status==="on_break"?"आपका Lunch / Break चल रहा है। ब्रेक समाप्त करने के बाद CRM फिर खुलेगा।":"आपके 8 नियमित काम के घंटे पूरे हो गए हैं। आगे काम करने के लिए अलग से ओवरटाइम शुरू करें।"}
      </p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-2 text-xs font-semibold"><ShieldCheck size={14} className="text-emerald-500"/>8 घंटे नियमित कार्य सीमा</div>
    </GlassCard>:<Outlet/>}
  </div>;
}
