// Employee Google login and HR account management endpoint.
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
    if (["google-employee-login", "request-crm-access", "verify-crm-access", "get-employee-access", "submit-employee-profile"].includes(String(body.action ?? ""))) {
      const authHeader = req.headers.get("Authorization") ?? "";
      if (!authHeader.startsWith("Bearer ")) return json({ error: "Google session required. Please try again." }, 401);
      const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
      const { data: userData, error: userError } = await caller.auth.getUser();
      if (userError || !userData.user?.email) return json({ error: "Google account could not be verified." }, 401);
      const signedIn = userData.user;
      const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
      const action = String(body.action);
      if (action === "verify-crm-access" || action === "get-employee-access") {
        const { data: request, error } = await admin.from("crm_access_requests")
          .select("status,email,full_name,phone,designation,department,employee_id,employee_note,created_at")
          .eq("user_id", signedIn.id).maybeSingle();
        if (error) throw error;
        return json({ success: request?.status === "approved", status: request?.status ?? "not_requested", profile: request ?? null });
      }
      if (action === "submit-employee-profile") {
        const fullName = String(body.full_name ?? "").trim();
        const phone = String(body.phone ?? "").trim();
        const designation = String(body.designation ?? "").trim();
        const department = String(body.department ?? "").trim();
        const employeeId = String(body.employee_id ?? "").trim();
        const employeeNote = String(body.employee_note ?? "").trim();
        if (!fullName || !phone || !designation || !department) {
          return json({ error: "Name, phone, designation and department are required." }, 400);
        }
        if (phone.replace(/\\D/g, "").length < 10) return json({ error: "Enter a valid phone number." }, 400);
        const { data: prior, error: priorError } = await admin.from("crm_access_requests")
          .select("status").eq("user_id", signedIn.id).maybeSingle();
        if (priorError) throw priorError;
        if (prior?.status === "approved") return json({ success: true, status: "approved" });
        const email = signedIn.email!.trim().toLowerCase();
        const { error } = await admin.from("crm_access_requests").upsert({
          user_id: signedIn.id,
          email,
          full_name: fullName,
          avatar_url: signedIn.user_metadata?.avatar_url || null,
          phone, designation, department, employee_id: employeeId || null,
          employee_note: employeeNote || null,
          status: "pending",
          reviewed_by: null, reviewed_at: null, review_note: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
        if (error) throw error;
        return json({ success: true, status: "pending", email });
      }
      const email = signedIn.email.trim().toLowerCase();
      // Do not reset an HR-approved/rejected request to pending on every login.
      const { data: existingRequest, error: lookupError } = await admin.from("crm_access_requests")
        .select("status").eq("user_id", signedIn.id).maybeSingle();
      if (lookupError) throw lookupError;
      const status = existingRequest?.status ?? "pending";
      const { error } = await admin.from("crm_access_requests").upsert({
        user_id: signedIn.id,
        email,
        full_name: signedIn.user_metadata?.full_name || signedIn.user_metadata?.name || email.split("@")[0],
        avatar_url: signedIn.user_metadata?.avatar_url || null,
        status,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      return json({ success: true, status, email });
    }
    if (String(body.action ?? "") === "prepare-email-login") {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
        return json({ error: "Enter a valid registered email address." }, 400);
      }
      const adminLookup = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
      const { data: member, error: memberError } = await adminLookup.from("crm_team_members")
        .select("id,auth_user_id,status,email").ilike("email", email).maybeSingle();
      if (memberError) throw memberError;
      if (!member || member.status !== "active" || !member.auth_user_id || !member.email) {
        return json({ error: "This email is not linked to an active employee account. Please ask HR to verify your registered email." }, 404);
      }
      const { error: syncError } = await adminLookup.auth.admin.updateUserById(member.auth_user_id, {
        email: member.email.trim().toLowerCase(),
        email_confirm: true,
      });
      if (syncError) throw syncError;
      return json({ success: true, email: member.email.trim().toLowerCase() });
    }
    if (String(body.action ?? "") === "login") {
      const identifier = String(body.login_id ?? "").trim();
      if (!identifier) return json({ error: "Enter Employee ID or registered email" }, 400);
      const adminLookup = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
      const lookup = adminLookup.from("crm_team_members")
        .select("login_id,auth_user_id,status,email");
      const { data: member, error: memberError } = identifier.includes("@")
        ? await lookup.ilike("email", identifier).maybeSingle()
        : await lookup.ilike("login_id", identifier).maybeSingle();
      if (memberError) throw memberError;
      if (!member || member.status !== "active" || !member.auth_user_id || !member.login_id) {
        return json({ error: "Employee account not found or inactive. Check the registered email or Employee ID with HR." }, 404);
      }
      const email = syntheticEmail(member.login_id);
      const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: anon },
        body: JSON.stringify({ email, password: String(body.password ?? "") }),
      });
      const result = await response.json();
      if (!response.ok || !result.access_token || result.user?.id !== member.auth_user_id) {
        return json({ error: "Invalid Employee ID/email or password" }, 401);
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
    const crmAdminEmails = new Set(["crazyseoteam@gmail.com", "saurabhanandshahisarmera@gmail.com", "saurabhanandcontentwriter@gmail.com", "sauravanand499@gmail.com"]);
    const isCrmAdmin = crmAdminEmails.has((userData.user.email ?? "").trim().toLowerCase());
    if (!isCrmAdmin && !roleRows?.some((r) => r.role === "admin")) return json({ error: "Admin permission required" }, 403);

    const action = String(body.action ?? "");
    const memberId = body.member_id ? String(body.member_id) : null;
    if (action === "link-existing") {
      if (!memberId) return json({ error: "Employee record is required" }, 400);
      const { data: member, error: memberError } = await admin.from("crm_team_members")
        .select("id,login_id,auth_user_id,name,position").eq("id", memberId).single();
      if (memberError) throw memberError;
      if (member.auth_user_id) return json({ success: true, auth_user_id: member.auth_user_id });
      if (!member.login_id) return json({ error: "Employee ID is missing. Create an Employee Login first." }, 409);
      const email = syntheticEmail(member.login_id);
      let found: { id: string } | null = null;
      for (let page = 1; page <= 20 && !found; page += 1) {
        const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (listError) throw listError;
        const match = usersPage.users.find((u) => (u.email ?? "").toLowerCase() === email);
        if (match) found = { id: match.id };
        if (usersPage.users.length < 1000) break;
      }
      if (!found) return json({ error: "No Supabase login account exists for this Employee ID. Open Employee Login and create/reset the employee login first." }, 404);
      const { error: roleError } = await admin.from("user_roles")
        .upsert({ user_id: found.id, role: "crm_team" }, { onConflict: "user_id,role", ignoreDuplicates: true });
      if (roleError) throw roleError;
      const { error: memberUpdateError } = await admin.from("crm_team_members")
        .update({ auth_user_id: found.id }).eq("id", memberId);
      if (memberUpdateError) throw memberUpdateError;
      const { error: profileError } = await admin.from("crm_employee_profiles").upsert({
        user_id: found.id,
        designation: member.position || "Employee",
        department: "CRM",
      }, { onConflict: "user_id", ignoreDuplicates: true });
      if (profileError) throw profileError;
      return json({ success: true, auth_user_id: found.id });
    }
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

      // Recover safely when a previous create attempt made the Auth user but
      // failed before the CRM member/profile rows were saved.
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { employee_id: loginId, name: body.name },
      });
      if (!createError && created.user) {
        authUserId = created.user.id;
      } else {
        let existingUser: { id: string } | null = null;
        for (let page = 1; page <= 20 && !existingUser; page += 1) {
          const { data: usersPage, error: listError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
          if (listError) throw listError;
          const match = usersPage.users.find((user) => (user.email ?? "").toLowerCase() === email);
          if (match) existingUser = { id: match.id };
          if (usersPage.users.length < 1000) break;
        }
        if (!existingUser) throw createError;
        const { error: resetError } = await admin.auth.admin.updateUserById(existingUser.id, {
          password,
          email,
          email_confirm: true,
          user_metadata: { employee_id: loginId, name: body.name },
        });
        if (resetError) throw resetError;
        authUserId = existingUser.id;
      }
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
    let result;
    if (action === "create") {
      const { data: existingMember, error: existingMemberError } = await admin
        .from("crm_team_members").select("id").ilike("login_id", loginId).maybeSingle();
      if (existingMemberError) throw existingMemberError;
      result = existingMember
        ? await admin.from("crm_team_members").update(values).eq("id", existingMember.id).select("id").single()
        : await admin.from("crm_team_members").insert(values).select("id").single();
    } else {
      result = await admin.from("crm_team_members").update(values).eq("id", memberId).select("id").single();
    }
    if (result.error) throw result.error;

    if (action === "create") {
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
    } else {
      const profile = await admin.from("crm_employee_profiles").update({
        designation: values.position,
        updated_at: new Date().toISOString(),
      }).eq("user_id", authUserId);
      if (profile.error) throw profile.error;
    }
    return json({ success: true, member_id: result.data.id, auth_user_id: authUserId });
  } catch (error) {
    console.error("crm-team-auth error", error);
    return json({ error: error instanceof Error ? error.message : "Employee account operation failed" }, 400);
  }
});
