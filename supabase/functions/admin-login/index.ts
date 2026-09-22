import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const ALLOWED_ADMINS = new Set([
  "crazyseoteam@gmail.com",
  "sauravanand499@gmail.com",
]);

const ALIASES: Record<string, string> = {
  "crazyseoteam": "crazyseoteam@gmail.com",
  "crazy seo team": "crazyseoteam@gmail.com",
  "crazyseoteamnalanda": "crazyseoteam@gmail.com",
  "crazyseoteam@gmail.com": "crazyseoteam@gmail.com",
  "sauravanand499@gmail.com": "sauravanand499@gmail.com",
};

function getKey(name: string, mapName: string): string {
  const direct = Deno.env.get(name);
  if (direct) return direct;
  try {
    const raw = Deno.env.get(mapName);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.default ?? Object.values(parsed ?? {})[0] ?? "";
  } catch {
    return "";
  }
}

async function ensureAdminRole(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
) {
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await adminClient.from("user_roles").upsert(
    { user_id: userId, role: "admin" },
    { onConflict: "user_id,role", ignoreDuplicates: true },
  );
  if (error) throw error;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: cors,
    });
  }

  try {
    const body = await req.json();
    const raw = String(body?.username ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!raw || !password) {
      return new Response(JSON.stringify({ error: "Admin ID and password are required" }), {
        status: 400,
        headers: cors,
      });
    }

    const email = ALIASES[raw] ?? raw;
    if (!ALLOWED_ADMINS.has(email)) {
      return new Response(JSON.stringify({ error: "Admin account is not authorized" }), {
        status: 403,
        headers: cors,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = getKey("SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEYS");
    const serviceRoleKey = getKey("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEYS");

    if (!supabaseUrl || !anonKey) {
      throw new Error("Supabase Auth configuration is incomplete");
    }

    const authToken = async () => fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey,
        },
        body: JSON.stringify({ email, password }),
      },
    );

    let response = await authToken();
    let result = await response.json();

    const invalidCredentials =
      result?.error_code === "invalid_credentials" ||
      result?.msg === "Invalid login credentials";

    if (!response.ok && invalidCredentials && serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: listed, error: listError } =
        await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) throw listError;

      const existing = listed?.users?.find(
        (u) => (u.email ?? "").toLowerCase() === email,
      );

      // Bootstrap only when the allow-listed admin account does not exist.
      // Existing accounts still require the correct password.
      if (!existing) {
        const { data: created, error: createError } =
          await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
        if (createError) throw createError;
        await ensureAdminRole(supabaseUrl, serviceRoleKey, created.user.id);

        response = await authToken();
        result = await response.json();
      }
    }

    if (!response.ok || !result.access_token || !result.refresh_token) {
      return new Response(
        JSON.stringify({
          error: result?.error_description ?? result?.msg ?? "Invalid Admin ID or password",
        }),
        { status: 401, headers: cors },
      );
    }

    if (serviceRoleKey && result?.user?.id) {
      await ensureAdminRole(supabaseUrl, serviceRoleKey, result.user.id);
    }

    return new Response(
      JSON.stringify({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        user: result.user,
      }),
      { status: 200, headers: cors },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Login failed" }),
      { status: 500, headers: cors },
    );
  }
});
