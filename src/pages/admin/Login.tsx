import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALLOWED_ADMINS = [
  "crazyseoteam@gmail.com",
  "sauravanand499@gmail.com",
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const email = username.trim().toLowerCase();

    if (!email || !password) {
      toast.error("Gmail and password are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid Gmail address.");
      return;
    }

    if (!ALLOWED_ADMINS.includes(email)) {
      toast.error("This Gmail is not authorized as an admin.");
      return;
    }

    setLoading(true);

    try {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(
          error.message === "Invalid login credentials"
            ? "Invalid Gmail or password."
            : error.message,
        );
      }

      if (!data.user) {
        throw new Error("Admin account could not be verified.");
      }

      const { data: roleData, error: roleError } = await Promise.race([
        supabase.rpc("has_role", {
          _user_id: data.user.id,
          _role: "admin",
        }),
        new Promise<never>((_, reject) =>
          window.setTimeout(() => reject(new Error("Admin role verification timed out. Please retry.")), 8000),
        ),
      ]);

      const isAdmin = Array.isArray(roleData)
        ? roleData.some(Boolean)
        : Boolean(roleData);

      if (roleError) {
        await supabase.auth.signOut({ scope: "local" });
        throw new Error(roleError.message || "Admin role check failed.");
      }

      if (!isAdmin) {
        await supabase.auth.signOut({ scope: "local" });
        throw new Error("This account does not have admin access.");
      }

      localStorage.setItem("adminLoggedIn", "true");
      toast.success("Admin login successful.");
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error(
        error instanceof Error ? error.message : "Admin login failed.",
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
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">Crazy SEO Team</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Admin Gmail</label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="crazyseoteam@gmail.com"
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
