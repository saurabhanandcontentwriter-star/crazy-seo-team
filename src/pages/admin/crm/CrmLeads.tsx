import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2, Download, FileSpreadsheet, FileText, Filter, Pencil, Phone, PhoneCall,
  Plus, Search, Trash2, Users2, XCircle, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GlassCard, EmptyState, CrmSkeleton } from "@/components/crm/CrmUI";
import {
  CRM_STAGES, CrmLead, TeamMember, createLead, deleteLead, exportCsv, exportExcel, exportPdf,
  fetchLeads, fetchTeam, fullPhone, logActivity, relativeTime, stageLabel, statusTone, updateLead, inr,
} from "@/lib/crm";

const ANY = "__any__";
const UNASSIGNED = "__unassigned__";
type Draft = Partial<CrmLead>;

export default function CrmLeads() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ANY);
  const [source, setSource] = useState(ANY);
  const [service, setService] = useState(ANY);
  const [owner, setOwner] = useState(ANY);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<CrmLead | null>(null);

  const load = async () => {
    try {
      const [l, t] = await Promise.all([fetchLeads(), fetchTeam()]);
      setLeads(l); setTeam(t);
    } catch (e: any) { toast.error(e.message ?? "Could not load leads"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const sources = useMemo(() => [...new Set(leads.map((l) => l.source).filter(Boolean))], [leads]);
  const services = useMemo(() => [...new Set(leads.map((l) => l.service).filter(Boolean))], [leads]);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (term) {
        const hay = [l.full_name, l.email, l.phone, fullPhone(l), l.company, l.city].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (status !== ANY && l.status !== status) return false;
      if (source !== ANY && l.source !== source) return false;
      if (service !== ANY && l.service !== service) return false;
      if (owner !== ANY && (owner === UNASSIGNED ? !!l.assigned_to : l.assigned_to !== owner)) return false;
      if (from && new Date(l.created_at) < new Date(from)) return false;
      if (to && new Date(l.created_at) > new Date(`${to}T23:59:59`)) return false;
      return true;
    });
  }, [leads, q, status, source, service, owner, from, to]);

  const save = async () => {
    if (!draft) return;
    if (!draft.full_name?.trim() || !draft.email?.trim() || !draft.phone?.trim()) return toast.error("Name, email and mobile are required");
    setSaving(true);
    try {
      if (draft.id) {
        await updateLead(draft.id, {
          full_name: draft.full_name, email: draft.email, phone_country: draft.phone_country || "+91", phone: draft.phone,
          company: draft.company ?? null, city: draft.city ?? null, state: draft.state ?? null, country: draft.country ?? null,
          source: draft.source || "crm_manual", service: draft.service || "Free Consultation", status: draft.status || "new",
          score: Number(draft.score) || 0, deal_value: Number(draft.deal_value) || 0, assigned_to: draft.assigned_to || null, message: draft.message ?? null,
        });
        toast.success("Lead updated");
      } else { await createLead(draft); toast.success("Lead created"); }
      setDraft(null); await load();
    } catch (e: any) { toast.error(e.message ?? "Save failed"); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    try { await deleteLead(deleting.id); toast.success("Lead deleted"); setDeleting(null); await load(); }
    catch (e: any) { toast.error(e.message ?? "Delete failed"); }
  };

  const assign = async (lead: CrmLead, value: string) => {
    const assigned_to = value === UNASSIGNED ? null : value;
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, assigned_to } : l));
    try { await updateLead(lead.id, { assigned_to }); toast.success("Owner updated"); }
    catch (e: any) { toast.error(e.message ?? "Could not assign"); load(); }
  };

  const setStage = async (lead: CrmLead, next: string) => {
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: next } : l));
    try { await updateLead(lead.id, { status: next }); toast.success(`Moved to ${stageLabel(next)}`); }
    catch (e: any) { toast.error(e.message ?? "Could not update status"); load(); }
  };

  const acceptLead = async (lead: CrmLead) => {
    try {
      await updateLead(lead.id, { status: "qualified" });
      await logActivity({ lead_id: lead.id, type: "status", subject: "Lead Accepted", body: "Lead was accepted from the leads list.", outcome: "Accepted" });
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: "qualified" } : l));
      toast.success(`${lead.full_name} accepted`);
    } catch (e: any) { toast.error(e.message ?? "Could not accept lead"); }
  };

  const rejectLead = async (lead: CrmLead) => {
    try {
      await updateLead(lead.id, { status: "lost" });
      await logActivity({ lead_id: lead.id, type: "status", subject: "Lead Rejected", body: "Lead was rejected from the leads list.", outcome: "Rejected" });
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: "lost" } : l));
      toast.success(`${lead.full_name} rejected`);
    } catch (e: any) { toast.error(e.message ?? "Could not reject lead"); }
  };

  const callConnected = async (lead: CrmLead) => {
    try {
      await logActivity({ lead_id: lead.id, type: "call", subject: "Call Connected", body: `Call connected with ${lead.full_name} on ${fullPhone(lead)}.`, outcome: "Connected" });
      await updateLead(lead.id, { status: "contacted", last_contact_at: new Date().toISOString() });
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: "contacted", last_contact_at: new Date().toISOString() } : l));
      toast.success(`${lead.full_name}: call connected`);
    } catch (e: any) { toast.error(e.message ?? "Could not mark call connected"); }
  };

  if (loading) return <CrmSkeleton />;

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, mobile, company, city…" className="pl-9 rounded-xl" /></div>
          <Button onClick={() => setDraft({ phone_country: "+91", status: "new", source: "crm_manual", service: "Free Consultation", score: 30 })} className="rounded-xl gap-2"><Plus size={16} /> New lead</Button>
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => filtered.length ? exportCsv(filtered, team) : toast.error("Nothing to export")}><Download size={15} /> CSV</Button>
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => filtered.length ? exportExcel(filtered, team) : toast.error("Nothing to export")}><FileSpreadsheet size={15} /> Excel</Button>
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => filtered.length ? exportPdf(filtered, team) : toast.error("Nothing to export")}><FileText size={15} /> PDF</Button>
        </div>
        <div className="mt-3 grid gap-2 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value={ANY}>All statuses</SelectItem>{CRM_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent></Select>
          <Select value={source} onValueChange={setSource}><SelectTrigger className="rounded-xl"><SelectValue placeholder="Source" /></SelectTrigger><SelectContent><SelectItem value={ANY}>All sources</SelectItem>{sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Select value={service} onValueChange={setService}><SelectTrigger className="rounded-xl"><SelectValue placeholder="Service" /></SelectTrigger><SelectContent><SelectItem value={ANY}>All services</SelectItem>{services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Select value={owner} onValueChange={setOwner}><SelectTrigger className="rounded-xl"><SelectValue placeholder="Owner" /></SelectTrigger><SelectContent><SelectItem value={ANY}>All owners</SelectItem><SelectItem value={UNASSIGNED}>Unassigned</SelectItem>{team.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl" />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Filter size={13} /> {filtered.length} of {leads.length} leads {(q || status !== ANY || source !== ANY || service !== ANY || owner !== ANY || from || to) && <button className="underline hover:text-foreground" onClick={() => { setQ(""); setStatus(ANY); setSource(ANY); setService(ANY); setOwner(ANY); setFrom(""); setTo(""); }}>Reset</button>}</div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        {filtered.length === 0 ? <EmptyState icon={Users2} title="No leads match your filters" hint="Adjust the search or create a new lead to get started." action={<Button className="rounded-xl" onClick={() => setDraft({ phone_country: "+91", status: "new", source: "crm_manual", service: "Free Consultation", score: 30 })}>Create lead</Button>} /> :
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[1180px]"><thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr>{["Lead", "Contact", "Location", "Service", "Owner", "Status", "Score", "Value", "Created", "Actions"].map((h) => <th key={h} className="text-left font-semibold px-4 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>{filtered.map((l, i) => <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.012, 0.3) }} className="border-t border-border/50 hover:bg-muted/40 transition-colors">
              <td className="px-4 py-3"><Link to={`/admin/crm/leads/${l.id}`} className="font-semibold hover:text-primary">{l.full_name}</Link><p className="text-xs text-muted-foreground">{l.company || "—"}</p></td>
              <td className="px-4 py-3"><div className="flex items-center gap-2"><a href={`tel:${fullPhone(l)}`} className="inline-flex items-center gap-1 text-xs font-semibold hover:text-primary"><Phone size={12} />{fullPhone(l)}</a></div><a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"><Mail size={12} />{l.email}</a></td>
              <td className="px-4 py-3 text-xs">{[l.city, l.state, l.country].filter(Boolean).join(", ") || "—"}</td>
              <td className="px-4 py-3 text-xs">{l.service}</td>
              <td className="px-4 py-3"><Select value={l.assigned_to ?? UNASSIGNED} onValueChange={(v) => assign(l, v)}><SelectTrigger className="h-8 rounded-lg text-xs w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={UNASSIGNED}>Unassigned</SelectItem>{team.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></td>
              <td className="px-4 py-3"><Select value={l.status} onValueChange={(v) => setStage(l, v)}><SelectTrigger className={`h-8 rounded-lg text-xs w-[130px] border ${statusTone(l.status)}`}><SelectValue /></SelectTrigger><SelectContent>{CRM_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent></Select></td>
              <td className="px-4 py-3 font-bold tabular-nums">{l.score}</td><td className="px-4 py-3 text-xs tabular-nums">{inr(l.deal_value ?? 0)}</td><td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{relativeTime(l.created_at)}</td>
              <td className="px-4 py-3"><div className="flex flex-wrap items-center gap-1">
                <Button size="sm" variant="outline" className="h-8 px-2" asChild><a href={`tel:${fullPhone(l)}`} aria-label={`Call ${l.full_name}`}><PhoneCall size={13} className="mr-1" />Call</a></Button>
                <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => callConnected(l)} disabled={l.status === "lost"}><Phone size={13} className="mr-1" />Connected</Button>
                <Button size="sm" className="h-8 px-2" onClick={() => acceptLead(l)} disabled={l.status === "qualified" || l.status === "won"}><CheckCircle2 size={13} className="mr-1" />Accept</Button>
                <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => rejectLead(l)} disabled={l.status === "lost"}><XCircle size={13} className="mr-1" />Reject</Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDraft(l)} aria-label="Edit lead"><Pencil size={14} /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleting(l)} aria-label="Delete lead"><Trash2 size={14} /></Button>
              </div></td>
            </motion.tr>)}</tbody>
          </table></div>}
      </GlassCard>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{draft?.id ? "Edit lead" : "New lead"}</DialogTitle></DialogHeader>{draft && <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name *"><Input value={draft.full_name ?? ""} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} /></Field>
        <Field label="Email *"><Input type="email" value={draft.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
        <Field label="Country code"><Input value={draft.phone_country ?? "+91"} onChange={(e) => setDraft({ ...draft, phone_country: e.target.value })} /></Field>
        <Field label="Mobile *"><Input value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field>
        <Field label="Company"><Input value={draft.company ?? ""} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></Field>
        <Field label="Service"><Input value={draft.service ?? ""} onChange={(e) => setDraft({ ...draft, service: e.target.value })} /></Field>
        <Field label="City"><Input value={draft.city ?? ""} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></Field>
        <Field label="State"><Input value={draft.state ?? ""} onChange={(e) => setDraft({ ...draft, state: e.target.value })} /></Field>
        <Field label="Country"><Input value={draft.country ?? ""} onChange={(e) => setDraft({ ...draft, country: e.target.value })} /></Field>
        <Field label="Source"><Input value={draft.source ?? ""} onChange={(e) => setDraft({ ...draft, source: e.target.value })} /></Field>
        <Field label="Status"><Select value={draft.status ?? "new"} onValueChange={(v) => setDraft({ ...draft, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CRM_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Assigned to"><Select value={draft.assigned_to ?? UNASSIGNED} onValueChange={(v) => setDraft({ ...draft, assigned_to: v === UNASSIGNED ? null : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value={UNASSIGNED}>Unassigned</SelectItem>{team.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Lead score"><Input type="number" value={draft.score ?? 0} onChange={(e) => setDraft({ ...draft, score: Number(e.target.value) })} /></Field>
        <Field label="Deal value (INR)"><Input type="number" value={draft.deal_value ?? 0} onChange={(e) => setDraft({ ...draft, deal_value: Number(e.target.value) })} /></Field>
        <div className="sm:col-span-2"><Field label="Notes"><Textarea rows={3} value={draft.message ?? ""} onChange={(e) => setDraft({ ...draft, message: e.target.value })} /></Field></div>
      </div>}<DialogFooter><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save lead"}</Button></DialogFooter></DialogContent></Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this lead?</AlertDialogTitle><AlertDialogDescription>{deleting?.full_name} and all related activities and follow-ups will be permanently removed.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={remove}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="space-y-1.5"><Label className="text-xs font-semibold text-muted-foreground">{label}</Label>{children}</div>;
