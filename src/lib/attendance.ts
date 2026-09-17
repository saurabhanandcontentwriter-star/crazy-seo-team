import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
const STORAGE_KEY = "cst_crm_attendance_v2";

export type Attendance = {
  id: string;
  user_id: string;
  email: string;
  work_date: string;
  punch_in: string | null;
  punch_out: string | null;
  total_seconds: number;
  status: "punched_in" | "punched_out";
  created_at: string;
  updated_at: string;
};

export const indiaDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export const formatClock = (iso: string | null) => iso ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).format(new Date(iso)) : "—";

export const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
};

const localKey = (userId: string, date = indiaDate()) => `${STORAGE_KEY}:${userId}:${date}`;
function writeLocal(value: Attendance) { try { localStorage.setItem(localKey(value.user_id, value.work_date), JSON.stringify(value)); } catch {} return value; }

async function currentUser() {
  const { data, error } = await db.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Please sign in again.");
  return data.user;
}

export async function getTodayAttendance(): Promise<Attendance | null> {
  const user = await currentUser();
  const { data, error } = await db.from("crm_attendance").select("*").eq("user_id", user.id).eq("work_date", indiaDate()).maybeSingle();
  if (error) throw error;
  return data ? writeLocal(data as Attendance) : null;
}

export async function punchIn() {
  const user = await currentUser();
  const now = new Date().toISOString();
  const workDate = indiaDate();
  const { data, error } = await db.from("crm_attendance").upsert({
    user_id: user.id,
    email: user.email ?? "",
    work_date: workDate,
    punch_in: now,
    punch_out: null,
    total_seconds: 0,
    status: "punched_in",
  }, { onConflict: "user_id,work_date" }).select("*").single();
  if (error) throw new Error(error.message || "Could not save Punch In record.");
  return writeLocal(data as Attendance);
}

export async function punchOut(current: Attendance) {
  if (!current.punch_in) throw new Error("Punch in first.");
  const now = new Date();
  const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(current.punch_in).getTime()) / 1000));
  const iso = now.toISOString();
  const { data, error } = await db.from("crm_attendance").update({ punch_out: iso, total_seconds: elapsed, status: "punched_out" }).eq("id", current.id).select("*").single();
  if (error) throw new Error(error.message || "Could not save Punch Out record.");
  return writeLocal(data as Attendance);
}

export async function getWorkingHours() {
  return "10:00 - 19:00";
}
