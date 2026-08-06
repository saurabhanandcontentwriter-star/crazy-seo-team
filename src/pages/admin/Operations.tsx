import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Activity, Bot, Database, FileBarChart, Gauge, HardDrive, Image as ImageIcon,
  Mail, Newspaper, PenLine, RefreshCw, Search, Server, Zap,
} from "lucide-react";

type Check = {
  key: string;
  label: string;
  icon: React.ElementType;
  kind: "function" | "db" | "storage" | "realtime";
  target: string;
};

type Result = { ms: number | null; ok: boolean; detail?: string };

const CHECKS: Check[] = [
  { key: "ai-chat", label: "AI Chatbot", icon: Bot, kind: "function", target: "ai-chat" },
  { key: "llm-seo-optimize", label: "SEO Audit / LLM SEO", icon: Search, kind: "function", target: "llm-seo-optimize" },
  { key: "generate-article", label: "AI Writer", icon: PenLine, kind: "function", target: "generate-article" },
  { key: "generate-blog-post", label: "Blog CMS Generator", icon: FileBarChart, kind: "function", target: "generate-blog-post" },
  { key: "refresh-news", label: "News Generator", icon: Newspaper, kind: "function", target: "refresh-news" },
  { key: "ai-tts", label: "AI Voice (TTS)", icon: Activity, kind: "function", target: "ai-tts" },
  { key: "ai-stt", label: "AI Voice (STT)", icon: Activity, kind: "function", target: "ai-stt" },
  { key: "subscribe-newsletter", label: "Newsletter", icon: Mail, kind: "function", target: "subscribe-newsletter" },
  { key: "db-blog", label: "Database (blog_posts)", icon: Database, kind: "db", target: "blog_posts" },
  { key: "db-news", label: "Database (news_articles)", icon: Database, kind: "db", target: "news_articles" },
  { key: "db-views", label: "Database (page_views)", icon: Database, kind: "db", target: "page_views" },
  { key: "storage", label: "Image Storage / CDN", icon: ImageIcon, kind: "storage", target: "blog-images" },
  { key: "realtime", label: "Realtime Channel", icon: Zap, kind: "realtime", target: "ops-ping" },
];

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function runCheck(c: Check): Promise<Result> {
  const t0 = performance.now();
  try {
    if (c.kind === "function") {
      const res = await fetch(`${FN_BASE}/${c.target}`, { method: "OPTIONS" });
      return { ms: Math.round(performance.now() - t0), ok: res.status < 500, detail: `HTTP ${res.status}` };
    }
    if (c.kind === "db") {
      const { error } = await supabase.from(c.target as never).select("id", { count: "exact", head: true });
      return { ms: Math.round(performance.now() - t0), ok: !error, detail: error?.message };
    }
    if (c.kind === "storage") {
      const { error } = await supabase.storage.from(c.target).list("", { limit: 1 });
      return { ms: Math.round(performance.now() - t0), ok: !error, detail: error?.message };
    }
    const ok = await new Promise<boolean>((resolve) => {
      const ch = supabase.channel(`ops-${Date.now()}`);
      const timer = setTimeout(() => { supabase.removeChannel(ch); resolve(false); }, 5000);
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          supabase.removeChannel(ch);
          resolve(true);
        }
      });
    });
    return { ms: Math.round(performance.now() - t0), ok };
  } catch (e) {
    return { ms: null, ok: false, detail: e instanceof Error ? e.message : "unreachable" };
  }
}

const fmt = (ms: number | null) => (ms == null ? "—" : ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`);

export default function Operations() {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [loading, setLoading] = useState(true);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [history, setHistory] = useState<{ t: number; up: number; total: number }[]>([]);
  const mounted = useRef(true);

  const runAll = useCallback(async () => {
    setLoading(true);
    const entries = await Promise.all(CHECKS.map(async (c) => [c.key, await runCheck(c)] as const));
    if (!mounted.current) return;
    const map = Object.fromEntries(entries);
    setResults(map);
    setLastRun(new Date());
    setLoading(false);
    const up = entries.filter(([, r]) => r.ok).length;
    setHistory((h) => [...h.slice(-29), { t: Date.now(), up, total: entries.length }]);
  }, []);

  useEffect(() => {
    mounted.current = true;
    runAll();
    const id = setInterval(runAll, 30_000);
    return () => { mounted.current = false; clearInterval(id); };
  }, [runAll]);

  const list = CHECKS.map((c) => ({ ...c, res: results[c.key] }));
  const upCount = list.filter((c) => c.res?.ok).length;
  const total = CHECKS.length;
  const latencies = list.map((c) => c.res?.ms).filter((m): m is number => typeof m === "number");
  const avg = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;
  const uptime = history.length
    ? (history.reduce((a, h) => a + h.up / h.total, 0) / history.length) * 100
    : (upCount / total) * 100;

  const kpis = [
    { label: "Services online", value: `${upCount}/${total}`, icon: Server },
    { label: "Avg response", value: fmt(avg), icon: Gauge },
    { label: "Uptime (session)", value: `${uptime.toFixed(1)}%`, icon: Activity },
    { label: "Checks run", value: String(history.length), icon: HardDrive },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Operations</h1>
          <p className="text-sm text-muted-foreground">
            Live health of every AI service, database and integration.
            {lastRun && <> Last checked {lastRun.toLocaleTimeString()} · auto-refresh 30s</>}
          </p>
        </div>
        <Button onClick={runAll} disabled={loading} size="sm" variant="outline" className="ml-auto rounded-2xl">
          <RefreshCw size={14} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Run checks
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <k.icon size={16} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">AI service status and response times</caption>
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-5 py-3 font-medium">Service</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 font-medium">Response time</th>
                <th scope="col" className="px-5 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const ok = c.res?.ok;
                return (
                  <tr key={c.key} className="border-b border-border/40 last:border-0 hover:bg-muted/40 transition">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 font-medium">
                        <c.icon size={15} className="text-primary" /> {c.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {c.res ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ok ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
                          {ok ? "Online" : "Degraded"}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Checking…</span>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">{fmt(c.res?.ms ?? null)}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground truncate max-w-[280px]">
                      {c.res?.detail ?? (c.res?.ok ? "Healthy" : "")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
