// @ts-nocheck
// Admin-only: refresh the public news feed. Requires a valid admin JWT.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "SEO", "AI SEO", "Technical SEO", "Google Updates",
  "ChatGPT SEO", "AI Tools", "Digital Marketing", "AI Automation",
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const CATEGORY_IMAGES: Record<string, string> = {
  "SEO": "https://images.unsplash.com/photo-1432888622747-4eb9a8f5a07d?w=1200&q=80&auto=format&fit=crop",
  "AI SEO": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80&auto=format&fit=crop",
  "Technical SEO": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
  "Google Updates": "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1200&q=80&auto=format&fit=crop",
  "ChatGPT SEO": "https://images.unsplash.com/photo-1696446702183-be6f3b1d8c08?w=1200&q=80&auto=format&fit=crop",
  "AI Tools": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80&auto=format&fit=crop",
  "Digital Marketing": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
  "AI Automation": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80&auto=format&fit=crop",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Verify caller and require admin role.
    const authed = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await authed.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", claims.claims.sub)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const prompt = `You are the lead editor of "Crazy SEO Team Newsroom". Produce 5 fresh, long-form news articles for ${today} on SEO, AI search, Google updates, ChatGPT/Gemini/Claude/Perplexity, and digital marketing automation. Each article MUST be 500+ words, structured for Google + AI Overview + LLM ranking.

Return ONLY a valid JSON object with key "articles" — an array of exactly 5 items. Each item:
{
  "title": "<= 70 chars, include focus keyword",
  "meta_title": "<= 60 chars",
  "meta_description": "<= 158 chars, include focus keyword + benefit",
  "focus_keyword": "primary 2-4 word keyword",
  "nlp_keywords": ["8-12 semantic LSI keywords"],
  "category": "one of: ${CATEGORIES.join(", ")}",
  "source": "plausible publisher e.g. 'Search Engine Land', 'Google Blog', 'The Verge'",
  "summary": "180-220 char editorial summary",
  "image_alt": "descriptive alt text, includes focus keyword",
  "reading_minutes": 4,
  "content_html": "Clean HTML 500+ words using <h2>Introduction</h2><p>…</p><h2>Key Updates</h2><ul><li>…</li></ul><h2>What This Means</h2><p>…</p><h2>Expert Analysis</h2><p>…</p><h2>Conclusion</h2><p>…</p>",
  "faqs": [{"q":"…","a":"…"},{"q":"…","a":"…"},{"q":"…","a":"…"},{"q":"…","a":"…"}]
}

Diversify across all 8 categories. Use today's date ${today}. Output JSON only.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You output only valid JSON. No markdown, no commentary." },
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
    const raw = aiJson.choices?.[0]?.message?.content ?? "{}";
    let items: any[] = [];
    try {
      const parsed = JSON.parse(raw);
      items = Array.isArray(parsed) ? parsed : (parsed.articles ?? parsed.news ?? parsed.data ?? []);
    } catch {
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) items = JSON.parse(m[0]);
    }

    items = items.slice(0, 5).filter((i) => i?.title && i?.content_html);
    if (!items.length) throw new Error("AI returned no usable items");

    await supabase.from("news_articles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const stamp = Date.now();
    const rows = items.map((i, idx) => {
      const cat = CATEGORIES.includes(i.category) ? i.category : "SEO";
      const baseSlug = slugify(i.title) || `news-${stamp}-${idx}`;
      return {
        slug: `${baseSlug}-${stamp.toString(36)}-${idx}`,
        title: String(i.title).slice(0, 200),
        summary: String(i.summary ?? "").slice(0, 400),
        content: String(i.content_html ?? "").slice(0, 16000),
        category: cat,
        source: i.source ? String(i.source).slice(0, 100) : null,
        image_url: CATEGORY_IMAGES[cat] ?? CATEGORY_IMAGES["SEO"],
        image_alt: String(i.image_alt ?? i.title).slice(0, 200),
        meta_title: String(i.meta_title ?? i.title).slice(0, 80),
        meta_description: String(i.meta_description ?? i.summary ?? "").slice(0, 200),
        focus_keyword: String(i.focus_keyword ?? "").slice(0, 80),
        nlp_keywords: Array.isArray(i.nlp_keywords) ? i.nlp_keywords.slice(0, 15).map((k: any) => String(k).slice(0, 60)) : [],
        faqs: Array.isArray(i.faqs) ? i.faqs.slice(0, 6) : [],
        reading_minutes: Number(i.reading_minutes) || 4,
        author: "Crazy SEO Team Newsroom",
        published_at: new Date(stamp - idx * 60_000).toISOString(),
      };
    });

    const { error } = await supabase.from("news_articles").insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, inserted: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("refresh-news error", e);
    return new Response(JSON.stringify({ success: false, error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
