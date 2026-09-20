import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};
const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: cors });
const fail = (message: string, status = 400) => ok({ error: message }, status);

async function removeUserStorage(admin: any, bucket: string, userId: string) {
  const paths: string[] = [];
  const walk = async (prefix: string) => {
    const { data, error } = await admin.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`Storage cleanup failed for ${bucket}: ${error.message}`);
    for (const item of data ?? []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) paths.push(path);
      else await walk(path);
    }
  };
  await walk(userId);
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await admin.storage.from(bucket).remove(paths.slice(i, i + 100));
    if (error) throw new Error(`Storage cleanup failed for ${bucket}: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return fail("Supabase server configuration is missing.", 500);

    const admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return fail("Authentication required.", 401);

    const { data: { user: actor }, error: actorError } = await admin.auth.getUser(token);
    if (actorError || !actor) return fail("Authentication required.", 401);

    let body: any = {};
    try { body = await req.json(); } catch {}

    const selfDelete = body.action === "delete_self";

    if (!selfDelete) {
      const { data: adminEmail, error: adminCheckError } = await admin
        .from("admin_emails")
        .select("email")
        .ilike("email", actor.email ?? "")
        .maybeSingle();

      if (adminCheckError) return fail("Admin check failed: " + adminCheckError.message, 500);
      if (!adminEmail) return fail("Admin access required.", 403);
    }

    if (body.action === "list") {
      const { data: profiles, error } = await admin
        .from("idea_profiles")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) return fail(error.message, 400);

      const [{ data: posts }, { data: follows }, { data: friends }, { data: badges }, { data: users }] =
        await Promise.all([
          admin.from("idea_posts").select("user_id,created_at"),
          admin.from("idea_follows").select("follower_id,following_id"),
          admin.from("idea_friendships").select("requester_id,addressee_id,status"),
          admin.from("idea_badges").select("user_id,badge_name"),
          admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        ]);

      const byUser = new Map((users?.users ?? []).map((u: any) => [u.id, u]));
      const out = (profiles ?? []).map((p: any) => {
        const u = byUser.get(p.user_id);
        const ps = (posts ?? []).filter((x: any) => x.user_id === p.user_id);
        const fs = (follows ?? []).filter((x: any) => x.following_id === p.user_id);
        const fg = (follows ?? []).filter((x: any) => x.follower_id === p.user_id);
        const fr = (friends ?? []).filter(
          (x: any) => (x.requester_id === p.user_id || x.addressee_id === p.user_id) && x.status === "accepted",
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
          badges: (badges ?? []).filter((b: any) => b.user_id === p.user_id).map((b: any) => b.badge_name),
          last_post_at: ps.sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at))[0]?.created_at ?? null,
        };
      });
      return ok({ users: out, total: out.length });
    }

    if (body.action === "delete" || selfDelete) {
      const id = selfDelete ? actor.id : String(body.user_id ?? "").trim();
      if (!id) return fail("User ID required.");
      if (!selfDelete && id === actor.id) return fail("You cannot delete your own admin account.", 400);

      // Remove CRM membership instead of blocking deletion. This is what makes the
      // same account disappear from both Ideas and the CRM.
      // Clear CRM references first so the team-member row can be removed safely.
      const crmCleanup = [
        admin.from("crm_activities").update({ team_member_id: null }).eq("team_member_id", id),
        admin.from("crm_followups").update({ team_member_id: null }).eq("team_member_id", id),
        admin.from("leads").update({ assigned_to: null }).eq("assigned_to", id),
      ];
      const crmResults = await Promise.all(crmCleanup);
      const crmError = crmResults.find((r: any) => r.error)?.error;
      if (crmError) return fail("CRM cleanup failed: " + crmError.message, 500);

      const { error: teamDeleteError } = await admin
        .from("crm_team_members")
        .delete()
        .eq("auth_user_id", id);
      if (teamDeleteError) return fail("CRM membership deletion failed: " + teamDeleteError.message, 500);

      // Clear nullable references that should remain in history.
      const cleanup = [
        admin.from("blog_posts").update({ created_by: null }).eq("created_by", id),
        admin.from("classified_listings").update({ user_id: null }).eq("user_id", id),
        admin.from("classified_media").update({ user_id: null }).eq("user_id", id),
        admin.from("crm_leave_requests").update({ reviewed_by: null }).eq("reviewed_by", id),
        admin.from("crm_schema_records").update({ user_id: null }).eq("user_id", id),
        admin.from("crm_workspace_items").update({ assigned_to: null }).eq("assigned_to", id),
        admin.from("idea_verification_requests").update({ reviewed_by: null }).eq("reviewed_by", id),
      ];
      const results = await Promise.all(cleanup);
      const cleanupError = results.find((r: any) => r.error)?.error;
      if (cleanupError) return fail("Account cleanup failed: " + cleanupError.message, 500);

      // Delete every object below the user's folder, including nested folders.
      for (const bucket of ["idea-images", "idea-videos", "idea-verification"]) {
        await removeUserStorage(admin, bucket, id);
      }

      // Permanent Auth deletion. Cascading Ideas tables are removed by their FKs.
      const { error: deleteError } = await admin.auth.admin.deleteUser(id, false);
      if (deleteError) return fail("Account deletion failed: " + deleteError.message, 400);

      return ok({ success: true, permanentlyDeleted: true, deletedUserId: id });
    }

    return fail("Unsupported action.");
  } catch (error) {
    console.error("crm-ideas-users error", error);
    return fail(error instanceof Error ? error.message : "Could not complete request.", 500);
  }
});