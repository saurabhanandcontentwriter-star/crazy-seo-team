import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
          queryParams: { prompt: "select_account" },
        },
      });

      if (error) throw error;
      if (data?.url) window.location.assign(data.url);
    } catch (error) {
      console.error("Admin Google login error:", error);
      toast.error(
        error instanceof Error ? error.message : "Google admin login failed.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-6 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Continue with Google using an authorized Gmail only.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border bg-background px-4 py-3 font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="grid size-7 place-items-center rounded-full bg-white text-sm font-black shadow-sm">
              G
            </span>
            {loading ? "Opening Google..." : "Continue with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}
