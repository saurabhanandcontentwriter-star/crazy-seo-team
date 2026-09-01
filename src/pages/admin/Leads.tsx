import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Users, Flame, CheckCircle2, XCircle, TrendingUp, Search, Download, RefreshCw,
  Loader2, Copy, Mail, Phone, Trash2, MapPin, Bell,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";
import { LEAD_STATUSES, statusLabel, scoreLabel } from "@/lib/leads";

type Lead = {
  id: string; full_name: string; email: string; phone_country: string; phone: string;
  company: string | null; website: string | null; service: string; message: string | null;
  country: string | null; state: string | null; district: string | null; city: string | null;
  preferred_contact: string | null; source: string; page_path: string | null;
  status: string; score: number; created_at: string;
};

type Note = { id: string; note: string; author_email: string | null; created_at: string };

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

const startOf = (range: string) => {
  const d = new Date();
  if (range === "today") { d.setHours(0, 0, 0, 0); return d; }
  if (range === "7d") return new Date(Date.now() - 7 * 864e5);
  if (range === "30d") return new Date(Date.now() - 30 * 864e5);
  if (range === "month") return new Date(d.getFullYear(), d.getMonth(), 1);
  return new Date(0);
};

const Kpi = ({ label, value, icon: Icon, suffix = "" }: any) => (
  <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 text-primary"><Icon size={15} /></span>
    </div>
    <p className="mt-2 text-2xl font-black tabular-nums">{value}{suffix}</p>
  </div>
);

