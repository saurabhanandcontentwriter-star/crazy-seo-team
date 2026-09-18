import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type State = "checking" | "allowed" | "denied";

export default function CrmTeamGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        if (!cancelled) setState("denied");
        return;
      }

      const [{ data: adminRole }, { data: teamRole }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: user.id, _role: "crm_team" }),
      ]);

      if (cancelled) return;
      if (adminRole === true || teamRole === true) setState("allowed");
      else setState("denied");
    };

    verify();
    const { data: sub } = supabase.auth.onAuthStateChange(() => setTimeout(verify, 0));
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "checking") {
    return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="animate-spin text-primary" size={28} /></div>;
  }
  if (state === "denied") {
    return <Navigate to="/admin/crm/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
