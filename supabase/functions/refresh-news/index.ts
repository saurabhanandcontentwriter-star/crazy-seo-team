import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "SEO",
  "AI SEO",
  "Technical SEO",
  "Google Updates",
  "ChatGPT SEO",
  "AI Tools",
  "Digital Marketing",
  "AI Automation",
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const today = new Date().toISOString().slice(0, 10);
    const prompt = `You are a senior SEO & AI search news editor. Generate exactly 5 fresh, realistic, factual-sounding news briefs for ${today} covering SEO, AI search (ChatGPT/Gemini/Claude/Perplexity), Google updates, AI tools and digital marketing automation.

Return ONLY a valid JSON array (no markdown, no prose) with this shape:
[
  {
    "title": "short news headline, 60-90 chars",
    "summary": "1-2 sentence summary, 140-200 chars",
    "content": "3-5 paragraph article body in plain text",
    "category": "one of: ${CATEGORIES.join(", ")}",
    "source": "plausible publisher name e.g. 'Search Engine Land', 'The Verge', 'Google Blog'"
  }
]

Diversify categories across the 5 items. Today's date is ${today}.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You output only valid JSON arrays." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(`AI gateway ${aiRes.status}: ${t}`);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson.choices?.[0]?.message?.content ?? "[]";
    let items: any[] = [];
    try {
      const parsed = JSON.parse(raw);
      items = Array.isArray(parsed) ? parsed : parsed.articles ?? parsed.news ?? parsed.data ?? [];
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) items = JSON.parse(match[0]);
    }

    items = items.slice(0, 5).filter((i) => i?.title && i?.summary);
    if (!items.length) throw new Error("AI returned no usable items");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    await supabase.from("news_articles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const rows = items.map((i, idx) => {
      const cat = CATEGORIES.includes(i.category) ? i.category : "SEO";
      const baseSlug = slugify(i.title) || `news-${Date.now()}-${idx}`;
      return {
        slug: `${baseSlug}-${Date.now().toString(36)}-${idx}`,
        title: String(i.title).slice(0, 200),
        summary: String(i.summary).slice(0, 400),
        content: String(i.content ?? i.summary).slice(0, 6000),
        category: cat,
        source: i.source ? String(i.source).slice(0, 100) : null,
        image_url: null,
        published_at: new Date(Date.now() - idx * 60_000).toISOString(),
      };
    });

    const { error } = await supabase.from("news_articles").insert(rows);
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, inserted: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("refresh-news error", e);
    return new Response(
      JSON.stringify({ success: false, error: String(e?.message ?? e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
