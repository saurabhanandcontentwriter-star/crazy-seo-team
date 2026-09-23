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
  const [settingPassword, setSettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Only redirect an existing session when it is actually an admin.
  // Redirecting every authenticated user to /admin causes a login <-> guard
  // redirect loop when a normal user has a Supabase session but no admin role.
  useEffect(() => {
    let cancelled = false;

    const checkAdminSession = async () => {
      let passwordSetup = false;
      try { passwordSetup = sessionStorage.getItem("admin_password_setup") === "1"; } catch {}
      if (passwordSetup) {
        if (!cancelled) setSettingPassword(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user || cancelled) return;

      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (!cancelled && !error && isAdmin === true) {
        navigate("/admin", { replace: true });
      }
    };

    checkAdminSession();
    try {
      if (sessionStorage.getItem("admin_password_setup") === "1") setSettingPassword(true);
    } catch {}
    return () => {
      cancelled = true;
    };
  }, [navigate]);


  const handleGoogleSetup = async () => {
    try {
      sessionStorage.setItem("admin_password_setup", "1");
    } catch {}
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/login`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      toast.error(error.message || "Google sign-in failed");
      setBusy(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setBusy(true);
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    const email = user?.email?.toLowerCase() ?? "";

    const allowed = [
      "crazyseoteam@gmail.com",
      "sauravanand499@gmail.com",
      "saurabhanandshahisarmera@gmail.com",
    ];

    if (!user || !email || !allowed.includes(email)) {
      toast.error("This Google account is not an authorized admin");
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      setBusy(false);
      return;
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || isAdmin !== true) {
      toast.error("Admin role is required");
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message || "Could not set password");
      setBusy(false);
      return;
    }

    toast.success("Admin password created successfully");
    try { sessionStorage.removeItem("admin_password_setup"); } catch {}
    setNewPassword("");
    setConfirmPassword("");
    setSettingPassword(false);
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
    setBusy(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const id = username.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: id,
      password,
    });

    if (error || !data.user || !data.session) {
      await logAttempt({ email: id, success: false, failure_reason: error?.message ?? "invalid_credentials" });
      toast.error("Invalid Admin Gmail or password");
      setBusy(false);
      return;
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    if (roleError || isAdmin !== true) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      await logAttempt({ email: id, success: false, failure_reason: "not_admin" });
      toast.error("This account is not an admin");
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
            <p className="text-sm text-slate-600">{settingPassword ? "Create your password securely with Google verification" : "Sign in to your admin dashboard"}</p>
          </div>

          {settingPassword ? (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-sm font-semibold text-slate-800">Create Admin Password</p>
                <p className="text-xs text-slate-600 mt-1">
                  Sign in with your authorized Google account, then create a password for Admin Login.
                </p>
              </div>

              <div>
                <Label htmlFor="new-admin-pwd" className="text-slate-700 font-medium">New Password</Label>
                <Input
                  id="new-admin-pwd"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  className="mt-1.5 bg-white/70 border-slate-200"
                />
              </div>

              <div>
                <Label htmlFor="confirm-admin-pwd" className="text-slate-700 font-medium">Confirm Password</Label>
                <Input
                  id="confirm-admin-pwd"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  minLength={8}
                  className="mt-1.5 bg-white/70 border-slate-200"
                />
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0"
                size="lg"
              >
                {busy ? <><Loader2 size={16} className="mr-2 animate-spin" /> Saving…</> : "Create Password"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setSettingPassword(false);
                  try { sessionStorage.removeItem("admin_password_setup"); } catch {}
                  navigate("/admin/login", { replace: true });
                }}
                className="w-full text-sm text-slate-500 hover:text-slate-800"
              >
                Back to Admin Login
              </button>
            </form>
          ) : (
            <>
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

              <div className="relative my-5">
                <div className="border-t border-slate-200" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white/90 px-3 text-[11px] text-slate-400">OR</span>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSetup}
                disabled={busy}
                className="w-full border-slate-200 bg-white/70"
              >
                {busy ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                Continue with Google to Create/Reset Password
              </Button>
            </>
          )}

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
