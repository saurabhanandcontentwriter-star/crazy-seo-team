import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { BarChart3, Download, IndianRupee, Percent, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlassCard, EmptyState, Kpi, CrmSkeleton } from "@/components/crm/CrmUI";
import {
  Activity, CRM_STAGES, CrmLead, TeamMember, exportCsv, exportExcel, exportPdf,
  fetchActivities, fetchLeads, fetchTeam, inr, stageLabel,
} from "@/lib/crm";

const RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "all", label: "All time", days: 3650 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#ef4444"];

const topN = (rows: string[], n = 8) => {
  const m: Record<string, number> = {};
  rows.filter(Boolean).forEach((r) => (m[r] = (m[r] ?? 0) + 1));
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, value]) => ({ name, value }));
};

export default function CrmAnalytics() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [acts, setActs] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    (async () => {
      try {
        const [l, t, a] = await Promise.all([fetchLeads(), fetchTeam(), fetchActivities()]);
        setLeads(l); setTeam(t); setActs(a);
      } catch (e: any) {
        toast.error(e.message ?? "Could not load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const days = RANGES.find((r) => r.key === range)?.days ?? 30;
  const scoped = useMemo(() => {
    const cutoff = Date.now() - days * 86400000;
    return leads.filter((l) => new Date(l.created_at).getTime() >= cutoff);
  }, [leads, days]);

  const kpis = useMemo(() => {
    const won = scoped.filter((l) => l.status === "won");
    const lost = scoped.filter((l) => l.status === "lost");
    const value = won.reduce((a, l) => a + Number(l.deal_value ?? 0), 0);
    const pipeline = scoped.filter((l) => !["won", "lost"].includes(l.status)).reduce((a, l) => a + Number(l.deal_value ?? 0), 0);
    return {
      total: scoped.length,
      won: won.length,
      lost: lost.length,
      conversion: scoped.length ? Math.round((won.length / scoped.length) * 100) : 0,
      revenue: value,
      pipeline,
      avgDeal: won.length ? Math.round(value / won.length) : 0,
      avgScore: scoped.length ? Math.round(scoped.reduce((a, l) => a + (l.score ?? 0), 0) / scoped.length) : 0,
    };
  }, [scoped]);

  const trend = useMemo(() => {
    const buckets: Record<string, { date: string; leads: number; won: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }), leads: 0, won: 0 };
    }
    scoped.forEach((l) => {
      const key = l.created_at.slice(0, 10);
      if (buckets[key]) {
        buckets[key].leads += 1;
        if (l.status === "won") buckets[key].won += 1;
      }
    });
    const arr = Object.values(buckets);
    return days > 60 ? arr.filter((_, i) => i % 3 === 0) : arr;
  }, [scoped, days]);

  const funnel = useMemo(
    () => CRM_STAGES.map((s) => ({ name: s.label, value: scoped.filter((l) => l.status === s.id).length })),
    [scoped],
  );

  const bySource = useMemo(() => topN(scoped.map((l) => l.source)), [scoped]);
  const byService = useMemo(() => topN(scoped.map((l) => l.service)), [scoped]);
  const byCity = useMemo(() => topN(scoped.map((l) => l.city ?? "")), [scoped]);
  const byState = useMemo(() => topN(scoped.map((l) => l.state ?? "")), [scoped]);

  const byOwner = useMemo(
    () =>
      team.map((t) => {
        const mine = scoped.filter((l) => l.assigned_to === t.id);
        const won = mine.filter((l) => l.status === "won");
        return {
          name: t.name,
          leads: mine.length,
          won: won.length,
          revenue: won.reduce((a, l) => a + Number(l.deal_value ?? 0), 0),
          activities: acts.filter((a) => a.team_member_id === t.id).length,
        };
      }).sort((a, b) => b.leads - a.leads),
    [team, scoped, acts],
  );

  if (loading) return <CrmSkeleton />;
  if (!leads.length)
    return (
      <GlassCard className="p-2">
        <EmptyState icon={BarChart3} title="No analytics yet" hint="Analytics appear once leads start coming in." />
      </GlassCard>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/60 p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                range === r.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >{r.label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCsv(scoped, team)}><Download size={14} className="mr-1" />CSV</Button>
          <Button size="sm" variant="outline" onClick={() => exportExcel(scoped, team)}>Excel</Button>
          <Button size="sm" variant="outline" onClick={() => exportPdf(scoped, team)}>PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Leads" value={kpis.total} icon={Target} />
        <Kpi label="Won" value={kpis.won} icon={TrendingUp} tone="from-emerald-500 to-teal-400" delay={0.04} />
        <Kpi label="Conversion" value={kpis.conversion} suffix="%" icon={Percent} tone="from-violet-500 to-purple-400" delay={0.08} />
        <Kpi label="Revenue ₹" value={kpis.revenue} icon={IndianRupee} tone="from-amber-500 to-orange-400" delay={0.12} />
        <Kpi label="Pipeline ₹" value={kpis.pipeline} icon={BarChart3} tone="from-fuchsia-500 to-pink-400" delay={0.16} />
        <Kpi label="Avg score" value={kpis.avgScore} icon={Target} tone="from-cyan-500 to-blue-400" delay={0.2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-4 lg:col-span-2">
          <p className="mb-3 text-sm font-bold">Leads & wins over time</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gWon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="url(#gLeads)" />
                <Area type="monotone" dataKey="won" stroke="#10b981" fill="url(#gWon)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-4" delay={0.05}>
          <p className="mb-3 text-sm font-bold">Pipeline funnel</p>
          <div className="space-y-2">
            {funnel.map((f, i) => {
              const max = Math.max(1, ...funnel.map((x) => x.value));
              return (
                <div key={f.name}>
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span>{f.name}</span><span>{f.value}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600" style={{ width: `${(f.value / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-4">
          <p className="mb-3 text-sm font-bold">Leads by source</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bySource} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-4" delay={0.05}>
          <p className="mb-3 text-sm font-bold">Top services</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byService} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[{ title: "Top cities", rows: byCity }, { title: "Top states / regions", rows: byState }].map((block, bi) => (
          <GlassCard key={block.title} className="p-4" delay={bi * 0.05}>
            <p className="mb-3 text-sm font-bold">{block.title}</p>
            {block.rows.length ? (
              <div className="space-y-2">
                {block.rows.map((r) => {
                  const max = Math.max(1, ...block.rows.map((x) => x.value));
                  return (
                    <div key={r.name}>
                      <div className="flex justify-between text-[11px] font-semibold"><span>{r.name}</span><span>{r.value}</span></div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${(r.value / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No location data captured yet.</p>
            )}
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-4">
        <p className="mb-3 text-sm font-bold">Team performance</p>
        {byOwner.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-muted-foreground">
                  <th className="py-2">Member</th><th>Leads</th><th>Won</th><th>Conv.</th><th>Revenue</th><th>Activities</th>
                </tr>
              </thead>
              <tbody>
                {byOwner.map((o) => (
                  <tr key={o.name} className="border-t border-border/50">
                    <td className="py-2 font-semibold">{o.name}</td>
                    <td>{o.leads}</td>
                    <td>{o.won}</td>
                    <td>{o.leads ? Math.round((o.won / o.leads) * 100) : 0}%</td>
                    <td>{inr(o.revenue)}</td>
                    <td>{o.activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Add team members to see performance.</p>
        )}
      </GlassCard>

      <GlassCard className="p-4">
        <p className="mb-3 text-sm font-bold">Stage breakdown</p>
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
          {CRM_STAGES.map((s) => (
            <span key={s.id} className="rounded-xl border border-border/60 px-3 py-1.5">
              {stageLabel(s.id)}: {scoped.filter((l) => l.status === s.id).length}
            </span>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
