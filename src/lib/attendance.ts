import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
export const DAILY_TARGET_SECONDS = 8 * 60 * 60;

export type Attendance = {
  id: string; user_id: string; email: string; work_date: string;
  punch_in: string | null; punch_out: string | null; total_seconds: number;
  regular_seconds?: number; overtime_seconds?: number; overtime_started_at?: string | null;
  break_started_at?: string | null; total_break_seconds?: number; break_status?: "none" | "on_break"; break_reason?: string | null;
  status: "punched_in" | "punched_out"; work_status: "red" | "green";
  work_mode: "office" | "home" | "remote"; created_at: string; updated_at: string;
};

export const indiaDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const formatClock = (iso: string | null) => iso ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).format(new Date(iso)) : "—";
export const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(sec).padStart(2,"0")}s`;
};
async function currentUser() {
  const { data, error } = await db.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("कृपया दोबारा लॉगिन करें।");
  return data.user;
}
export async function getTodayAttendance(): Promise<Attendance | null> {
  const user = await currentUser();
  const { data, error } = await db.from("crm_attendance").select("*").eq("user_id", user.id).eq("work_date", indiaDate()).maybeSingle();
  if (error) throw error;
  return data as Attendance | null;
}
export type WorkMode = "office" | "home" | "remote";
export async function punchIn(workMode: WorkMode = "office") {
  const user = await currentUser(), now = new Date().toISOString(), workDate = indiaDate();
  if (await getTodayAttendance()) throw new Error("आज का Punch In पहले से दर्ज है।");
  const { data, error } = await db.from("crm_attendance").upsert({
    user_id:user.id,email:user.email ?? "",work_date:workDate,punch_in:now,punch_out:null,total_seconds:0,
    regular_seconds:0,overtime_seconds:0,overtime_started_at:null,total_break_seconds:0,
    break_started_at:null,break_status:"none",status:"punched_in"
  }, { onConflict:"user_id,work_date" }).select("*").single();
  if (error) throw new Error(error.message || "Punch In सेव नहीं हुआ।");
  return data as Attendance;
}
export async function startBreak(current: Attendance, reason: "Lunch" | "Break") {
  if (current.break_status === "on_break") throw new Error("पहले चल रहा ब्रेक समाप्त करें।");
  const at = new Date().toISOString();
  const { data, error } = await db.from("crm_attendance").update({break_started_at:at,break_status:"on_break",break_reason:reason}).eq("id",current.id).eq("status","punched_in").select("*").single();
  if (error) throw new Error(error.message || "ब्रेक शुरू नहीं हुआ।");
  return data as Attendance;
}
export async function endBreak(current: Attendance) {
  if (!current.break_started_at || current.break_status !== "on_break") throw new Error("कोई ब्रेक चालू नहीं है।");
  const seconds = Math.max(0,Math.floor((Date.now()-new Date(current.break_started_at).getTime())/1000));
  const { data, error } = await db.from("crm_attendance").update({break_started_at:null,break_status:"none",break_reason:null,total_break_seconds:Number(current.total_break_seconds||0)+seconds}).eq("id",current.id).eq("status","punched_in").select("*").single();
  if (error) throw new Error(error.message || "ब्रेक समाप्त नहीं हुआ।");
  return data as Attendance;
}
export async function startOvertime(current: Attendance) {
  if (current.overtime_started_at) return current;
  if (current.break_status === "on_break") throw new Error("ओवरटाइम शुरू करने से पहले ब्रेक समाप्त करें।");
  const at = new Date().toISOString();
  const { data, error } = await db.from("crm_attendance").update({overtime_started_at:at}).eq("id",current.id).eq("status","punched_in").select("*").single();
  if (error) throw new Error(error.message || "ओवरटाइम शुरू नहीं हुआ।");
  return data as Attendance;
}
export async function punchOut(current: Attendance) {
  if (!current.punch_in) throw new Error("पहले Punch In करें।");
  if (current.break_status === "on_break" && current.break_started_at) throw new Error("Punch Out से पहले अपना ब्रेक समाप्त करें।");
  const now = new Date(), iso = now.toISOString();
  const gross = Math.max(0,Math.floor((now.getTime()-new Date(current.punch_in).getTime())/1000));
  const net = Math.max(0,gross-Number(current.total_break_seconds||0));
  const regular = Math.min(DAILY_TARGET_SECONDS,net);
  const overtime = current.overtime_started_at ? Math.max(0,net-DAILY_TARGET_SECONDS) : 0;
  const { data, error } = await db.from("crm_attendance").update({
    punch_out:iso,total_seconds:net,regular_seconds:regular,overtime_seconds:overtime,status:"punched_out"
  }).eq("id",current.id).select("*").single();
  if (error) throw new Error(error.message || "Punch Out सेव नहीं हुआ।");
  return data as Attendance;
}
export async function getWorkingHours() { return "8 घंटे प्रतिदिन"; }
