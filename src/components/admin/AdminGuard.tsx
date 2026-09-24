import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type State = "checking" | "allowed" | "denied";

const ROLE_CHECK_TIMEOUT_MS = 8000;

async function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return await Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      window.setTimeout(() => reject(new Error("Admin role check timed out")), ms),
    ),
  ]);
}

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    let verifiedUserId: string | null = null;

    const verify = async () => {
      try {
        const { data: sessionData } = await withTimeout(
          supabase.auth.getSession(),
          ROLE_CHECK_TIMEOUT_MS,
        );
        const user = sessionData.session?.user;

        if (!user) {
          if (!cancelled) {
            verifiedUserId = null;
            setState("denied");
          }
          return;
        }

        // Once this browser session has been verified for the current user,
        // token refreshes and route changes must not cause a logout/redirect loop.
        if (verifiedUserId === user.id) {
          if (!cancelled) setState("allowed");
          return;
        }

        const { data: roleData, error: roleError } = await withTimeout(
          supabase.rpc("has_role", {
            _user_id: user.id,
            _role: "admin",
          }),
          ROLE_CHECK_TIMEOUT_MS,
        );

        if (cancelled) return;

        const isAdmin = Array.isArray(roleData)
          ? roleData.some(Boolean)
          : roleData === true;

        if (roleError || !isAdmin) {
          verifiedUserId = null;
          setState("denied");
          return;
        }

        verifiedUserId = user.id;
        setState("allowed");
      } catch {
        if (cancelled) return;

        // A live authenticated session is still preferable to a redirect loop
        // when the role endpoint has a transient/network failure. The next
        // auth event will retry verification.
        const { data } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        if (data.session?.user) {
          setState("allowed");
        } else {
          setState("denied");
        }
      }
    };

    verify();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => {
        if (cancelled) return;

        if (event === "SIGNED_OUT" || !session) {
          verifiedUserId = null;
          setState("denied");
          return;
        }

        // Don't re-run the role query for every token refresh when this user
        // is already verified in the current mounted guard.
        if (event === "TOKEN_REFRESHED" && verifiedUserId === session.user.id) {
          setState("allowed");
          return;
        }

        verify();
      }, 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen bg-background grid place-items-center" aria-busy="true">
        <div className="text-sm text-muted-foreground">Verifying admin session…</div>
      </div>
    );
  }

  if (state === "denied") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
