import { useEffect, useMemo, useState } from "react";
import { Clock3, Coffee, LogIn, LogOut, ShieldCheck, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Attendance, formatClock, formatDuration, getTodayAttendance, getWorkingHours, punchIn, punchOut } from "@/lib/attendance";

type BreakRecord = { id: string; start: string; end: string | null; reason: string };

const breakKey = (userId: string, date: string) => `cst_crm_breaks:${userId}:${date}`;

function readBreaks(userId: string, date: string): BreakRecord[] {
  try { return JSON.parse(localStorage.getItem(breakKey(userId, date)) || "[]"); } catch { return []; }
}
function saveBreaks(userId: string, date: string, value: BreakRecord[]) {
  try { localStorage.setItem(breakKey(userId, date), JSON.stringify(value)); } catch { /* ignore storage errors */ }
}
function breakSeconds(breaks: BreakRecord[], now = Date.now()) {
  return breaks.reduce((total, b) => total + Math.max(0, ((b.end ? new Date(b.end).getTime() : now) - new Date(b.start).getTime()) / 1000), 0);
}

export default function PunchClock({ onAttendanceChange }: { onAttendanceChange?: (attendance: Attendance | null) => void }) {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [workingHours, setWorkingHours] = useState("10:00 - 19:00");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [breaks, setBreaks] = useState<BreakRecord[]>([]);

  const applyAttendance = (value: Attendance | null) => { setAttendance(value); onAttendanceChange?.(value); };
  const load = async () => {
    try {
      const [a, hours] = await Promise.all([getTodayAttendance(), getWorkingHours()]);
      applyAttendance(a); setWorkingHours(hours);
      if (a) setBreaks(readBreaks(a.user_id, a.work_date));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);

  const active = attendance?.status === "punched_in";
  const currentBreak = breaks.find((b) => !b.end);
  const totalBreak = breakSeconds(breaks, now);
  const elapsed = useMemo(() => {
    if (!attendance?.punch_in) return 0;
    const gross = attendance.punch_out
      ? attendance.total_seconds
      : Math.max(0, (now - new Date(attendance.punch_in).getTime()) / 1000);
    return Math.max(0, Math.floor(gross - totalBreak));
  }, [attendance, now, totalBreak]);

  const updateBreaks = (next: BreakRecord[]) => {
    if (!attendance) return;
    setBreaks(next); saveBreaks(attendance.user_id, attendance.work_date, next);
  };

  const handlePunchIn = async () => {
    if (!window.confirm(`Punch In now?\n\nWorking hours: ${workingHours}\nCRM will unlock after Punch In.`)) return;
    setBusy(true);
    try { applyAttendance(await punchIn()); toast.success("Punch In successful — CRM unlocked", { description: `Started at ${formatClock(new Date().toISOString())}` }); }
    catch (e: any) { toast.error(e.message ?? "Punch In failed"); }
    finally { setBusy(false); }
  };

  const handleBreakStart = () => {
    if (!attendance || !active || currentBreak) return;
    const reason = window.prompt("Break reason (optional):", "Tea / Lunch / Personal") ?? "";
    if (reason === null) return;
    if (!window.confirm("Start break now? CRM will remain open, but break time will not count as working time.")) return;
    const record: BreakRecord = { id: crypto.randomUUID(), start: new Date().toISOString(), end: null, reason: reason.trim() || "Break" };
    updateBreaks([...breaks, record]);
    toast.success("Break started", { description: `${record.reason} • Break timer is running` });
  };

  const handleBreakEnd = () => {
    if (!attendance || !currentBreak) return;
    if (!window.confirm("End break and resume working now?")) return;
    const ended = new Date().toISOString();
    updateBreaks(breaks.map((b) => b.id === currentBreak.id ? { ...b, end: ended } : b));
    toast.success("Break ended — working timer resumed", { description: `Break ended at ${formatClock(ended)}` });
  };

  const handlePunchOut = async () => {
    if (!attendance || !active) return;
    if (currentBreak) { toast.error("End your active break before Punch Out."); return; }
    if (!window.confirm(`Punch Out now?\n\nWorking time: ${formatDuration(elapsed)}\nBreak time: ${formatDuration(totalBreak)}\n\nCRM access will lock after Punch Out.`)) return;
    setBusy(true);
    try { applyAttendance(await punchOut(attendance)); toast.success("Punch Out recorded — CRM locked", { description: `Worked ${formatDuration(elapsed)} • Breaks ${formatDuration(totalBreak)}` }); }
    catch (e: any) { toast.error(e.message ?? "Punch Out failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-2.5 py-1.5 shadow-sm">
      <div className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-xl ${active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}><Clock3 size={15} /></div>
      <div className="hidden md:block leading-tight min-w-[180px]">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Working hours {workingHours}</p>
        <p className="text-xs font-semibold tabular-nums">{active ? `In ${formatClock(attendance?.punch_in ?? null)} · ${formatDuration(elapsed)}` : attendance?.punch_out ? `Out ${formatClock(attendance.punch_out)} · ${formatDuration(elapsed)}` : "Not punched in"}</p>
        {active && <p className="text-[10px] text-muted-foreground">Breaks: {formatDuration(totalBreak)}{currentBreak ? " · ON BREAK" : ""}</p>}
      </div>
      {active && (currentBreak ?
        <Button size="sm" onClick={handleBreakEnd} disabled={busy} className="rounded-xl h-8 px-3 gap-1.5"><TimerReset size={14} /> End Break</Button> :
        <Button size="sm" variant="secondary" onClick={handleBreakStart} disabled={busy} className="rounded-xl h-8 px-3 gap-1.5"><Coffee size={14} /> Break</Button>
      )}
      {active ? <Button size="sm" variant="destructive" onClick={handlePunchOut} disabled={busy || !!currentBreak} className="rounded-xl h-8 px-3 gap-1.5"><LogOut size={14} /> Punch Out</Button> : <Button size="sm" onClick={handlePunchIn} disabled={busy} className="rounded-xl h-8 px-3 gap-1.5"><LogIn size={14} /> Punch In</Button>}
      <ShieldCheck size={14} className={active ? "text-emerald-500" : "text-muted-foreground"} title={active ? "CRM unlocked" : "Punch In required for CRM"} />
    </div>
  );
}
