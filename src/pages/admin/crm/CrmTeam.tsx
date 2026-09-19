import { useEffect, useMemo, useState } from "react";
import { Mail, Pencil, Phone, Plus, Trash2, UsersRound, Search, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { GlassCard, EmptyState, CrmSkeleton } from "@/components/crm/CrmUI";
import { CrmLead, TeamMember, FollowUp, Activity, WORKING_DAYS, deleteTeamMemberAuth, fetchActivities, fetchFollowUps, fetchLeads, fetchTeam, inr, saveTeamMemberAuth, stageLabel } from "@/lib/crm";

type Draft = Partial<TeamMember> & { password?: string };

const TEAM_ROLES = ["Founder", "CTO", "Manager", "Vice President", "Accountant", "Sales", "Intern"] as const;

export default function CrmTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    try {
      const [t, l] = await Promise.all([fetchTeam(), fetchLeads()]);
      setTeam(t);
      setLeads(l);
      if (selected) {
        const fresh = t.find(x => x.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Could not load team");
    } finally {
      setLoading(false);
    }
  };

  const openWorkspace = async (member: TeamMember) => {
    setSelected(member);
    setWorkspaceLoading(true);
    try {
      const [fu, act] = await Promise.all([fetchFollowUps(), fetchActivities()]);
      setFollowups(fu.filter(x => x.team_member_id === member.id));
      const memberLeadIds = new Set(leads.filter(x => x.assigned_to === member.id).map(x => x.id));
      setActivities(act.filter(x => x.team_member_id === member.id || memberLeadIds.has(x.lead_id)));
    } catch (e: any) {
      toast.error(e.message ?? "Could not load employee workspace");
    } finally {
      setWorkspaceLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

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
    } catch (e: any) { toast.error(e.message ?? "Could not save"); }
    finally { setSaving(false); }
  };

  const toggleDay = (d: string) => {
    const days = new Set(draft?.working_days ?? []);
    days.has(d) ? days.delete(d) : days.add(d);
    setDraft({ ...draft, working_days: WORKING_DAYS.filter((x) => days.has(x)) });
  };

  const visibleTeam = team.filter((m) => {
    const q = query.trim().toLowerCase();
    const matches = !q || [m.name, m.email, m.position, m.login_id].some(v => (v || "").toLowerCase().includes(q));
    return matches && (statusFilter === "all" || m.status === statusFilter);
  });

  if (loading) return <CrmSkeleton />;

  const assignedLeads = selected ? leads.filter(l => l.assigned_to === selected.id) : [];
  const openLeads = assignedLeads.filter(l => !["won", "lost"].includes(l.status));
  const wonLeads = assignedLeads.filter(l => l.status === "won");
  const pipelineValue = assignedLeads.reduce((s, l) => s + Number(l.deal_value || 0), 0);
  const pendingFollowups = followups.filter(x => !x.completed);
  const completedFollowups = followups.filter(x => x.completed);

  return (
    <div className="space-y-5">
      <GlassCard className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Employee Management</p>
            <h2 className="mt-1 text-2xl font-black">Employees & Employee Workspaces</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage employees from here and open a separate live workspace for every employee.</p>
          </div>
          <Button onClick={() => setDraft({ working_days: ["Mon", "Tue", "Wed", "Thu", "Fri"], working_hours: "10:00 - 19:00", position: "Sales", status: "active", login_id: "", password: "" })}>
            <Plus size={15} className="mr-1" /> Add employee
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border p-3"><p className="text-xs text-muted-foreground">Total Employees</p><p className="text-2xl font-black">{team.length}</p></div>
          <div className="rounded-2xl border p-3"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-black">{team.filter(x => x.status === "active").length}</p></div>
          <div className="rounded-2xl border p-3"><p className="text-xs text-muted-foreground">Assigned Leads</p><p className="text-2xl font-black">{leads.filter(x => !!x.assigned_to).length}</p></div>
          <div className="rounded-2xl border p-3"><p className="text-xs text-muted-foreground">Selected Workspace</p><p className="text-sm font-black mt-2 truncate">{selected?.name || "Select employee"}</p></div>
        </div>
      </GlassCard>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
        <GlassCard className="p-4">
          <div className="mb-4 flex flex-col gap-2 md:flex-row">
            <div className="relative flex-1"><Search size={15} className="absolute left-3 top-3 text-muted-foreground" /><Input className="pl-9" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search employee..." /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full md:w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
          </div>
          <div className="space-y-2">
            {visibleTeam.length === 0 ? <EmptyState icon={UsersRound} title="No employees found" hint="Add an employee or change the search filter." /> : visibleTeam.map((m, i) => {
              const p = perf[m.id] ?? { total: 0, won: 0, value: 0 };
              const active = selected?.id === m.id;
              return <div key={m.id} className={`rounded-2xl border p-4 transition ${active ? "border-primary/50 bg-primary/5" : ""}`}>
                <div className="flex items-start gap-3">
                  {m.photo_url ? <img src={m.photo_url} alt={m.name} className="h-12 w-12 rounded-2xl object-cover" /> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">{m.name.charAt(0).toUpperCase()}</span>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{m.name}</p><p className="truncate text-[11px] font-semibold text-primary">{m.position || "Unassigned role"}</p>
                    <p className="mt-1 flex items-center gap-2 truncate text-[11px]"><Mail size={12} />{m.email}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setDraft(m)}><Pencil size={14} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setRemoving(m)}><Trash2 size={14} /></Button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-muted/50 p-2"><p className="text-[10px] text-muted-foreground">Leads</p><p className="font-black">{p.total}</p></div>
                  <div className="rounded-xl bg-muted/50 p-2"><p className="text-[10px] text-muted-foreground">Won</p><p className="font-black">{p.won}</p></div>
                  <div className="rounded-xl bg-muted/50 p-2"><p className="text-[10px] text-muted-foreground">Value</p><p className="text-xs font-black">{inr(p.value)}</p></div>
                </div>
                <Button className="mt-3 w-full rounded-xl" variant={active ? "default" : "outline"} onClick={() => void openWorkspace(m)}>
                  <BriefcaseBusiness size={15} className="mr-2" /> {active ? "Workspace Open" : "Open Employee Workspace"}
                </Button>
              </div>;
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-5 min-h-[420px]">
          {!selected ? <div className="flex min-h-[380px] items-center justify-center text-center"><div><BriefcaseBusiness className="mx-auto text-primary" size={38}/><p className="mt-3 font-black text-lg">Employee Workspace</p><p className="mt-1 text-sm text-muted-foreground">Select an employee to open their workspace.</p></div></div> :
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {selected.photo_url ? <img src={selected.photo_url} alt={selected.name} className="h-14 w-14 rounded-2xl object-cover" /> : <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">{selected.name.charAt(0)}</div>}
                <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wider text-primary">Employee Workspace</p><h3 className="text-xl font-black truncate">{selected.name}</h3><p className="text-xs text-muted-foreground">{selected.position} · {selected.status}</p><p className="mt-1 text-xs text-muted-foreground">{selected.email}{selected.mobile ? ` · ${selected.mobile}` : ""}</p></div>
              </div>
              {workspaceLoading ? <p className="py-12 text-center text-sm text-muted-foreground">Loading employee workspace…</p> : <>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <div className="rounded-xl border p-3"><p className="text-[10px] text-muted-foreground">Open Leads</p><p className="text-xl font-black">{openLeads.length}</p></div>
                  <div className="rounded-xl border p-3"><p className="text-[10px] text-muted-foreground">Won</p><p className="text-xl font-black">{wonLeads.length}</p></div>
                  <div className="rounded-xl border p-3"><p className="text-[10px] text-muted-foreground">Pending Follow-ups</p><p className="text-xl font-black">{pendingFollowups.length}</p></div>
                  <div className="rounded-xl border p-3"><p className="text-[10px] text-muted-foreground">Pipeline</p><p className="text-sm font-black mt-1">{inr(pipelineValue)}</p></div>
                </div>
                <div className="rounded-2xl border">
                  <div className="border-b p-3"><p className="font-black">Assigned Leads</p></div>
                  <div className="max-h-56 space-y-2 overflow-auto p-3">
                    {assignedLeads.length === 0 ? <p className="text-sm text-muted-foreground">No leads assigned.</p> : assignedLeads.map(l => <div key={l.id} className="rounded-xl border p-3"><div className="flex items-center justify-between gap-2"><p className="font-semibold truncate">{l.full_name}</p><span className="rounded-full bg-muted px-2 py-1 text-[10px]">{stageLabel(l.status)}</span></div><p className="mt-1 text-xs text-muted-foreground truncate">{l.email}{l.company ? ` · ${l.company}` : ""}</p><p className="mt-1 text-[11px] font-semibold">{inr(Number(l.deal_value || 0))}</p></div>)}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border p-3"><div className="mb-2 flex items-center gap-2"><Clock3 size={15} className="text-primary"/><p className="font-black">Follow-ups</p></div><p className="text-xs text-muted-foreground">{pendingFollowups.length} pending · {completedFollowups.length} completed</p>{pendingFollowups.slice(0,5).map(f=><div key={f.id} className="mt-2 rounded-xl bg-muted/50 p-2"><p className="text-xs font-semibold">{f.title}</p><p className="text-[10px] text-muted-foreground">{new Date(f.due_at).toLocaleString("en-IN")}</p></div>)}</div>
                  <div className="rounded-2xl border p-3"><div className="mb-2 flex items-center gap-2"><CheckCircle2 size={15} className="text-primary"/><p className="font-black">Recent Activity</p></div>{activities.length === 0 ? <p className="text-xs text-muted-foreground">No activity recorded.</p> : activities.slice(0,5).map(a=><div key={a.id} className="mt-2 rounded-xl bg-muted/50 p-2"><p className="text-xs font-semibold">{a.subject || a.type}</p><p className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString("en-IN")}</p></div>)}</div>
                </div>
                <div className="grid gap-2 text-xs md:grid-cols-2">
                  <div className="rounded-xl border p-3"><p className="font-bold">Working Days</p><p className="mt-1 text-muted-foreground">{(selected.working_days || []).join(", ") || "—"}</p></div>
                  <div className="rounded-xl border p-3"><p className="font-bold">Working Hours</p><p className="mt-1 text-muted-foreground">{selected.working_hours || "—"}</p></div>
                </div>
              </>}
            </div>}
        </GlassCard>
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{draft?.id ? "Edit employee" : "Add employee"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input className="mt-1" value={draft?.name ?? ""} onChange={e => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label>Role / Position</Label><Select value={draft?.position ?? "Sales"} onValueChange={v => setDraft({ ...draft, position: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent>{TEAM_ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Email *</Label><Input className="mt-1" type="email" value={draft?.email ?? ""} onChange={e => setDraft({ ...draft, email: e.target.value })} /></div>
            <div><Label>Team ID *</Label><Input className="mt-1" value={draft?.login_id ?? ""} onChange={e => setDraft({ ...draft, login_id: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "") })} disabled={!!draft?.id} /></div>
            <div><Label>{draft?.id ? "New password (optional)" : "Password *"}</Label><Input className="mt-1" type="password" value={draft?.password ?? ""} onChange={e => setDraft({ ...draft, password: e.target.value })} placeholder="Minimum 8 characters" /></div>
            <div><Label>Mobile</Label><Input className="mt-1" value={draft?.mobile ?? ""} onChange={e => setDraft({ ...draft, mobile: e.target.value })} /></div>
            <div><Label>Photo URL</Label><Input className="mt-1" value={draft?.photo_url ?? ""} onChange={e => setDraft({ ...draft, photo_url: e.target.value })} /></div>
            <div><Label>Working days</Label><div className="mt-1 flex flex-wrap gap-1">{WORKING_DAYS.map(d => { const on = (draft?.working_days ?? []).includes(d); return <button key={d} type="button" onClick={() => toggleDay(d)} className={`rounded-lg border px-2 py-1 text-xs font-semibold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>{d}</button>; })}</div></div>
            <div><Label>Working hours</Label><Input className="mt-1" value={draft?.working_hours ?? ""} onChange={e => setDraft({ ...draft, working_hours: e.target.value })} /></div>
            <div><Label>Status</Label><Select value={draft?.status ?? "active"} onValueChange={v => setDraft({ ...draft, status: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removing} onOpenChange={o => !o && setRemoving(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle><AlertDialogDescription>Leads assigned to this member will become unassigned.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (!removing) return; try { await deleteTeamMemberAuth(removing.id); setRemoving(null); if (selected?.id === removing.id) setSelected(null); await load(); toast.success("Employee removed"); } catch (e: any) { toast.error(e.message ?? "Could not remove"); } }}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
