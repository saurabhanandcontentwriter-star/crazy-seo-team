// supabase/functions/log-login-history/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return req.headers.get("cf-connecting-ip");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Method Not Allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid Email",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let userId: string | null = null;

    try {
      const { data, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (!error && data?.users) {
        const user = data.users.find(
          (u) => u.email?.toLowerCase() === email
        );

        if (user) userId = user.id;
      }
    } catch (err) {
      console.error(err);
    }

    const { error } = await supabase
      .from("login_history")
      .insert({
        email,
        user_id: userId,
        success: Boolean(body.success),
        mfa_verified: false,
        failure_reason:
          typeof body.failure_reason === "string"
            ? body.failure_reason
            : null,
        ip_address: getClientIp(req),
        user_agent: req.headers.get("user-agent"),
      });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
create table login_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    email text,
    success boolean default false,
    mfa_verified boolean default false,
    failure_reason text,
    ip_address text,
    user_agent text,
    created_at timestamptz default now()
);create table login_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    email text,
    success boolean default false,
    mfa_verified boolean default false,
    failure_reason text,
    ip_address text,
    user_agent text,
    created_at timestamptz default now()
);
await supabase.functions.invoke("log-login-history", {
  body: {
    email: "crazyseoteam@gmail.com",
    success: true,
  },
});
