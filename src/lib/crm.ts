import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------------------------------------------------------------ types */

export type CrmLead = {
  id: string;
  full_name: string;
  email: string;
  phone_country: string;
  phone: string;
  company: string | null;
  website: string | null;
  service: string;
  message: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  preferred_contact: string | null;
  source: string;
  page_path: string | null;
  status: string;
  score: number;
  deal_value: number;
  assigned_to: string | null;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  position: string;
  email: string;
  mobile: string | null;
  working_days: string[];
  working_hours: string;
  photo_url: string | null;
  status: string;
  created_at: string;
};

export type Activity = {
  id: string;
  lead_id: string;
  type: string;
  subject: string | null;
  body: string | null;
  outcome: string | null;
  duration_seconds: number | null;
  actor_email: string | null;
  team_member_id: string | null;
  created_at: string;
};

export type FollowUp = {
  id: string;
  lead_id: string;
  title: string;
  notes: string | null;
  due_at: string;
  reminder_minutes: number;
  team_member_id: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

/* -------------------------------------------------------------- constants */

export const CRM_STAGES = [
  { id: "new", label: "New", tone: "from-sky-500 to-cyan-400" },
  { id: "contacted", label: "Contacted", tone: "from-blue-500 to-indigo-400" },
  { id: "qualified", label: "Qualified", tone: "from-violet-500 to-purple-400" },
  { id: "proposal_sent", label: "Proposal", tone: "from-fuchsia-500 to-pink-400" },
  { id: "won", label: "Won", tone: "from-emerald-500 to-teal-400" },
  { id: "lost", label: "Lost", tone: "from-rose-500 to-orange-400" },
] as const;

export const stageLabel = (id: string) =>
  CRM_STAGES.find((s) => s.id === id)?.label ?? id;

export const ACTIVITY_TYPES = ["call", "email", "note", "meeting", "status"] as const;

export const CALL_OUTCOMES = [
  "Connected",
  "No answer",
  "Busy",
  "Wrong number",
  "Callback requested",
  "Not interested",
] as const;

export const WORKING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const statusTone = (status: string) =>
  ({
    new: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    contacted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    qualified: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    proposal_sent: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
    negotiation: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    won: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    lost: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  })[status] ?? "bg-muted text-muted-foreground border-border";

export const fullPhone = (l: Pick<CrmLead, "phone_country" | "phone">) =>
  `${l.phone_country ?? ""}${l.phone ?? ""}`.replace(/\s/g, "");

export const relativeTime = (iso?: string | null) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60000);
  const suffix = diff >= 0 ? "ago" : "from now";
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ${suffix}`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ${suffix}`;
  return `${Math.round(h / 24)}d ${suffix}`;
};

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

/* ------------------------------------------------------------------ reads */

export async function fetchLeads(): Promise<CrmLead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  return (data ?? []) as CrmLead[];
}

export async function fetchLead(id: string): Promise<CrmLead | null> {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as CrmLead) ?? null;
}

