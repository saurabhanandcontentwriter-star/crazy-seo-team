import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Radio, Users, Sun, CalendarDays, CalendarRange, Globe2, RefreshCw, Loader2,
  MonitorSmartphone, Bot,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

type View = {
  id: string;
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

/* ---------------- helpers ---------------- */

const AI_ENGINES: Record<string, RegExp> = {
  ChatGPT: /chat\.openai|chatgpt\.com|openai\.com/i,
  Gemini: /gemini\.google|bard\.google/i,
  Perplexity: /perplexity\.ai/i,
  Claude: /claude\.ai|anthropic/i,
};
const SEARCH = /google\.|bing\.|duckduckgo|yahoo\.|yandex\./i;
const SOCIAL = /facebook|instagram|linkedin|twitter|x\.com|t\.co|youtube|pinterest|reddit|whatsapp/i;
const PAID = /gclid|utm_medium=(cpc|ppc|paid)/i;

function classify(referrer: string | null): string {
  if (!referrer) return "Direct";
  for (const [name, re] of Object.entries(AI_ENGINES)) if (re.test(referrer)) return name;
  if (PAID.test(referrer)) return "Paid";
  if (SEARCH.test(referrer)) return "Organic";
  if (SOCIAL.test(referrer)) return "Social";
  return "Referral";
}

const SOURCE_COLORS: Record<string, string> = {
  Organic: "hsl(var(--primary))",
  Direct: "#22d3ee",
  Referral: "#a78bfa",
  Social: "#f472b6",
  Paid: "#fbbf24",
  ChatGPT: "#10a37f",
  Gemini: "#4285f4",
  Perplexity: "#20808d",
  Claude: "#d97757",
};

const flag = (cc?: string | null) =>
  cc && cc.length === 2
    ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
    : "🌐";

function useCounter(value: number) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 700);
      setDisplay(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return display;
}

const Stat = ({ label, value, icon: Icon, live }: { label: string; value: number; icon: any; live?: boolean }) => {
  const n = useCounter(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-black tabular-nums flex items-center gap-2">
        {n.toLocaleString()}
        {live && value > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
      </p>
    </motion.div>
  );
};

const uniq = (arr: (string | null | undefined)[]) => new Set(arr.filter(Boolean) as string[]).size;

const rank = (rows: View[], key: keyof View, limit = 6) => {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const v = (r[key] as string) || null;
    if (v) m.set(v, (m.get(v) ?? 0) + 1);
  });
  const total = [...m.values()].reduce((a, b) => a + b, 0) || 1;
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));
};

const durationLabel = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

/* ---------------- page ---------------- */

const INTERVALS = [
  { label: "15s", ms: 15_000 },
  { label: "30s", ms: 30_000 },
  { label: "1m", ms: 60_000 },
  { label: "5m", ms: 300_000 },
  { label: "15m", ms: 900_000 },
  { label: "30m", ms: 1_800_000 },
];

