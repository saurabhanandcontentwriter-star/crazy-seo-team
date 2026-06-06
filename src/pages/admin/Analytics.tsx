import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Loader2, Users, FileText, Newspaper, Mail, TrendingUp, Activity, Globe, Download, FileDown, LogOut } from "lucide-react";

type Stats = {
  totalUsers: number;
  totalAdmins: number;
  publishedBlogs: number;
  draftBlogs: number;
  newsCount: number;
  subscribers: number;
  blogsByMonth: { month: string; count: number }[];
  newsByCategory: { name: string; value: number }[];
  subscribersBySource: { source: string; count: number }[];
  recentSubscribers: { email: string; created_at: string; source: string }[];
  recentBlogs: { title: string; published: boolean; published_at: string }[];
};

const COLORS = ["hsl(217 91% 60%)", "hsl(271 91% 65%)", "hsl(189 94% 55%)", "hsl(142 70% 45%)", "hsl(45 90% 55%)", "hsl(340 82% 60%)", "hsl(24 95% 55%)", "hsl(195 75% 50%)"];

const StatCard = ({ icon: Icon, label, value, accent }: any) => (
  <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card to-card/60 backdrop-blur">
    <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
          <p className="text-3xl font-black text-foreground mt-1">{value.toLocaleString()}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/admin/login");
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    (async () => {
      const [usersRes, blogsRes, newsRes, subsRes] = await Promise.all([
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("blog_posts").select("title, published, published_at, created_at").order("created_at", { ascending: false }),
        supabase.from("news_articles").select("category, title, published_at"),
        supabase.from("newsletter_subscribers").select("email, source, created_at").order("created_at", { ascending: false }),
      ]);

      const users = usersRes.data ?? [];
      const blogs = blogsRes.data ?? [];
      const news = newsRes.data ?? [];
      const subs = subsRes.data ?? [];

      // Blogs by month (last 6 months)
      const monthMap = new Map<string, number>();
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthMap.set(d.toLocaleString("default", { month: "short" }), 0);
      }
      blogs.forEach((b: any) => {
        const d = new Date(b.created_at);
        const key = d.toLocaleString("default", { month: "short" });
        if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
      });

      const catMap = new Map<string, number>();
      news.forEach((n: any) => catMap.set(n.category, (catMap.get(n.category) ?? 0) + 1));

      const srcMap = new Map<string, number>();
      subs.forEach((s: any) => srcMap.set(s.source || "footer", (srcMap.get(s.source || "footer") ?? 0) + 1));

      setStats({
        totalUsers: new Set(users.map((u: any) => u.user_id)).size,
        totalAdmins: users.filter((u: any) => u.role === "admin").length,
        publishedBlogs: blogs.filter((b: any) => b.published).length,
        draftBlogs: blogs.filter((b: any) => !b.published).length,
        newsCount: news.length,
        subscribers: subs.length,
        blogsByMonth: Array.from(monthMap, ([month, count]) => ({ month, count })),
        newsByCategory: Array.from(catMap, ([name, value]) => ({ name, value })),
        subscribersBySource: Array.from(srcMap, ([source, count]) => ({ source, count })),
        recentSubscribers: subs.slice(0, 8) as any,
        recentBlogs: blogs.slice(0, 6) as any,
      });
      setLoading(false);
    })();
  }, [user, isAdmin]);

  const exportSubscribersCsv = () => {
    if (!stats) return;
    const rows = [["email", "source", "created_at"], ...stats.recentSubscribers.map((s) => [s.email, s.source, s.created_at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (authLoading || loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Super Admin Dashboard — Crazy SEO Team</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Top bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Super Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Real-time analytics · {user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/admin">Blog CMS</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/reports">Reports</Link></Button>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} accent="bg-gradient-to-r from-primary to-purple-500" />
          <StatCard icon={Activity} label="Admins" value={stats.totalAdmins} accent="bg-gradient-to-r from-purple-500 to-pink-500" />
          <StatCard icon={FileText} label="Published Blogs" value={stats.publishedBlogs} accent="bg-gradient-to-r from-emerald-500 to-teal-500" />
          <StatCard icon={FileText} label="Draft Blogs" value={stats.draftBlogs} accent="bg-gradient-to-r from-amber-500 to-orange-500" />
          <StatCard icon={Newspaper} label="Live News" value={stats.newsCount} accent="bg-gradient-to-r from-cyan-500 to-blue-500" />
          <StatCard icon={Mail} label="Subscribers" value={stats.subscribers} accent="bg-gradient-to-r from-rose-500 to-red-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="w-4 h-4 text-primary" /> Blog Growth (last 6 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.blogsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="count" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Globe className="w-4 h-4 text-primary" /> News by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.newsByCategory} dataKey="value" nameKey="name" outerRadius={90} label={(e: any) => e.name}>
                    {stats.newsByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base"><Mail className="w-4 h-4 text-primary" /> Subscribers by Source</CardTitle>
              <Button size="sm" variant="outline" onClick={exportSubscribersCsv}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.subscribersBySource}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="count" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent Subscribers</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {stats.recentSubscribers.length === 0 && <p className="text-sm text-muted-foreground">No subscribers yet.</p>}
                {stats.recentSubscribers.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                    <span className="truncate text-foreground">{s.email}</span>
                    <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Blog Posts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentBlogs.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                  <span className="truncate text-foreground font-medium">{b.title}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${b.published ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"}`}>
                      {b.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(b.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><FileDown className="w-5 h-5 text-primary" /> PDF Report Center</h3>
              <p className="text-sm text-muted-foreground mt-1">Generate branded SEO audits, competitor reports, and AI visibility scorecards.</p>
            </div>
            <Button asChild><Link to="/admin/reports">Open Report Center</Link></Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAnalytics;
