import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";

export default function CrmTeamLogin() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const id = loginId.trim().toLowerCase();
    if (!id || !password) return toast.error("Email / Team ID and password are required.");
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: id.includes("@") ? id : `${id}@crazyseoteam.in`,
        password,
      });
      if (error) throw error;

      const { data: teamRole } = await supabase.rpc("has_role", {
        _user_id: (await supabase.auth.getUser()).data.user?.id,
        _role: "crm_team",
      });
      const { data: adminRole } = await supabase.rpc("has_role", {
        _user_id: (await supabase.auth.getUser()).data.user?.id,
        _role: "admin",
      });
      if (!teamRole && !adminRole) {
        await supabase.auth.signOut();
        throw new Error("This account is not authorized for CRM.");
      }
      navigate("/admin/crm", { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Invalid Login ID or password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <GlassCard className="w-full max-w-md p-6 md:p-8">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <LockKeyhole size={26} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black">Crazy SEO Team CRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">Team login</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Admin Email / Team ID</label>
            <div className="relative mt-1">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="Admin email or e.g. cst_sales01" autoComplete="username" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Password</label>
            <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <><Loader2 size={16} className="mr-2 animate-spin" /> Signing in…</> : "Login to CRM"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
