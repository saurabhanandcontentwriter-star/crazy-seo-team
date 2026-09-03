import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const PROMPTS: Record<string, string> = {
  score:
    "Score this sales lead from 0-100 for likelihood to convert into a paying SEO/AI marketing client. Reply with ONLY a JSON object: {\"score\": <number>, \"reason\": \"<one sentence>\"}",
  summary:
    "Write a crisp 3-4 bullet summary of this lead for a sales rep: who they are, what they want, buying signals, and risk. Markdown bullets only.",
  followup_message:
    "Write a short, friendly WhatsApp/SMS follow-up message (max 60 words) for this lead from the Crazy SEO Team sales rep. No placeholders like [Name] — use the real name.",
  sales_email:
    "Write a professional sales email for this lead. Return markdown with a 'Subject:' line, then the body (max 180 words), signed 'Crazy SEO Team'. Personalised to their service interest and city.",
  intent:
    "Detect the customer intent for this lead. Reply in markdown with: **Intent**, **Urgency** (High/Medium/Low), **Budget signal**, and one line of reasoning.",
  next_best_action:
    "Suggest the next best action for this lead as a sales rep. Return 3 numbered concrete actions with timing (e.g. 'Call today 6pm'). Max 90 words.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    // ---- auth: admins only
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    const instruction = PROMPTS[action];
    if (!instruction) return json({ error: "Unknown action" }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI is not configured" }, 500);

    const payload = JSON.stringify({ lead: body.lead ?? {}, recent_activities: body.activities ?? [] }).slice(0, 8000);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are the CRM sales intelligence engine for Crazy SEO Team, an AI SEO & digital growth agency in India. Be concrete, never invent facts not present in the lead data.",
          },
          { role: "user", content: `${instruction}\n\nLead data:\n${payload}` },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("gateway error", resp.status, t);
      if (resp.status === 429) return json({ error: "Rate limit — try again shortly." }, 429);
      if (resp.status === 402) return json({ error: "AI credits exhausted." }, 402);
      return json({ error: "AI gateway error", details: t }, resp.status);
    }

    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";

    if (action === "score") {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          return json({ score: Math.max(0, Math.min(100, Number(parsed.score) || 0)), text: parsed.reason ?? "" });
        } catch { /* fall through */ }
      }
      const n = Number(text.match(/\d{1,3}/)?.[0] ?? 0);
      return json({ score: Math.max(0, Math.min(100, n)), text });
    }

    return json({ text });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});
