import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, Heart, MessageCircle, Share2, Sparkles, ArrowUpRight } from "lucide-react";
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
  const { data: existing, error: lookupError } = await supabase.from("idea_profiles")
    .select("user_id,public_id,display_name,email,avatar_url,account_status").eq("user_id", user.id).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    if (existing.account_status === "banned") { await supabase.auth.signOut(); throw new Error("Your ANVYA account is banned."); }
    return { profile: existing, created: false };
  }
  const metadata = user.user_metadata || {};
  const displayName = metadata.full_name || metadata.name || user.email?.split("@")[0] || "Ideas Member";
  const firstName = metadata.first_name || metadata.given_name || displayName.split(" ")[0] || null;
  const lastName = metadata.last_name || metadata.family_name || displayName.split(" ").slice(1).join(" ") || null;
  const avatarUrl = metadata.avatar_url || metadata.picture || null;
  const publicId = `CST-${user.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
  const { data: created, error: createError } = await supabase.from("idea_profiles").insert({
    user_id: user.id, public_id: publicId, display_name: displayName, first_name: firstName,
    last_name: lastName, email: user.email || null, avatar_url: avatarUrl,
  }).select("user_id,public_id,display_name,email,avatar_url,account_status").single();
  if (createError) {
    const { data: retry } = await supabase.from("idea_profiles").select("user_id,public_id,display_name,email,avatar_url,account_status").eq("user_id", user.id).maybeSingle();
    if (retry) return { profile: retry, created: false };
    throw createError;
  }
  return { profile: created, created: true };
}

function MiniPost({ name, initials, title, tone }: { name: string; initials: string; title: string; tone: string }) {
  return (
    <div className="w-[205px] shrink-0 rounded-2xl border border-white/70 bg-white/95 p-3 shadow-xl backdrop-blur-sm rotate-[-3deg]">
      <div className="flex items-center gap-2">
        <div className={`grid size-8 place-items-center rounded-full bg-gradient-to-br ${tone} text-xs font-black text-white`}>{initials}</div>
        <div><p className="text-xs font-bold text-slate-900">{name}</p><p className="text-[9px] text-slate-400">2h ago</p></div>
      </div>
      <p className="mt-3 text-sm font-extrabold leading-tight text-slate-900">{title}</p>
      <div className="mt-3 h-16 rounded-xl bg-gradient-to-br from-slate-950 via-indigo-900 to-fuchsia-700 p-2">
        <div className="h-full rounded-lg border border-white/20 bg-white/10 p-2 text-[9px] font-bold text-white">Ideas that move people →</div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400">
        <span className="flex items-center gap-1"><Heart size={11} className="fill-rose-500 text-rose-500"/> 128</span>
        <span className="flex items-center gap-1"><MessageCircle size={11}/> 24</span>
        <span className="flex items-center gap-1"><Share2 size={11}/> Share</span>
      </div>
    </div>
  );
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
      } finally { if (active) setLoading(false); }
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
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [nav]);

  const continueWithGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const productionOrigin = "https://www.crazyseoteam.in";
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const redirectTo = `${isLocal ? window.location.origin : productionOrigin}/anvya/login`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, queryParams: { prompt: "select_account" } },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
      setBusy(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-950"><Loader2 className="size-8 animate-spin text-white" /></div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06122f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.7),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(217,70,239,.55),transparent_32%),linear-gradient(135deg,#071b4c_0%,#172c83_48%,#7e22ce_100%)]" />
      <div className="absolute -left-24 top-1/3 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -right-20 bottom-0 size-96 rounded-full bg-fuchsia-500/25 blur-3xl" />

      <main className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-[1.12fr_.88fr] lg:px-8">
        <section className="order-2 lg:order-1">
          <div className="mb-7 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-white text-xl font-black text-indigo-700 shadow-lg">A</div>
            <div><p className="text-xl font-black tracking-tight">ANVYA</p><p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/60">A Product by Crazy SEO Team</p></div>
          </div>

          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur"><Sparkles size={13}/> Ideas • People • Opportunities</p>
            <h1 className="text-5xl font-black leading-[.95] tracking-tight sm:text-6xl">SHARE.<br/><span className="text-yellow-300">SCROLL.</span><br/>GROW.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">Join ANVYA, discover useful posts, share your ideas and connect with people building something meaningful.</p>
          </div>

          <div className="mt-8 flex gap-4 overflow-hidden pb-4">
            <MiniPost name="Saurabh" initials="S" title="New SEO Strategy for 2026 🚀" tone="from-blue-500 to-cyan-400" />
            <MiniPost name="Priya" initials="P" title="AI Tools for Students & Creators ✨" tone="from-fuchsia-500 to-violet-500" />
            <MiniPost name="Rohan" initials="R" title="Productivity Tips that Actually Work 💡" tone="from-amber-500 to-orange-500" />
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-white/70">
            <span className="rounded-full bg-white/10 px-3 py-2">AI</span><span className="rounded-full bg-white/10 px-3 py-2">SEO</span>
            <span className="rounded-full bg-white/10 px-3 py-2">Technology</span><span className="rounded-full bg-white/10 px-3 py-2">Business</span>
            <span className="rounded-full bg-white/10 px-3 py-2">Science</span>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="mx-auto w-full max-w-[470px] rounded-[32px] border border-white/50 bg-white/95 p-2 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur">
            <div className="overflow-hidden rounded-[25px]">
              <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white">
                <div className="mb-6 flex items-center justify-between"><span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em]">ANVYA ACCESS</span><ArrowUpRight size={19}/></div>
                <h2 className="text-3xl font-black leading-tight">Welcome to<br/>Crazy SEO Team Ideas</h2>
                <p className="mt-3 text-sm leading-6 text-white/80">One secure entry for ANVYA — sign up or log in with your Gmail / Google account.</p>
              </div>

              <div className="space-y-5 p-6 md:p-7">
                <Button type="button" variant="outline" className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50" onClick={continueWithGoogle} disabled={busy}>
                  {busy ? <Loader2 className="mr-3 size-5 animate-spin" /> : <span className="mr-3">{googleIcon()}</span>}
                  {busy ? "Connecting to Google…" : "Continue with Gmail — Sign up / Log in"}
                </Button>

                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-4 text-center text-xs leading-5 text-slate-600">
                  No separate account form, password or extra signup step. <strong className="text-slate-900">Google is the only ANVYA sign-in.</strong>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 p-3 text-center"><div className="text-lg font-black text-indigo-600">01</div><p className="text-[9px] font-bold text-slate-500">SIGN IN</p></div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center"><div className="text-lg font-black text-fuchsia-600">02</div><p className="text-[9px] font-bold text-slate-500">SHARE</p></div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center"><div className="text-lg font-black text-cyan-600">03</div><p className="text-[9px] font-bold text-slate-500">GROW</p></div>
                </div>

                <Link to="/anvya" className="block text-center text-sm font-bold text-indigo-600 hover:underline">← Back to ANVYA Home</Link>
                <p className="flex items-center justify-center gap-2 text-[11px] text-slate-400"><LogIn className="size-3.5"/> Returning users keep the same ANVYA ID • New users get one automatically.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
