import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Loader2, Eye, EyeOff, Bot, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

async function logAttempt(row: { email: string; success: boolean; failure_reason?: string }) {
  try {
    await supabase.functions.invoke("log-login-attempt", {
      body: {
        email: row.email,
        success: row.success,
        mfa_verified: false,
        failure_reason: row.failure_reason ?? null,
      },
    });
  } catch {
    /* best-effort */
  }
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  // If a valid session already exists, go straight to the dashboard.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) navigate("/admin", { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const id = username.trim();

    const { data, error } = await supabase.functions.invoke("admin-login", {
      body: { username: id, password },
    });

    const tokens = data as { access_token?: string; refresh_token?: string; error?: string } | null;

    if (error || !tokens?.access_token || !tokens?.refresh_token) {
      await logAttempt({ email: id, success: false, failure_reason: tokens?.error ?? "invalid_credentials" });
      toast.error("Invalid Admin ID or password");
      setBusy(false);
      return;
    }

    const { error: sessErr } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    if (sessErr) {
      toast.error("Could not start session");
      setBusy(false);
      return;
    }

    await logAttempt({ email: id, success: true });
    await supabase.from("login_history").insert({ email: id, success: true });
    toast.success("Welcome back, Admin");
    navigate("/admin", { replace: true });
  };


  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Animated background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-400/30 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-indigo-400/20 to-emerald-400/20 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="relative w-full max-w-md">
        {/* Glow ring */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-30 blur-xl" />

        <div className="relative p-8 rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
          {/* Icon */}
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/40">
              <Bot size={30} className="text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-semibold text-blue-700 mb-3">
              <Sparkles size={11} /> AI SaaS Admin Portal
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-600">Sign in to your admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-slate-700 font-medium">Admin ID</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Crazyseoteam"
                required
                className="mt-1.5 bg-white/70 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>


            <div>
              <Label htmlFor="pwd" className="text-slate-700 font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="pwd"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-white/70 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-lg shadow-blue-500/30 border-0"
              size="lg"
            >
              {busy ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={16} className="ml-2" /></>
              )}
            </Button>
          </form>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-blue-50/60 border border-blue-100">
              <ShieldCheck size={14} className="text-blue-600" />
              <span className="text-[10px] font-medium text-slate-600">Encrypted</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-purple-50/60 border border-purple-100">
              <Zap size={14} className="text-purple-600" />
              <span className="text-[10px] font-medium text-slate-600">Fast Auth</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <Sparkles size={14} className="text-emerald-600" />
              <span className="text-[10px] font-medium text-slate-600">AI Powered</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-5">
            Secure sign-in · Session encrypted · Audit-logged
          </p>
        </div>
      </div>
    </div>
  );
}
