import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

const sessionKey = "ideas_direct_profile";

function googleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.22Z"/>
      <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.04H3.29v2.53A9.74 9.74 0 0 0 12 21.75Z"/>
      <path fill="#FBBC05" d="M6.53 13.83A5.85 5.85 0 0 1 6.22 12c0-.64.11-1.26.31-1.83V7.64H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.36l3.24-2.53Z"/>
      <path fill="#EA4335" d="M12 6.13c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.16 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.71 5.39l3.24 2.53C6.83 7.85 9 6.13 12 6.13Z"/>
    </svg>
  );
}

async function ensureIdeasProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, any> }) {
  const { data: existing, error: lookupError } = await supabase
    .from("idea_profiles")
    .select("user_id,public_id,display_name,email,avatar_url,account_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) {
    if (existing.account_status === "banned") {
      await supabase.auth.signOut();
      throw new Error("Your ANVYA account is banned.");
    }
    return { profile: existing, created: false };
  }

  const metadata = user.user_metadata || {};
  const displayName =
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    "Ideas Member";
  const firstName = metadata.first_name || metadata.given_name || displayName.split(" ")[0] || null;
  const lastName = metadata.last_name || metadata.family_name || displayName.split(" ").slice(1).join(" ") || null;
  const avatarUrl = metadata.avatar_url || metadata.picture || null;
  const publicId = `CST-${user.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;

  const { data: created, error: createError } = await supabase
    .from("idea_profiles")
    .insert({
      user_id: user.id,
      public_id: publicId,
      display_name: displayName,
      first_name: firstName,
      last_name: lastName,
      email: user.email || null,
      avatar_url: avatarUrl,
    })
    .select("user_id,public_id,display_name,email,avatar_url,account_status")
    .single();

  if (createError) {
    const { data: retry } = await supabase
      .from("idea_profiles")
      .select("user_id,public_id,display_name,email,avatar_url,account_status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (retry) return { profile: retry, created: false };
    throw createError;
  }

  return { profile: created, created: true };
}

export default function IdeasLogin() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!active) return;

        if (user) {
          const result = await ensureIdeasProfile(user);

          if (!active) return;

          sessionStorage.removeItem(sessionKey);
          toast.success(result.created ? "Account created successfully!" : "Welcome back!");
          nav("/anvya", { replace: true });
          return;
        }
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Could not open your ANVYA account.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" || !session?.user) return;

      window.setTimeout(async () => {
        try {
          const result = await ensureIdeasProfile(session.user);
          toast.success(result.created ? "Account created successfully!" : "Welcome back!");
          nav("/anvya", { replace: true });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not create your ANVYA profile.");
        }
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [nav]);

  // ANVYA authentication is permanently handled by Supabase Google OAuth.
  // Keep this as the single login/create-account entry point for ANVYA.
  const continueWithGoogle = async () => {
    if (busy) return;
    setBusy(true);

    try {
      const productionOrigin = "https://www.crazyseoteam.in";
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const redirectTo = `${isLocal ? window.location.origin : productionOrigin}/anvya/login`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-violet-50/50 grid place-items-center px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden rounded-[28px] shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white">
          <h1 className="text-2xl font-black">Welcome to Crazy SEO Team Ideas</h1>
          <p className="mt-2 text-sm text-white/80">
            One secure entry for ANVYA — sign up or log in with your Gmail / Google account.
          </p>
        </div>

        <CardContent className="space-y-5 p-6 md:p-8">
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl border-2 bg-background text-base font-semibold shadow-sm hover:bg-muted"
            onClick={continueWithGoogle}
            disabled={busy}
          >
            {busy ? <Loader2 className="mr-3 size-5 animate-spin" /> : <span className="mr-3">{googleIcon()}</span>}
            {busy ? "Connecting to Google…" : "Continue with Gmail — Sign up / Log in"}
          </Button>

          <div className="rounded-2xl border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            No separate account-creation form, password, or extra signup step. Gmail / Google is the only ANVYA sign-in method.
          </div>

          <div className="flex items-center justify-center">
            <Link to="/anvya" className="font-semibold text-primary hover:underline">← Home</Link>
          </div>

          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <LogIn className="size-3.5" />
            Returning users keep the same ANVYA ID • New users get an ANVYA ID automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
