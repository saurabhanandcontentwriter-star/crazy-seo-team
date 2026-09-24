import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";

const CRM_ADMIN_EMAIL = "crazyseoteam@gmail.com";

export default function CrmTeamLogin() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email?.trim().toLowerCase();

      if (!cancelled && email === CRM_ADMIN_EMAIL) {
        navigate("/admin/crm", { replace: true });
      }
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const continueWithGoogle = async () => {
    setBusy(true);

    try {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/crm/login`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
      if (data?.url) window.location.assign(data.url);
    } catch (error) {
      console.error("CRM Google login error:", error);
      toast.error(
        error instanceof Error ? error.message : "CRM Google login failed.",
      );
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
          <p className="mt-1 text-sm text-muted-foreground">
            Admin access
          </p>
        </div>

        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border bg-background px-4 py-3 font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="grid size-7 place-items-center rounded-full bg-white text-sm font-black shadow-sm">
            G
          </span>
          {busy ? "Opening Google..." : "Continue with Google"}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sign in with the authorized Google account to continue.
        </p>
      </GlassCard>
    </div>
  );
}
