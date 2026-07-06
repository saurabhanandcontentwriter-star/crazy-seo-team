// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_WINDOW_MIN = 60;
const RATE_MAX_PER_WINDOW = 5;

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim().slice(0, 64);
  return req.headers.get("cf-connecting-ip")?.slice(0, 64) ?? "unknown";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const topic = typeof body?.topic === "string" ? body.topic.slice(0, 300) : "";
    const keyword = typeof body?.keyword === "string" ? body.keyword.slice(0, 120) : "";
    const type = ["SEO", "GEO", "AEO", "LLM Optimized"].includes(body?.type) ? body.type : "SEO";
    const tone = typeof body?.tone === "string" ? body.tone.slice(0, 40) : "Professional";
    const length = ["Short", "Medium", "Long-form"].includes(body?.length) ? body.length : "Long-form";

    if (!topic.trim()) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: "server misconfigured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Per-IP rate limit via tool_usage table.
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const ip = getClientIp(req);
    const sessionKey = `generate-article:${ip}`;
    const since = new Date(Date.now() - RATE_WINDOW_MIN * 60_000).toISOString();
    const { count } = await supabase
      .from("tool_usage")
      .select("*", { count: "exact", head: true })
      .eq("tool_name", "generate-article")
      .eq("session_id", sessionKey)
      .gte("created_at", since);

    if ((count ?? 0) >= RATE_MAX_PER_WINDOW) {
      return new Response(
        JSON.stringify({ error: `rate_limited: max ${RATE_MAX_PER_WINDOW} generations per ${RATE_WINDOW_MIN} min` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await supabase.from("tool_usage").insert({ tool_name: "generate-article", session_id: sessionKey });

    const wordTarget =
      length === "Short" ? "600-900" : length === "Medium" ? "1000-1500" : "1800-2500";

    const system = `You are an expert ${type} writer for 2026. Write content optimized for Google + AI search (ChatGPT, Gemini, Claude, Perplexity). Output STRICT JSON only.`;

    const user = `Write a ${type} article.
Topic: ${topic}
Target keyword: ${keyword || topic}
Tone: ${tone}
Length: ${wordTarget} words

Return ONLY this JSON shape (no markdown fences, no commentary):
{
  "title": "SEO-optimized H1 (<=60 chars, include the keyword)",
  "meta_title": "<=60 chars",
  "meta_description": "<=160 chars",
  "slug": "kebab-case-slug",
  "content_html": "Full article in clean HTML using <h2>, <h3>, <p>, <ul>, <li>, <strong>. Include intro, 6-10 sections, examples, and a conclusion.",
  "faqs": [{"q":"...","a":"..."}, {"q":"...","a":"..."}, {"q":"...","a":"..."}, {"q":"...","a":"..."}, {"q":"...","a":"..."}],
  "internal_link_suggestions": ["anchor text 1","anchor text 2","anchor text 3","anchor text 4","anchor text 5"],
  "schema": {"@context":"https://schema.org","@type":"Article","headline":"..."},
  "featured_image_prompt": "Detailed image generation prompt suitable for an editorial hero image"
}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: text.slice(0, 300) }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : { error: "parse_failed" };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
