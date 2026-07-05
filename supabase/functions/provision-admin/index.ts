// Idempotent provisioner for the two Super Admin accounts.
// Creates them (or resets their password) using service_role and ensures the admin role.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAILS = ["crazyseoteam@gmail.com", "sauravanand499@gmail.com"];
const ADMIN_PASSWORD = "Crazyseoteam@#$2025";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const results: Record<string, string> = {};

    for (const email of ADMIN_EMAILS) {
      // Try to find an existing user
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);

      let userId: string;
      if (existing) {
        const { error } = await admin.auth.admin.updateUserById(existing.id, {
          password: ADMIN_PASSWORD,
          email_confirm: true,
        });
        if (error) throw error;
        userId = existing.id;
        results[email] = "password_reset";
      } else {
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password: ADMIN_PASSWORD,
          email_confirm: true,
        });
        if (error) throw error;
        userId = data.user!.id;
        results[email] = "created";
      }

      // Ensure admin role (trigger does this on new signup, but be defensive)
      await admin.from("user_roles").upsert(
        { user_id: userId, role: "admin" },
        { onConflict: "user_id,role" },
      );
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
