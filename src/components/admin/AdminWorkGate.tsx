import { useEffect, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { GlassCard } from "@/components/crm/CrmUI";
import PunchClock from "./PunchClock";
import { getTodayAttendance, Attendance } from "@/lib/attendance";

export default function AdminWorkGate() {
  const location = useLocation();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [refresh, setRefresh] = useState(0);
  const isCrm = location.pathname === "/admin/crm" || location.pathname.startsWith("/admin/crm/");

  useEffect(() => {
    getTodayAttendance().then(setAttendance).catch(() => setAttendance(null));
    const id = window.setInterval(() => setRefresh((v) => v + 1), 3000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const punchedIn = attendance?.status === "punched_in";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-3 py-2.5">
        <div>
          <p className="text-xs font-bold">Staff Attendance</p>
          <p className="text-[10px] text-muted-foreground">Punch In required before using AI CRM</p>
        </div>
        <PunchClock />
      </div>
      {isCrm && !punchedIn ? (
        <GlassCard className="p-8 md:p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><LockKeyhole size={26} /></div>
          <h2 className="text-2xl font-black">CRM is locked</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Please Punch In from Staff Attendance above. Once your working session starts, the CRM dashboard, leads, pipeline and follow-ups will unlock.</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-2 text-xs font-semibold"><ShieldCheck size={14} className="text-emerald-500" /> Attendance required</div>
        </GlassCard>
      ) : <Outlet />}
    </div>
  );
}
