import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });
const syntheticEmail = (id: string) => {
  const normalized = id.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{1,39}$/.test(normalized)) throw new Error("Invalid Employee ID");
  return `${normalized}@employees.crazyseoteam.in`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const body = await req.json();
    if (String(body.action ?? "") === "login") {
      const loginId = String(body.login_id ?? "").trim();
      const email = syntheticEmail(loginId);
      const adminLookup = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
      const { data: member, error: memberError } = await adminLookup.from("crm_team_members")
        .select("auth_user_id,status").ilike("login_id", loginId).maybeSingle();
      if (memberError) throw memberError;
      if (!member || member.status !== "active" || !member.auth_user_id) return json({ error: "Employee ID not found or inactive" }, 404);
      const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: anon },
        body: JSON.stringify({ email, password: String(body.password ?? "") }),
      });
      const result = await response.json();
      if (!response.ok || !result.access_token || result.user?.id !== member.auth_user_id) {
        return json({ error: "Invalid Employee ID or password" }, 401);
      }
      return json({ success: true, access_token: result.access_token, refresh_token: result.refresh_token, user: result.user });
    }
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Admin login required" }, 401);

    const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userError } = await caller.auth.getUser();
    if (userError || !userData.user) return json({ error: "Invalid session" }, 401);

    const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: roleRows, error: roleError } = await admin
      .from("user_roles").select("role").eq("user_id", userData.user.id);
    if (roleError) throw roleError;
    if (!roleRows?.some((r) => r.role === "admin")) return json({ error: "Admin permission required" }, 403);

    const action = String(body.action ?? "");
    if (action === "login") {
      const email = syntheticEmail(String(body.login_id ?? ""));
      const { data: member, error } = await admin.from("crm_team_members")
        .select("id,auth_user_id,status").eq("login_id", String(body.login_id).trim()).maybeSingle();
      if (error) throw error;
      if (!member || member.status !== "active" || !member.auth_user_id) return json({ error: "Employee ID not found or inactive" }, 404);
      return json({ email });
    }

    const memberId = body.member_id ? String(body.member_id) : null;
    if (action === "delete") {
      if (!memberId) return json({ error: "Employee is required" }, 400);
      const { data: member, error } = await admin.from("crm_team_members").select("auth_user_id").eq("id", memberId).single();
      if (error) throw error;
      if (member.auth_user_id) {
        const { error: deleteAuthError } = await admin.auth.admin.deleteUser(member.auth_user_id);
        if (deleteAuthError) throw deleteAuthError;
      }
      const { error: deleteError } = await admin.from("crm_team_members").delete().eq("id", memberId);
      if (deleteError) throw deleteError;
      return json({ success: true });
    }
    if (!["create", "update"].includes(action)) return json({ error: "Unsupported action" }, 400);

    const loginId = String(body.login_id ?? "").trim();
    const email = syntheticEmail(loginId);
    const password = String(body.password ?? "");
    if (action === "create" && password.length < 8) return json({ error: "Initial password must be at least 8 characters" }, 400);

    let authUserId: string | null = null;
    if (action === "update" && memberId) {
      const { data: existing, error } = await admin.from("crm_team_members")
        .select("auth_user_id").eq("id", memberId).single();
      if (error) throw error;
      authUserId = existing.auth_user_id;
    }
    if (authUserId) {
      const update: Record<string, unknown> = { email, user_metadata: { employee_id: loginId, name: body.name } };
      if (password) {
        if (password.length < 8) return json({ error: "Password must be at least 8 characters" }, 400);
        update.password = password;
      }
      const { error } = await admin.auth.admin.updateUserById(authUserId, update);
      if (error) throw error;
    } else {
      if (action === "update") return json({ error: "Employee account is not linked; create a new account or contact support" }, 409);
      const { data, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { employee_id: loginId, name: body.name },
      });
      if (error) throw error;
      authUserId = data.user.id;
      const { error: roleInsertError } = await admin.from("user_roles")
        .upsert({ user_id: authUserId, role: "crm_team" }, { onConflict: "user_id,role", ignoreDuplicates: true });
      if (roleInsertError) throw roleInsertError;
    }

    const values = {
      name: String(body.name ?? "").trim(),
      position: String(body.position ?? "Employee"),
      email: String(body.email ?? "").trim(),
      mobile: body.mobile ?? null,
      working_days: body.working_days ?? ["Mon", "Tue", "Wed", "Thu", "Fri"],
      working_hours: body.working_hours ?? "10:00 - 19:00",
      photo_url: body.photo_url ?? null,
      status: body.status ?? "active",
      login_id: loginId,
      auth_user_id: authUserId,
    };
    const result = action === "create"
      ? await admin.from("crm_team_members").insert(values).select("id").single()
      : await admin.from("crm_team_members").update(values).eq("id", memberId).select("id").single();
    if (result.error) throw result.error;

    const profile = await admin.from("crm_employee_profiles").upsert({
      user_id: authUserId,
      designation: values.position,
      department: String(body.department ?? "CRM"),
      joining_date: body.joining_date || null,
      birthday: body.birthday || null,
      monthly_salary: Number(body.monthly_salary ?? 0),
      paid_leave_balance: Number(body.paid_leave_balance ?? 12),
    }, { onConflict: "user_id" });
    if (profile.error) throw profile.error;
    return json({ success: true, member_id: result.data.id, auth_user_id: authUserId });
  } catch (error) {
    console.error("crm-team-auth error", error);
    return json({ error: error instanceof Error ? error.message : "Employee account operation failed" }, 400);
  }
});
