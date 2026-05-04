import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Try sign-in first
      let { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error && /invalid login credentials/i.test(error.message)) {
        // Auto-create the admin account on first run (only works for allowlisted emails)
        const signUp = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (signUp.error) throw signUp.error;
        // Try sign-in again
        const retry = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (retry.error) throw retry.error;
      } else if (error) {
        throw error;
      }
      toast.success("Signed in");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast.error("Sign-in failed", { description: err.message });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (user && isAdmin) return <Navigate to="/admin" replace />;

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border border-border bg-card">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access denied</h1>
          <p className="text-muted-foreground mb-4">
            {user.email} is not authorized for the admin dashboard.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
          >
            Sign out & try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleLogin}
        className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
            <ShieldCheck size={28} className="text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">Admin Login</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Sign in to manage blog posts and SEO tools.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="crazyseoteam@gmail.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
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
            className="w-full gradient-bg text-primary-foreground"
            size="lg"
          >
            {busy ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <LogIn size={18} className="mr-2" />
            )}
            Sign in
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Only allowlisted admin emails can access the dashboard.
        </p>
      </form>
    </div>
  );
}
