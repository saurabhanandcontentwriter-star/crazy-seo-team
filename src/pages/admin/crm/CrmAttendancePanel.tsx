import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, LogIn, LogOut, RefreshCw, UsersRound, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/crm/CrmUI";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatClock, formatDuration, indiaDate, punchIn, punchOut, type Attendance } from "@/lib/attendance";
import { isWorkingDay } from "@/pages/admin/crm/CrmHolidayCalendar";

type TeamMember = { id: string; auth_user_id: string | null; name: string; login_id: string | null; position: string | null; photo_url: string | null };
type DisplayRow = Attendance & { member: TeamMember };
type Leave = { id:string; user_id:string; leave_type:"paid"|"unpaid"; start_date:string; end_date:string; total_days:number; reason:string; status:"pending"|"approved"|"rejected"; review_note:string|null };

const statusLabel = (r: Attendance | null) => !r ? "Not punched in" : r.status === "punched_in" ? "Working" : "Completed";
const statusClass = (r: Attendance | null) => !r ? "bg-muted text-muted-foreground" : r.status === "punched_in" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20";
const nineHourSeconds = 9 * 60 * 60;
const liveWorkSeconds = (r: Attendance) => r.status === "punched_in" && r.punch_in ? Math.max(0, Math.floor((Date.now() - new Date(r.punch_in).getTime()) / 1000)) : Number(r.total_seconds || 0);
const nineHourClass = (seconds: number) => seconds >= nineHourSeconds ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-red-500/10 text-red-700 border-red-500/20";

