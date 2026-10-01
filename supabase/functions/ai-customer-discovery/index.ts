import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const headers = { ...corsHeaders, "Content-Type": "application/json" };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });

const SYSTEM = `You are the AI Customer Discovery engine for Crazy SEO Team.
Turn a website, offer, target market, location and business goal into a practical customer map.
Use only the supplied facts plus clearly labelled strategic inference. Do not invent company facts, traffic numbers, search volumes, rankings or competitor data.
Return ONLY valid JSON with this exact shape:
{
  "personas":[{"name":"","description":"","pain_points":[],"buying_triggers":[]}],
  "search_intent":[{"intent":"","example_queries":[],"why_it_matters":""}],
  "keywords":[{"keyword":"","intent":"","priority":"High|Medium|Low"}],
  "channels":[{"channel":"","reason":"","content_angle":""}],
  "growth_opportunities":[{"opportunity":"","action":"","expected_signal":""}],
  "summary":""
}
Create 3 concise personas, 5 intent groups, 10 keyword ideas, 5 channels and 5 growth opportunities.`;

function extractJson(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI returned an invalid customer map");
  return JSON.parse(cleaned.slice(start, end + 1));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admin access required" }, 403);

    const body = await req.json().catch(() => ({}));
    const website = String(body.website ?? "").trim().slice(0, 500);
    const offer = String(body.offer ?? "").trim().slice(0, 1000);
    const targetMarket = String(body.target_market ?? "").trim().slice(0, 500);
    const location = String(body.location ?? "").trim().slice(0, 300);
    const goal = String(body.goal ?? "").trim().slice(0, 500);
    if (!website || !offer || !targetMarket) return json({ error: "Website, offer and target market are required." }, 400);

    const admin = createClient(url, service);
    let used = 0;
    try {
      const { data: credit, error: creditError } = await admin.rpc("consume_ai_customer_discovery_credit", { p_user_id: user.id });
      if (creditError) throw creditError;
      used = Number(credit);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "No free runs remaining." }, 429);
    }

    try {
      const rollback = async () => { await admin.from("ai_customer_discovery_usage").update({ usage_count: Math.max(0, used - 1), updated_at: new Date().toISOString() }).eq("user_id", user.id); };
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) { await rollback(); return json({ error: "AI is not configured. Add LOVABLE_API_KEY to Supabase Edge Function secrets." }, 500); }
      const prompt = `Website: ${website}
Offer / products / services: ${offer}
Target market: ${targetMarket}
Location: ${location || "Not specified"}
Goal: ${goal || "Generate qualified demand"}`;

      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });
      if (!resp.ok) { const detail = await resp.text(); if (resp.status === 429) { await rollback(); return json({ error: "AI rate limit — try again shortly." }, 429); } if (resp.status === 402) { await rollback(); return json({ error: "AI credits exhausted." }, 402); } throw new Error(`AI gateway error (${resp.status}): ${detail.slice(0, 300)}`); }
      const data = await resp.json();
      const result = extractJson(String(data?.choices?.[0]?.message?.content ?? ""));
      const { error: saveError } = await admin.from("ai_customer_discovery_runs").insert({
        user_id: user.id, website, offer, target_market: targetMarket, location: location || null, goal: goal || null, result,
      });
      if (saveError) throw saveError;

      return json({ ok: true, used, remaining: Math.max(0, 3 - used), result });
    } catch (e) {
      await rollback();
      return json({ error: e instanceof Error ? e.message : "Could not generate customer discovery." }, 500);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
