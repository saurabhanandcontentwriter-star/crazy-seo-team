import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";

export default function CrmEmployeeLogin() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const OAUTH_PENDING_KEY = "cst_employee_google_oauth_pending";

  useEffect(() => {
    let cancelled = false;
    const finishGoogleLogin = async () => {
      // Never run employee verification on a plain visit to the login page.
      // Supabase can restore an old session on page load; only a real Google
      // OAuth callback containing the PKCE code may trigger employee linking.
      const oauthCallback = new URLSearchParams(window.location.search).has("code");
      if (!oauthCallback) {
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
        return;
      }
      if (sessionStorage.getItem(OAUTH_PENDING_KEY) !== "1") return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setBusy(true);
      try {
        const { data, error } = await supabase.functions.invoke("crm-team-auth", {
          body: { action: "google-employee-login" },
        });
        if (error) {
          let message = error.message || "Google login verification failed.";
          const context = (error as any).context;
          if (context && typeof context.clone === "function") {
            try {
              const payload = await context.clone().json();
              message = payload?.error || payload?.message || message;
            } catch { /* retain original message */ }
          }
          throw new Error(message);
        }
        if (data?.error) throw new Error(data.error);
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
        if (!cancelled) {
          toast.success("Gmail से कर्मचारी लॉगिन सफल हुआ।");
          navigate("/admin/crm", { replace: true });
        }
      } catch (error) {
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Google login failed.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    void finishGoogleLogin();
    return () => { cancelled = true; };
  }, [navigate]);

  const continueWithGoogle = async () => {
    setBusy(true);
    try {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      sessionStorage.setItem(OAUTH_PENDING_KEY, "1");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/employee/login`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
      if (data?.url) window.location.assign(data.url);
      else { sessionStorage.removeItem(OAUTH_PENDING_KEY); setBusy(false); }
    } catch (error) {
      sessionStorage.removeItem(OAUTH_PENDING_KEY);
      toast.error(error instanceof Error ? error.message : "Google login शुरू नहीं हो सका।");
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <GlassCard className="w-full max-w-md p-6 md:p-8">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <LockKeyhole size={26}/>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black">Crazy SEO Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">Employee Portal Login</p>
        </div>
        <button type="button" onClick={continueWithGoogle} disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border bg-background px-4 py-3 font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
          <span className="grid size-7 place-items-center rounded-full bg-white text-sm font-black shadow-sm">G</span>
          {busy ? "Google खुल रहा है..." : "Gmail से लॉगिन करें"}
        </button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          HR में रजिस्टर किए गए Gmail अकाउंट से ही लॉगिन करें।
        </p>
      </GlassCard>
    </main>
  );
}
