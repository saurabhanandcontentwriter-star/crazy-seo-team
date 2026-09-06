import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GripVertical, KanbanSquare, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { GlassCard, EmptyState, CrmSkeleton } from "@/components/crm/CrmUI";
import {
  CRM_STAGES, CrmLead, TeamMember, changeStage, fetchLeads, fetchTeam, fullPhone, inr, relativeTime,
} from "@/lib/crm";

export default function CrmPipeline() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const load = async () => {
    try {
      const [l, t] = await Promise.all([fetchLeads(), fetchTeam()]);
      setLeads(l);
      setTeam(t);
    } catch (e: any) {
      toast.error(e.message ?? "Could not load pipeline");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const byStage = useMemo(() => {
    const map: Record<string, CrmLead[]> = {};
    CRM_STAGES.forEach((s) => (map[s.id] = []));
    leads.forEach((l) => {
      const key = map[l.status] ? l.status : "new";
      map[key].push(l);
    });
    return map;
  }, [leads]);

  const move = async (lead: CrmLead, status: string) => {
    if (lead.status === status) return;
    const prev = leads;
    setLeads((cur) => cur.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    try {
      await changeStage(lead, status);
      toast.success(`${lead.full_name} moved`);
    } catch (e: any) {
      setLeads(prev);
      toast.error(e.message ?? "Could not move lead");
    }
  };

  if (loading) return <CrmSkeleton />;
  if (!leads.length)
    return (
      <GlassCard className="p-2">
        <EmptyState icon={KanbanSquare} title="Pipeline is empty" hint="Leads captured from the website will appear here." />
      </GlassCard>
    );

  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex gap-3 min-w-max">
        {CRM_STAGES.map((stage, si) => {
          const items = byStage[stage.id] ?? [];
          const value = items.reduce((a, l) => a + Number(l.deal_value ?? 0), 0);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => { e.preventDefault(); setOver(stage.id); }}
              onDragLeave={() => setOver((o) => (o === stage.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const lead = leads.find((l) => l.id === dragId);
                if (lead) move(lead, stage.id);
                setDragId(null);
              }}
              className={`w-[280px] shrink-0 rounded-[24px] border p-2 transition-colors ${
                over === stage.id ? "border-primary bg-primary/5" : "border-white/60 bg-white/50 dark:bg-card/50"
              }`}
            >
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${stage.tone}`} />
                  <p className="text-sm font-bold">{stage.label}</p>
                  <span className="text-[11px] font-semibold text-muted-foreground">{items.length}</span>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">{inr(value)}</span>
              </div>

              <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-1">
                {items.map((l, i) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.02 * i, 0.3) + si * 0.02 }}
                    draggable
                    onDragStart={() => setDragId(l.id)}
                    onDragEnd={() => setDragId(null)}
                    className="rounded-2xl border border-white/70 bg-white/85 dark:bg-card/80 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className="mt-0.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Link to={`/admin/crm/leads/${l.id}`} className="font-semibold text-sm hover:underline truncate block">
                          {l.full_name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground truncate">{l.service}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{l.city ?? l.state ?? "—"}</span>
                          <span>· score {l.score}</span>
                          <span>· {relativeTime(l.created_at)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <a href={`tel:${fullPhone(l)}`} className="text-primary hover:opacity-80" aria-label="Call">
                            <Phone size={13} />
                          </a>
                          <a href={`mailto:${l.email}`} className="text-primary hover:opacity-80" aria-label="Email">
                            <Mail size={13} />
                          </a>
                          <span className="ml-auto text-[10px] font-semibold">
                            {team.find((t) => t.id === l.assigned_to)?.name ?? "Unassigned"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {CRM_STAGES.filter((s) => s.id !== l.status).slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => move(l, s.id)}
                          className="rounded-lg border border-border/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
                {!items.length && (
                  <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">Drop leads here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
