import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Bot, Building2, CalendarPlus, Globe, Mail, MapPin, MessageSquare, Phone, Sparkles, User2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassCard, EmptyState, CrmSkeleton } from "@/components/crm/CrmUI";
import {
  Activity, AiAction, CRM_STAGES, CrmLead, FollowUp, TeamMember, CALL_OUTCOMES,
  changeStage, fetchActivities, fetchFollowUps, fetchLead, fetchTeam, fullPhone, inr,
  logActivity, relativeTime, runCrmAi, saveFollowUp, stageLabel, statusTone, updateLead,
} from "@/lib/crm";

const AI_ACTIONS: { id: AiAction; label: string }[] = [
  { id: "score", label: "Score lead" },
  { id: "summary", label: "Summary" },
  { id: "intent", label: "Intent" },
  { id: "next_best_action", label: "Next best action" },
  { id: "followup_message", label: "WhatsApp message" },
  { id: "sales_email", label: "Sales email" },
];

const UNASSIGNED = "__unassigned__";

export default function CrmLeadProfile() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<CrmLead | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiBusy, setAiBusy] = useState<AiAction | null>(null);
  const [aiText, setAiText] = useState("");
  const [note, setNote] = useState("");
  const [callOutcome, setCallOutcome] = useState(CALL_OUTCOMES[0]);
  const [callMinutes, setCallMinutes] = useState("3");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [fuOpen, setFuOpen] = useState(false);
  const [fuTitle, setFuTitle] = useState("Follow-up call");
  const [fuWhen, setFuWhen] = useState("");
  const [fuNotes, setFuNotes] = useState("");

  const load = async () => {
    try {
      const [l, t, a, f] = await Promise.all([fetchLead(id), fetchTeam(), fetchActivities(id), fetchFollowUps(id)]);
      setLead(l);
      setTeam(t);
      setActivities(a);
      setFollowUps(f);
    } catch (e: any) {
      toast.error(e.message ?? "Could not load lead");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { setLoading(true); load(); /* eslint-disable-next-line */ }, [id]);

  const owner = useMemo(() => team.find((t) => t.id === lead?.assigned_to)?.name ?? "Unassigned", [team, lead]);

  if (loading) return <CrmSkeleton />;
  if (!lead)
    return (
      <GlassCard className="p-2">
        <EmptyState
          icon={User2}
          title="Lead not found"
          hint="It may have been deleted."
          action={<Button asChild variant="outline"><Link to="/admin/crm/leads">Back to leads</Link></Button>}
        />
      </GlassCard>
    );

  const refresh = async () => {
    const [l, a, f] = await Promise.all([fetchLead(id), fetchActivities(id), fetchFollowUps(id)]);
    setLead(l);
    setActivities(a);
    setFollowUps(f);
  };

  const runAi = async (action: AiAction) => {
    setAiBusy(action);
    setAiText("");
    try {
      const res = await runCrmAi(action, lead, activities);
      if (action === "score" && typeof res.score === "number") {
        await updateLead(lead.id, { score: res.score });
        setAiText(`Score: ${res.score}/100 — ${res.text ?? ""}`);
        await refresh();
      } else {
        setAiText(res.text ?? "No response");
      }
    } catch (e: any) {
      toast.error(e.message ?? "AI request failed");
    } finally {
      setAiBusy(null);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await logActivity({ lead_id: lead.id, type: "note", body: note.trim() });
    setNote("");
    await refresh();
    toast.success("Note added");
  };

  const logCall = async () => {
    await logActivity({
      lead_id: lead.id,
      type: "call",
      subject: `Call — ${callOutcome}`,
      outcome: callOutcome,
      duration_seconds: Math.max(0, Number(callMinutes) || 0) * 60,
    });
    await updateLead(lead.id, { last_contact_at: new Date().toISOString() });
    await refresh();
    toast.success("Call logged");
  };

  const sendEmail = async () => {
    if (!emailSubject.trim()) return toast.error("Subject required");
    await logActivity({ lead_id: lead.id, type: "email", subject: emailSubject, body: emailBody });
    await updateLead(lead.id, { last_contact_at: new Date().toISOString() });
    window.location.href = `mailto:${lead.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    setEmailSubject("");
    setEmailBody("");
    await refresh();
  };

  const saveFu = async () => {
    if (!fuWhen) return toast.error("Pick a date & time");
    await saveFollowUp({
      lead_id: lead.id,
      title: fuTitle,
      notes: fuNotes,
      due_at: new Date(fuWhen).toISOString(),
      reminder_minutes: 30,
    });
    setFuOpen(false);
    setFuNotes("");
    await refresh();
    toast.success("Follow-up scheduled");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/crm/leads")}>
          <ArrowLeft size={16} className="mr-1" /> Leads
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* profile */}
        <GlassCard className="p-5 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-black text-white">
              {lead.full_name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-black">{lead.full_name}</p>
              <span className={`inline-block rounded-lg border px-2 py-0.5 text-[10px] font-bold ${statusTone(lead.status)}`}>
                {stageLabel(lead.status)}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2"><Mail size={14} className="text-muted-foreground" /><a className="hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a></p>
            <p className="flex items-center gap-2"><Phone size={14} className="text-muted-foreground" /><a className="hover:underline" href={`tel:${fullPhone(lead)}`}>{fullPhone(lead)}</a></p>
            {lead.company && <p className="flex items-center gap-2"><Building2 size={14} className="text-muted-foreground" />{lead.company}</p>}
            {lead.website && <p className="flex items-center gap-2"><Globe size={14} className="text-muted-foreground" /><a className="hover:underline" href={lead.website} target="_blank" rel="noreferrer">{lead.website}</a></p>}
            <p className="flex items-center gap-2"><MapPin size={14} className="text-muted-foreground" />{[lead.city, lead.state, lead.country].filter(Boolean).join(", ") || "—"}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-muted/50 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">Score</p>
              <p className="text-lg font-black">{lead.score}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-2">
              <p className="text-[10px] uppercase text-muted-foreground">Deal value</p>
              <p className="text-lg font-black">{inr(lead.deal_value)}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div>
              <Label className="text-xs">Stage</Label>
              <Select value={lead.status} onValueChange={async (v) => { await changeStage(lead, v); await refresh(); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CRM_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Owner</Label>
              <Select
                value={lead.assigned_to ?? UNASSIGNED}
                onValueChange={async (v) => { await updateLead(lead.id, { assigned_to: v === UNASSIGNED ? null : v }); await refresh(); }}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {team.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Deal value (INR)</Label>
              <Input
                className="mt-1"
                type="number"
                defaultValue={lead.deal_value}
                onBlur={async (e) => {
                  const v = Number(e.target.value) || 0;
                  if (v !== lead.deal_value) { await updateLead(lead.id, { deal_value: v }); await refresh(); toast.success("Deal value updated"); }
                }}
              />
            </div>
            <p className="pt-1 text-[11px] text-muted-foreground">
              Owner: {owner} · Created {relativeTime(lead.created_at)} · Last contact {relativeTime(lead.last_contact_at)}
            </p>
          </div>
        </GlassCard>

        {/* actions + timeline */}
        <div className="space-y-4 lg:col-span-2">
          <GlassCard className="p-5" delay={0.05}>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Sparkles size={15} className="text-primary" /> AI sales intelligence</p>
            <div className="flex flex-wrap gap-2">
              {AI_ACTIONS.map((a) => (
                <Button key={a.id} size="sm" variant="outline" disabled={!!aiBusy} onClick={() => runAi(a.id)}>
                  {aiBusy === a.id ? "Working…" : a.label}
                </Button>
              ))}
            </div>
            {aiText && (
              <div className="mt-3 whitespace-pre-wrap rounded-2xl border border-border/60 bg-muted/40 p-3 text-sm">
                <p className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase text-muted-foreground"><Bot size={13} /> AI output</p>
                {aiText}
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(aiText); toast.success("Copied"); }}>Copy</Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`https://wa.me/${fullPhone(lead).replace("+", "")}?text=${encodeURIComponent(aiText)}`} target="_blank" rel="noreferrer">Send on WhatsApp</a>
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>

          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard className="p-5" delay={0.1}>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Phone size={15} className="text-primary" /> Log a call</p>
              <div className="space-y-2">
                <Select value={callOutcome} onValueChange={(v) => setCallOutcome(v as typeof callOutcome)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CALL_OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" min="0" value={callMinutes} onChange={(e) => setCallMinutes(e.target.value)} placeholder="Duration (minutes)" />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={logCall}>Save call</Button>
                  <Button size="sm" variant="outline" asChild><a href={`tel:${fullPhone(lead)}`}>Dial</a></Button>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5" delay={0.15}>
              <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Mail size={15} className="text-primary" /> Send email</p>
              <div className="space-y-2">
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Subject" />
                <Textarea rows={3} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Message" />
                <Button size="sm" onClick={sendEmail}>Open mail & log</Button>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-5" delay={0.2}>
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-bold"><CalendarPlus size={15} className="text-primary" /> Follow-ups</p>
              <Button size="sm" variant="outline" onClick={() => setFuOpen(true)}>Schedule</Button>
            </div>
            {followUps.length ? (
              <ul className="space-y-2">
                {followUps.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-3 text-sm">
                    <div className="min-w-0">
                      <p className={`font-semibold ${f.completed ? "line-through text-muted-foreground" : ""}`}>{f.title}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(f.due_at).toLocaleString()} · {relativeTime(f.due_at)}</p>
                    </div>
                    {!f.completed && (
                      <Button size="sm" variant="ghost" onClick={async () => {
                        await saveFollowUp({ ...f, completed: true });
                        await refresh();
                        toast.success("Marked done");
                      }}>Done</Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No follow-ups scheduled yet.</p>
            )}
          </GlassCard>

          <GlassCard className="p-5" delay={0.25}>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold"><MessageSquare size={15} className="text-primary" /> Activity timeline</p>
            <div className="flex gap-2">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" onKeyDown={(e) => e.key === "Enter" && addNote()} />
              <Button size="sm" onClick={addNote}>Add</Button>
            </div>
            {activities.length ? (
              <ul className="mt-4 space-y-3">
                {activities.map((a) => (
                  <li key={a.id} className="relative border-l border-border/70 pl-4">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500" />
                    <p className="text-sm font-semibold">{a.subject ?? a.type}</p>
                    {a.body && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>}
                    <p className="text-[11px] text-muted-foreground">
                      {a.type}{a.outcome ? ` · ${a.outcome}` : ""} · {new Date(a.created_at).toLocaleString()} · {a.actor_email ?? "system"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No activity logged yet.</p>
            )}
          </GlassCard>
        </div>
      </div>

      <Dialog open={fuOpen} onOpenChange={setFuOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule follow-up</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input className="mt-1" value={fuTitle} onChange={(e) => setFuTitle(e.target.value)} /></div>
            <div><Label>Date & time</Label><Input className="mt-1" type="datetime-local" value={fuWhen} onChange={(e) => setFuWhen(e.target.value)} /></div>
            <div><Label>Notes</Label><Textarea className="mt-1" rows={3} value={fuNotes} onChange={(e) => setFuNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFuOpen(false)}>Cancel</Button>
            <Button onClick={saveFu}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
