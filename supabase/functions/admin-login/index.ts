import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });
  }

  try {
    const body = await req.json();
    const raw = String(body?.username ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!raw || !password) {
      return new Response(JSON.stringify({ error: "Admin ID and password are required" }), { status: 400, headers: cors });
    }

    const email = ALIASES[raw] ?? raw;

    if (!ALLOWED_ADMINS.has(email)) {
      return new Response(JSON.stringify({ error: "Admin account is not authorized" }), { status: 403, headers: cors });
    }

    const authUrl = `${Deno.env.get("SUPABASE_URL")}/auth/v1/token?grant_type=password`;
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.access_token || !result.refresh_token) {
      return new Response(
        JSON.stringify({ error: result?.error_description ?? result?.msg ?? "Invalid Admin ID or password" }),
        { status: 401, headers: cors },
      );
    }

    return new Response(JSON.stringify({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      user: result.user,
    }), { status: 200, headers: cors });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Login failed" }),
      { status: 500, headers: cors },
    );
  }
});
