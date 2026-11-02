import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CRM_ADMIN_EMAILS = new Set([
  "crazyseoteam@gmail.com",
  "saurabhanandshahisarmera@gmail.com",
  "saurabhanandcontentwriter@gmail.com",
  "sauravanand499@gmail.com",
]);

type State = "checking" | "allowed" | "denied";

export default function CrmTeamGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) throw error || new Error("No active session");
        const email = data.user.email?.trim().toLowerCase() ?? "";
        let allowed = CRM_ADMIN_EMAILS.has(email);

        if (!allowed) {
          // Employee Google login assigns crm_team through the trusted
          // Edge Function. Check that role through the security-definer
          // has_role RPC instead of querying the HR table directly (which
          // is restricted by RLS for employee sessions).
          const { data: employeeRole, error: roleError } = await supabase.rpc(
            "has_role",
            { _user_id: data.user.id, _role: "crm_team" },
          );
          if (roleError) throw roleError;
          allowed = employeeRole === true;
        }

        if (!cancelled) setState(allowed ? "allowed" : "denied");
      } catch (error) {
        console.error("CRM guard verification failed:", error);
        if (!cancelled) setState("denied");
      }
    };

    void verify();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => { if (!cancelled) void verify(); }, 0);
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  if (state === "checking") {
    return <div className="min-h-screen grid place-items-center bg-background"><Loader2 className="animate-spin text-primary" size={28}/></div>;
  }
  if (state === "denied") {
    return <Navigate to="/employee/login" replace state={{ from: location.pathname }}/>;
  }
  return <>{children}</>;
}