export async function fetchTeam(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("crm_team_members")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function fetchActivities(leadId?: string): Promise<Activity[]> {
  let q = supabase.from("crm_activities").select("*").order("created_at", { ascending: false }).limit(500);
  if (leadId) q = q.eq("lead_id", leadId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Activity[];
}

export async function fetchFollowUps(leadId?: string): Promise<FollowUp[]> {
  let q = supabase.from("crm_followups").select("*").order("due_at", { ascending: true }).limit(1000);
  if (leadId) q = q.eq("lead_id", leadId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as FollowUp[];
}

/* ------------------------------------------------------------- mutations */

async function actorEmail() {
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export async function logActivity(input: {
  lead_id: string;
  type: string;
  subject?: string | null;
  body?: string | null;
  outcome?: string | null;
  duration_seconds?: number | null;
  team_member_id?: string | null;
}) {
  const { error } = await supabase.from("crm_activities").insert({
    ...input,
    actor_email: await actorEmail(),
  });
  if (error) throw error;
}

export async function updateLead(id: string, patch: Partial<CrmLead>) {
  const { error } = await supabase.from("leads").update(patch).eq("id", id);
  if (error) throw error;
}

export async function changeStage(lead: CrmLead, status: string) {
  await updateLead(lead.id, { status });
  await logActivity({
    lead_id: lead.id,
    type: "status",
    subject: `Stage changed to ${stageLabel(status)}`,
    body: `From ${stageLabel(lead.status)} → ${stageLabel(status)}`,
  });
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export async function createLead(input: Partial<CrmLead>) {
  const { data, error } = await supabase
    .from("leads")
    .insert({
      full_name: input.full_name ?? "",
      email: input.email ?? "",
      phone_country: input.phone_country ?? "+91",
      phone: input.phone ?? "",
      company: input.company ?? null,
      website: input.website ?? null,
      service: input.service ?? "Free Consultation",
      message: input.message ?? null,
      country: input.country ?? null,
      state: input.state ?? null,
      city: input.city ?? null,
      source: input.source ?? "crm_manual",
      status: input.status ?? "new",
      score: input.score ?? 30,
      deal_value: input.deal_value ?? 0,
      assigned_to: input.assigned_to ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function saveFollowUp(input: Partial<FollowUp> & { lead_id: string }) {
  if (input.id) {
    const { error } = await supabase
      .from("crm_followups")
      .update({
        title: input.title,
        notes: input.notes ?? null,
        due_at: input.due_at,
        reminder_minutes: input.reminder_minutes ?? 30,
        team_member_id: input.team_member_id ?? null,
        completed: input.completed ?? false,
        completed_at: input.completed ? new Date().toISOString() : null,
      })
      .eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("crm_followups").insert({
      lead_id: input.lead_id,
      title: input.title ?? "Follow-up",
      notes: input.notes ?? null,
      due_at: input.due_at ?? new Date().toISOString(),
      reminder_minutes: input.reminder_minutes ?? 30,
      team_member_id: input.team_member_id ?? null,
    });
    if (error) throw error;
  }
  if (input.due_at && !input.completed) {
    await updateLead(input.lead_id, { next_follow_up_at: input.due_at });
  }
}

export async function deleteFollowUp(id: string) {
  const { error } = await supabase.from("crm_followups").delete().eq("id", id);
  if (error) throw error;
}

export async function saveTeamMember(input: Partial<TeamMember>) {
  if (input.id) {
    const { error } = await supabase
      .from("crm_team_members")
      .update({
        name: input.name,
        position: input.position,
        email: input.email,
        mobile: input.mobile ?? null,
        working_days: input.working_days ?? [],
        working_hours: input.working_hours,
        photo_url: input.photo_url ?? null,
        status: input.status ?? "active",
      })
      .eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("crm_team_members").insert({
      name: input.name ?? "",
      position: input.position ?? "Sales Executive",
      email: input.email ?? "",
      mobile: input.mobile ?? null,
      working_days: input.working_days ?? ["Mon", "Tue", "Wed", "Thu", "Fri"],
      working_hours: input.working_hours ?? "10:00 - 19:00",
      photo_url: input.photo_url ?? null,
      status: input.status ?? "active",
    });
    if (error) throw error;
  }
}

export async function deleteTeamMember(id: string) {
  const { error } = await supabase.from("crm_team_members").delete().eq("id", id);
  if (error) throw error;
}

/* ----------------------------------------------------------------- AI ops */

export type AiAction =
  | "score"
  | "summary"
  | "followup_message"
  | "sales_email"
  | "intent"
  | "next_best_action";

export async function runCrmAi(action: AiAction, lead: CrmLead, activities: Activity[] = []) {
  const { data, error } = await supabase.functions.invoke("crm-ai", {
    body: {
      action,
      lead: {
        full_name: lead.full_name,
        email: lead.email,
        company: lead.company,
        service: lead.service,
        message: lead.message,
        city: lead.city,
        state: lead.state,
        country: lead.country,
        source: lead.source,
        status: lead.status,
        score: lead.score,
        created_at: lead.created_at,
      },
      activities: activities.slice(0, 15).map((a) => ({
        type: a.type,
        subject: a.subject,
        body: a.body,
        outcome: a.outcome,
        created_at: a.created_at,
      })),
    },
  });
  if (error) throw error;
  return data as { text?: string; score?: number };
}

/* ---------------------------------------------------------------- exports */

const leadRows = (leads: CrmLead[], team: TeamMember[]) =>
  leads.map((l) => ({
    Name: l.full_name,
    Email: l.email,
    Mobile: fullPhone(l),
    Company: l.company ?? "",
    City: l.city ?? "",
    State: l.state ?? "",
    Country: l.country ?? "",
    Source: l.source,
    Service: l.service,
    Status: stageLabel(l.status),
    Score: l.score,
    "Deal Value": l.deal_value ?? 0,
    "Assigned To": team.find((t) => t.id === l.assigned_to)?.name ?? "Unassigned",
    Created: new Date(l.created_at).toLocaleString(),
    "Last Contact": l.last_contact_at ? new Date(l.last_contact_at).toLocaleString() : "",
    "Next Follow-up": l.next_follow_up_at ? new Date(l.next_follow_up_at).toLocaleString() : "",
  }));

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(leads: CrmLead[], team: TeamMember[]) {
  const rows = leadRows(leads, team);
  const head = Object.keys(rows[0] ?? { Name: "" });
  const csv = [
    head.join(","),
    ...rows.map((r) => head.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `crm-leads-${Date.now()}.csv`);
}

export function exportExcel(leads: CrmLead[], team: TeamMember[]) {
  const ws = XLSX.utils.json_to_sheet(leadRows(leads, team));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  XLSX.writeFile(wb, `crm-leads-${Date.now()}.xlsx`);
}

export function exportPdf(leads: CrmLead[], team: TeamMember[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Crazy SEO Team — CRM Leads Report", 14, 15);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString()} · ${leads.length} leads`, 14, 21);
  const rows = leadRows(leads, team).map((r) => [
    r.Name, r.Email, r.Mobile, r.Company, r.City, r.Service, r.Status, String(r.Score), r["Assigned To"],
  ]);
  autoTable(doc, {
    head: [["Name", "Email", "Mobile", "Company", "City", "Service", "Status", "Score", "Owner"]],
    body: rows,
    startY: 26,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [79, 70, 229] },
  });
  doc.save(`crm-leads-${Date.now()}.pdf`);
}
