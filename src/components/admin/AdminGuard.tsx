import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type State = "checking" | "allowed" | "denied";

const ALLOWED_ADMINS = new Set([
  "crazyseoteam@gmail.com",
  "sauravanand499@gmail.com",
  "saurabhanandshahisarmera@gmail.com",
  "saurabhanandcontentwriter@gmail.com",
]);

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const location = useLocation();
  const verifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const {
          data: { user },
        error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (cancelled) return;

        const email = user?.email?.trim().toLowerCase() ?? "";

        if (!user || !ALLOWED_ADMINS.has(email)) {
          verifiedUserId.current = null;
          setState("denied");
          return;
        }

        verifiedUserId.current = user.id;
        setState("allowed");
      } catch (error) {
        console.error("Admin guard verification failed:", error);

        if (!cancelled) {
          verifiedUserId.current = null;
          setState("denied");
        }
      }
    };

    void verify();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => {
        if (cancelled) return;

        if (event === "SIGNED_OUT" || !session) {
          verifiedUserId.current = null;
          setState("denied");
          return;
        }

        const email = session.user.email?.trim().toLowerCase() ?? "";

        if (!ALLOWED_ADMINS.has(email)) {
          verifiedUserId.current = null;
          setState("denied");
          void supabase.auth.signOut({ scope: "local" });
          return;
        }

        verifiedUserId.current = session.user.id;
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
      <div
        className="min-h-screen bg-background grid place-items-center"
        aria-busy="true"
      >
        <div className="text-sm text-muted-foreground">
          Verifying admin session...
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
