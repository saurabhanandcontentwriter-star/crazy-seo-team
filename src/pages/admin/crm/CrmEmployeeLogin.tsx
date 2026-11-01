import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";

export default function CrmEmployeeLogin() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginId.trim() || !password) {
      toast.error("Enter Employee ID and password.");
      return;
    }
    setBusy(true);
    try {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      const { data, error } = await supabase.functions.invoke("crm-team-auth", {
        body: { action: "login", login_id: loginId.trim(), password },
      });
      if (error) throw error;
      if (data?.error || !data?.access_token || !data?.refresh_token) {
        throw new Error(data?.error || "Employee login failed.");
      }
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (sessionError) throw sessionError;
      toast.success("Employee login successful.");
      navigate("/admin/crm", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <GlassCard className="w-full max-w-md p-6 md:p-8">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole size={26}/></div>
        <div className="text-center">
          <h1 className="text-2xl font-black">Crazy SEO Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">Employee Portal Login</p>
        </div>
        <form onSubmit={signIn} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">Employee ID
            <input value={loginId} onChange={e=>setLoginId(e.target.value)} autoComplete="username" placeholder="Enter your Employee ID" className="mt-1 w-full rounded-xl border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="block text-sm font-semibold">Password
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" className="mt-1 w-full rounded-xl border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50">
            {busy && <Loader2 size={17} className="animate-spin"/>}{busy ? "Signing in..." : "Employee Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">Use the Employee ID and password provided by HR.</p>
      </GlassCard>
    </main>
  );
}
