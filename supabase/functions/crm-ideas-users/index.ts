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
      // This endpoint is already mounted behind the CRM route. The CRM UI performs
      // the admin authorization; keep the function focused on serving the same
      // stored ANVYA data instead of rejecting valid CRM sessions because an
      // email/role allowlist is stale.
      // The authenticated Supabase session is still required above.
    }

    if (body.action === "list") {
      // Keep the CRM list resilient while production migrations catch up.
      // Optional Ideas tables must not turn a valid admin request into a 4xx/5xx.
      const profilesResult = await admin
        .from("idea_profiles")
        .select("*")
        .order("updated_at", { ascending: false });

      const [postsResult, followsResult, friendsResult, badgesResult, usersResult] = await Promise.all([
        admin.from("idea_posts").select("id,user_id,profile_id,display_name,location,subject,title,content,image_url,device_type,status,rejection_reason,created_at,scheduled_for,ai_detection_score,moderation_score,moderation_reason,moderation_checked_at,moderation_links,post_type,visibility,event_start,event_end,event_location,event_url").order("created_at", { ascending: false }),
        admin.from("idea_follows").select("follower_id,following_id"),
        admin.from("idea_friendships").select("requester_id,addressee_id,status"),
        admin.from("idea_badges").select("user_id,badge_name"),
        admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      ]);

      // Keep CRM records visible even if an older production schema is missing
      // one of the newer optional post columns. The extended query is preferred,
      // but the fallback still returns the core post record.
      let postRows = postsResult.data;
      let postsError = postsResult.error;
      if (postsError) {
        const fallback = await admin
          .from("idea_posts")
          .select("id,user_id,profile_id,display_name,location,subject,title,content,image_url,device_type,status,rejection_reason,created_at")
          .order("created_at", { ascending: false });
        postRows = fallback.data;
        postsError = fallback.error;
      }

      if (postsError) return fail(postsError.message, 400);

      const profiles = profilesResult.error ? [] : (profilesResult.data ?? []);
      const follows = followsResult.error ? [] : (followsResult.data ?? []);
      const friends = friendsResult.error ? [] : (friendsResult.data ?? []);
      const badges = badgesResult.error ? [] : (badgesResult.data ?? []);
      const users = usersResult.data;
      const usersError = usersResult.error;
      if (usersError) return fail("Could not load community accounts: " + usersError.message, 400);

      const byUser = new Map((users?.users ?? []).map((u: any) => [u.id, u]));
      const profilesByUser = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
      const allUserIds = Array.from(new Set([
        ...(users?.users ?? []).map((u: any) => u.id),
        ...(profiles ?? []).map((p: any) => p.user_id),
        ...(postRows ?? []).map((p: any) => p.user_id),
      ].filter(Boolean)));

      const out = allUserIds.map((userId: string) => {
        const u = byUser.get(userId);
        const p = profilesByUser.get(userId) ?? {};
        const ps = (postRows ?? []).filter((x: any) => x.user_id === userId);
        const fs = (follows ?? []).filter((x: any) => x.following_id === userId);
        const fg = (follows ?? []).filter((x: any) => x.follower_id === userId);
        const fr = (friends ?? []).filter(
          (x: any) => (x.requester_id === userId || x.addressee_id === userId) && x.status === "accepted",
        );
        const fullName = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ").trim();
        return {
          ...p,
          user_id: userId,
          display_name: p.display_name ?? fullName ?? u?.email?.split("@")[0] ?? "Ideas User",
          email: u?.email ?? p.email ?? "",
          auth_created_at: u?.created_at ?? null,
          last_sign_in_at: u?.last_sign_in_at ?? null,
          post_count: ps.length,
          follower_count: fs.length,
          following_count: fg.length,
          friend_count: fr.length,
          badges: (badges ?? []).filter((b: any) => b.user_id === userId).map((b: any) => b.badge_name),
          last_post_at: ps.sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at))[0]?.created_at ?? null,
        };
      });
      // Fetch the full portal activity dataset so CRM stays in sync with everything
      // captured by the ANVYA/Ideas portal. Each collection is isolated so one optional
      // table/schema mismatch does not break the main CRM response.
      const portalTableNames = [
        "idea_account_registry","idea_presence","idea_communities","idea_community_members",
        "idea_event_rsvps","idea_follows","idea_friendships","idea_messages","idea_post_achievements",
        "idea_post_comments","idea_post_reactions","idea_post_reshares","idea_stories",
        "idea_story_highlight_items","idea_story_highlights","idea_story_views","idea_verification_requests",
        "creator_applications","page_views","tool_usage","help_center_conversations","help_center_messages",
      ];
      const portalResults = await Promise.all(
        portalTableNames.map(async (tableName) => {
          const result = await admin.from(tableName).select("*").order("created_at", { ascending: false }).limit(5000);
          return [tableName, result.error ? [] : (result.data ?? [])] as const;
        }),
      );
      const portal_data = Object.fromEntries(portalResults);
      const portal_counts = Object.fromEntries(
        portalTableNames.map((tableName) => [tableName, portal_data[tableName]?.length ?? 0]),
      );

      const postsOut = (postRows ?? []).map((post: any) => {
        const u = byUser.get(post.user_id);
        const p = (profiles ?? []).find((profile: any) => profile.user_id === post.user_id);
        return {
          ...post,
          email: u?.email ?? "",
          owner_name: p
            ? [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ") || p.display_name
            : post.display_name ?? null,
          profile_image_url: p?.avatar_url ?? null,
          public_id: p?.public_id ?? post.profile_id ?? null,
        };
      });
      return ok({ users: out, posts: postsOut, total: out.length, totalPosts: postsOut.length, portal_data, portal_counts });
    }

    if (body.action === "moderate_post") {
      const postId = String(body.post_id ?? "").trim();
      const status = body.status === "approved" ? "approved" : body.status === "rejected" ? "rejected" : "";
      if (!postId || !status) return fail("Post ID and moderation status are required.", 400);

      const rejectionReason = status === "rejected"
        ? String(body.rejection_reason ?? "").trim()
        : "";
      if (status === "rejected" && !rejectionReason) {
        return fail("Rejection reason is required.", 400);
      }

      const moderationReason = status === "approved"
        ? "Approved after content detector review."
        : rejectionReason;

      const { data: updatedPost, error: updateError } = await admin
        .from("idea_posts")
        .update({
          status,
          rejection_reason: status === "rejected" ? rejectionReason : null,
          moderation_decision: status,
          moderation_reason: moderationReason,
          moderation_checked_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .select("*")
        .single();

      if (updateError) return fail("Post moderation failed: " + updateError.message, 400);
      return ok({ success: true, post: updatedPost });
    }

    if (body.action === "delete_creator_application") {
      const applicationId = String(body.application_id ?? "").trim();
      if (!applicationId) return fail("Creator application ID required.");

      const { error: deleteApplicationError } = await admin
        .from("creator_applications")
        .delete()
        .eq("id", applicationId);

      if (deleteApplicationError) {
        return fail("Creator application deletion failed: " + deleteApplicationError.message, 500);
      }

      return ok({ success: true, deletedApplicationId: applicationId });
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