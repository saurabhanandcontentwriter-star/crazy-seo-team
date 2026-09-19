import { useEffect, useMemo, useState } from "react";
import { Mail, Pencil, Phone, Plus, Trash2, UsersRound, Search, UserCheck, Clock3, BriefcaseBusiness, WalletCards, CalendarDays } from "lucide-react";
import { toast } from "sonner";\nimport { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GlassCard, EmptyState, CrmSkeleton } from "@/components/crm/CrmUI";
import {
  CrmLead, TeamMember, WORKING_DAYS, deleteTeamMemberAuth, fetchLeads, fetchTeam, inr, saveTeamMemberAuth,
} from "@/lib/crm";

type Draft = Partial<TeamMember> & { password?: string };

export default function CrmTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<TeamMember | null>(null);\n  const [query, setQuery] = useState("");\n  const [statusFilter, setStatusFilter] = useState("all");\n  const [attendance, setAttendance] = useState<any[]>([]);\n  const [profiles, setProfiles] = useState<any[]>([]);

  const load = async () => {
    try {
      const [t, l] = await Promise.all([fetchTeam(), fetchLeads()]);
      setTeam(t);
      setLeads(l);
    } catch (e: any) {
      toast.error(e.message ?? "Could not load team");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const perf = useMemo(() => {
    const m: Record<string, { total: number; won: number; value: number }> = {};
    leads.forEach((l) => {
      if (!l.assigned_to) return;
      const e = (m[l.assigned_to] ||= { total: 0, won: 0, value: 0 });
      e.total += 1;
      if (l.status === "won") { e.won += 1; e.value += Number(l.deal_value ?? 0); }
    });
    return m;
  }, [leads]);

  const save = async () => {
    if (!draft?.name?.trim() || !draft?.email?.trim()) return toast.error("Name and email are required");
    if (!draft.id && (!draft.login_id?.trim() || !draft.password)) return toast.error("Login ID and password are required for a new member.");
    if (draft.password && draft.password.length < 8) return toast.error("Password must be at least 8 characters.");
    setSaving(true);
    try {
      await saveTeamMemberAuth(draft);
      setDraft(null);
      await load();
      toast.success("Team member saved");
    } catch (e: any) {
      toast.error(e.message ?? "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (d: string) => {
    const days = new Set(draft?.working_days ?? []);
    days.has(d) ? days.delete(d) : days.add(d);
    setDraft({ ...draft, working_days: WORKING_DAYS.filter((x) => days.has(x)) });
  };

  const visibleTeam = team.filter((m) => { const q = query.trim().toLowerCase(); const matches = !q || [m.name,m.email,m.position,m.login_id].some(v => (v || "").toLowerCase().includes(q)); return matches && (statusFilter === "all" || m.status === statusFilter); });\n  const activeCount = team.filter(m => m.status === "active").length;\n  const workingNow = attendance.filter(a => a.punch_in && !a.punch_out).length;\n  const totalPayroll = profiles.reduce((sum,p) => sum + Number(p.monthly_salary || 0), 0);\n  const profileFor = (m: TeamMember) => profiles.find(p => p.user_id === m.auth_user_id);\n  const attendanceFor = (m: TeamMember) => attendance.find(a => a.user_id === m.auth_user_id);\n  const formatDuration = (seconds=0) => { const h=Math.floor(seconds/3600); const min=Math.floor((seconds%3600)/60); return h ? h+"h "+min+"m" : min+"m"; };\n\n  if (loading) return <CrmSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{team.length} team member(s)</p>
        <Button size="sm" onClick={() => setDraft({ working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], working_hours: "10:00 - 19:00", position: "Sales Executive", status: "active", login_id: "", password: "" })}>
          <Plus size={15} className="mr-1" /> Add member
        </Button>
      </div>

      {team.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTeam.map((m, i) => {
            const p = perf[m.id] ?? { total: 0, won: 0, value: 0 };
            return (
              <GlassCard key={m.id} delay={i * 0.04} className="p-4">
                <div className="flex items-start gap-3">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="h-12 w-12 rounded-2xl object-cover" loading="lazy" />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-black text-white">
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{m.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{m.position}</p>
                    <span className={`mt-1 inline-block rounded-lg border px-2 py-0.5 text-[10px] font-bold ${
                      m.status === "active" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-border bg-muted text-muted-foreground"
                    }`}>{m.status}</span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setDraft(m)} aria-label="Edit"><Pencil size={14} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setRemoving(m)} aria-label="Delete"><Trash2 size={14} /></Button>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-[12px]">
                  <p className="flex items-center gap-2 truncate"><Mail size={13} className="text-muted-foreground" />{m.email}</p>
                  {m.login_id && <p className="text-[11px] font-semibold text-primary">Team ID: {m.login_id}</p>}
                  {m.mobile && <p className="flex items-center gap-2"><Phone size={13} className="text-muted-foreground" />{m.mobile}</p>}
                  <p className="text-muted-foreground">{(m.working_days ?? []).join(", ")} · {m.working_hours}</p>{profileFor(m)&&<p className="text-muted-foreground">{profileFor(m).department||"Department"} · {profileFor(m).designation||m.position}</p>}{profileFor(m)?.monthly_salary!=null&&<p className="font-semibold">Monthly salary: {inr(Number(profileFor(m).monthly_salary))}</p>}{attendanceFor(m)&&<p className={attendanceFor(m).punch_out?"text-emerald-600 font-semibold":"text-amber-600 font-semibold"}><CalendarDays size={12} className="inline mr-1"/>{attendanceFor(m).punch_in?"Punch In":"Not punched"}{attendanceFor(m).punch_out?" · Completed":" · Working"} · {formatDuration(attendanceFor(m).total_seconds||0)}</p>}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-muted/50 p-2"><p className="text-[10px] uppercase text-muted-foreground">Leads</p><p className="font-black">{p.total}</p></div>
                  <div className="rounded-xl bg-muted/50 p-2"><p className="text-[10px] uppercase text-muted-foreground">Won</p><p className="font-black">{p.won}</p></div>
                  <div className="rounded-xl bg-muted/50 p-2"><p className="text-[10px] uppercase text-muted-foreground">Value</p><p className="text-[12px] font-black">{inr(p.value)}</p></div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="p-2">
          <EmptyState
            icon={UsersRound}
            title="No team members yet"
            hint="Add your sales executives to assign leads and follow-ups."
            action={<Button onClick={() => setDraft({ working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], working_hours: "10:00 - 19:00", position: "Sales Executive", status: "active" })}>Add member</Button>}
          />
        </GlassCard>
      )}

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{draft?.id ? "Edit member" : "Add member"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input className="mt-1" value={draft?.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label>Position</Label><Input className="mt-1" value={draft?.position ?? ""} onChange={(e) => setDraft({ ...draft, position: e.target.value })} /></div>
            <div><Label>Email *</Label><Input className="mt-1" type="email" value={draft?.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
            <div><Label>Team ID *</Label><Input className="mt-1" value={draft?.login_id ?? ""} onChange={(e) => setDraft({ ...draft, login_id: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "") })} placeholder="e.g. cst_sales01" disabled={!!draft?.id} /></div>
            <div><Label>{draft?.id ? "New password (optional)" : "Password *"}</Label><Input className="mt-1" type="password" value={draft?.password ?? ""} onChange={(e) => setDraft({ ...draft, password: e.target.value })} placeholder="Minimum 8 characters" /></div>
            <div><Label>Mobile</Label><Input className="mt-1" value={draft?.mobile ?? ""} onChange={(e) => setDraft({ ...draft, mobile: e.target.value })} /></div>
            <div><Label>Photo URL</Label><Input className="mt-1" value={draft?.photo_url ?? ""} onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })} /></div>
            <div>
              <Label>Working days</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {WORKING_DAYS.map((d) => {
                  const on = (draft?.working_days ?? []).includes(d);
                  return (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div><Label>Working hours</Label><Input className="mt-1" value={draft?.working_hours ?? ""} onChange={(e) => setDraft({ ...draft, working_hours: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <Select value={draft?.status ?? "active"} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Leads assigned to this member will become unassigned.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!removing) return;
              try {
                await deleteTeamMemberAuth(removing.id);
                setRemoving(null);
                await load();
                toast.success("Removed");
              } catch (e: any) { toast.error(e.message ?? "Could not remove"); }
            }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
