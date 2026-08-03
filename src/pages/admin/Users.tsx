import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Download, Search, ShieldCheck, User } from "lucide-react";

type RoleRow = { user_id: string; role: string; created_at: string };
type LoginRow = { email: string; success: boolean; created_at: string; ip_address: string | null };

export default function AdminUsers() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [logins, setLogins] = useState<LoginRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const [r, l] = await Promise.all([
        supabase.from("user_roles").select("user_id,role,created_at").order("created_at", { ascending: false }),
        supabase.from("login_history").select("email,success,created_at,ip_address").order("created_at", { ascending: false }).limit(200),
      ]);
      if (r.error) toast.error("Failed to load roles", { description: r.error.message });
      setRoles((r.data as RoleRow[]) ?? []);
      setLogins((l.data as LoginRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const lastLoginByEmail = useMemo(() => {
    const m = new Map<string, string>();
    logins.filter((x) => x.success).forEach((x) => { if (!m.has(x.email)) m.set(x.email, x.created_at); });
    return m;
  }, [logins]);

  const filtered = roles.filter((r) => !q.trim() || `${r.user_id} ${r.role}`.toLowerCase().includes(q.toLowerCase()));

  const exportCsv = () => {
    const csv = ["user_id,role,registered_at", ...filtered.map((r) => `${r.user_id},${r.role},${r.created_at}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "users.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Users exported");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">Users & Roles</h1>
          <p className="text-sm text-muted-foreground">{roles.length} role assignments · {lastLoginByEmail.size} accounts with logins</p>
        </div>
        <Button size="sm" className="rounded-2xl" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user or role…" className="pl-9 rounded-2xl" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl divide-y divide-border/60 overflow-hidden">
            <p className="p-3 text-sm font-bold">Accounts</p>
            {filtered.map((r) => (
              <div key={`${r.user_id}-${r.role}`} className="flex items-center gap-3 p-3">
                <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {r.role === "admin" ? <ShieldCheck size={14} /> : <User size={14} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate">{r.user_id}</p>
                  <p className="text-[11px] text-muted-foreground">Registered {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={r.role === "admin" ? "default" : "outline"} className="text-[10px] capitalize">{r.role}</Badge>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">No users found.</p>}
          </div>

          <div className="rounded-[24px] border border-border/60 bg-card/70 backdrop-blur-xl divide-y divide-border/60 overflow-hidden">
            <p className="p-3 text-sm font-bold">Login history</p>
            <div className="max-h-[520px] overflow-auto divide-y divide-border/60">
              {logins.map((l, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Badge variant={l.success ? "default" : "destructive"} className="text-[10px]">{l.success ? "OK" : "FAIL"}</Badge>
                  <p className="flex-1 text-sm truncate">{l.email}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(l.created_at).toLocaleString()}</p>
                </div>
              ))}
              {logins.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">No login records.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
