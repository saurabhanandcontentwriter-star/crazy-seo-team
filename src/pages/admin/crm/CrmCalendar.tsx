import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassCard, EmptyState, CrmSkeleton } from "@/components/crm/CrmUI";
import {
  CrmLead, FollowUp, TeamMember, deleteFollowUp, fetchFollowUps, fetchLeads, fetchTeam,
  relativeTime, saveFollowUp,
} from "@/lib/crm";

const NONE = "__none__";
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function CrmCalendar() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [open, setOpen] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [title, setTitle] = useState("Follow-up call");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");
  const [member, setMember] = useState(NONE);

  const load = async () => {
    try {
      const [f, l, t] = await Promise.all([fetchFollowUps(), fetchLeads(), fetchTeam()]);
      setItems(f);
      setLeads(l);
      setTeam(t);
    } catch (e: any) {
      toast.error(e.message ?? "Could not load follow-ups");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const byDay = useMemo(() => {
    const m: Record<string, FollowUp[]> = {};
    items.forEach((f) => {
      const k = dayKey(new Date(f.due_at));
      (m[k] ||= []).push(f);
    });
    return m;
  }, [items]);

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // Monday first
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const leadName = (id: string) => leads.find((l) => l.id === id)?.full_name ?? "Lead";
  const dayItems = byDay[dayKey(selected)] ?? [];
  const upcoming = items.filter((f) => !f.completed && new Date(f.due_at).getTime() >= Date.now()).slice(0, 8);
  const overdue = items.filter((f) => !f.completed && new Date(f.due_at).getTime() < Date.now());

  const save = async () => {
    if (!leadId) return toast.error("Choose a lead");
    if (!when) return toast.error("Pick date & time");
    await saveFollowUp({
      lead_id: leadId,
      title,
      notes,
      due_at: new Date(when).toISOString(),
      reminder_minutes: 30,
      team_member_id: member === NONE ? null : member,
    });
    setOpen(false);
    setNotes("");
    await load();
    toast.success("Follow-up scheduled");
  };

  if (loading) return <CrmSkeleton />;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <GlassCard className="p-4 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft size={16} /></Button>
            <p className="min-w-[150px] text-center text-sm font-black">
              {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
            </p>
            <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight size={16} /></Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setCursor(new Date()); setSelected(new Date()); }}>Today</Button>
            <Button size="sm" onClick={() => { setOpen(true); setWhen(new Date(selected.getTime() - selected.getTimezoneOffset() * 60000).toISOString().slice(0, 16)); }}>
              New follow-up
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((d) => {
            const list = byDay[dayKey(d)] ?? [];
            const isMonth = d.getMonth() === cursor.getMonth();
            const isToday = dayKey(d) === dayKey(new Date());
            const isSel = dayKey(d) === dayKey(selected);
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelected(new Date(d))}
                className={`min-h-[62px] rounded-xl border p-1 text-left transition-colors ${
                  isSel ? "border-primary bg-primary/10" : "border-border/50 hover:bg-muted/50"
                } ${isMonth ? "" : "opacity-40"}`}
              >
                <span className={`text-[11px] font-bold ${isToday ? "text-primary" : ""}`}>{d.getDate()}</span>
                <div className="mt-0.5 space-y-0.5">
                  {list.slice(0, 2).map((f) => (
                    <span
                      key={f.id}
                      className={`block truncate rounded px-1 text-[9px] font-semibold ${
                        f.completed ? "bg-emerald-500/15 text-emerald-600" :
                        new Date(f.due_at).getTime() < Date.now() ? "bg-rose-500/15 text-rose-600" : "bg-blue-500/15 text-blue-600"
                      }`}
                    >
                      {leadName(f.lead_id)}
                    </span>
                  ))}
                  {list.length > 2 && <span className="block text-[9px] text-muted-foreground">+{list.length - 2} more</span>}
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <div className="space-y-4">
        <GlassCard className="p-4" delay={0.05}>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold"><CalendarDays size={15} className="text-primary" /> {selected.toDateString()}</p>
          {dayItems.length ? (
            <ul className="space-y-2">
              {dayItems.map((f) => (
                <li key={f.id} className="rounded-2xl border border-border/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/admin/crm/leads/${f.lead_id}`} className="text-sm font-semibold hover:underline">{leadName(f.lead_id)}</Link>
                      <p className="text-[11px] text-muted-foreground">{f.title} · {new Date(f.due_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      {f.notes && <p className="mt-1 text-[11px] text-muted-foreground">{f.notes}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!f.completed && (
                        <Button size="icon" variant="ghost" title="Mark done" onClick={async () => { await saveFollowUp({ ...f, completed: true }); await load(); }}>
                          <CheckCircle2 size={15} />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" title="Delete" onClick={async () => { await deleteFollowUp(f.id); await load(); toast.success("Deleted"); }}>
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarDays} title="Nothing scheduled" hint="Pick another day or add a follow-up." />
          )}
        </GlassCard>

        <GlassCard className="p-4" delay={0.1}>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold"><Clock size={15} className="text-primary" /> Upcoming</p>
          {overdue.length > 0 && (
            <p className="mb-2 rounded-xl bg-rose-500/10 px-2 py-1 text-[11px] font-semibold text-rose-600">{overdue.length} overdue follow-up(s)</p>
          )}
          {upcoming.length ? (
            <ul className="space-y-1.5">
              {upcoming.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link to={`/admin/crm/leads/${f.lead_id}`} className="truncate hover:underline">{leadName(f.lead_id)}</Link>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{relativeTime(f.due_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming follow-ups.</p>
          )}
        </GlassCard>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New follow-up</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Lead</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a lead" /></SelectTrigger>
                <SelectContent>
                  {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.full_name} — {l.service}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Title</Label><Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label>Date & time</Label><Input className="mt-1" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></div>
            <div>
              <Label>Assign to</Label>
              <Select value={member} onValueChange={setMember}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {team.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea className="mt-1" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
