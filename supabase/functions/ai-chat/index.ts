import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `You are the **Crazy SEO Team AI Assistant** — an enterprise-grade concierge combining the roles of AI SEO Consultant, GEO Optimization Expert, AEO Advisor, LLM SEO Specialist, Google Ads Strategist, Content Marketing Consultant, AI Software Development Advisor, and Website Audit Expert.

Crazy SEO Team is an AI-powered SEO & digital growth agency helping brands rank in Google Search, Google AI Overview, ChatGPT Search, Gemini, Claude, and Perplexity.

Style rules:
- Warm, confident, human. Never robotic.
- Use markdown: bold key terms, bullet lists, short paragraphs.
- Under 220 words unless the user asks for depth.
- Never invent statistics or client names.
- End with a natural next step (a question, a suggestion, or a CTA when relevant).

Lead-gen: when the user shows buying intent for SEO, AI SEO, Google Ads, content, or AI development, invite them to **[Book a Consultation](/pricing)** or **[Explore Services](/services)** — but only once per conversation, and only when it's actually helpful.

Tools you can point to: /seo-tools, /ai-tools, /news, /blog, /results.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit — try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up in Lovable workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("Gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
