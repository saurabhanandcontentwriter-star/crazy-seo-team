import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserPlus, PhoneCall, BadgeCheck, Trophy, XCircle, TrendingUp, CalendarClock,
  HeartHandshake, IndianRupee, RefreshCw, Download, MapPin,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { GlassCard, Kpi, CrmSkeleton, EmptyState } from "@/components/crm/CrmUI";
import {
  fetchLeads, fetchTeam, fetchFollowUps, exportCsv, exportExcel, exportPdf, inr,
  stageLabel, CRM_STAGES, type CrmLead, type TeamMember, type FollowUp,
} from "@/lib/crm";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#6366f1"];

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default function CrmDashboard() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  const load = async () => {
    try {
      const [l, t, f] = await Promise.all([fetchLeads(), fetchTeam(), fetchFollowUps()]);
      setLeads(l); setTeam(t); setFollowups(f);
    } catch (e: any) {
      toast({ title: "Could not load CRM data", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const k = useMemo(() => {
    const by = (s: string) => leads.filter((l) => l.status === s).length;
    const won = by("won");
    const pipeline = leads
      .filter((l) => !["won", "lost"].includes(l.status))
      .reduce((s, l) => s + (Number(l.deal_value) || 0), 0);
    const dueSoon = followups.filter((f) => !f.completed && new Date(f.due_at).getTime() < Date.now() + 864e5).length;
    return {
      total: leads.length,
      new: by("new"),
      contacted: by("contacted"),
      qualified: by("qualified"),
      won,
      lost: by("lost"),
      conversion: leads.length ? Math.round((won / leads.length) * 100) : 0,
      dueSoon,
      customers: won,
      pipeline,
    };
  }, [leads, followups]);

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;

  const trend = useMemo(() => {
    const map = new Map<string, { date: string; leads: number; won: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      map.set(dayKey(d), { date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), leads: 0, won: 0 });
    }
    leads.forEach((l) => {
      const row = map.get(l.created_at.slice(0, 10));
      if (row) { row.leads += 1; if (l.status === "won") row.won += 1; }
    });
    return [...map.values()];
  }, [leads, days]);

  const group = (key: (l: CrmLead) => string | null | undefined, limit = 8) => {
    const m = new Map<string, number>();
    leads.forEach((l) => {
      const v = (key(l) || "Unknown").toString();
      m.set(v, (m.get(v) ?? 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, value]) => ({ name, value }));
  };

  const byCity = useMemo(() => group((l) => l.city), [leads]);
  const byState = useMemo(() => group((l) => l.state), [leads]);
  const bySource = useMemo(() => group((l) => l.source, 6), [leads]);
  const byService = useMemo(() => group((l) => l.service, 7), [leads]);
  const byCountry = useMemo(() => group((l) => l.country, 6), [leads]);

  const pipelineData = useMemo(
    () => CRM_STAGES.map((s) => ({ name: s.label, value: leads.filter((l) => l.status === s.id).length })),
    [leads],
  );

  const teamPerf = useMemo(
    () =>
      team.map((t) => {
        const mine = leads.filter((l) => l.assigned_to === t.id);
        return {
          name: t.name.split(" ")[0],
          leads: mine.length,
          won: mine.filter((l) => l.status === "won").length,
        };
      }),
    [team, leads],
  );

  const followPerf = useMemo(() => {
    const done = followups.filter((f) => f.completed).length;
    const overdue = followups.filter((f) => !f.completed && new Date(f.due_at) < new Date()).length;
    const upcoming = followups.length - done - overdue;
    return [
      { name: "Completed", value: done },
      { name: "Overdue", value: overdue },
      { name: "Upcoming", value: upcoming },
    ].filter((d) => d.value > 0);
  }, [followups]);

  if (loading) return <CrmSkeleton />;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
            CRM Command Center
          </h1>
          <p className="text-sm text-muted-foreground">Live pipeline, conversions and team performance — straight from your database.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${
                range === r ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={load}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => exportCsv(leads, team)}>
            <Download size={14} className="mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => exportExcel(leads, team)}>
            <Download size={14} className="mr-1" /> Excel
          </Button>
          <Button size="sm" className="rounded-2xl" onClick={() => exportPdf(leads, team)}>
            <Download size={14} className="mr-1" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Total Leads" value={k.total} icon={Users} delay={0} />
        <Kpi label="New" value={k.new} icon={UserPlus} tone="from-sky-500 to-cyan-400" delay={0.03} />
        <Kpi label="Contacted" value={k.contacted} icon={PhoneCall} tone="from-blue-500 to-indigo-400" delay={0.06} />
        <Kpi label="Qualified" value={k.qualified} icon={BadgeCheck} tone="from-violet-500 to-purple-400" delay={0.09} />
        <Kpi label="Won" value={k.won} icon={Trophy} tone="from-emerald-500 to-teal-400" delay={0.12} />
        <Kpi label="Lost" value={k.lost} icon={XCircle} tone="from-rose-500 to-orange-400" delay={0.15} />
        <Kpi label="Conversion" value={k.conversion} suffix="%" icon={TrendingUp} tone="from-fuchsia-500 to-pink-400" delay={0.18} />
        <Kpi label="Follow-ups Due" value={k.dueSoon} icon={CalendarClock} tone="from-amber-500 to-orange-400" delay={0.21} />
        <Kpi label="Active Customers" value={k.customers} icon={HeartHandshake} tone="from-teal-500 to-emerald-400" delay={0.24} />
        <Kpi label="Pipeline Value" value={k.pipeline} prefix="₹" icon={IndianRupee} tone="from-indigo-500 to-blue-400" delay={0.27} />
      </div>

      {leads.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Users}
            title="No leads yet"
            hint="Leads captured from the website forms, chatbot and SEO tools will appear here instantly."
            action={<Link to="/admin/crm/leads"><Button className="rounded-2xl">Create your first lead</Button></Link>}
          />
        </GlassCard>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard className="lg:col-span-2 p-4">
              <p className="font-bold mb-3">Leads over time</p>
              <ResponsiveContainer width="100%" height={280}>
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
                  <XAxis dataKey="date" fontSize={11} interval="preserveStartEnd" />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="leads" stroke="#3b82f6" fill="url(#gLeads)" strokeWidth={2} />
                  <Area type="monotone" dataKey="won" stroke="#10b981" fill="url(#gWon)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4" delay={0.05}>
              <p className="font-bold mb-3">Sales pipeline</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={80} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {pipelineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard className="p-4">
              <p className="font-bold mb-3">Leads by source</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={bySource} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4" delay={0.05}>
              <p className="font-bold mb-3">Leads by service</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byService}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" fontSize={9} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4" delay={0.1}>
              <p className="font-bold mb-3">Won vs Lost</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={[{ name: "Won", value: k.won }, { name: "Lost", value: k.lost }, { name: "Open", value: k.total - k.won - k.lost }]}
                    dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}
                  >
                    <Cell fill="#10b981" /><Cell fill="#f43f5e" /><Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { title: "Top cities", data: byCity },
              { title: "Top states", data: byState },
              { title: "Top countries", data: byCountry },
            ].map((block, bi) => (
              <GlassCard key={block.title} className="p-4" delay={bi * 0.05}>
                <p className="font-bold mb-3 flex items-center gap-2"><MapPin size={15} className="text-primary" /> {block.title}</p>
                {block.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No location data yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {block.data.map((r, i) => (
                      <li key={r.name} className="flex items-center gap-3 text-sm">
                        <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
                        <span className="flex-1 truncate">{r.name}</span>
                        <span className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                          style={{ width: `${Math.max(8, (r.value / block.data[0].value) * 90)}px` }} />
                        <b className="tabular-nums w-8 text-right">{r.value}</b>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard className="p-4">
              <p className="font-bold mb-3">Team performance</p>
              {teamPerf.length === 0 ? (
                <EmptyState icon={Users} title="No team members yet"
                  hint="Add employees in the Team page to track assignment and conversions."
                  action={<Link to="/admin/crm/team"><Button size="sm" className="rounded-2xl">Add team member</Button></Link>} />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={teamPerf}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="leads" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="won" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassCard>

            <GlassCard className="p-4" delay={0.05}>
              <p className="font-bold mb-3">Follow-up performance</p>
              {followPerf.length === 0 ? (
                <EmptyState icon={CalendarClock} title="No follow-ups scheduled"
                  hint="Schedule follow-ups from any lead profile to see completion analytics here." />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={followPerf} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                      <Cell fill="#10b981" /><Cell fill="#f43f5e" /><Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          </div>

          <GlassCard className="p-4">
            <p className="font-bold mb-3">Latest leads</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border/60">
                    <th className="text-left py-2">Name</th><th className="text-left">Service</th>
                    <th className="text-left">City</th><th className="text-left">Status</th><th className="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 8).map((l) => (
                    <tr key={l.id} className="border-b border-border/40 hover:bg-muted/40 transition">
                      <td className="py-2">
                        <Link to={`/admin/crm/lead/${l.id}`} className="font-semibold hover:text-primary">{l.full_name}</Link>
                      </td>
                      <td className="truncate max-w-[180px]">{l.service}</td>
                      <td>{l.city ?? "—"}</td>
                      <td>{stageLabel(l.status)}</td>
                      <td className="text-right tabular-nums">{inr(Number(l.deal_value) || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
