import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};
const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: cors });
const fail = (message: string, status = 400) => ok({ error: message }, status);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return fail("Supabase server configuration is missing.", 500);

    const admin = createClient(url, key);
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return fail("Authentication required.", 401);

    const { data: { user: actor } } = await admin.auth.getUser(token);
    if (!actor) return fail("Authentication required.", 401);

    const { data: adminEmail, error: adminCheckError } = await admin
      .from("admin_emails").select("email").ilike("email", actor.email ?? "").maybeSingle();
    if (adminCheckError) return fail("Admin check failed: " + adminCheckError.message, 500);
    if (!adminEmail) return fail("Admin access required.", 403);

    let body: any = {};
    try { body = await req.json(); } catch {}

    if (body.action === "list") {
      const { data: profiles, error } = await admin.from("idea_profiles")
        .select("*").order("updated_at", { ascending: false });
      if (error) return fail(error.message, 400);

      const [{ data: posts }, { data: follows }, { data: friends }, { data: badges }, { data: users }] =
        await Promise.all([
          admin.from("idea_posts").select("user_id,created_at"),
          admin.from("idea_follows").select("follower_id,following_id"),
          admin.from("idea_friendships").select("requester_id,addressee_id,status"),
          admin.from("idea_badges").select("user_id,badge_name"),
          admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        ]);

      const byUser = new Map((users?.users ?? []).map((u) => [u.id, u]));
      const out = (profiles ?? []).map((p) => {
        const u = byUser.get(p.user_id);
        const ps = (posts ?? []).filter((x) => x.user_id === p.user_id);
        const fs = (follows ?? []).filter((x) => x.following_id === p.user_id);
        const fg = (follows ?? []).filter((x) => x.follower_id === p.user_id);
        const fr = (friends ?? []).filter(
          (x) => (x.requester_id === p.user_id || x.addressee_id === p.user_id) && x.status === "accepted"
        );
        return {
          ...p,
          email: u?.email ?? "",
          auth_created_at: u?.created_at ?? null,
          last_sign_in_at: u?.last_sign_in_at ?? null,
          post_count: ps.length,
          follower_count: fs.length,
          following_count: fg.length,
          friend_count: fr.length,
          badges: (badges ?? []).filter((b) => b.user_id === p.user_id).map((b) => b.badge_name),
          last_post_at: ps.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0]?.created_at ?? null,
        };
      });
      return ok({ users: out, total: out.length });
    }

    if (body.action === "delete") {
      const id = String(body.user_id ?? "").trim();
      if (!id) return fail("User ID required.");
      if (id === actor.id) return fail("You cannot delete your own admin account.", 400);

      const { data: member } = await admin.from("crm_team_members")
        .select("id").eq("auth_user_id", id).maybeSingle();
      if (member) return fail("This account is linked to a CRM employee. Remove it from Employees first.", 409);

      const cleanup = [
        admin.from("blog_posts").update({ created_by: null }).eq("created_by", id),
        admin.from("classified_listings").update({ user_id: null }).eq("user_id", id),
        admin.from("classified_media").update({ user_id: null }).eq("user_id", id),
        admin.from("crm_schema_records").update({ user_id: null }).eq("user_id", id),
        admin.from("crm_workspace_items").update({ assigned_to: null }).eq("assigned_to", id),
        admin.from("idea_verification_requests").update({ reviewed_by: null }).eq("reviewed_by", id),
      ];
      const results = await Promise.all(cleanup);
      const cleanupError = results.find((r) => r.error)?.error;
      if (cleanupError) return fail("Account cleanup failed: " + cleanupError.message, 500);

      for (const bucket of ["idea-images", "idea-videos", "idea-verification"]) {
        try {
          const { data: files } = await admin.storage.from(bucket).list(id, { limit: 1000, offset: 0 });
          const names = (files ?? []).map((f) => f.name).filter(Boolean);
          if (names.length) {
            await admin.storage.from(bucket).remove(names.map((name) => id + "/" + name));
          }
        } catch (_) {}
      }

      const { error: deleteError } = await admin.auth.admin.deleteUser(id, false);
      if (deleteError) return fail("Account deletion failed: " + deleteError.message, 400);
      return ok({ success: true });
    }

    return fail("Unsupported action.");
  } catch (error) {
    console.error("crm-ideas-users error", error);
    return fail(error instanceof Error ? error.message : "Could not complete request.", 500);
  }
});