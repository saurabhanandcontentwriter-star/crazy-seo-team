import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const email = username.trim().toLowerCase();

    if (!email || !password) {
      setError("Gmail and password are required.");
      return;
    }

    // Only these two admin accounts are allowed
    const allowedAdmins = [
      "crazyseoteam@gmail.com",
      "sauravanand499@gmail.com",
    ];

    if (!allowedAdmins.includes(email)) {
      setError("This Gmail is not authorized as an admin.");
      return;
    }

    setLoading(true);

    try {
      // Call Supabase Edge Function
      const { data, error: functionError } =
        await supabase.functions.invoke("admin-login", {
          body: {
            username: email,
            password: password,
          },
        });

      if (functionError) {
        throw new Error(
          functionError.message || "Admin login failed."
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error || "Invalid Admin Gmail or password."
        );
      }

      if (!data?.access_token || !data?.refresh_token) {
        throw new Error("Admin session could not be created.");
      }

      // Save Supabase session
      const { error: sessionError } =
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      // Verify current logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        await supabase.auth.signOut();
        throw new Error("Admin session verification failed.");
      }

      // Verify admin role
      const { data: isAdmin, error: roleError } =
        await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

      if (roleError) {
        await supabase.auth.signOut();
        throw new Error(roleError.message);
      }

      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error(
          "This account does not have admin access."
        );
      }

      // Legacy flag for compatibility with old admin components
      localStorage.setItem("adminLoggedIn", "true");

      // Final redirect
      window.location.href = "/admin";
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Invalid Admin Gmail or password."
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

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Admin Gmail
              </label>

              <input
                type="email"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
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
                  setPassword(e.target.value)
                }
                placeholder="Enter admin password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
