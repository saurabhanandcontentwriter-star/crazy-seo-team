import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

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

export const indiaDate = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export const formatClock = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).format(new Date(iso)) : "—";

export const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
};

export async function getTodayAttendance(): Promise<Attendance | null> {
  const { data: userData, error: userError } = await db.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return null;
  const { data, error } = await db.from("crm_attendance").select("*").eq("user_id", userData.user.id).eq("work_date", indiaDate()).maybeSingle();
  if (error) throw error;
  return (data as Attendance) ?? null;
}

export async function punchIn() {
  const { data: userData, error: userError } = await db.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Please sign in again.");
  const now = new Date().toISOString();
  const { data, error } = await db.from("crm_attendance").upsert({
    user_id: userData.user.id,
    email: userData.user.email ?? "",
    work_date: indiaDate(),
    punch_in: now,
    punch_out: null,
    total_seconds: 0,
    status: "punched_in",
  }, { onConflict: "user_id,work_date" }).select("*").single();
  if (error) throw error;
  return data as Attendance;
}

export async function punchOut(current: Attendance) {
  if (!current.punch_in) throw new Error("Punch in first.");
  const now = new Date();
  const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(current.punch_in).getTime()) / 1000));
  const { data, error } = await db.from("crm_attendance").update({
    punch_out: now.toISOString(),
    total_seconds: elapsed,
    status: "punched_out",
  }).eq("id", current.id).select("*").single();
  if (error) throw error;
  return data as Attendance;
}

export async function getWorkingHours() {
  const { data: userData } = await db.auth.getUser();
  const email = userData.user?.email;
  if (!email) return "10:00 - 19:00";
  const { data } = await db.from("crm_team_members").select("working_hours").eq("email", email).maybeSingle();
  return data?.working_hours || "10:00 - 19:00";
}
