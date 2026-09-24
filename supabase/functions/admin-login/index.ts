import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
  "crazyseo": "crazyseoteam@gmail.com",
  "crazyseoteamnalanda": "crazyseoteam@gmail.com",
  "crazyseoteam@gmail.com": "crazyseoteam@gmail.com",

  "sauravanand499@gmail.com": "sauravanand499@gmail.com",

  "saurabhanand": "saurabhanandshahisarmera@gmail.com",
  "saurav": "saurabhanandshahisarmera@gmail.com",
  "saurabhanandshahisarmera@gmail.com":
    "saurabhanandshahisarmera@gmail.com",
};

function getEnv(name: string): string {
  return Deno.env.get(name) ?? "";
}

async function ensureAdminRole(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
) {
  const admin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { error } = await admin
    .from("user_roles")
    .upsert(
      {
        user_id: userId,
        role: "admin",
      },
      {
        onConflict: "user_id,role",
        ignoreDuplicates: true,
      },
    );

  if (error) throw error;
}

async function passwordLogin(
  supabaseUrl: string,
  anonKey: string,
  email: string,
  password: string,
) {
  return await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: corsHeaders,
      },
    );
  }

  try {
    const {
      username,
      password,
    } = await req.json();

    const input = String(username ?? "")
      .trim()
      .toLowerCase();

    const userPassword = String(
      password ?? "",
    );

    if (!input || !userPassword) {
      return new Response(
        JSON.stringify({
          error:
            "Admin Gmail and password are required",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const email =
      ALIASES[input] ?? input;

    if (!ALLOWED_ADMINS.has(email)) {
      return new Response(
        JSON.stringify({
          error:
            "This account is not authorized as admin",
        }),
        {
          status: 403,
          headers: corsHeaders,
        },
      );
    }

    const supabaseUrl =
      getEnv("SUPABASE_URL");

    const anonKey =
      getEnv("SUPABASE_ANON_KEY");

    const serviceRoleKey =
      getEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey) {
      throw new Error(
        "Supabase configuration is missing",
      );
    }

    /*
     * IMPORTANT:
     * Password is NEVER hardcoded here.
     * Supabase Auth verifies the password.
     */
    let authResponse = await passwordLogin(
      supabaseUrl,
      anonKey,
      email,
      userPassword,
    );

    let authResult =
      await authResponse.json();

    /*
     * Existing users:
     * wrong password = login fails.
     *
     * New allow-listed user:
     * create account only when it does not exist.
     */
    if (
      !authResponse.ok &&
      authResult?.error_code ===
        "invalid_credentials" &&
      serviceRoleKey
    ) {
      const admin = createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

      const {
        data,
        error,
      } =
        await admin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

      if (error) throw error;

      const existingUser =
        data.users.find(
          (u) =>
            (u.email ?? "")
              .toLowerCase() === email,
        );

      if (!existingUser) {
        const {
          data: created,
          error: createError,
        } =
          await admin.auth.admin.createUser({
            email,
            password: userPassword,
            email_confirm: true,
          });

        if (createError) {
          throw createError;
        }

        await ensureAdminRole(
          supabaseUrl,
          serviceRoleKey,
          created.user.id,
        );

        authResponse =
          await passwordLogin(
            supabaseUrl,
            anonKey,
            email,
            userPassword,
          );

        authResult =
          await authResponse.json();
      }
    }

    if (
      !authResponse.ok ||
      !authResult?.access_token ||
      !authResult?.refresh_token
    ) {
      return new Response(
        JSON.stringify({
          error:
            authResult?.error_description ??
            authResult?.msg ??
            "Invalid Admin Gmail or password",
        }),
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    if (
      serviceRoleKey &&
      authResult.user?.id
    ) {
      await ensureAdminRole(
        supabaseUrl,
        serviceRoleKey,
        authResult.user.id,
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token:
          authResult.access_token,
        refresh_token:
          authResult.refresh_token,
        user: authResult.user,
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("admin-login error:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Admin login failed",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