export default function CrmAttendancePanel() {
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [mine, setMine] = useState<Attendance | null>(null);
  const [busy, setBusy] = useState<"in" | "out" | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [reviewNote, setReviewNote] = useState<Record<string,string>>({});
  const [reviewing, setReviewing] = useState<string|null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: userData, error: userError }, { data: team, error: teamError }, { data: attendance, error: attendanceError }, { data: leaveData, error: leaveError }] = await Promise.all([
        supabase.auth.getUser(),
        (supabase as any).from("crm_team_members").select("id,auth_user_id,name,login_id,position,photo_url").eq("status", "active").order("name"),
        (supabase as any).from("crm_attendance").select("*").eq("work_date", indiaDate()).order("punch_in", { ascending: false }),
        (supabase as any).from("crm_leave_requests").select("*").lte("start_date", indiaDate()).gte("end_date", indiaDate()).order("created_at", { ascending: false }),
      ]);
      if (userError) throw userError;
      if (teamError) throw teamError;
      if (attendanceError) throw attendanceError;
      if (leaveError) throw leaveError;
      const uid = userData.user?.id ?? null;
      const attendanceMap = new Map(((attendance ?? []) as Attendance[]).map(row => [row.user_id, row]));
      const displayRows = ((team ?? []) as TeamMember[]).filter(member => member.auth_user_id).map(member => ({
        ...(attendanceMap.get(member.auth_user_id!) ?? { id: "missing-" + member.auth_user_id, user_id: member.auth_user_id!, email: "", work_date: indiaDate(), punch_in: null, punch_out: null, total_seconds: 0, status: "punched_out" as const, work_status: "red" as const, created_at: "", updated_at: "" }),
        member
      }));
      setRows(displayRows);
      setMine(uid ? (attendanceMap.get(uid) ?? null) : null);
      setLeaves((leaveData ?? []) as Leave[]);
    } catch (e: any) { toast.error(e?.message ?? "Could not load attendance"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const reviewLeave = async (leave: Leave, status: "approved"|"rejected") => {
    const note = (reviewNote[leave.id] ?? "").trim();
    if (!note) { toast.error("HR message is required."); return; }
    setReviewing(leave.id);
    try {
      const { data: ud, error: ue } = await supabase.auth.getUser();
      if (ue || !ud.user) throw ue ?? new Error("Please sign in again.");
      const { error } = await (supabase as any).from("crm_leave_requests").update({ status, reviewed_by: ud.user.id, reviewed_at: new Date().toISOString(), review_note: note }).eq("id", leave.id).eq("status", "pending");
      if (error) throw error;
      toast.success(status === "approved" ? "Leave approved. CRM attendance is now green." : "Leave rejected.");
      setReviewNote(x => ({ ...x, [leave.id]: "" }));
      await load();
    } catch (e:any) { toast.error(e?.message ?? "Could not update leave"); } finally { setReviewing(null); }
  };
  const action = async (kind: "in" | "out") => {
    if (kind === "in" && !isWorkingDay(new Date())) { toast.error("Today is a non-working day. Working days are Monday–Friday."); return; }
    setBusy(kind);
    try {
      if (kind === "in") { if (mine) return toast.error("Today attendance is already recorded."); setMine(await punchIn()); }
      else { if (!mine || mine.status !== "punched_in") return toast.error("You are not currently punched in."); setMine(await punchOut(mine)); }
      await load();
      toast.success(kind === "in" ? "Punch In recorded" : "Punch Out recorded");
    } catch (e: any) { toast.error(e?.message ?? "Attendance action failed"); }
    finally { setBusy(null); }
  };

  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }), []);
  const currentSeconds = (mine?.status === "punched_in" && mine.punch_in) ? Math.max(0, Math.floor((Date.now() - new Date(mine.punch_in).getTime()) / 1000)) : Number(mine?.total_seconds ?? 0);

  return <GlassCard className="p-5">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div><div className="flex items-center gap-2"><Clock3 size={19} className="text-primary" /><p className="font-black text-lg">Team Attendance</p></div><p className="text-xs text-muted-foreground mt-1">Today · {today} · All CRM members can see everyone attendance.</p></div>
      <div className="flex gap-2"><Button variant="outline" size="sm" className="rounded-2xl" onClick={() => void load()} disabled={loading}><RefreshCw size={14} className="mr-1" /> Refresh</Button>{!mine ? <Button size="sm" className="rounded-2xl" onClick={() => void action("in")} disabled={busy !== null || !isWorkingDay(new Date())}><LogIn size={14} className="mr-1" />{busy === "in" ? "Punching…" : "Punch In"}</Button> : mine.status === "punched_in" ? <Button size="sm" variant="destructive" className="rounded-2xl" onClick={() => void action("out")} disabled={busy !== null}><LogOut size={14} className="mr-1" />{busy === "out" ? "Punching…" : "Punch Out"}</Button> : <span className="inline-flex items-center rounded-2xl border bg-muted px-3 py-2 text-xs font-bold text-muted-foreground">Today completed</span>}</div>
    </div>
    {mine && <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2"><div className="rounded-2xl bg-muted/50 p-3"><p className="text-[10px] uppercase text-muted-foreground">My Punch In</p><p className="font-black">{formatClock(mine.punch_in)}</p></div><div className="rounded-2xl bg-muted/50 p-3"><p className="text-[10px] uppercase text-muted-foreground">My Punch Out</p><p className="font-black">{formatClock(mine.punch_out)}</p></div><div className="rounded-2xl bg-muted/50 p-3"><p className="text-[10px] uppercase text-muted-foreground">Working Time</p><p className="font-black">{formatDuration(currentSeconds)}</p></div><div className="rounded-2xl bg-muted/50 p-3"><p className="text-[10px] uppercase text-muted-foreground">My Status</p><p className="font-black">{mine.status === "punched_in" ? "Working" : "Completed"}</p></div></div>}
    <div className="mt-5 overflow-x-auto"><div className="min-w-[760px]"><div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-3 border-b px-3 pb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"><span>Member</span><span>Status</span><span>Punch In</span><span>Punch Out</span><span>Working Time</span></div>
      <div className="divide-y">{rows.map(r => <div key={r.member.id} className={"grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] items-center gap-3 px-3 py-3 " + (leaves.some(l=>l.user_id===r.user_id&&l.status==="approved") ? "bg-emerald-500/5" : "")}><div className="flex items-center gap-2 min-w-0">{r.member.photo_url ? <img src={r.member.photo_url} alt={r.member.name} className="h-9 w-9 rounded-xl object-cover" /> : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-black text-white">{r.member.name.charAt(0).toUpperCase()}</span>}<div className="min-w-0"><p className="truncate text-sm font-bold">{r.member.name}</p><p className="truncate text-[10px] text-muted-foreground">{r.member.login_id ?? "Team member"}</p></div></div><span className={"inline-flex w-fit rounded-lg border px-2 py-1 text-[10px] font-bold " + (leaves.some(l=>l.user_id===r.user_id&&l.status==="approved") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : statusClass(r.punch_in ? r : null))}>{leaves.some(l=>l.user_id===r.user_id&&l.status==="approved") ? "Approved Leave" : statusLabel(r.punch_in ? r : null)}</span><span className="text-xs font-semibold">{leaves.some(l=>l.user_id===r.user_id&&l.status==="approved") ? "—" : formatClock(r.punch_in)}</span><span className="text-xs font-semibold">{leaves.some(l=>l.user_id===r.user_id&&l.status==="approved") ? "—" : formatClock(r.punch_out)}</span><span className={"inline-flex w-fit rounded-lg border px-2 py-1 text-[10px] font-bold " + nineHourClass(liveWorkSeconds(r))}>{liveWorkSeconds(r) >= nineHourSeconds ? "9+ Hours" : "Under 9 Hours"}</span><span className="text-xs font-semibold">{formatDuration(liveWorkSeconds(r))}</span></div>)}{!rows.length && !loading && <div className="px-3 py-8 text-center text-sm text-muted-foreground"><UsersRound size={18} className="mx-auto mb-2" />No active CRM members found.</div>}</div></div>
    </div>
    <div className="mt-5 border-t pt-5">
      <div className="flex items-center justify-between"><div><p className="font-black">HR Leave Approval</p><p className="text-xs text-muted-foreground">Accept/reject pending leave. Approved leave is shown green in CRM attendance.</p></div><Clock3 size={18} className="text-primary"/></div>
      <div className="mt-3 space-y-3">{leaves.filter(l=>l.status==="pending").map(l=>{const member=rows.find(r=>r.user_id===l.user_id)?.member; return <div key={l.id} className="rounded-2xl border p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold">{member?.name ?? "Team member"} <span className="ml-1 rounded-full bg-muted px-2 py-1 text-[10px] uppercase">{l.leave_type}</span></p><p className="text-xs text-muted-foreground">{l.start_date} → {l.end_date} · {l.total_days} working day(s)</p><p className="mt-1 text-xs">{l.reason}</p></div><span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-600">Pending</span></div><textarea value={reviewNote[l.id] ?? ""} onChange={e=>setReviewNote(x=>({...x,[l.id]:e.target.value}))} placeholder="HR message…" className="mt-3 min-h-16 w-full rounded-xl border bg-background p-3 text-sm"/><div className="mt-2 flex gap-2"><Button size="sm" className="rounded-xl" disabled={reviewing===l.id} onClick={()=>void reviewLeave(l,"approved")}><CheckCircle2 size={13} className="mr-1"/>Accept Leave</Button><Button size="sm" variant="destructive" className="rounded-xl" disabled={reviewing===l.id} onClick={()=>void reviewLeave(l,"rejected")}><XCircle size={13} className="mr-1"/>Reject Leave</Button></div></div>})}{!leaves.some(l=>l.status==="pending")&&<p className="py-5 text-center text-sm text-muted-foreground">No pending leave approvals.</p>}</div>
    </div>
  </GlassCard>;
}