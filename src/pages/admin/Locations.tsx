import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import {
  ChevronRight, Download, Globe2, Loader2, MapPin, RefreshCw, Search, TrendingDown,
  TrendingUp, Minus, Clock, CalendarDays, Wrench, Target,
} from "lucide-react";

/* ------------------------------------------------------------------ types */

type View = {
  session_id: string;
  path: string;
  referrer: string | null;
  country: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  created_at: string;
};

type Lead = {
  country: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  service: string | null;
  source: string | null;
  status: string | null;
  session_id: string | null;
  created_at: string;
};

type Tool = { tool_name: string; session_id: string | null; created_at: string };

/* ---------------------------------------------------------------- helpers */

const SEARCH = /google\.|bing\.|duckduckgo|yahoo\.|yandex\./i;
const SOCIAL = /facebook|instagram|linkedin|twitter|x\.com|t\.co|youtube|pinterest|reddit|whatsapp/i;

export function classifySource(referrer: string | null): string {
  if (!referrer) return "Direct";
  if (/google\./i.test(referrer)) return "Google";
  if (/bing\./i.test(referrer)) return "Bing";
  if (SEARCH.test(referrer)) return "Other search";
  if (SOCIAL.test(referrer)) return "Social";
  return "Referral";
}

export const flag = (cc?: string | null) =>
  cc && cc.length === 2
    ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
    : "🌐";

const UNKNOWN = "Unknown";
const norm = (v: string | null | undefined) => (v && v.trim() ? v.trim() : UNKNOWN);

export const durationLabel = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

/** Aggregates a bag of page views + leads + tool runs into location metrics. */
export function computeMetrics(views: View[], leads: Lead[], tools: Tool[]) {
  const sessions = new Map<string, View[]>();
  views.forEach((v) => {
    const l = sessions.get(v.session_id) ?? [];
    l.push(v);
    sessions.set(v.session_id, l);
  });
  let durationSum = 0;
  let engaged = 0;
  sessions.forEach((list) => {
    const times = list.map((r) => new Date(r.created_at).getTime()).sort((a, b) => a - b);
    const d = times[times.length - 1] - times[0];
    durationSum += d;
    if (list.length > 1 || d > 30_000) engaged++;
  });
  const visitors = sessions.size;
  return {
    visitors,
    pageViews: views.length,
    sessions: visitors,
    avgDuration: visitors ? durationSum / visitors : 0,
    engagement: visitors ? Math.round((engaged / visitors) * 100) : 0,
    leads: leads.length,
    conversion: visitors ? Math.round((leads.length / visitors) * 1000) / 10 : 0,
    toolRuns: tools.length,
  };
}