const relative = (iso: string) => {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 10) return "Just now";
  if (s < 60) return `${s} sec ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

const locationOf = (l: Lead) =>
  [l.country, l.state, l.district, l.city].filter(Boolean).join(" → ") || null;

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");
  const [place, setPlace] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteDraft, setNoteDraft] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) toast({ title: "Could not load leads", description: error.message, variant: "destructive" });
    setLeads((data ?? []) as Lead[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime new-lead alerts
  useEffect(() => {
    const ch = supabase
      .channel("leads-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const l = payload.new as Lead;
          setLeads((prev) => [l, ...prev]);
          toast({
            title: "🔔 New lead received",
            description: `${l.full_name} · ${l.email} · ${l.service}${locationOf(l) ? ` · ${locationOf(l)}` : ""}`,
          });
        } else if (payload.eventType === "UPDATE") {
          setLeads((prev) => prev.map((x) => (x.id === (payload.new as Lead).id ? (payload.new as Lead) : x)));
        } else if (payload.eventType === "DELETE") {
          setLeads((prev) => prev.filter((x) => x.id !== (payload.old as Lead).id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const inRange = useMemo(() => {
    const from = startOf(range).toISOString();
    return leads.filter((l) => l.created_at >= from);
  }, [leads, range]);

  const services = useMemo(() => [...new Set(leads.map((l) => l.service))].sort(), [leads]);
  const places = useMemo(
    () => [...new Set(leads.map((l) => l.city || l.state || l.country).filter(Boolean) as string[])].sort(),
    [leads],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return inRange.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (service !== "all" && l.service !== service) return false;
      if (place !== "all" && (l.city || l.state || l.country) !== place) return false;
      if (!term) return true;
      return [l.full_name, l.email, l.phone, l.company, l.website].some((v) => (v ?? "").toLowerCase().includes(term));
    });
  }, [inRange, q, status, service, place]);

  const stats = useMemo(() => {
    const today = startOf("today").toISOString();
    const week = startOf("7d").toISOString();
    const month = startOf("month").toISOString();
    const qualified = inRange.filter((l) => ["qualified", "proposal_sent", "negotiation"].includes(l.status)).length;
    const won = inRange.filter((l) => l.status === "won").length;
    return {
      total: leads.length,
      period: inRange.length,
      today: leads.filter((l) => l.created_at >= today).length,
      week: leads.filter((l) => l.created_at >= week).length,
      month: leads.filter((l) => l.created_at >= month).length,
      fresh: inRange.filter((l) => l.status === "new").length,
      hot: inRange.filter((l) => l.score >= 70).length,
      qualified,
      won,
      lost: inRange.filter((l) => l.status === "lost").length,
      conv: inRange.length ? Math.round((won / inRange.length) * 1000) / 10 : 0,
      avgScore: inRange.length ? Math.round(inRange.reduce((s, l) => s + l.score, 0) / inRange.length) : 0,
    };
  }, [leads, inRange]);

  const byDay = useMemo(() => {
    const days = range === "today" || range === "7d" ? 7 : 30;
    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) map.set(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), 0);
    leads.forEach((l) => {
      const k = l.created_at.slice(0, 10);
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
    });
    return [...map.entries()].map(([day, leads]) => ({ day: day.slice(5), leads }));
  }, [leads, range]);

  const byService = useMemo(() => {
    const m = new Map<string, number>();
    inRange.forEach((l) => m.set(l.service, (m.get(l.service) ?? 0) + 1));
    return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [inRange]);

  const bySource = useMemo(() => {
    const m = new Map<string, number>();
    inRange.forEach((l) => m.set(l.source, (m.get(l.source) ?? 0) + 1));
    return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [inRange]);

  const geoRows = useMemo(() => {
    const m = new Map<string, { key: string; country: string | null; state: string | null; city: string | null; total: number; qualified: number; won: number; score: number }>();
    inRange.forEach((l) => {
      const key = [l.country, l.state, l.city].filter(Boolean).join(" → ") || "__unknown__";
      const cur = m.get(key) ?? { key, country: l.country, state: l.state, city: l.city, total: 0, qualified: 0, won: 0, score: 0 };
      cur.total++;
      if (["qualified", "proposal_sent", "negotiation"].includes(l.status)) cur.qualified++;
      if (l.status === "won") cur.won++;
      cur.score += l.score;
      m.set(key, cur);
    });
    return [...m.values()].sort((a, b) => b.total - a.total);
  }, [inRange]);

  const updateStatus = async (id: string, next: string) => {
    const { error } = await supabase.from("leads").update({ status: next }).eq("id", id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: next } : l)));
    setSelected((s) => (s && s.id === id ? { ...s, status: next } : s));
  };

  const removeLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelected(null);
    toast({ title: "Lead deleted" });
  };

  const openLead = async (l: Lead) => {
    setSelected(l);
    setNoteDraft("");
    const { data } = await supabase.from("lead_notes").select("*").eq("lead_id", l.id).order("created_at", { ascending: false });
    setNotes((data ?? []) as Note[]);
  };

  const addNote = async () => {
    if (!selected || !noteDraft.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("lead_notes")
      .insert({ lead_id: selected.id, note: noteDraft.trim(), author_email: userData.user?.email ?? null })
      .select()
      .single();
    if (error) return toast({ title: "Could not add note", description: error.message, variant: "destructive" });
    setNotes((n) => [data as Note, ...n]);
    setNoteDraft("");
  };

  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${what} copied` });
  };

  const exportCsv = () => {
    const head = ["Name", "Email", "Mobile", "Company", "Website", "Service", "Location", "Source", "Status", "Score", "Date"];
    const rows = filtered.map((l) => [
      l.full_name, l.email, `${l.phone_country} ${l.phone}`, l.company ?? "", l.website ?? "", l.service,
      locationOf(l) ?? "Unavailable", l.source, statusLabel(l.status), l.score, new Date(l.created_at).toISOString(),
    ]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">Leads CRM</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live pipeline — new leads appear instantly
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[150px] rounded-2xl h-9"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover">
              {RANGES.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={load} disabled={loading}>
            {loading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />} Refresh
          </Button>
          <Button size="sm" className="rounded-2xl" onClick={exportCsv} disabled={!filtered.length}>
            <Download size={14} className="mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Total leads" value={stats.total} icon={Users} />
        <Kpi label="In selected range" value={stats.period} icon={TrendingUp} />
        <Kpi label="Today" value={stats.today} icon={Bell} />
        <Kpi label="This week" value={stats.week} icon={TrendingUp} />
        <Kpi label="This month" value={stats.month} icon={TrendingUp} />
        <Kpi label="New / untouched" value={stats.fresh} icon={Users} />
        <Kpi label="Hot leads (70+)" value={stats.hot} icon={Flame} />
        <Kpi label="Qualified" value={stats.qualified} icon={CheckCircle2} />
        <Kpi label="Converted (won)" value={stats.won} icon={CheckCircle2} />
        <Kpi label="Lost" value={stats.lost} icon={XCircle} />
        <Kpi label="Conversion rate" value={stats.conv} suffix="%" icon={TrendingUp} />
        <Kpi label="Avg lead score" value={stats.avgScore} icon={Flame} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-3">Leads over time</h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byDay}>
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" fill="url(#lg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-3">Leads by source</h2>
          {bySource.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads in this range yet.</p>
          ) : (
            <ul className="space-y-2 max-h-[240px] overflow-auto pr-1">
              {bySource.map((s) => (
                <li key={s.name} className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2 text-sm">
                  <span className="truncate">{s.name.replace(/_/g, " ")}</span>
                  <Badge variant="secondary">{s.count}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-3">Leads by service</h2>
          {byService.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byService}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-15} height={54} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin size={16} className="text-primary" /> Leads by location</h2>
          {geoRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No location data yet.</p>
          ) : (
            <div className="space-y-2 max-h-[240px] overflow-auto pr-1">
              {geoRows.map((g) => (
                <div key={g.key} className="rounded-2xl bg-muted/40 px-3 py-2">
                  <p className="text-sm font-semibold">
                    {g.key === "__unknown__" ? "More precise location data unavailable for these visitors" : g.key}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {g.total} leads · {g.qualified} qualified · {g.won} converted · avg score {Math.round(g.score / g.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, mobile, company, website…" className="pl-9 rounded-2xl" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px] rounded-2xl h-10"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All statuses</SelectItem>
              {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger className="w-[170px] rounded-2xl h-10"><SelectValue placeholder="Service" /></SelectTrigger>
            <SelectContent className="bg-popover max-h-72">
              <SelectItem value="all">All services</SelectItem>
              {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={place} onValueChange={setPlace}>
            <SelectTrigger className="w-[160px] rounded-2xl h-10"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent className="bg-popover max-h-72">
              <SelectItem value="all">All locations</SelectItem>
              {places.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border/60">
                <th className="py-2 pr-3">Lead</th>
                <th className="py-2 pr-3 hidden md:table-cell">Service</th>
                <th className="py-2 pr-3 hidden lg:table-cell">Location</th>
                <th className="py-2 pr-3 hidden lg:table-cell">Source</th>
                <th className="py-2 pr-3">Score</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">When</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground"><Loader2 className="inline animate-spin mr-2" size={15} /> Loading leads…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No leads match these filters yet.</td></tr>
              )}
              {filtered.map((l) => {
                const sl = scoreLabel(l.score);
                return (
                  <tr key={l.id} onClick={() => openLead(l)} className="border-b border-border/40 hover:bg-muted/40 cursor-pointer">
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold">{l.full_name}</p>
                      <p className="text-xs text-muted-foreground">{l.email}</p>
                    </td>
                    <td className="py-2.5 pr-3 hidden md:table-cell">{l.service}</td>
                    <td className="py-2.5 pr-3 hidden lg:table-cell text-xs text-muted-foreground">
                      {locationOf(l) ?? "Unavailable"}
                    </td>
                    <td className="py-2.5 pr-3 hidden lg:table-cell text-xs">{l.source.replace(/_/g, " ")}</td>
                    <td className="py-2.5 pr-3 tabular-nums">{sl.emoji} {l.score}</td>
                    <td className="py-2.5 pr-3"><Badge variant="secondary">{statusLabel(l.status)}</Badge></td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground whitespace-nowrap">{relative(l.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.full_name}
                  <Badge variant="secondary">{scoreLabel(selected.score).emoji} {scoreLabel(selected.score).label} · {selected.score}</Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Email", selected.email],
                    ["Mobile", `${selected.phone_country} ${selected.phone}`],
                    ["Company", selected.company || "—"],
                    ["Website", selected.website || "—"],
                    ["Service", selected.service],
                    ["Preferred contact", selected.preferred_contact || "—"],
                    ["Source", selected.source.replace(/_/g, " ")],
                    ["Page", selected.page_path || "—"],
                    ["Location", locationOf(selected) ?? "More precise location data unavailable for this visitor"],
                    ["Received", new Date(selected.created_at).toLocaleString()],
                  ].map(([k, v]) => (
                    <div key={k as string} className="rounded-xl bg-muted/40 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">{k}</p>
                      <p className="break-words">{v as string}</p>
                    </div>
                  ))}
                </div>

                {selected.message && (
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground mb-1">Message</p>
                    <p className="whitespace-pre-wrap">{selected.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="rounded-2xl" onClick={() => copy(selected.email, "Email")}><Copy size={13} className="mr-1" /> Email</Button>
                  <Button size="sm" variant="outline" className="rounded-2xl" onClick={() => copy(`${selected.phone_country}${selected.phone}`, "Mobile")}><Copy size={13} className="mr-1" /> Mobile</Button>
                  <a href={`mailto:${selected.email}`}><Button size="sm" variant="outline" className="rounded-2xl"><Mail size={13} className="mr-1" /> Send email</Button></a>
                  <a href={`tel:${selected.phone_country}${selected.phone}`}><Button size="sm" variant="outline" className="rounded-2xl"><Phone size={13} className="mr-1" /> Call</Button></a>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-1">Pipeline status</p>
                  <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                    <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-1">Notes & follow-ups</p>
                  <Textarea rows={2} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add a follow-up note…" />
                  <Button size="sm" className="rounded-2xl mt-2" onClick={addNote} disabled={!noteDraft.trim()}>Add note</Button>
                  <div className="space-y-2 mt-3 max-h-40 overflow-auto pr-1">
                    {notes.map((n) => (
                      <div key={n.id} className="rounded-xl bg-muted/40 p-2">
                        <p className="text-xs whitespace-pre-wrap">{n.note}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{n.author_email ?? "admin"} · {relative(n.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button size="sm" variant="destructive" className="rounded-2xl" onClick={() => removeLead(selected.id)}>
                  <Trash2 size={13} className="mr-1" /> Delete lead
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
