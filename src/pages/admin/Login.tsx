import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/admin/login`,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) {
        toast.error("Sign-in failed", { description: result.error.message });
        setBusy(false);
        return;
      }
      if (result.redirected) return;
    } catch (e: any) {
      toast.error("Sign-in error", { description: e.message });
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

  // Logged in but not admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border border-border bg-card">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access denied</h1>
          <p className="text-muted-foreground mb-4">
            Your Google account ({user.email}) is not on the admin allowlist.
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

  if (user && isAdmin) return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
            <ShieldCheck size={28} className="text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">Admin Login</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Sign in with your authorized Google account to manage blog posts.
        </p>
        <Button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full gradient-bg text-primary-foreground"
          size="lg"
        >
          {busy ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <LogIn size={18} className="mr-2" />
          )}
          Continue with Google
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Only allowlisted Gmail addresses can access the admin dashboard.
        </p>
      </div>
    </div>
  );
}
