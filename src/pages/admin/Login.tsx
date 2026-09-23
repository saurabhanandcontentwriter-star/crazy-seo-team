import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      toast.error(
        "Gmail/username and password are required",
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Call Supabase Edge Function.
       * DO NOT use signInWithPassword here.
       */
      const { data, error } =
        await supabase.functions.invoke(
          "admin-login",
          {
            body: {
              username:
                username.trim(),
              password,
            },
          },
        );

      if (error) {
        throw new Error(
          error.message ||
            "Admin login failed",
        );
      }

      if (
        !data?.access_token ||
        !data?.refresh_token
      ) {
        throw new Error(
          data?.error ||
            "Invalid Admin Gmail or password",
        );
      }

      /*
       * Save returned Supabase session.
       */
      const {
        error: sessionError,
      } =
        await supabase.auth.setSession({
          access_token:
            data.access_token,
          refresh_token:
            data.refresh_token,
        });

      if (sessionError) {
        throw sessionError;
      }

      /*
       * Verify admin role.
       */
      const {
        data: roleData,
        error: roleError,
      } = await supabase.rpc(
        "has_role",
        {
          _user_id:
            data.user.id,
          _role: "admin",
        },
      );

      if (roleError) {
        throw roleError;
      }

      if (!roleData) {
        await supabase.auth.signOut();

        throw new Error(
          "This account does not have admin access",
        );
      }

      toast.success(
        "Admin login successful",
      );

      navigate("/admin", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Admin login error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Invalid Admin Gmail or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-6 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Crazy SEO Team
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Gmail / Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value,
                  )
                }
                placeholder="crazyseoteam@gmail.com"
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value,
                  )
                }
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg px-4 py-3 font-semibold disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
