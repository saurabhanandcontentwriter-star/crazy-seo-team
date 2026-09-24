import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type State = "checking" | "allowed" | "denied";

/**
 * Stable admin route guard.
 *
 * We intentionally do not call Supabase APIs from inside the auth-state
 * callback. A deferred verification keeps refresh/sign-in events from
 * deadlocking the client auth lock.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const location = useLocation();
  const verifiedUserId = useRef<string | null>(null);\n\n  const ALLOWED_ADMINS = new Set([\n    "saurabhanandshahisarmera@gmail.com",\n    "crazyseoteam@gmail.com",\n  ]);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        const user = session?.user;
        if (!user) {
          verifiedUserId.current = null;
          setState("denied");
          return;
        }

        if (verifiedUserId.current === user.id) {
          setState("allowed");
          return;
        }

        const { data: roleData, error: roleError } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (cancelled) return;

        if (roleError || roleData !== true) {
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

        if (
          event === "TOKEN_REFRESHED" &&
          verifiedUserId.current === session.user.id
        ) {
          setState("allowed");
          return;
        }

        void verify();
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
