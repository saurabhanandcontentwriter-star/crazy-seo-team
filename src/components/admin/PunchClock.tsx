import { useEffect, useState } from "react";
import { Clock3, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Attendance, formatClock, formatDuration, getTodayAttendance, getWorkingHours, punchIn, punchOut } from "@/lib/attendance";

export default function PunchClock() {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [workingHours, setWorkingHours] = useState("10:00 - 19:00");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const load = async () => {
    try {
      const [a, hours] = await Promise.all([getTodayAttendance(), getWorkingHours()]);
      setAttendance(a);
      setWorkingHours(hours);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => { load(); const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);

  const elapsed = attendance?.punch_in
    ? attendance.punch_out
      ? attendance.total_seconds
      : Math.max(0, Math.floor((now - new Date(attendance.punch_in).getTime()) / 1000))
    : 0;

  const handlePunchIn = async () => {
    setBusy(true);
    try { setAttendance(await punchIn()); toast.success("Punch In successful — CRM unlocked"); }
    catch (e: any) { toast.error(e.message ?? "Punch In failed"); }
    finally { setBusy(false); }
  };

  const handlePunchOut = async () => {
    if (!attendance) return;
    if (!window.confirm("Punch Out now? CRM access will be locked until you Punch In again.")) return;
    setBusy(true);
    try { setAttendance(await punchOut(attendance)); toast.success("Punch Out recorded — CRM locked"); }
    catch (e: any) { toast.error(e.message ?? "Punch Out failed"); }
    finally { setBusy(false); }
  };

  const active = attendance?.status === "punched_in";

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-2.5 py-1.5 shadow-sm">
      <div className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-xl ${active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
        <Clock3 size={15} />
      </div>
      <div className="hidden md:block leading-tight min-w-[145px]">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Working hours {workingHours}</p>
        <p className="text-xs font-semibold tabular-nums">{active ? `In ${formatClock(attendance?.punch_in ?? null)} · ${formatDuration(elapsed)}` : attendance?.punch_out ? `Out ${formatClock(attendance.punch_out)} · ${formatDuration(elapsed)}` : "Not punched in"}</p>
      </div>
      {active ? (
        <Button size="sm" variant="destructive" onClick={handlePunchOut} disabled={busy} className="rounded-xl h-8 px-3 gap-1.5"><LogOut size={14} /> Punch Out</Button>
      ) : (
        <Button size="sm" onClick={handlePunchIn} disabled={busy} className="rounded-xl h-8 px-3 gap-1.5"><LogIn size={14} /> Punch In</Button>
      )}
      <ShieldCheck size={14} className={active ? "text-emerald-500" : "text-muted-foreground"} title={active ? "CRM unlocked" : "Punch In required for CRM"} />
    </div>
  );
}
