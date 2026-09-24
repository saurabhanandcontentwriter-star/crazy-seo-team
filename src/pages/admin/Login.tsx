import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALLOWED_ADMINS = [
  "saurabhanandshahisarmera@gmail.com",
  "crazyseoteam@gmail.com",
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Admin Google login error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Google admin login failed.",
      );
      setLoading(false);
    }
  };

  const checkCurrentGoogleUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const email = user?.email?.trim().toLowerCase() ?? "";
    if (!user || !ALLOWED_ADMINS.includes(email)) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      localStorage.removeItem("adminLoggedIn");
      toast.error("This Gmail is not authorized for Admin.");
      return false;
    }

    const { data: roleData, error: roleError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || roleData !== true) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      localStorage.removeItem("adminLoggedIn");
      toast.error("This Gmail does not have Admin access yet.");
      return false;
    }

    localStorage.setItem("adminLoggedIn", "true");
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-6 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Continue with Google using an authorized Gmail only.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border bg-background px-4 py-3 font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="grid size-7 place-items-center rounded-full bg-white text-sm font-black shadow-sm">
              G
            </span>
            {loading ? "Opening Google..." : "Continue with Google"}
          </button>

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALLOWED_ADMINS = [
  "saurabhanandshahisarmera@gmail.com",
  "crazyseoteam@gmail.com",
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Admin Google login error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Google admin login failed.",
      );
      setLoading(false);
    }
  };

  const checkCurrentGoogleUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const email = user?.email?.trim().toLowerCase() ?? "";
    if (!user || !ALLOWED_ADMINS.includes(email)) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      localStorage.removeItem("adminLoggedIn");
      toast.error("This Gmail is not authorized for Admin.");
      return false;
    }

    const { data: roleData, error: roleError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || roleData !== true) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      localStorage.removeItem("adminLoggedIn");
      toast.error("This Gmail does not have Admin access yet.");
      return false;
    }

    localStorage.setItem("adminLoggedIn", "true");
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-6 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Continue with Google using an authorized Gmail only.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border bg-background px-4 py-3 font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="grid size-7 place-items-center rounded-full bg-white text-sm font-black shadow-sm">
              G
            </span>
            {loading ? "Opening Google..." : "Continue with Google"}
          </button>

          <div className="mt-5 rounded-xl border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Authorized Admin Gmail</p>
            <p className="mt-1">saurabhanandshahisarmera@gmail.com</p>
            <p>crazyseoteam@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
