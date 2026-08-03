const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// simple in-memory rate limiting per IP
const attempts = new Map<string, { count: number; ts: number }>();

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.ts < 15 * 60 * 1000 && rec.count >= 8) {
    return json({ error: "Too many attempts. Try again later." }, 429);
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  const okId =
    timingSafeEqual(username.toLowerCase(), (Deno.env.get("ADMIN_LOGIN_ID") ?? "").toLowerCase());
  const okPwd = timingSafeEqual(password, Deno.env.get("ADMIN_LOGIN_PASSWORD") ?? "");

  if (!okId || !okPwd) {
    attempts.set(ip, { count: (rec && now - rec.ts < 15 * 60 * 1000 ? rec.count : 0) + 1, ts: now });
    return json({ error: "Invalid Admin ID or password" }, 401);
  }
  attempts.delete(ip);

  const email = Deno.env.get("ADMIN_LOGIN_EMAIL")!;

  const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "magiclink", email }),
  });
  const link = await linkRes.json();
  if (!linkRes.ok || !link.hashed_token) {
    console.log("generate_link fail", linkRes.status, JSON.stringify(link));
    return json({ error: "Login unavailable" }, 500);
  }

  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token_hash: link.hashed_token }),
  });
  const session = await verifyRes.json();
  if (!verifyRes.ok || !session.access_token) {
    console.log("verify fail", verifyRes.status, JSON.stringify(session));
    return json({ error: "Login unavailable" }, 500);
  }

  return json({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
});