export default function AdminLive() {
  const [rows, setRows] = useState<View[]>([]);
  const [monthCount, setMonthCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalMs, setIntervalMs] = useState(30_000);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);

  const loadWindow = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    const since = new Date(Date.now() - 14 * 864e5).toISOString();
    const [recent, month] = await Promise.all([
      supabase
        .from("page_views")
        .select("id,session_id,path,referrer,country,country_code,region,city,device,browser,os,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(3000),
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString()),
    ]);
    setRows((recent.data as View[]) ?? []);
    setMonthCount(month.count ?? 0);
    setLoading(false);
    setRefreshing(false);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    loadWindow();
  }, [loadWindow]);

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      setNextRefresh(null);
      return;
    }
    setNextRefresh(new Date(Date.now() + intervalMs));
    const pull = setInterval(() => {
      loadWindow(true);
      setNextRefresh(new Date(Date.now() + intervalMs));
    }, intervalMs);
    return () => clearInterval(pull);
  }, [autoRefresh, intervalMs, loadWindow]);


  // realtime: prepend new page views instantly (no page refresh)
  useEffect(() => {
    const channel = supabase
      .channel("admin-live-page-views")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, (payload) => {
        setRows((prev) => [payload.new as View, ...prev].slice(0, 3000));
        setNow(Date.now());
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const m = useMemo(() => {
    const t = now;
    const iso = (ms: number) => new Date(t - ms).toISOString();
    const startOf = (offsetDays: number) => {
      const d = new Date(t);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString();
    };
    const todayStart = startOf(0);
    const yStart = startOf(1);

    const online = rows.filter((r) => r.created_at >= iso(5 * 60_000));
    const active = rows.filter((r) => r.created_at >= iso(30 * 60_000));
    const today = rows.filter((r) => r.created_at >= todayStart);
    const yesterday = rows.filter((r) => r.created_at >= yStart && r.created_at < todayStart);
    const week = rows.filter((r) => r.created_at >= iso(7 * 864e5));

    // sources
    const smap = new Map<string, number>();
    rows.forEach((r) => {
      const s = classify(r.referrer);
      smap.set(s, (smap.get(s) ?? 0) + 1);
    });
    const sources = [...smap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // hourly series (24h)
    const buckets = new Map<string, { hour: string; views: number; sessions: Set<string> }>();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(t - i * 3600_000);
      const k = `${d.toISOString().slice(0, 13)}`;
      buckets.set(k, { hour: `${d.getHours()}:00`, views: 0, sessions: new Set() });
    }
    rows.forEach((r) => {
      const b = buckets.get(r.created_at.slice(0, 13));
      if (b) {
        b.views++;
        b.sessions.add(r.session_id);
      }
    });
    const series = [...buckets.values()].map((b) => ({ hour: b.hour, views: b.views, sessions: b.sessions.size }));

    // live sessions table
    const bySession = new Map<string, View[]>();
    active.forEach((r) => {
      const list = bySession.get(r.session_id) ?? [];
      list.push(r);
      bySession.set(r.session_id, list);
    });
    const live = [...bySession.entries()]
      .map(([session, list]) => {
        const sorted = [...list].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        return {
          session,
          last,
          pages: sorted.length,
          entry: first.path,
          start: first.created_at,
          duration: new Date(last.created_at).getTime() - new Date(first.created_at).getTime(),
          source: classify(last.referrer),
          isOnline: last.created_at >= iso(5 * 60_000),
        };
      })
      .sort((a, b) => (a.last.created_at < b.last.created_at ? 1 : -1))
      .slice(0, 40);

    return {
      online: uniq(online.map((r) => r.session_id)),
      active: uniq(active.map((r) => r.session_id)),
      today: uniq(today.map((r) => r.session_id)),
      yesterday: uniq(yesterday.map((r) => r.session_id)),
      week: uniq(week.map((r) => r.session_id)),
      sources,
      series,
      live,
      countries: rank(rows, "country"),
      regions: rank(rows, "region"),
      cities: rank(rows, "city"),
      pages: rank(rows, "path"),
      devices: rank(rows, "device", 4),
      browsers: rank(rows, "browser", 4),
    };
  }, [rows, now]);

  const aiTotal = m.sources
    .filter((s) => Object.keys(AI_ENGINES).includes(s.name))
    .reduce((a, b) => a + b.value, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-[24px]" />)}
        </div>
        <Skeleton className="h-[300px] rounded-[24px]" />
      </div>
    );
  }

  const RankList = ({ title, items, icon: Icon, withFlag }: { title: string; items: { name: string; count: number; pct: number }[]; icon: any; withFlag?: boolean }) => (
    <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
      <h3 className="font-bold mb-3 flex items-center gap-2 text-sm"><Icon size={15} className="text-primary" /> {title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((i) => (
            <li key={i.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[70%]">
                  {withFlag && `${flag(rows.find((r) => r.country === i.name)?.country_code)} `}{i.name}
                </span>
                <span className="tabular-nums text-muted-foreground">{i.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${i.pct}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            Live Traffic Command Center
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-wide text-emerald-600 bg-emerald-500/10 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Streaming visitor data from your database — updates in place, never reloads the page
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            Last updated: <b className="text-foreground">{lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}</b>
            {nextRefresh && <> · Next refresh: {nextRefresh.toLocaleTimeString()}</>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${
              autoRefresh ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600" : "border-border bg-muted/40 text-muted-foreground"
            }`}
          >
            Auto refresh {autoRefresh ? "ON" : "OFF"}
          </button>
          <select
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            disabled={!autoRefresh}
            className="rounded-2xl border border-border bg-card/70 px-3 py-1.5 text-xs disabled:opacity-50"
          >
            {INTERVALS.map((i) => (
              <option key={i.ms} value={i.ms}>Every {i.label}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => loadWindow()} disabled={refreshing}>
            {refreshing ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />} Refresh Now
          </Button>
        </div>
      </div>


      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Online now (5m)" value={m.online} icon={Radio} live />
        <Stat label="Active (30m)" value={m.active} icon={Users} live />
        <Stat label="Today" value={m.today} icon={Sun} />
        <Stat label="Yesterday" value={m.yesterday} icon={CalendarDays} />
        <Stat label="Last 7 days" value={m.week} icon={CalendarRange} />
        <Stat label="Views (30d)" value={monthCount} icon={Globe2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-3">Traffic — last 24 hours</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.series}>
                <defs>
                  <linearGradient id="lv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="hour" fontSize={11} tickLine={false} axisLine={false} interval={2} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="views" name="Page views" stroke="hsl(var(--primary))" fill="url(#lv)" strokeWidth={2} />
                <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#22d3ee" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-1">Traffic sources</h2>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Bot size={13} className="text-primary" /> AI search visits: <b className="text-foreground">{aiTotal}</b>
          </p>
          {m.sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No traffic recorded yet.</p>
          ) : (
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={m.sources} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {m.sources.map((s) => (
                      <Cell key={s.name} fill={SOURCE_COLORS[s.name] ?? "hsl(var(--muted-foreground))"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RankList title="Top countries" items={m.countries} icon={Globe2} withFlag />
        <RankList title="Top states / regions" items={m.regions} icon={Globe2} />
        <RankList title="Top cities" items={m.cities} icon={Globe2} />
        <RankList title="Top pages" items={m.pages} icon={MonitorSmartphone} />
      </div>

      <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
        <h2 className="font-bold mb-3">Live visitors</h2>
        {m.live.length === 0 ? (
          <p className="text-sm text-muted-foreground">No visitors in the last 30 minutes.</p>
        ) : (
          <div className="overflow-auto max-h-[460px] -mx-2 px-2">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Location</th>
                  <th className="py-2 pr-3 font-medium">Page</th>
                  <th className="py-2 pr-3 font-medium">Source</th>
                  <th className="py-2 pr-3 font-medium">Device</th>
                  <th className="py-2 pr-3 font-medium">Pages</th>
                  <th className="py-2 pr-3 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {m.live.map((v) => (
                  <tr key={v.session} className="border-t border-border/50 hover:bg-muted/40 transition">
                    <td className="py-2 pr-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${v.isOnline ? "text-emerald-600" : "text-muted-foreground"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${v.isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"}`} />
                        {v.isOnline ? "Online" : "Idle"}
                      </span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {flag(v.last.country_code)} {v.last.city ?? v.last.region ?? v.last.country ?? "Unknown"}
                      {v.last.country && <span className="text-muted-foreground"> · {v.last.country}</span>}
                    </td>
                    <td className="py-2 pr-3 max-w-[220px] truncate">{v.last.path}</td>
                    <td className="py-2 pr-3">
                      <Badge variant="outline" className="text-[10px]">{v.source}</Badge>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground text-xs">
                      {v.last.device} · {v.last.browser} · {v.last.os}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{v.pages}</td>
                    <td className="py-2 pr-3 tabular-nums">{durationLabel(v.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RankList title="Devices" items={m.devices} icon={MonitorSmartphone} />
        <RankList title="Browsers" items={m.browsers} icon={MonitorSmartphone} />
      </div>
    </div>
  );
}
