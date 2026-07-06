import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Loader2, KeyRound, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Stage = "credentials" | "enroll" | "challenge";

async function logAttempt(row: {
  email: string;
  success: boolean;
  mfa_verified?: boolean;
  failure_reason?: string;
}) {
  try {
    await supabase.functions.invoke("log-login-attempt", {
      body: {
        email: row.email,
        success: row.success,
        mfa_verified: row.mfa_verified ?? false,
        failure_reason: row.failure_reason ?? null,
      },
    });
  } catch {
    /* best-effort */
  }
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [provisioning, setProvisioning] = useState(false);

  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  // Provisioning is a server-only, secret-gated operation now — no client auto-invoke.

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const raw = email.trim();
    // Username alias: map "Crazyseoteam" -> crazyseoteam@gmail.com
    const cleanEmail = raw.includes("@")
      ? raw.toLowerCase()
      : raw.toLowerCase() === "crazyseoteam"
        ? "crazyseoteam@gmail.com"
        : raw.toLowerCase() === "sauravanand499"
          ? "sauravanand499@gmail.com"
          : raw.toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      await logAttempt({ email: cleanEmail, success: false, failure_reason: error?.message ?? "unknown" });
      toast.error(error?.message ?? "Invalid credentials");
      setBusy(false);
      return;
    }

    // Confirm admin role
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      await supabase.auth.signOut();
      await logAttempt({ email: cleanEmail, success: false, failure_reason: "not_admin" });
      toast.error("Access denied — not an admin");
      setBusy(false);
      return;
    }

    // Check existing TOTP factors
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.find((f) => f.status === "verified");

    if (totp) {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (chErr) {
        toast.error(chErr.message);
        setBusy(false);
        return;
      }
      setFactorId(totp.id);
      setChallengeId(ch.id);
      setStage("challenge");
      setBusy(false);
      return;
    }

    // No verified TOTP — enroll one
    const { data: enroll, error: enrErr } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Admin ${Date.now()}`,
    });
    if (enrErr || !enroll) {
      toast.error(enrErr?.message ?? "MFA enroll failed");
      setBusy(false);
      return;
    }
    setFactorId(enroll.id);
    setQrSvg(enroll.totp.qr_code);
    setSecret(enroll.totp.secret);
    setStage("enroll");
    setBusy(false);
  };

  const verifyEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chErr || !ch) {
      toast.error(chErr?.message ?? "Challenge failed");
      setBusy(false);
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: ch.id,
      code: otp.trim(),
    });
    if (vErr) {
      toast.error(vErr.message);
      setBusy(false);
      return;
    }
    const { data: u } = await supabase.auth.getUser();
    await logAttempt({
      email: u.user?.email ?? email,
      success: true,
      mfa_verified: true,
    });
    toast.success("2FA enabled — welcome, Admin");
    navigate("/admin", { replace: true });
  };

  const verifyChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !challengeId) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: otp.trim(),
    });
    if (error) {
      const { data: u } = await supabase.auth.getUser();
      await logAttempt({
        email: u.user?.email ?? email,
        success: false,
        mfa_verified: false,
        failure_reason: "totp_invalid",
      });
      toast.error(error.message);
      setBusy(false);
      return;
    }
    const { data: u } = await supabase.auth.getUser();
    await logAttempt({
      email: u.user?.email ?? email,
      success: true,
      mfa_verified: true,
    });
    toast.success("Welcome, Admin");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4">
      <div className="max-w-md w-full p-8 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <ShieldCheck size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Super Admin 2.0</h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          {stage === "credentials" && "Sign in with your admin credentials"}
          {stage === "enroll" && "Scan the QR with Google Authenticator / Authy"}
          {stage === "challenge" && "Enter the 6-digit code from your authenticator app"}
        </p>

        {provisioning && (
          <p className="text-[11px] text-blue-600 text-center mb-3 flex items-center justify-center gap-1">
            <Loader2 size={11} className="animate-spin" /> Provisioning admin accounts…
          </p>
        )}

        {stage === "credentials" && (
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <Label htmlFor="email">Username or Email</Label>
              <Input
                id="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Crazyseoteam"
                required
              />
            </div>
            <div>
              <Label htmlFor="pwd">Password</Label>
              <Input
                id="pwd"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-95"
              size="lg"
            >
              {busy ? <><Loader2 size={16} className="mr-2 animate-spin" /> Verifying…</> : <>Continue <ArrowRight size={16} className="ml-2" /></>}
            </Button>
          </form>
        )}

        {stage === "enroll" && qrSvg && (
          <form onSubmit={verifyEnroll} className="space-y-4">
            <div
              className="mx-auto w-48 h-48 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            {secret && (
              <p className="text-[11px] text-slate-500 text-center break-all">
                Or enter manually: <span className="font-mono text-slate-700">{secret}</span>
              </p>
            )}
            <div>
              <Label htmlFor="otp1" className="flex items-center gap-1.5"><Smartphone size={13} /> 6-digit code</Label>
              <Input
                id="otp1"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                className="tracking-[0.5em] text-center font-mono text-lg"
              />
            </div>
            <Button type="submit" disabled={busy || otp.length !== 6} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white" size="lg">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <>Verify & Enable 2FA</>}
            </Button>
          </form>
        )}

        {stage === "challenge" && (
          <form onSubmit={verifyChallenge} className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
              <KeyRound className="mx-auto mb-2 text-blue-600" size={22} />
              <p className="text-sm text-slate-700">Enter the 6-digit code from your authenticator app.</p>
            </div>
            <Input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              required
              className="tracking-[0.5em] text-center font-mono text-xl"
            />
            <Button type="submit" disabled={busy || otp.length !== 6} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white" size="lg">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <>Verify & Sign In</>}
            </Button>
          </form>
        )}

        <p className="text-[10px] text-slate-400 text-center mt-6">
          Encrypted session · Bcrypt password hashing · TOTP 2FA · Audit-logged
        </p>
      </div>
    </div>
  );
}
