import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.crazyseoteam.in",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID");
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET");
const APP_URL = (Deno.env.get("APP_URL") || "https://www.crazyseoteam.in").replace(/\/$/, "");
const LINKEDIN_VERSION = Deno.env.get("LINKEDIN_VERSION") || "202610";

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = auth.slice(7);
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");
  const { data: role } = await admin.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
  if (!role) throw new Error("Forbidden");
  return data.user;
}

const callbackUrl = () => SUPABASE_URL + "/functions/v1/linkedin-automation";
const liHeaders = (token: string) => ({
  Authorization: "Bearer " + token,
  "Content-Type": "application/json",
  "X-Restli-Protocol-Version": "2.0.0",
  "Linkedin-Version": LINKEDIN_VERSION,
});

async function liError(response: Response) {
  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw);
    return new Error("LinkedIn API " + response.status + ": " + (parsed.message || parsed.error_description || parsed.error || raw));
  } catch {
    return new Error("LinkedIn API " + response.status + ": " + (raw || "Request failed"));
  }
}

async function oauthCallback(req: Request) {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) return new Response("LinkedIn integration is not configured.", { status: 500 });
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (oauthError) {
    const target = new URL(APP_URL + "/admin/linkedin");
    target.searchParams.set("linkedin", "error");
    target.searchParams.set("message", errorDescription || oauthError);
    return Response.redirect(target.toString(), 303);
  }
  if (!code || !state) return new Response("Missing LinkedIn authorization code or state.", { status: 400 });

  const { data: stateRow } = await admin.from("linkedin_oauth_states").select("state,user_id,expires_at").eq("state", state).maybeSingle();
  if (!stateRow || new Date(stateRow.expires_at).getTime() <= Date.now()) return new Response("Invalid or expired LinkedIn OAuth state.", { status: 400 });
  await admin.from("linkedin_oauth_states").delete().eq("state", state);

  const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: callbackUrl(),
    }),
  });
  if (!tokenResponse.ok) {
    const error = await liError(tokenResponse);
    const target = new URL(APP_URL + "/admin/linkedin");
    target.searchParams.set("linkedin", "error");
    target.searchParams.set("message", error.message);
    return Response.redirect(target.toString(), 303);
  }

  const token = await tokenResponse.json();
  const accessToken = token.access_token as string;
  if (!accessToken) throw new Error("LinkedIn did not return an access token.");

  const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: "Bearer " + accessToken } });
  if (!profileResponse.ok) {
    const error = await liError(profileResponse);
    const target = new URL(APP_URL + "/admin/linkedin");
    target.searchParams.set("linkedin", "error");
    target.searchParams.set("message", error.message);
    return Response.redirect(target.toString(), 303);
  }

  const profile = await profileResponse.json();
  const expiresAt = token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000).toISOString() : null;
  const { error: saveError } = await admin.from("linkedin_connections").upsert({
    id: "primary",
    user_id: stateRow.user_id,
    member_sub: profile.sub,
    member_urn: "urn:li:person:" + profile.sub,
    name: profile.name ?? null,
    email: profile.email ?? null,
    picture: profile.picture ?? null,
    access_token: accessToken,
    expires_at: expiresAt,
  });
  if (saveError) throw new Error("Could not save LinkedIn connection: " + saveError.message);

  const target = new URL(APP_URL + "/admin/linkedin");
  target.searchParams.set("linkedin", "connected");
  return Response.redirect(target.toString(), 303);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method === "GET") return await oauthCallback(req);
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) throw new Error("LinkedIn integration is not configured. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in Supabase secrets.");

    const user = await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "connect") {
      const state = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await admin.from("linkedin_oauth_states").delete().lt("expires_at", new Date().toISOString());
      const { error } = await admin.from("linkedin_oauth_states").insert({ state, user_id: user.id, expires_at: expiresAt });
      if (error) throw new Error("Could not start LinkedIn connection: " + error.message);

      const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", LINKEDIN_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", callbackUrl());
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("scope", "openid profile email w_member_social");
      return json({ authUrl: authUrl.toString() });
    }

    const { data: connection } = await admin.from("linkedin_connections")
      .select("id,user_id,member_urn,name,email,picture,access_token,expires_at")
      .eq("id", "primary").maybeSingle();

    if (action === "status") {
      if (!connection || connection.user_id !== user.id) return json({ connected: false, profile: null });
      return json({ connected: true, profile: {
        name: connection.name, email: connection.email, picture: connection.picture,
        memberUrn: connection.member_urn, expiresAt: connection.expires_at,
      }});
    }

    if (!connection || connection.user_id !== user.id) throw new Error("Connect your LinkedIn account first.");
    if (connection.expires_at && new Date(connection.expires_at).getTime() <= Date.now()) throw new Error("LinkedIn authorization has expired. Click Connect my LinkedIn and authorize again.");

    if (action === "disconnect") {
      const { error } = await admin.from("linkedin_connections").delete().eq("id", "primary");
      if (error) throw new Error("Could not disconnect LinkedIn: " + error.message);
      return json({ ok: true });
    }

    if (action === "post") {
      const text = String(body.text || "").trim();
      if (!text) throw new Error("Post text is required.");
      if (text.length > 3000) throw new Error("LinkedIn post is limited to 3000 characters.");
      const response = await fetch("https://api.linkedin.com/rest/posts", {
        method: "POST",
        headers: liHeaders(connection.access_token),
        body: JSON.stringify({
          author: connection.member_urn, commentary: text, visibility: "PUBLIC",
          distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
          lifecycleState: "PUBLISHED", isReshareDisabledByAuthor: false,
        }),
      });
      if (!response.ok) throw await liError(response);
      return json({ ok: true, postUrn: response.headers.get("x-restli-id") });
    }

    if (action === "comment") {
      const postUrn = String(body.postUrn || "").trim();
      const text = String(body.text || "").trim();
      if (!postUrn || !text) throw new Error("Post URN and comment are required.");
      if (!/^urn:li:(share|ugcPost):[A-Za-z0-9_:-]+$/.test(postUrn)) throw new Error("Enter a valid LinkedIn share or ugcPost URN.");

      const response = await fetch("https://api.linkedin.com/rest/socialActions/" + encodeURIComponent(postUrn) + "/comments", {
        method: "POST",
        headers: liHeaders(connection.access_token),
        body: JSON.stringify({ actor: connection.member_urn, object: postUrn, message: { text } }),
      });
      if (!response.ok) throw await liError(response);
      return json({ ok: true, commentId: response.headers.get("x-restli-id") });
    }

    throw new Error("Unsupported LinkedIn action.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "LinkedIn automation failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return json({ error: message }, status);
  }
});
