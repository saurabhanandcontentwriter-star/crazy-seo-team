// Auto-optimize a draft post for LLM/Google SEO using Lovable AI.
// Returns improved title/meta/keyword/alt + (optionally) rewritten HTML content.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You are an elite SEO + GEO (Generative Engine Optimization) editor for "Crazy SEO Team".
Optimize a blog draft for both Google ranking AND retrieval by AI search (ChatGPT, Gemini, Perplexity, AI Overviews).
Rules:
- Meta title 50–60 chars, includes the primary keyword near the start.
- Meta description 140–160 chars, action-oriented, contains keyword.
- Choose ONE concise primary keyword (2–4 words) if missing.
- Hero image alt: 8–125 chars, descriptive, naturally contains the keyword once.
- Card description: 1 crisp sentence, ≤ 200 chars.
- Rewrite the body as clean semantic HTML. Use <h2>/<h3>, <p>, <ul><li>, <strong>, <a href>.
  Add a short FAQ <h2>Frequently Asked Questions</h2> with 3 Q/A pairs (use <h3> for questions) if missing.
  Keep total length 900–1500 words. Do NOT include <h1> (the page renders the title separately).
- Tone: confident, practical, 2026 trends, zero fluff.
Return ONLY via the tool call.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const { title = "", description = "", content = "", keyword = "", tag = "SEO", rewriteBody = true } = body || {};
    if (!title.trim() && !content.trim()) {
      return new Response(JSON.stringify({ error: "Need at least a title or content" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userPrompt = `Title: ${title}\nCurrent description: ${description}\nCurrent target keyword: ${keyword}\nTag: ${tag}\nRewrite body? ${rewriteBody ? "yes" : "no"}\n\n--- CURRENT BODY (HTML or Markdown) ---\n${content}\n--- END ---\n\nReturn the optimized fields.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "optimize_post",
            description: "Return the SEO/LLM-optimized post fields",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                meta_title: { type: "string" },
                meta_description: { type: "string" },
                target_keyword: { type: "string" },
                description: { type: "string" },
                hero_image_alt: { type: "string" },
                content_html: { type: "string", description: "Optimized body as semantic HTML (no <h1>, no <html>/<body>)" },
              },
              required: ["meta_title", "meta_description", "target_keyword", "description", "hero_image_alt", "content_html"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "optimize_post" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "AI rate limit exceeded — try again in a minute." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiRes.text();
      console.error("AI error:", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await aiRes.json();
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc?.function?.arguments) return new Response(JSON.stringify({ error: "AI returned nothing" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const optimized = JSON.parse(tc.function.arguments);

    return new Response(JSON.stringify({ optimized }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("llm-seo-optimize error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
