import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, Trash2, ExternalLink, Search } from "lucide-react";

type NewsRow = {
  id: string; slug: string; title: string; category: string; summary: string;
  image_url: string | null; published_at: string; author: string | null;
};

export default function AdminNews() {
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news_articles")
      .select("id,slug,title,category,summary,image_url,published_at,author")
      .order("published_at", { ascending: false });
    if (error) toast.error("Failed to load news", { description: error.message });
    setRows((data as NewsRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const refreshNews = async () => {
    setBusy(true);
    const { error } = await supabase.functions.invoke("refresh-news", { body: { manual: true } });
    if (error) toast.error("Refresh failed", { description: error.message });
    else { toast.success("News refresh triggered"); await load(); }
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("news_articles").delete().eq("id", id);
    if (error) return toast.error("Delete failed", { description: error.message });
    toast.success("Article deleted");
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const pruneOld = async () => {
    const keep = rows.slice(0, 5).map((r) => r.id);
    const old = rows.filter((r) => !keep.includes(r.id));
    if (old.length === 0) return toast.info("Nothing to prune — only 5 or fewer articles");
    if (!confirm(`Delete ${old.length} older article(s), keeping the latest 5?`)) return;
    const { error } = await supabase.from("news_articles").delete().in("id", old.map((o) => o.id));
    if (error) return toast.error("Prune failed", { description: error.message });
    toast.success(`${old.length} old articles removed`);
    load();
  };

  const filtered = rows.filter((r) =>
    !q.trim() || `${r.title} ${r.category}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">Live News</h1>
          <p className="text-sm text-muted-foreground">{rows.length} articles · auto-refreshes every 30 minutes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-2xl" onClick={pruneOld}>Keep latest 5</Button>
          <Button size="sm" className="rounded-2xl" onClick={refreshNews} disabled={busy}>
            {busy ? <Loader2 size={14} className="mr-1 animate-spin" /> : <RefreshCw size={14} className="mr-1" />} Generate now
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search news…" className="pl-9 rounded-2xl" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div key={n.id} className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl p-4 flex gap-4 items-center flex-wrap">
              {n.image_url && (
                <img src={n.image_url} alt={n.title} loading="lazy" className="w-20 h-14 object-cover rounded-xl" />
              )}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{n.title}</h3>
                  <Badge variant="outline" className="text-[10px]">{n.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.summary}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {new Date(n.published_at).toLocaleString()} · {n.author}
                </p>
              </div>
              <div className="flex gap-2">
                <a href={`/news#${n.slug}`} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="rounded-2xl"><ExternalLink size={14} /></Button>
                </a>
                <Button size="sm" variant="outline" onClick={() => remove(n.id)} className="rounded-2xl text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No news articles.</p>}
        </div>
      )}
    </div>
  );
}
