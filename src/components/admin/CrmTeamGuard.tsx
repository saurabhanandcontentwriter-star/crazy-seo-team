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
          // Re-validate the signed-in Google account against the active HR
          // employee record using the service-role Edge Function. This also
          // repairs a missing crm_team role/link for an existing active
          // employee, avoiding false denials from stale/missing role rows.
          const { data: verification, error: verificationError } =
            await supabase.functions.invoke("crm-team-auth", {
              body: { action: "google-employee-login" },
            });
          if (verificationError) {
            let message = verificationError.message || "Employee access verification failed.";
            const context = (verificationError as any).context;
            if (context && typeof context.clone === "function") {
              try {
                const payload = await context.clone().json();
                message = payload?.error || payload?.message || message;
              } catch { /* keep original message */ }
            }
            throw new Error(message);
          }
          if (verification?.error) throw new Error(verification.error);
          allowed = verification?.success === true;
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
