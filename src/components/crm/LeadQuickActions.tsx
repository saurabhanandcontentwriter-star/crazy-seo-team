import { useEffect, useState } from "react";
import { Check, X, MessageSquareReply, RefreshCw, UserRound, Target, Globe2, FileText, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/crm/CrmUI";
import { fetchLeads, changeStage, logActivity, fullPhone, type CrmLead } from "@/lib/crm";

/** Lead action center with prominent client contact details and one-click calling/email. */
export default function LeadQuickActions() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const rows = await fetchLeads();
      setLeads(rows.filter((l) => !["won", "lost"].includes(l.status)).slice(0, 8));
    } catch (e: any) {
      toast({ title: "Could not load leads", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => { load(); }, []);

  const run = async (lead: CrmLead, action: "accept" | "reject" | "replied") => {
    if (action === "accept" && lead.status === "qualified") return;
    setBusy(`${lead.id}:${action}`);
    try {
      if (action === "accept") {
        await changeStage(lead, "qualified");
        await logActivity({ lead_id: lead.id, type: "status", subject: "Lead accepted", body: "Lead accepted by CRM team and moved to Qualified." });
        toast({ title: "Lead accepted ✓", description: `${lead.full_name} moved to Qualified.` });
      } else if (action === "reject") {
        await changeStage(lead, "lost");
        await logActivity({ lead_id: lead.id, type: "status", subject: "Lead rejected", body: "Lead rejected from CRM." });
        toast({ title: "Lead rejected", description: `${lead.full_name} moved to Lost.` });
      } else {
        await changeStage(lead, "contacted");
        await logActivity({ lead_id: lead.id, type: "email", subject: "Message replied", body: "CRM team replied to the lead message." });
        toast({ title: "Reply recorded", description: `${lead.full_name} marked as Contacted.` });
      }
      await load();
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold flex items-center gap-2"><UserRound size={17} className="text-primary" /> Lead Action Center</h2>
          <p className="text-xs text-muted-foreground">Client contact details, requirement and quick CRM actions.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={load} disabled={!!busy}>
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-muted-foreground py-5 text-center">No open leads requiring action.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const accepted = lead.status === "qualified";
            const phone = fullPhone(lead);
            return (
              <div key={lead.id} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{lead.full_name || "Unnamed lead"}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{lead.status}</span>
                      {accepted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600">
                          <Check size={12} strokeWidth={3} /> Accepted
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {phone ? (
                        <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 rounded-xl border bg-background/80 px-3 py-2 text-sm font-bold hover:border-primary hover:text-primary transition-colors">
                          <Phone size={14} /> {phone}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No phone number</span>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 rounded-xl border bg-background/80 px-3 py-2 text-xs font-semibold hover:border-primary hover:text-primary transition-colors">
                          <Mail size={13} /> {lead.email}
                        </a>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="rounded-xl border bg-background/70 p-3">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"><Target size={13} /> Purpose / Service</p>
                        <p className="mt-1 text-sm font-semibold">{lead.service || "General enquiry"}</p>
                      </div>
                      <div className="rounded-xl border bg-background/70 p-3">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"><Globe2 size={13} /> Source / Page</p>
                        <p className="mt-1 text-xs font-semibold break-words">{lead.source || "website"}{lead.page_path ? ` · ${lead.page_path}` : ""}</p>
                      </div>
                    </div>

                    <div className="mt-2 rounded-xl border border-primary/10 bg-primary/5 p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary"><FileText size={13} /> Client message / requirement</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{lead.message?.trim() || "No message was provided. Client selected the service above."}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {phone && (
                      <Button size="sm" variant="outline" className="rounded-xl" asChild>
                        <a href={`tel:${phone}`} aria-label={`Call ${lead.full_name}`}><Phone size={14} className="mr-1" /> Call client</a>
                      </Button>
                    )}
                    {accepted ? (
                      <Button size="sm" variant="secondary" className="rounded-xl border border-emerald-500/30 text-emerald-600" disabled>
                        <Check size={14} className="mr-1" strokeWidth={3} /> Accepted
                      </Button>
                    ) : (
                      <Button size="sm" className="rounded-xl" disabled={!!busy} onClick={() => run(lead, "accept")}>
                        <Check size={14} className="mr-1" /> Accept
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="rounded-xl" disabled={!!busy} onClick={() => run(lead, "reject")}>
                      <X size={14} className="mr-1" /> Reject
                    </Button>
                    <Button size="sm" variant="secondary" className="rounded-xl" disabled={!!busy} onClick={() => run(lead, "replied")}>
                      <MessageSquareReply size={14} className="mr-1" /> Message replied
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
