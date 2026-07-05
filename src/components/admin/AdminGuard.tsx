import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type State = "checking" | "allowed" | "denied";

/**
 * Route guard for admin pages.
 * Requires: valid session + admin role in user_roles + aal2 (2FA verified).
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        if (!cancelled) setState("denied");
        return;
      }

      // Require admin role
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!role) {
        await supabase.auth.signOut();
        if (!cancelled) setState("denied");
        return;
      }

      // Require aal2 (MFA-verified session)
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel !== "aal2") {
        if (!cancelled) setState("denied");
        return;
      }

      if (!cancelled) setState("allowed");
    };

    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }
  if (state === "denied") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
