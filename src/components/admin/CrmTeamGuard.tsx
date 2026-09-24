import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CRM_ADMIN_EMAILS = new Set([
  "crazyseoteam@gmail.com",
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
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email?.trim().toLowerCase() ?? "";

        if (cancelled) return;

        setState(CRM_ADMIN_EMAILS.has(email) ? "allowed" : "denied");
      } catch (error) {
        console.error("CRM guard verification failed:", error);
        if (!cancelled) setState("denied");
      }
    };

    void verify();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => {
        if (cancelled) return;

        const email = session?.user?.email?.trim().toLowerCase() ?? "";
        setState(
          event !== "SIGNED_OUT" && CRM_ADMIN_EMAILS.has(email)
            ? "allowed"
            : "denied",
        );
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <Navigate
        to="/admin/crm/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
