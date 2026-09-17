import { useEffect, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/crm/CrmUI";
import { Outlet, useLocation } from "react-router-dom";
import PunchClock from "./PunchClock";
import { Attendance, getTodayAttendance } from "@/lib/attendance";

export default function AdminWorkGate() {
  const location = useLocation();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const isCrm = location.pathname === "/admin/crm" || location.pathname.startsWith("/admin/crm/");
  const isAttendance = location.pathname === "/admin/attendance";

  useEffect(() => {
    getTodayAttendance().then(setAttendance).catch(() => setAttendance(null));
  }, [location.pathname]);

  const punchedIn = attendance?.status === "punched_in";

  // Punching is controlled from CRM only. Attendance is a read-only reporting page.
  if (isAttendance) {
    return <Outlet />;
  }

  return (
    <div className="space-y-4">
      {isCrm && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-3 py-2.5">
          <div>
            <p className="text-xs font-bold">Staff Attendance</p>
            <p className="text-[10px] text-muted-foreground">Punch In / Punch Out from CRM. Attendance page only shows the saved data.</p>
          </div>
          <PunchClock onAttendanceChange={setAttendance} />
        </div>
      )}

      {isCrm && !punchedIn ? (
        <GlassCard className="p-8 md:p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <LockKeyhole size={26} />
          </div>
          <h2 className="text-2xl font-black">CRM is locked</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Please Punch In from Staff Attendance above. Once your working session starts, the CRM dashboard, leads, pipeline and follow-ups will unlock.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-2 text-xs font-semibold">
            <ShieldCheck size={14} className="text-emerald-500" /> Attendance required
          </div>
        </GlassCard>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
