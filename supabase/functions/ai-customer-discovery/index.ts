import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
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

function fallbackDiscovery(input: { website: string; offer: string; targetMarket: string; location: string; goal: string }) {
  const offer = input.offer || "products and services";
  const market = input.targetMarket || "potential customers";
  const location = input.location || "the target market";
  const goal = input.goal || "qualified leads";
  const keywords = [
    offer + " for " + market,
    "best " + offer + " in " + location,
    offer + " near me",
    market + " " + offer,
    offer + " services " + location,
    offer + " pricing",
    offer + " company",
    "hire " + offer,
    offer + " reviews",
    offer + " solutions",
  ];
  return {
    personas: [
      { name: market + " Decision Maker", description: "Decision makers evaluating " + offer + ".", pain_points: ["Finding a trustworthy provider", "Comparing options", "Proving value"], buying_triggers: ["Clear ROI", "Case studies", "Fast response"] },
      { name: "Research-First Buyer", description: "Prospects researching " + offer + " before contacting a provider.", pain_points: ["Too many options", "Unclear pricing", "Low trust"], buying_triggers: ["Useful guides", "Transparent packages", "Reviews"] },
      { name: "Growth-Focused Prospect", description: "Customers seeking " + offer + " to achieve " + goal + ".", pain_points: ["Limited resources", "Need measurable outcomes", "Unclear next steps"], buying_triggers: ["Actionable strategy", "Simple onboarding", "Milestones"] },
    ],
    search_intent: [
      { intent: "Problem discovery", example_queries: ["how to improve " + offer, "need " + offer, offer + " problems"], why_it_matters: "Captures prospects before provider selection." },
      { intent: "Commercial research", example_queries: ["best " + offer, offer + " companies", offer + " providers"], why_it_matters: "Reaches prospects comparing solutions." },
      { intent: "Local intent", example_queries: [offer + " in " + location, offer + " near me", offer + " " + location], why_it_matters: "Captures location-specific demand." },
      { intent: "Transactional", example_queries: ["hire " + offer, offer + " pricing, buy " + offer], why_it_matters: "Targets users closer to conversion." },
      { intent: "Trust and proof", example_queries: [offer + " reviews", offer + " case studies", offer + " results"], why_it_matters: "Addresses objections before contact." },
    ],
    keywords: keywords.map((keyword, i) => ({ keyword, intent: i < 4 ? "Commercial" : i < 7 ? "Local / Commercial" : "Transactional", priority: i < 5 ? "High" : i < 8 ? "Medium" : "Low" })),
    channels: [
      { channel: "Google Search / SEO", reason: "Capture existing demand around " + offer + ".", content_angle: "High-intent service and comparison pages." },
      { channel: "LinkedIn", reason: "Reach decision makers in " + market + ".", content_angle: "Proof-led posts and case studies." },
      { channel: "Short-form video", reason: "Explain the problem and solution quickly.", content_angle: "FAQs, demos and practical tips." },
      { channel: "Email / CRM", reason: "Nurture prospects who are not ready yet.", content_angle: "Education, proof and clear CTAs." },
      { channel: "Retargeting", reason: "Re-engage high-intent visitors.", content_angle: "Objection handling and testimonials." },
    ],
    growth_opportunities: [
      { opportunity: "Build intent-led landing pages", action: "Create dedicated pages around the highest-value searches.", expected_signal: "More qualified visits and enquiries." },
      { opportunity: "Strengthen conversion proof", action: "Add case studies, outcomes and trust signals.", expected_signal: "Higher lead conversion." },
      { opportunity: "Create a comparison content cluster", action: "Answer which solution fits different customer situations.", expected_signal: "More commercial-intent traffic." },
      { opportunity: "Add intent-based lead capture", action: "Tailor CTAs for research, commercial and transactional visitors.", expected_signal: "Better lead quality." },
      { opportunity: "Retarget engaged visitors", action: "Use proof-led follow-up for high-intent audiences.", expected_signal: "More returning visitors and assisted conversions." },
    ],
    summary: "For " + input.website + ", align " + offer + " messaging with " + market + " in " + location + ". Prioritise intent-led pages, proof and lead nurturing toward " + goal + ". Validate the baseline with Search Console, keyword research and CRM conversion data.",
  };
}

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
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, service);
    const { data: userData } = await userClient.auth.getUser(auth.replace(/^Bearer\s+/i, ""));
    const user = userData.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (roleError) return json({ error: "Could not verify admin access." }, 500);
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
    const rollback = async () => {
      if (used <= 0) return;
      await admin.from("ai_customer_discovery_usage")
        .update({ usage_count: Math.max(0, used - 1), updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    };
    try {
      const { data: credit, error: creditError } = await admin.rpc("consume_ai_customer_discovery_credit", { p_user_id: user.id });
      if (creditError) throw creditError;
      used = Number(credit);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "No free runs remaining." }, 429);
    }

    try {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) {
        const result = fallbackDiscovery({ website, offer, targetMarket, location, goal });
        const { error: saveError } = await admin.from("ai_customer_discovery_runs").insert({
          user_id: user.id, website, offer, target_market: targetMarket, location: location || null, goal: goal || null, result,
        });
        if (saveError) throw saveError;
        return json({ ok: true, used, remaining: Math.max(0, 3 - used), fallback: true, result });
      }
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
