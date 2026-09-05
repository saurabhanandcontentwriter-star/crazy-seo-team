import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import type { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, AreaChart, Area, Legend
} from "recharts";
import {
  Loader2, Users, FileText, Newspaper, Mail, TrendingUp, Activity, Globe,
  Download, FileDown, LogOut, Smartphone, Monitor, Tablet, Eye, Wifi, MapPin, Zap,
  CalendarDays, Building2
} from "lucide-react";

const COLORS = ["hsl(230 80% 60%)", "hsl(270 80% 65%)", "hsl(189 94% 55%)", "hsl(142 70% 45%)", "hsl(45 90% 55%)", "hsl(340 82% 60%)", "hsl(24 95% 55%)", "hsl(195 75% 50%)"];

type PageView = {
  id: string; session_id: string; path: string; country: string | null;
  country_code: string | null; city: string | null; region: string | null;
  device: string | null;
  browser: string | null; os: string | null; created_at: string;
};

const PRESETS = [
  { key: "24h", label: "24 hours", days: 1 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
] as const;


const StatCard = ({ icon: Icon, label, value, delta, accent }: any) => (
  <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-card/40 backdrop-blur-xl">
    <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
    <CardContent className="p-5 relative">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
          <p className="text-3xl font-black text-foreground mt-1 tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
          {delta && <p className="text-xs text-emerald-500 mt-1 font-semibold">{delta}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${accent} text-white shadow-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const LiveDot = () => (
  <span className="relative inline-flex items-center gap-1.5">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Live</span>
  </span>
);

const flag = (cc: string | null) => {
  if (!cc || cc.length !== 2) return "🌐";
  return String.fromCodePoint(...cc.toUpperCase().split("").map(c => 127397 + c.charCodeAt(0)));
};

const DeviceIcon = ({ d }: { d: string | null }) => {
  if (d === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (d === "tablet") return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
};

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allViews, setAllViews] = useState<PageView[]>([]);
  const [core, setCore] = useState<any>(null);
  const [tick, setTick] = useState(0);
  const [preset, setPreset] = useState<string>("30d");
  const [range, setRange] = useState<DateRange | undefined>();
  const [calOpen, setCalOpen] = useState(false);

  // Access control is handled by AdminGuard on the /admin route.


  // Auto-refresh every 15s for live feel
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    (async () => {
      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const [pvRes, usersRes, blogsRes, newsRes, subsRes, toolRes] = await Promise.all([
        supabase.from("page_views").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("blog_posts").select("title, published, published_at, created_at").order("created_at", { ascending: false }),
        supabase.from("news_articles").select("category, title, published_at"),
        supabase.from("newsletter_subscribers").select("email, source, created_at").order("created_at", { ascending: false }),
        supabase.from("tool_usage").select("tool_name, created_at").gte("created_at", since),
      ]);

      const users = usersRes.data ?? [];
      const blogs = blogsRes.data ?? [];
      const news = newsRes.data ?? [];
      const subs = subsRes.data ?? [];

      setAllViews((pvRes.data ?? []) as PageView[]);
      setCore({
        totalUsers: new Set(users.map((u: any) => u.user_id)).size,
        admins: users.filter((u: any) => u.role === "admin").length,
        publishedBlogs: blogs.filter((b: any) => b.published).length,
        draftBlogs: blogs.filter((b: any) => !b.published).length,
        newsCount: news.length,
        subscribers: subs.length,
        recentSubs: subs.slice(0, 8),
        recentBlogs: blogs.slice(0, 5),
        toolUsage: toolRes.data ?? [],
      });
      setLoading(false);
    })();
  }, [user, isAdmin, tick]);

  // Custom calendar range wins over the quick presets.
  const pageViews = useMemo(() => {
    if (range?.from) {
      const from = new Date(range.from); from.setHours(0, 0, 0, 0);
      const to = new Date(range.to ?? range.from); to.setHours(23, 59, 59, 999);
      return allViews.filter(v => {
        const t = new Date(v.created_at).getTime();
        return t >= from.getTime() && t <= to.getTime();
      });
    }
    const days = PRESETS.find(p => p.key === preset)?.days ?? 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return allViews.filter(v => new Date(v.created_at).getTime() >= cutoff);
  }, [allViews, range, preset]);

  const rangeLabel = range?.from
    ? `${range.from.toLocaleDateString()} – ${(range.to ?? range.from).toLocaleDateString()}`
    : `Last ${PRESETS.find(p => p.key === preset)?.label ?? "30 days"}`;

  const stats = useMemo(() => {
    if (!pageViews.length) return null;
    const now = Date.now();
    const online = new Set(pageViews.filter(v => now - new Date(v.created_at).getTime() < 5 * 60 * 1000).map(v => v.session_id));
    const today = pageViews.filter(v => now - new Date(v.created_at).getTime() < 24 * 60 * 60 * 1000);

    const week = pageViews.filter(v => now - new Date(v.created_at).getTime() < 7 * 24 * 60 * 60 * 1000);

    const sessionsAll = new Set(pageViews.map(v => v.session_id));
    const sessionCounts = new Map<string, number>();
    pageViews.forEach(v => sessionCounts.set(v.session_id, (sessionCounts.get(v.session_id) ?? 0) + 1));
    const returning = Array.from(sessionCounts.values()).filter(c => c > 1).length;

    // Traffic by hour (last 24h)
    const hourly = new Array(24).fill(0).map((_, i) => ({ hour: `${23 - i}h`, views: 0, idx: 23 - i }));
    today.forEach(v => {
      const hoursAgo = Math.floor((now - new Date(v.created_at).getTime()) / (60 * 60 * 1000));
      if (hoursAgo < 24) hourly[hoursAgo].views++;
    });
    hourly.reverse();

    // Traffic last 7 days
    const daily = new Array(7).fill(0).map((_, i) => {
      const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      return { day: d.toLocaleDateString(undefined, { weekday: "short" }), views: 0, visitors: new Set<string>() };
    });
    week.forEach(v => {
      const daysAgo = Math.floor((now - new Date(v.created_at).getTime()) / (24 * 60 * 60 * 1000));
      const idx = 6 - daysAgo;
      if (idx >= 0 && idx < 7) {
        daily[idx].views++;
        daily[idx].visitors.add(v.session_id);
      }
    });
    const dailyChart = daily.map(d => ({ day: d.day, views: d.views, visitors: d.visitors.size }));

    const bucket = (key: keyof PageView) => {
      const m = new Map<string, number>();
      pageViews.forEach(v => { const k = (v[key] as string) || "Unknown"; m.set(k, (m.get(k) ?? 0) + 1); });
      return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const countryBuckets = new Map<string, { name: string; code: string; value: number }>();
    pageViews.forEach(v => {
      const name = v.country || "Unknown";
      const cur = countryBuckets.get(name) ?? { name, code: v.country_code || "", value: 0 };
      cur.value++;
      countryBuckets.set(name, cur);
    });
    const countries = Array.from(countryBuckets.values()).sort((a, b) => b.value - a.value).slice(0, 10);

    const cityBuckets = new Map<string, { name: string; state: string; country: string; value: number }>();
    pageViews.forEach(v => {
      if (!v.city) return;
      const key = `${v.city}|${v.region ?? ""}|${v.country ?? ""}`;
      const cur = cityBuckets.get(key) ?? { name: v.city, state: v.region ?? "", country: v.country ?? "", value: 0 };
      cur.value++;
      cityBuckets.set(key, cur);
    });
    const cities = Array.from(cityBuckets.values()).sort((a, b) => b.value - a.value).slice(0, 8);

    const stateBuckets = new Map<string, { name: string; country: string; value: number }>();
    pageViews.forEach(v => {
      if (!v.region) return;
      const key = `${v.region}|${v.country ?? ""}`;
      const cur = stateBuckets.get(key) ?? { name: v.region, country: v.country ?? "", value: 0 };
      cur.value++;
      stateBuckets.set(key, cur);
    });
    const states = Array.from(stateBuckets.values()).sort((a, b) => b.value - a.value).slice(0, 8);

    const paths = bucket("path").slice(0, 8);


    return {
      online: online.size,
      todayViews: today.length,
      todayVisitors: new Set(today.map(v => v.session_id)).size,
      totalSessions: sessionsAll.size,
      totalViews: pageViews.length,
      returning,
      hourly, dailyChart,
      devices: bucket("device"),
      browsers: bucket("browser"),
      os: bucket("os"),
      countries, cities, states, paths,
    };
  }, [pageViews]);

  const liveFeed = useMemo(() => pageViews.slice(0, 12), [pageViews]);

  const toolUsageChart = useMemo(() => {
    if (!core?.toolUsage) return [];
    const m = new Map<string, number>();
    core.toolUsage.forEach((t: any) => m.set(t.tool_name, (m.get(t.tool_name) ?? 0) + 1));
    return Array.from(m, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [core]);

  const exportCsv = (filename: string, rows: any[]) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => { await supabase.auth.signOut(); navigate("/"); };

  if (authLoading || loading || !core) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading Super Admin 2.0…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Super Admin 2.0 — Crazy SEO Team</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Ambient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg grid place-items-center text-white shadow-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-foreground">Super Admin 2.0</h1>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold">v2</Badge>
                <LiveDot />
              </div>
              <p className="text-[11px] text-muted-foreground">Real-time visitor intel · auto-refresh 15s</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/admin">Blog CMS</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/reports">Reports</Link></Button>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Live KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatCard icon={Wifi} label="Online Now" value={stats?.online ?? 0} accent="bg-gradient-to-br from-emerald-500 to-teal-600" />
          <StatCard icon={Eye} label="Views (24h)" value={stats?.todayViews ?? 0} accent="bg-gradient-to-br from-primary to-blue-600" />
          <StatCard icon={Users} label="Visitors (24h)" value={stats?.todayVisitors ?? 0} accent="bg-gradient-to-br from-cyan-500 to-blue-500" />
          <StatCard icon={Activity} label="Returning" value={stats?.returning ?? 0} accent="bg-gradient-to-br from-purple-500 to-pink-500" />
          <StatCard icon={Users} label="Total Users" value={core.totalUsers} accent="bg-gradient-to-br from-indigo-500 to-purple-600" />
          <StatCard icon={FileText} label="Blogs Live" value={core.publishedBlogs} accent="bg-gradient-to-br from-amber-500 to-orange-500" />
          <StatCard icon={Newspaper} label="News" value={core.newsCount} accent="bg-gradient-to-br from-rose-500 to-red-500" />
          <StatCard icon={Mail} label="Subscribers" value={core.subscribers} accent="bg-gradient-to-br from-pink-500 to-fuchsia-600" />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl bg-card/60 backdrop-blur border border-border/60">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="geo">Geography</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="live">Live Feed</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 backdrop-blur bg-card/60 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-4 h-4 text-primary" /> Traffic — Last 7 Days</CardTitle>
                  <LiveDot />
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={stats?.dailyChart ?? []}>
                      <defs>
                        <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.6} />
                          <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.6} />
                          <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Legend />
                      <Area type="monotone" dataKey="views" stroke={COLORS[0]} strokeWidth={2} fill="url(#viewsGrad)" />
                      <Area type="monotone" dataKey="visitors" stroke={COLORS[1]} strokeWidth={2} fill="url(#visGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="backdrop-blur bg-card/60 border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base"><Activity className="w-4 h-4 text-primary" /> Hourly Pulse (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats?.hourly ?? []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={2} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="views" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="backdrop-blur bg-card/60 border-border/60">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Top Pages</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.paths.map((p, i) => {
                      const max = stats.paths[0]?.value || 1;
                      return (
                        <div key={i} className="relative">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-mono text-xs text-foreground truncate max-w-[70%]">{p.name}</span>
                            <span className="font-bold text-foreground tabular-nums">{p.value}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full gradient-bg" style={{ width: `${(p.value / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {!stats?.paths.length && <p className="text-sm text-muted-foreground">Waiting for traffic…</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur bg-card/60 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Tool Usage (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  {toolUsageChart.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-8 text-center">
                      Call <code className="text-xs bg-muted px-1 rounded">logToolUsage("tool-name")</code> from tools to populate.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={toolUsageChart} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="count" fill={COLORS[3]} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* GEO */}
          <TabsContent value="geo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="backdrop-blur bg-card/60 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Top Countries</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => exportCsv("countries", stats?.countries ?? [])}><Download className="w-3.5 h-3.5 mr-1.5" />CSV</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.countries.map((c, i) => {
                      const max = stats.countries[0]?.value || 1;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="flex items-center gap-2 text-foreground">
                              <span className="text-lg">{flag(c.code)}</span>
                              <span className="font-medium">{c.name}</span>
                            </span>
                            <span className="font-bold tabular-nums">{c.value}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(c.value / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {!stats?.countries.length && <p className="text-sm text-muted-foreground">No geo data yet.</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur bg-card/60 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Top Cities</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => exportCsv("cities", stats?.cities ?? [])}><Download className="w-3.5 h-3.5 mr-1.5" />CSV</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.cities.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b border-border/40 pb-2 last:border-0">
                        <div>
                          <p className="font-semibold text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {[c.state, c.country].filter(Boolean).join(", ") || "—"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="tabular-nums">{c.value} views</Badge>
                      </div>
                    ))}
                    {!stats?.cities.length && <p className="text-sm text-muted-foreground">No city data yet.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="backdrop-blur bg-card/60 border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Top States / Regions</CardTitle>
                <Button size="sm" variant="outline" onClick={() => exportCsv("states", stats?.states ?? [])}><Download className="w-3.5 h-3.5 mr-1.5" />CSV</Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {stats?.states.map((s, i) => {
                    const max = stats.states[0]?.value || 1;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-medium text-foreground">{s.name}</span>
                          <span className="text-xs text-muted-foreground">{s.country}</span>
                          <span className="font-bold tabular-nums">{s.value}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500" style={{ width: `${(s.value / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {!stats?.states.length && <p className="text-sm text-muted-foreground">No state data yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* DEVICES */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[{ title: "Devices", data: stats?.devices, icon: Monitor }, { title: "Browsers", data: stats?.browsers, icon: Globe }, { title: "OS", data: stats?.os, icon: Smartphone }].map((chart, idx) => (
                <Card key={idx} className="backdrop-blur bg-card/60 border-border/60">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><chart.icon className="w-4 h-4 text-primary" /> {chart.title}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={chart.data ?? []} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} label={(e: any) => e.name}>
                          {(chart.data ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* LIVE FEED */}
          <TabsContent value="live" className="space-y-6">
            <Card className="backdrop-blur bg-card/60 border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Live Activity Feed</CardTitle>
                <LiveDot />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {liveFeed.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Waiting for visitors…</p>}
                  {liveFeed.map((v) => {
                    const ago = Math.floor((Date.now() - new Date(v.created_at).getTime()) / 1000);
                    const online = ago < 300;
                    return (
                      <div key={v.id} className="flex items-center justify-between text-sm border-b border-border/40 pb-2 last:border-0 hover:bg-muted/30 rounded px-2 py-1 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {online && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />}
                          {!online && <span className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />}
                          <span className="text-lg">{flag(v.country_code)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-xs text-foreground truncate">{v.path}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                              <span>{v.city || v.country || "Unknown"}</span>
                              <span className="flex items-center gap-1"><DeviceIcon d={v.device} />{v.browser}</span>
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {ago < 60 ? `${ago}s ago` : ago < 3600 ? `${Math.floor(ago / 60)}m ago` : `${Math.floor(ago / 3600)}h ago`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom row: recents + reports CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="backdrop-blur bg-card/60 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Subscribers</CardTitle>
              <Button size="sm" variant="outline" onClick={() => exportCsv("subscribers", core.recentSubs)}><Download className="w-3.5 h-3.5 mr-1.5" />CSV</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {core.recentSubs.length === 0 && <p className="text-sm text-muted-foreground">No subscribers yet.</p>}
                {core.recentSubs.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b border-border/40 pb-2 last:border-0">
                    <span className="truncate text-foreground">{s.email}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur bg-card/60 border-border/60">
            <CardHeader><CardTitle className="text-base">Recent Blogs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {core.recentBlogs.map((b: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b border-border/40 pb-2 last:border-0">
                    <span className="truncate text-foreground font-medium">{b.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${b.published ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"}`}>
                      {b.published ? "LIVE" : "DRAFT"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-primary/30 backdrop-blur">
            <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2"><FileDown className="w-5 h-5 text-primary" /> PDF Reports</h3>
                <p className="text-sm text-muted-foreground mt-1">Branded SEO audits, competitor scorecards, AI visibility reports.</p>
              </div>
              <Button asChild className="w-full"><Link to="/admin/reports">Open Report Center</Link></Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
