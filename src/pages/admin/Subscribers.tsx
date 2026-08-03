import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Download, Search, Mail } from "lucide-react";

type Sub = { id: string; email: string; source: string; created_at: string };

export default function AdminSubscribers() {
  const [rows, setRows] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("id,email,source,created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error("Failed to load subscribers", { description: error.message });
      setRows((data as Sub[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => rows.filter((r) => !q.trim() || r.email.toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  const exportCsv = () => {
    const csv = ["email,source,subscribed_at", ...filtered.map((r) => `${r.email},${r.source},${r.created_at}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} subscribers`);
  };

  const bySource = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.source, (m.get(r.source) ?? 0) + 1));
    return [...m.entries()];
  }, [rows]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">Newsletter</h1>
          <p className="text-sm text-muted-foreground">{rows.length} subscribers</p>
        </div>
        <Button size="sm" className="rounded-2xl" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {bySource.map(([s, n]) => (
          <Badge key={s} variant="outline" className="rounded-xl">{s}: {n}</Badge>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email…" className="pl-9 rounded-2xl" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl divide-y divide-border/60 overflow-hidden">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Mail size={14} /></span>
              <p className="flex-1 text-sm font-medium truncate">{r.email}</p>
              <Badge variant="outline" className="text-[10px]">{r.source}</Badge>
              <p className="text-xs text-muted-foreground hidden sm:block">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No subscribers yet.</p>}
        </div>
      )}
    </div>
  );
}