const csv = (rows: (string | number)[][]) =>
  rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const blob = new Blob([csv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const trendIcon = (delta: number) =>
  delta > 5 ? (
    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold"><TrendingUp size={13} /> Growing</span>
  ) : delta < -5 ? (
    <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-semibold"><TrendingDown size={13} /> Declining</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-semibold"><Minus size={13} /> Stable</span>
  );

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4 shadow-sm ${className}`}>
    {children}
  </div>
);

const Kpi = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all"
  >
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-1.5 text-2xl font-black tabular-nums">{value}</p>
    {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
  </motion.div>
);

/* ------------------------------------------------------------------- page */

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export default function AdminLocations() {
  const [views, setViews] = useState<View[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [days, setDays] = useState(30);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"visitors" | "leads" | "sessions" | "engagement">("visitors");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    const since = new Date(Date.now() - 90 * 864e5).toISOString();
    const [v, l, t] = await Promise.all([
      supabase
        .from("page_views")
        .select("session_id,path,referrer,country,country_code,region,city,device,browser,os,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(8000),
      supabase
        .from("leads")
        .select("country,state,district,city,service,source,status,session_id,created_at")
        .gte("created_at", since)
        .limit(5000),
      supabase.from("tool_usage").select("tool_name,session_id,created_at").gte("created_at", since).limit(8000),
    ]);
    setViews((v.data as View[]) ?? []);
    setLeads((l.data as Lead[]) ?? []);
    setTools((t.data as Tool[]) ?? []);
    setLoading(false);
    setRefreshing(false);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 300_000);
    return () => clearInterval(id);
  }, [load]);

  /* ---------------------------------------------------------- derived data */

  const scoped = useMemo(() => {
    const since = new Date(Date.now() - days * 864e5).toISOString();
    let v = views.filter((r) => r.created_at >= since);
    if (deviceFilter !== "all") v = v.filter((r) => r.device === deviceFilter);
    if (sourceFilter !== "all") v = v.filter((r) => classifySource(r.referrer) === sourceFilter);
    const sessionIds = new Set(v.map((r) => r.session_id));
    const l = leads.filter((r) => r.created_at >= since);
    const t = tools.filter((r) => r.created_at >= since && (!r.session_id || sessionIds.has(r.session_id)));
    return { v, l, t };
  }, [views, leads, tools, days, deviceFilter, sourceFilter]);

  const sessionLocation = useMemo(() => {
    const map = new Map<string, View>();
    scoped.v.forEach((r) => {
      if (!map.has(r.session_id)) map.set(r.session_id, r);
    });
    return map;
  }, [scoped.v]);

  const tree = useMemo(() => {
    type Node = { name: string; views: View[]; children: Map<string, Node> };
    const root = new Map<string, Node>();
    const push = (map: Map<string, Node>, key: string, r: View) => {
      const n = map.get(key) ?? { name: key, views: [], children: new Map() };
      n.views.push(r);
      map.set(key, n);
      return n;
    };
    scoped.v.forEach((r) => {
      const c = push(root, norm(r.country), r);
      const s = push(c.children, norm(r.region), r);
      push(s.children, norm(r.city), r);
    });

    const leadsAt = (country: string, state?: string, city?: string) =>
      scoped.l.filter(
        (x) =>
          norm(x.country) === country &&
          (state === undefined || norm(x.state) === state) &&
          (city === undefined || norm(x.city) === city),
      );
    const toolsFor = (vs: View[]) => {
      const ids = new Set(vs.map((r) => r.session_id));
      return scoped.t.filter((x) => x.session_id && ids.has(x.session_id));
    };

    return [...root.values()]
      .map((c) => ({
        name: c.name,
        cc: c.views.find((r) => r.country_code)?.country_code ?? null,
        m: computeMetrics(c.views, leadsAt(c.name), toolsFor(c.views)),
        states: [...c.children.values()]
          .map((s) => ({
            name: s.name,
            m: computeMetrics(s.views, leadsAt(c.name, s.name), toolsFor(s.views)),
            cities: [...s.children.values()]
              .map((ci) => ({
                name: ci.name,
                state: s.name,
                country: c.name,
                m: computeMetrics(ci.views, leadsAt(c.name, s.name, ci.name), toolsFor(ci.views)),
              }))
              .sort((a, b) => b.m.visitors - a.m.visitors),
          }))
          .sort((a, b) => b.m.visitors - a.m.visitors),
      }))
      .sort((a, b) => b.m.visitors - a.m.visitors);
  }, [scoped]);

  const cityRows = useMemo(() => {
    const rows = tree.flatMap((c) =>
      c.states.flatMap((s) =>
        s.cities.map((ci) => {
          const cityViews = scoped.v.filter(
            (r) => norm(r.country) === c.name && norm(r.region) === s.name && norm(r.city) === ci.name,
          );
          const pageCount = new Map<string, number>();
          cityViews.forEach((r) => pageCount.set(r.path, (pageCount.get(r.path) ?? 0) + 1));
          const topPage = [...pageCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
          const ids = new Set(cityViews.map((r) => r.session_id));
          const toolCount = new Map<string, number>();
          scoped.t.forEach((t) => {
            if (t.session_id && ids.has(t.session_id)) toolCount.set(t.tool_name, (toolCount.get(t.tool_name) ?? 0) + 1);
          });
          const topTool = [...toolCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
          const last = cityViews.reduce((acc, r) => (r.created_at > acc ? r.created_at : acc), "");
          return {
            city: ci.name,
            state: s.name,
            country: c.name,
            district: UNKNOWN,
            ...ci.m,
            topPage,
            topTool,
            last,
          };
        }),
      ),
    );
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => !q || `${r.city} ${r.state} ${r.country}`.toLowerCase().includes(q))
      .sort((a, b) => (b as any)[sortKey] - (a as any)[sortKey]);
  }, [tree, scoped, query, sortKey]);

  const totals = useMemo(() => computeMetrics(scoped.v, scoped.l, scoped.t), [scoped]);

  const hourly = useMemo(() => {
    const arr = Array.from({ length: 24 }, (_, h) => ({ hour: h, label: `${((h + 11) % 12) + 1} ${h < 12 ? "AM" : "PM"}`, sessions: new Set<string>(), views: 0, leads: 0 }));
    scoped.v.forEach((r) => {
      const h = new Date(r.created_at).getHours();
      arr[h].views++;
      arr[h].sessions.add(r.session_id);
    });
    scoped.l.forEach((r) => { arr[new Date(r.created_at).getHours()].leads++; });
    return arr.map((a) => ({ label: a.label, visitors: a.sessions.size, views: a.views, leads: a.leads }));
  }, [scoped]);

  const weekday = useMemo(() => {
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const arr = names.map((day) => ({ day, sessions: new Set<string>(), leads: 0 }));
    scoped.v.forEach((r) => arr[new Date(r.created_at).getDay()].sessions.add(r.session_id));
    scoped.l.forEach((r) => { arr[new Date(r.created_at).getDay()].leads++; });
    return arr.map((a) => ({
      day: a.day,
      visitors: a.sessions.size,
      leads: a.leads,
      conversion: a.sessions.size ? Math.round((a.leads / a.sessions.size) * 1000) / 10 : 0,
    }));
  }, [scoped]);

  const calendar = useMemo(() => {
    const map = new Map<string, { sessions: Set<string>; views: number; leads: number; tools: number }>();
    const get = (k: string) => {
      const e = map.get(k) ?? { sessions: new Set<string>(), views: 0, leads: 0, tools: 0 };
      map.set(k, e);
      return e;
    };
    scoped.v.forEach((r) => {
      const e = get(r.created_at.slice(0, 10));
      e.views++;
      e.sessions.add(r.session_id);
    });
    scoped.l.forEach((r) => { get(r.created_at.slice(0, 10)).leads++; });
    scoped.t.forEach((r) => { get(r.created_at.slice(0, 10)).tools++; });
    return [...map.entries()]
      .map(([date, e]) => ({ date, visitors: e.sessions.size, views: e.views, leads: e.leads, tools: e.tools }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 31);
  }, [scoped]);

  const deviceByState = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    scoped.v.forEach((r) => {
      const key = norm(r.region);
      const e = map.get(key) ?? {};
      const d = norm(r.device);
      e[d] = (e[d] ?? 0) + 1;
      map.set(key, e);
    });
    return [...map.entries()]
      .map(([state, counts]) => {
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        return {
          state,
          total,
          split: Object.entries(counts)
            .map(([device, n]) => ({ device, pct: Math.round((n / total) * 100) }))
            .sort((a, b) => b.pct - a.pct),
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [scoped]);

  const serviceDemand = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    scoped.l.forEach((l) => {
      const city = norm(l.city);
      const inner = map.get(city) ?? new Map<string, number>();
      const svc = norm(l.service);
      inner.set(svc, (inner.get(svc) ?? 0) + 1);
      map.set(city, inner);
    });
    return [...map.entries()]
      .map(([city, inner]) => ({
        city,
        total: [...inner.values()].reduce((a, b) => a + b, 0),
        services: [...inner.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [scoped]);

  const toolByLocation = useMemo(() => {
    const map = new Map<string, { location: string; tool: string; usage: number; users: Set<string> }>();
    scoped.t.forEach((t) => {
      const v = t.session_id ? sessionLocation.get(t.session_id) : undefined;
      const location = v ? `${norm(v.city)}, ${norm(v.region)}` : UNKNOWN;
      const key = `${location}|${t.tool_name}`;
      const e = map.get(key) ?? { location, tool: t.tool_name, usage: 0, users: new Set<string>() };
      e.usage++;
      if (t.session_id) e.users.add(t.session_id);
      map.set(key, e);
    });
    return [...map.values()]
      .map((e) => ({ ...e, users: e.users.size }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 12);
  }, [scoped.t, sessionLocation]);

  const leadBreakdown = useMemo(() => {
    const by = (fn: (l: Lead) => string) => {
      const m = new Map<string, number>();
      scoped.l.forEach((l) => {
        const k = fn(l);
        m.set(k, (m.get(k) ?? 0) + 1);
      });
      return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    };
    return {
      country: by((l) => norm(l.country)),
      state: by((l) => norm(l.state)),
      city: by((l) => norm(l.city)),
      service: by((l) => norm(l.service)),
      source: by((l) => norm(l.source)),
    };
  }, [scoped.l]);

  const trends = useMemo(() => {
    const half = days / 2;
    const mid = new Date(Date.now() - half * 864e5).toISOString();
    const per = (list: { created_at: string }[]) => {
      const recent = list.filter((r) => r.created_at >= mid).length;
      const before = list.length - recent;
      return before ? Math.round(((recent - before) / before) * 100) : recent ? 100 : 0;
    };
    return { visitors: per(scoped.v), leads: per(scoped.l), tools: per(scoped.t) };
  }, [scoped, days]);

  const peakHour = [...hourly].sort((a, b) => b.visitors - a.visitors)[0];
  const lowHour = [...hourly].filter((h) => h.visitors > 0).sort((a, b) => a.visitors - b.visitors)[0];
  const bestLeadHour = [...hourly].sort((a, b) => b.leads - a.leads)[0];

  const hasData = views.length > 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-[24px]" />)}
        </div>
        <Skeleton className="h-[320px] rounded-[24px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            Cities &amp; Towns intelligence
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 bg-emerald-500/10 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Country → State → City hierarchy, aggregated from your own analytics. No precise coordinates stored.
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            Source: project database · Last updated: <b className="text-foreground">{lastUpdated?.toLocaleTimeString() ?? "—"}</b>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${
                days === r.days ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => load()} disabled={refreshing}>
            {refreshing ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />} Refresh Now
          </Button>
        </div>
      </div>

      {!hasData && (
        <Card>
          <p className="text-sm text-muted-foreground">
            No analytics recorded yet. Location metrics appear as soon as visitors browse the public site — nothing here is simulated.
          </p>
        </Card>
      )}

      {/* filters */}
      <Card className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search city, state or country…" className="pl-9 rounded-2xl" />
        </div>
        <select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)} className="rounded-2xl border border-border bg-card px-3 py-2 text-sm">
          <option value="all">All devices</option>
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
          <option value="tablet">Tablet</option>
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="rounded-2xl border border-border bg-card px-3 py-2 text-sm">
          {["all", "Google", "Bing", "Other search", "Direct", "Social", "Referral"].map((s) => (
            <option key={s} value={s}>{s === "all" ? "All sources" : s}</option>
          ))}
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="rounded-2xl border border-border bg-card px-3 py-2 text-sm">
          <option value="visitors">Sort: Visitors</option>
          <option value="leads">Sort: Leads</option>
          <option value="sessions">Sort: Sessions</option>
          <option value="engagement">Sort: Engagement</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          className="rounded-2xl"
          onClick={() =>
            downloadCsv(`location-analytics-${new Date().toISOString().slice(0, 10)}.csv`, [
              ["Location", "State", "Country", "Visitors", "Sessions", "Page views", "Leads", "Conversion %", "Engagement %", "Avg duration", "Top page", "Top tool", "Last seen"],
              ...cityRows.map((r) => [r.city, r.state, r.country, r.visitors, r.sessions, r.pageViews, r.leads, r.conversion, r.engagement, durationLabel(r.avgDuration), r.topPage, r.topTool, r.last]),
            ])
          }
        >
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </Card>

      {/* totals */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Visitors" value={totals.visitors.toLocaleString()} />
        <Kpi label="Sessions" value={totals.sessions.toLocaleString()} />
        <Kpi label="Page views" value={totals.pageViews.toLocaleString()} />
        <Kpi label="Avg session" value={durationLabel(totals.avgDuration)} />
        <Kpi label="Engagement" value={`${totals.engagement}%`} />
        <Kpi label="Leads" value={totals.leads.toLocaleString()} />
        <Kpi label="Conversion" value={`${totals.conversion}%`} />
        <Kpi label="Tool runs" value={totals.toolRuns.toLocaleString()} />
      </div>

      {/* trends */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card><p className="text-xs text-muted-foreground">Visitors trend ({days}d)</p><div className="mt-1">{trendIcon(trends.visitors)}</div><p className="text-xs text-muted-foreground mt-1 tabular-nums">{trends.visitors > 0 ? "+" : ""}{trends.visitors}% vs prior period</p></Card>
        <Card><p className="text-xs text-muted-foreground">Leads trend ({days}d)</p><div className="mt-1">{trendIcon(trends.leads)}</div><p className="text-xs text-muted-foreground mt-1 tabular-nums">{trends.leads > 0 ? "+" : ""}{trends.leads}% vs prior period</p></Card>
        <Card><p className="text-xs text-muted-foreground">Tool usage trend ({days}d)</p><div className="mt-1">{trendIcon(trends.tools)}</div><p className="text-xs text-muted-foreground mt-1 tabular-nums">{trends.tools > 0 ? "+" : ""}{trends.tools}% vs prior period</p></Card>
      </div>

      {/* hierarchy */}
      <Card>
        <h2 className="font-bold mb-3 flex items-center gap-2"><Globe2 size={16} className="text-primary" /> Location hierarchy</h2>
        {tree.length === 0 ? (
          <p className="text-sm text-muted-foreground">No location data in this period.</p>
        ) : (
          <ul className="space-y-1.5">
            {tree.map((c) => (
              <li key={c.name} className="rounded-2xl border border-border/50">
                <button
                  onClick={() => setExpanded((e) => ({ ...e, [c.name]: !e[c.name] }))}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-muted/50 rounded-2xl transition"
                >
                  <ChevronRight size={15} className={`transition ${expanded[c.name] ? "rotate-90" : ""}`} />
                  <span>{flag(c.cc)} {c.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {c.m.visitors} visitors · {c.m.leads} leads · {c.m.conversion}%
                  </span>
                </button>
                {expanded[c.name] &&
                  c.states.map((s) => {
                    const sk = `${c.name}/${s.name}`;
                    return (
                      <div key={sk} className="ml-5 border-l border-border/60 pl-3 pb-1">
                        <button
                          onClick={() => setExpanded((e) => ({ ...e, [sk]: !e[sk] }))}
                          className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-muted/50 rounded-xl transition"
                        >
                          <ChevronRight size={13} className={`transition ${expanded[sk] ? "rotate-90" : ""}`} />
                          {s.name}
                          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                            {s.m.visitors} visitors · {s.m.leads} leads
                          </span>
                        </button>
                        {expanded[sk] && (
                          <ul className="ml-5 border-l border-border/60 pl-3">
                            {s.cities.map((ci) => (
                              <li key={ci.name}>
                                <Link
                                  to={`/admin/analytics/location/${encodeURIComponent(ci.name)}`}
                                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-xl hover:bg-primary/5 hover:text-primary transition"
                                >
                                  <MapPin size={12} /> {ci.name}
                                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                                    {ci.m.visitors} visitors · {ci.m.pageViews} views · {ci.m.leads} leads
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* rankings */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Top countries", items: tree.map((c) => ({ name: c.name, m: c.m })) },
          { title: "Top states", items: tree.flatMap((c) => c.states.map((s) => ({ name: s.name, m: s.m }))).sort((a, b) => b.m.visitors - a.m.visitors) },
          { title: "Top cities", items: cityRows.map((r) => ({ name: r.city, m: r })) },
          { title: "Top small towns", items: cityRows.filter((r) => r.visitors <= 25 && r.city !== UNKNOWN).map((r) => ({ name: r.city, m: r })) },
        ].map((block) => (
          <Card key={block.title}>
            <h3 className="font-bold text-sm mb-3">{block.title}</h3>
            {block.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ol className="space-y-2">
                {block.items.slice(0, 6).map((i, idx) => (
                  <li key={`${i.name}-${idx}`} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">{idx + 1}</span>
                    <span className="truncate">{i.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {i.m.visitors} · {i.m.leads} leads · {i.m.conversion}%
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        ))}
      </div>

      {/* small town table */}
      <Card>
        <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin size={16} className="text-primary" /> Small town &amp; emerging market traffic</h2>
        {cityRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No city-level data recorded yet.</p>
        ) : (
          <div className="overflow-auto max-h-[520px] -mx-2 px-2">
            <table className="w-full text-sm min-w-[980px]">
              <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
                <tr className="text-left text-xs text-muted-foreground">
                  {["Location", "State", "District", "Visitors", "Leads", "Sessions", "Engagement", "Top page", "Top tool", "Last updated"].map((h) => (
                    <th key={h} className="py-2 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cityRows.slice(0, 200).map((r) => (
                  <tr key={`${r.country}-${r.state}-${r.city}`} className="border-t border-border/50 hover:bg-muted/40 transition">
                    <td className="py-2 pr-3">
                      <Link className="text-primary hover:underline" to={`/admin/analytics/location/${encodeURIComponent(r.city)}`}>{r.city}</Link>
                    </td>
                    <td className="py-2 pr-3">{r.state}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.district}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.visitors}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.leads}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.sessions}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.engagement}%</td>
                    <td className="py-2 pr-3 max-w-[180px] truncate">{r.topPage}</td>
                    <td className="py-2 pr-3 max-w-[150px] truncate">{r.topTool}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                      {r.last ? new Date(r.last).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* hourly + weekday */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold mb-1 flex items-center gap-2"><Clock size={16} className="text-primary" /> Traffic by hour</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Peak: <b className="text-foreground">{peakHour?.visitors ? peakHour.label : "—"}</b> · Lowest:{" "}
            <b className="text-foreground">{lowHour?.label ?? "—"}</b> · Best for leads:{" "}
            <b className="text-foreground">{bestLeadHour?.leads ? bestLeadHour.label : "—"}</b>
          </p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" fontSize={10} interval={2} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} width={28} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="visitors" name="Visitors" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                <Bar dataKey="leads" name="Leads" radius={[6, 6, 0, 0]} fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold mb-3 flex items-center gap-2"><CalendarDays size={16} className="text-primary" /> Day of week</h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekday}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(d: string) => d.slice(0, 3)} />
                <YAxis fontSize={10} width={28} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="visitors" name="Visitors" radius={[6, 6, 0, 0]}>
                  {weekday.map((d, i) => <Cell key={d.day} fill={i % 2 ? "#a78bfa" : "hsl(var(--primary))"} />)}
                </Bar>
                <Bar dataKey="leads" name="Leads" radius={[6, 6, 0, 0]} fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* calendar */}
      <Card>
        <h2 className="font-bold mb-3 flex items-center gap-2"><CalendarDays size={16} className="text-primary" /> Traffic calendar</h2>
        {calendar.length === 0 ? (
          <p className="text-sm text-muted-foreground">No daily traffic recorded yet.</p>
        ) : (
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {calendar.map((d) => (
              <div key={d.date} className="rounded-2xl border border-border/60 p-3 hover:border-primary/40 hover:shadow-sm transition">
                <p className="text-xs text-muted-foreground">{new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</p>
                <p className="text-lg font-black tabular-nums">{d.visitors}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums">{d.views} views · {d.leads} leads · {d.tools} tools</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* device by location + service demand */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold mb-3">Device by location</h2>
          {deviceByState.length === 0 ? (
            <p className="text-sm text-muted-foreground">No device data yet.</p>
          ) : (
            <ul className="space-y-3">
              {deviceByState.map((s) => (
                <li key={s.state}>
                  <p className="text-sm font-semibold">{s.state}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.split.map((x) => `${x.device}: ${x.pct}%`).join(" · ")}
                  </p>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden flex">
                    {s.split.map((x, i) => (
                      <div key={x.device} style={{ width: `${x.pct}%` }} className={i === 0 ? "bg-primary" : i === 1 ? "bg-cyan-400" : "bg-violet-400"} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-bold mb-3 flex items-center gap-2"><Target size={16} className="text-primary" /> Service demand by location</h2>
          {serviceDemand.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {serviceDemand.map((c) => (
                <li key={c.city}>
                  <p className="text-sm font-semibold">{c.city} <span className="text-xs text-muted-foreground">· {c.total} leads</span></p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {c.services.map(([svc, n]) => (
                      <Badge key={svc} variant="outline" className="text-[10px]">{svc} — {n}</Badge>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* tool usage by location + lead intelligence */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold mb-3 flex items-center gap-2"><Wrench size={16} className="text-primary" /> AI &amp; SEO tool usage by location</h2>
          {toolByLocation.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tool runs recorded yet.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Location</th>
                    <th className="py-2 pr-3 font-medium">Tool</th>
                    <th className="py-2 pr-3 font-medium">Usage</th>
                    <th className="py-2 pr-3 font-medium">Unique users</th>
                  </tr>
                </thead>
                <tbody>
                  {toolByLocation.map((t) => (
                    <tr key={`${t.location}-${t.tool}`} className="border-t border-border/50">
                      <td className="py-2 pr-3">{t.location}</td>
                      <td className="py-2 pr-3">{t.tool}</td>
                      <td className="py-2 pr-3 tabular-nums">{t.usage}</td>
                      <td className="py-2 pr-3 tabular-nums">{t.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-bold mb-3">Lead location intelligence</h2>
          {scoped.l.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads recorded in this period.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ["Countries", leadBreakdown.country],
                ["States", leadBreakdown.state],
                ["Cities", leadBreakdown.city],
                ["Services", leadBreakdown.service],
                ["Sources", leadBreakdown.source],
              ] as const).map(([title, items]) => (
                <div key={title}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">{title}</p>
                  <ul className="space-y-1">
                    {items.map(([name, n]) => (
                      <li key={name} className="flex justify-between text-sm">
                        <span className="truncate">{name}</span>
                        <span className="tabular-nums text-muted-foreground">{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-3">
            Aggregated counts only — lead email and phone stay inside the CRM screens.
          </p>
        </Card>
      </div>
    </div>
  );
}
