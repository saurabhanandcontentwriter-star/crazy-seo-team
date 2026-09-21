import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type State = "checking" | "allowed" | "denied";

/**
 * Route guard for admin pages.
 * - Restores the persisted session on refresh / new tab / browser restart.
 * - Never signs the user out on a transient role-check failure (no redirect loops).
 * - Auth state changes are handled outside the Supabase callback (avoids deadlocks
 *   that used to freeze the guard on "checking" forever).
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const location = useLocation();
  const verified = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        if (!cancelled) {
          verified.current = false;
          setState("denied");
        }
        return;
      }

      // Already verified in this mount — a token refresh must not re-gate the UI.
      if (verified.current) {
        if (!cancelled) setState("allowed");
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (cancelled) return;

      if (error) {
        // Network/transient failure: keep an existing session usable rather than
        // bouncing the user to the login page.
        setState(verified.current ? "allowed" : "denied");
        return;
      }

      if (!isAdmin) {
        setState("denied");
        return;
      }

      verified.current = true;
      setState("allowed");
    };

    verify();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer: never call supabase APIs synchronously inside this callback.
      setTimeout(() => {
        if (cancelled) return;
        if (event === "SIGNED_OUT" || !session) {
          verified.current = false;
          setState("denied");
          return;
        }
        if (event === "TOKEN_REFRESHED" && verified.current) return;
        verify();
      }, 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "checking") {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }
  if (state === "denied") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
