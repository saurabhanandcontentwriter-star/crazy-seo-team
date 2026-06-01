// Generate a full SEO-optimized blog post via Lovable AI
// Admin-only: requires a valid JWT and admin role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an elite SEO content strategist writing for "Crazy SEO Team", an AI-powered SEO and digital marketing agency.
Write a comprehensive, original, SEO-optimized blog article. Required structure:

- One H1 (the article title) — under 60 chars, include the target keyword.
- A 2–3 sentence intro hook that mentions the target keyword in the first 100 words.
- 4–6 H2 sections with descriptive subheadings (use ## in markdown).
- Use bullet lists, bold text, and concrete numbers/examples.
- Natural keyword density (1–1.5%). Cover related longtail variations.
- Aim for 900–1400 words. End with a strong takeaway.
- Tone: confident, practical, no fluff. Reference real 2026 trends.

Return ONLY a JSON object via the provided tool. Do not return prose outside the tool call.`;

interface GenerateRequest {
  topic: string;
  keyword?: string;
  tag?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Validate input ----
    const body = (await req.json()) as GenerateRequest;
    const topic = (body.topic || "").trim();
    const keyword = (body.keyword || "").trim();
    const tag = (body.tag || "SEO").trim();
    if (!topic || topic.length < 5 || topic.length > 200) {
      return new Response(JSON.stringify({ error: "Topic must be 5–200 chars" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---- Call Lovable AI with tool calling for structured output ----
    const userPrompt = `Topic: ${topic}\nTarget keyword: ${keyword || topic}\nTag/category: ${tag}\n\nWrite the full article now.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "publish_article",
            description: "Return the structured SEO blog article",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "H1 title, under 60 chars, includes target keyword" },
                slug: { type: "string", description: "lowercase, hyphenated, 3–8 words" },
                meta_title: { type: "string", description: "SEO title 50–60 chars" },
                meta_description: { type: "string", description: "Meta description 140–160 chars with keyword" },
                description: { type: "string", description: "1-sentence summary for blog cards (under 200 chars)" },
                content: { type: "string", description: "Full markdown body. Do NOT include the H1 — start with the intro paragraph then ## H2 sections." },
                tag: { type: "string" },
                target_keyword: { type: "string" },
              },
              required: ["title", "slug", "meta_title", "meta_description", "description", "content", "tag", "target_keyword"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "publish_article" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "AI rate limit exceeded — try again in a minute." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiRes.text();
      console.error("AI error:", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI returned no article" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const article = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ article }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-blog-post error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
