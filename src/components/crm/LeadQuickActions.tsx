import { useEffect, useState } from "react";
import { Check, X, MessageSquareReply, RefreshCw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/crm/CrmUI";
import { fetchLeads, changeStage, logActivity, type CrmLead } from "@/lib/crm";

/** Real CRM lead actions backed by the Supabase leads + crm_activities tables. */
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
    setBusy(`${lead.id}:${action}`);
    try {
      if (action === "accept") {
        await changeStage(lead, "qualified");
        await logActivity({ lead_id: lead.id, type: "status", subject: "Lead accepted", body: "Lead accepted by CRM team and moved to Qualified." });
        toast({ title: "Lead accepted", description: `${lead.full_name} moved to Qualified.` });
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
          <p className="text-xs text-muted-foreground">Accept, reject or record a message reply directly in CRM.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={load} disabled={!!busy}>
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-muted-foreground py-5 text-center">No open leads requiring action.</p>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <div key={lead.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{lead.full_name || "Unnamed lead"}</p>
                <p className="text-xs text-muted-foreground truncate">{lead.email || lead.phone || "No contact"} · {lead.service || "General enquiry"}</p>
                {lead.message && <p className="text-xs mt-1 line-clamp-1 text-muted-foreground">{lead.message}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" className="rounded-xl" disabled={!!busy} onClick={() => run(lead, "accept")}>
                  <Check size={14} className="mr-1" /> Accept
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl" disabled={!!busy} onClick={() => run(lead, "reject")}>
                  <X size={14} className="mr-1" /> Reject
                </Button>
                <Button size="sm" variant="secondary" className="rounded-xl" disabled={!!busy} onClick={() => run(lead, "replied")}>
                  <MessageSquareReply size={14} className="mr-1" /> Message replied
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
