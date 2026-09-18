import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CrmFlashNotice from "@/pages/admin/crm/CrmFlashNotice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Activity, Radio, UserPlus, Repeat, Mail, FileText, FileEdit, Newspaper,
  Sparkles, Gauge, FileBarChart, Eye, Wrench, Loader2, RefreshCw, Plus,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";

type Kpis = {
  totalUsers: number; activeUsers: number; onlineUsers: number; newToday: number;
  returning: number; subscribers: number; published: number; drafts: number;
  news: number; aiArticles: number; audits: number; reports: number;
  pageViews: number; toolRuns: number;
};

const EMPTY: Kpis = {
  totalUsers: 0, activeUsers: 0, onlineUsers: 0, newToday: 0, returning: 0, subscribers: 0,
  published: 0, drafts: 0, news: 0, aiArticles: 0, audits: 0, reports: 0, pageViews: 0, toolRuns: 0,
};

function useCounter(value: number) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const start = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return display;
}

const KpiCard = ({ label, value, icon: Icon, tone = "primary" }: { label: string; value: number; icon: any; tone?: string }) => {
  const n = useCounter(value);
  return (
    <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${tone}/10 text-${tone}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-black tabular-nums">{n.toLocaleString()}</p>
    </div>
  );
};

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default function AdminHome() {
  const [kpis, setKpis] = useState<Kpis>(EMPTY);
  const [series, setSeries] = useState<{ day: string; views: number; sessions: number }[]>([]);
  const [tools, setTools] = useState<{ tool: string; runs: number }[]>([]);
  const [activity, setActivity] = useState<{ id: string; text: string; at: string }[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loginCount, setLoginCount] = useState(0);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const since14 = new Date(Date.now() - 14 * 864e5).toISOString();
    const since30m = new Date(Date.now() - 30 * 60_000).toISOString();
    const since5m = new Date(Date.now() - 5 * 60_000).toISOString();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const [
      roles, subs, posts, news, views, viewsToday, online, tool, logins, newsAi, holidaysRes,
    ] = await Promise.all([
      supabase.from("user_roles").select("user_id", { count: "exact" }),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id,published,source,title,published_at").order("published_at", { ascending: false }),
      supabase.from("news_articles").select("id,title,published_at").order("published_at", { ascending: false }).limit(200),
      supabase.from("page_views").select("created_at,session_id").gte("created_at", since14).order("created_at", { ascending: true }),
      supabase.from("page_views").select("session_id").gte("created_at", todayStart.toISOString()),
      supabase.from("page_views").select("session_id").gte("created_at", since5m),
      supabase.from("tool_usage").select("tool_name,created_at").gte("created_at", since14),
      supabase.from("login_history").select("id,email,success,created_at").order("created_at", { ascending: false }).limit(8),
      supabase.from("news_articles").select("id", { count: "exact", head: true }),
      supabase.from("crm_holidays").select("id,holiday_date,name,reason").gte("holiday_date", new Date().toISOString().slice(0,10)).order("holiday_date", { ascending: true }).limit(8),
    ]);

    const queryErrors = [roles, subs, posts, news, views, viewsToday, online, tool, logins, newsAi].filter((q) => q.error);
    if (queryErrors.length) console.error("Admin dashboard data errors:", queryErrors.map((q) => q.error));

    const postRows = posts.data ?? [];
    const viewRows = views.data ?? [];
    const toolRows = tool.data ?? [];

    const uniq = (arr: (string | null)[]) => new Set(arr.filter(Boolean) as string[]).size;
    const activeSessions = uniq(viewRows.filter((v) => v.created_at >= since30m).map((v) => v.session_id));
    const todaySessions = uniq((viewsToday.data ?? []).map((v) => v.session_id));
    const sessionFirstSeen = new Map<string, string>();
    viewRows.forEach((v) => {
      const cur = sessionFirstSeen.get(v.session_id);
      if (!cur || v.created_at < cur) sessionFirstSeen.set(v.session_id, v.created_at);
    });
    const returning = [...new Set((viewsToday.data ?? []).map((v) => v.session_id))]
      .filter((s) => (sessionFirstSeen.get(s) ?? "") < todayStart.toISOString()).length;

    setLoginCount((logins.data ?? []).filter((l) => l.success).length);
    setLoginHistory(logins.data ?? []);
    setHolidays(holidaysRes.data ?? []);

    setKpis({
      totalUsers: uniq((roles.data ?? []).map((r) => r.user_id)),
      activeUsers: activeSessions,
      onlineUsers: uniq((online.data ?? []).map((v) => v.session_id)),
      newToday: Math.max(0, todaySessions - returning),
      returning,
      subscribers: subs.count ?? 0,
      published: postRows.filter((p) => p.published).length,
      drafts: postRows.filter((p) => !p.published).length,
      news: newsAi.count ?? 0,
      aiArticles: postRows.filter((p) => p.source === "ai").length,
      audits: toolRows.filter((t) => /audit/i.test(t.tool_name)).length,
      reports: toolRows.filter((t) => /report/i.test(t.tool_name)).length,
      pageViews: viewRows.length,
      toolRuns: toolRows.length,
    });

    // 14-day series
    const buckets = new Map<string, { views: number; sessions: Set<string> }>();
    for (let i = 13; i >= 0; i--) {
      buckets.set(dayKey(new Date(Date.now() - i * 864e5)), { views: 0, sessions: new Set() });
    }
    viewRows.forEach((v) => {
      const b = buckets.get(v.created_at.slice(0, 10));
      if (b) { b.views++; b.sessions.add(v.session_id); }
    });
    setSeries([...buckets.entries()].map(([day, b]) => ({
      day: day.slice(5), views: b.views, sessions: b.sessions.size,
    })));

    const tmap = new Map<string, number>();
    toolRows.forEach((t) => tmap.set(t.tool_name, (tmap.get(t.tool_name) ?? 0) + 1));
    setTools([...tmap.entries()].map(([tool, runs]) => ({ tool, runs })).sort((a, b) => b.runs - a.runs).slice(0, 6));

    const feed = [
      ...(logins.data ?? []).map((l) => ({
        id: `l${l.id}`,
        text: `${l.success ? "Admin login" : "Failed login"} · ${l.email}`,
        at: l.created_at,
      })),
      ...postRows.slice(0, 5).map((p) => ({ id: `p${p.id}`, text: `Blog ${p.published ? "published" : "draft saved"} · ${p.title}`, at: p.published_at })),
      ...(news.data ?? []).slice(0, 5).map((n) => ({ id: `n${n.id}`, text: `News published · ${n.title}`, at: n.published_at })),
    ].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 10);
    setActivity(feed);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  const insights = useMemo(() => {
    const out: string[] = [];
    if (kpis.drafts > 0) out.push(`${kpis.drafts} draft${kpis.drafts > 1 ? "s" : ""} waiting to be published — publishing lifts crawl frequency.`);
    if (kpis.news < 5) out.push("Live News has fewer than 5 fresh articles. Run a news refresh to keep the feed current.");
    if (kpis.subscribers === 0) out.push("No newsletter subscribers yet — add the signup block to high-traffic pages.");
    if (tools[0]) out.push(`Most used tool: ${tools[0].tool} (${tools[0].runs} runs in 14 days).`);
    if (kpis.pageViews === 0) out.push("No tracked page views in the last 14 days — verify visitor tracking is live on the site.");
    return out.slice(0, 4);
  }, [kpis, tools]);

  return (
    <div className="space-y-6">
      <CrmFlashNotice />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live metrics from your Crazy SEO Team platform</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={load} disabled={loading}>
            {loading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />} Refresh
          </Button>
          <Link to="/admin/blog"><Button size="sm" className="rounded-2xl"><Plus size={14} className="mr-1" /> New post</Button></Link>
          <Link to="/admin/news"><Button size="sm" variant="outline" className="rounded-2xl"><Newspaper size={14} className="mr-1" /> Manage news</Button></Link>
          <Link to="/admin/reports"><Button size="sm" variant="outline" className="rounded-2xl"><FileBarChart size={14} className="mr-1" /> Reports</Button></Link>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total users" value={kpis.totalUsers} icon={Users} />
        <KpiCard label="Active (30m)" value={kpis.activeUsers} icon={Activity} />
        <KpiCard label="Online now" value={kpis.onlineUsers} icon={Radio} />
        <KpiCard label="New today" value={kpis.newToday} icon={UserPlus} />
        <KpiCard label="Returning today" value={kpis.returning} icon={Repeat} />
        <KpiCard label="Subscribers" value={kpis.subscribers} icon={Mail} />
        <KpiCard label="Published blogs" value={kpis.published} icon={FileText} />
        <KpiCard label="Draft blogs" value={kpis.drafts} icon={FileEdit} />
        <KpiCard label="Live news" value={kpis.news} icon={Newspaper} />
        <KpiCard label="AI articles" value={kpis.aiArticles} icon={Sparkles} />
        <KpiCard label="Website audits" value={kpis.audits} icon={Gauge} />
        <KpiCard label="Reports generated" value={kpis.reports} icon={FileBarChart} />
        <KpiCard label="Page views (14d)" value={kpis.pageViews} icon={Eye} />
        <KpiCard label="Tool runs (14d)" value={kpis.toolRuns} icon={Wrench} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-3">Traffic — last 14 days</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#v)" strokeWidth={2} name="Page views" />
                <Area type="monotone" dataKey="sessions" stroke="hsl(var(--accent-foreground))" fill="transparent" strokeWidth={2} name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-3 flex items-center gap-2"><Sparkles size={16} className="text-primary" /> AI insights</h2>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">Everything looks healthy. No action items right now.</p>
          ) : (
            <ul className="space-y-2">
              {insights.map((i) => (
                <li key={i} className="text-sm text-muted-foreground rounded-2xl bg-muted/40 p-3">{i}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-3">Tool usage (14 days)</h2>
          {tools.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tool runs recorded yet.</p>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tools}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="tool" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} height={50} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} width={30} />
                  <Tooltip />
                  <Bar dataKey="runs" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4">
          <h2 className="font-bold mb-3">Real-time activity</h2>
          <div className="space-y-2 max-h-[240px] overflow-auto pr-1">
            {activity.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-2xl bg-muted/40 p-3">
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Badge>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
