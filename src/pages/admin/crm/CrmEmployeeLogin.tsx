import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";

export default function CrmEmployeeLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(normalizedEmail)) {
      toast.error("Enter your valid registered email address.");
      return;
    }
    setBusy(true);
    setSent(false);
    try {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      const { data, error: prepareError } = await supabase.functions.invoke("crm-team-auth", {
        body: { action: "prepare-email-login", email: normalizedEmail },
      });
      if (prepareError) {
        let message = prepareError.message || "Could not send login link.";
        const context = (prepareError as any).context;
        if (context && typeof context.clone === "function") {
          try {
            const payload = await context.clone().json();
            message = payload?.error || payload?.message || message;
          } catch { /* retain original message */ }
        }
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.error);
      const destinationEmail = String(data?.email || normalizedEmail);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: destinationEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: window.location.origin + "/employee/login",
        },
      });
      if (otpError) throw otpError;
      setSent(true);
      toast.success("Login link sent. Check your email inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send login link.");
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
          <label className="block text-sm font-semibold">Employee ID or Registered Email
            <input value={loginId} onChange={e=>setLoginId(e.target.value)} autoComplete="username" placeholder="Enter Employee ID or registered email" className="mt-1 w-full rounded-xl border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <label className="block text-sm font-semibold">Password
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" className="mt-1 w-full rounded-xl border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>
          <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50">
            {busy && <Loader2 size={17} className="animate-spin"/>}{busy ? "Sending link..." : "Send Login Link"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">No password needed. We will email you a secure sign-in link.</p>\n        {sent && <p role="status" className="mt-3 text-center text-sm font-medium text-primary">Check your inbox and open the secure login link.</p>}
      </GlassCard>
    </main>
  );
}
