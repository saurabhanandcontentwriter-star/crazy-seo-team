import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CRM_ADMIN_EMAIL = "crazyseoteam@gmail.com";

type State = "checking" | "allowed" | "denied";

export default function CrmTeamGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        const email = user?.email?.trim().toLowerCase() ?? "";

        if (cancelled) return;

        if (email !== CRM_ADMIN_EMAIL) {
          setState("denied");
          return;
        }

        setState("allowed");
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

        if (event === "SIGNED_OUT" || email !== CRM_ADMIN_EMAIL) {
          setState("denied");
          return;
        }

        setState("allowed");
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
