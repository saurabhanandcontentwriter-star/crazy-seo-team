import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && isAdmin) navigate("/admin", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin`,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      toast.error("Sign-in failed", { description: result.error.message });
      return;
    }
    if (result.redirected) return;
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
            <Lock className="text-primary-foreground" size={26} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-center text-foreground mb-2">Admin Sign-In</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Only allowlisted Gmail accounts can access the dashboard.
        </p>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" /></div>
        ) : user && !isAdmin ? (
          <div className="text-center">
            <p className="text-sm text-destructive mb-3">
              Signed in as <strong>{user.email}</strong>, but this account is not on the admin allowlist.
            </p>
            <Button variant="outline" onClick={async () => { await (await import("@/integrations/supabase/client")).supabase.auth.signOut(); window.location.reload(); }}>
              Sign out
            </Button>
          </div>
        ) : (
          <Button onClick={handleGoogle} className="w-full gradient-bg text-primary-foreground hover:opacity-90 h-12 font-semibold">
            <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" opacity=".8"/><path fill="#fff" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z" opacity=".6"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" opacity=".4"/></svg>
            Continue with Google
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
