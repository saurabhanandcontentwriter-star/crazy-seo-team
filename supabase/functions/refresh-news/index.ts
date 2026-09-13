// @ts-nocheck
// Crazy SEO Team — automated newsroom refresh.
// Real RSS/Atom sources are fetched first; AI only rewrites supplied facts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret" };
const CATEGORIES = ["SEO", "AI SEO", "Technical SEO", "Google Updates", "ChatGPT SEO", "AI Tools", "Digital Marketing", "AI Automation", "Machine Learning", "Generative AI", "Voice AI", "Business Intelligence"];
const FEEDS = [
  { name: "Search Engine Land", url: "https://searchengineland.com/feed" },
  { name: "Search Engine Roundtable", url: "https://feeds.seroundtable.com/SearchEngineRoundtable1" },
  { name: "Google Search Central", url: "https://developers.google.com/search/updates/search_docs_updates.rss" },
  { name: "Google Blog", url: "https://blog.google/feed/" },
];
const CATEGORY_IMAGES: Record<string, string> = {
  "SEO": "https://images.unsplash.com/photo-1432888622747-4eb9a8f5a07d?w=1200&q=80&auto=format&fit=crop",
  "AI SEO": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80&auto=format&fit=crop",
  "Technical SEO": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
  "Google Updates": "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1200&q=80&auto=format&fit=crop",
  "ChatGPT SEO": "https://images.unsplash.com/photo-1696446702183-be6f3b1d8c08?w=1200&q=80&auto=format&fit=crop",
  "AI Tools": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80&auto=format&fit=crop",
  "Digital Marketing": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
  "AI Automation": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80&auto=format&fit=crop",
  "Generative AI": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80&auto=format&fit=crop",
};
const clean = (v: string) => v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const tag = (block: string, name: string) => clean(block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"))?.[1] ?? "");
const parseFeed = (xml: string, source: string) => (xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) ?? []).map((block) => {
  const link = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] ?? tag(block, "link");
  return { source, title: tag(block, "title"), url: link.trim(), published_at: tag(block, "pubDate") || tag(block, "published") || tag(block, "updated"), description: tag(block, "description") || tag(block, "summary") || tag(block, "content") };
}).filter((x) => x.title && /^https?:\/\//i.test(x.url));
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
async function isAdmin(req: Request, url: string, anon: string, service: string) {
  const h = req.headers.get("Authorization") ?? ""; if (!h.startsWith("Bearer ")) return false;
  const c = createClient(url, anon, { global: { headers: { Authorization: h } } }); const token = h.replace("Bearer ", "");
  const { data } = await c.auth.getClaims(token); const uid = data?.claims?.sub; if (!uid) return false;
  const s = createClient(url, service); const { data: role } = await s.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(); return !!role;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const URL = Deno.env.get("SUPABASE_URL")!; const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!; const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; const AI = Deno.env.get("LOVABLE_API_KEY");
    if (!AI) throw new Error("LOVABLE_API_KEY missing");
    const supabase = createClient(URL, SERVICE);
    const cronSecret = Deno.env.get("NEWS_CRON_SECRET"); const cronOk = !!cronSecret && req.headers.get("x-cron-secret") === cronSecret;
    const adminOk = await isAdmin(req, URL, ANON, SERVICE); if (!cronOk && !adminOk) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const feedResults = await Promise.all(FEEDS.map(async (feed) => { try { const r = await fetch(feed.url, { headers: { "User-Agent": "CrazySEO-Team-NewsBot/1.0" } }); return r.ok ? parseFeed(await r.text(), feed.name).slice(0, 8) : []; } catch { return []; } }));
    const candidates = feedResults.flat().sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 20);
    if (!candidates.length) throw new Error("No source feed items available");
    const packet = candidates.map((x, i) => `${i + 1}. SOURCE=${x.source}\nTITLE=${x.title}\nURL=${x.url}\nDATE=${x.published_at}\nSUMMARY=${x.description.slice(0, 900)}`).join("\n\n");
    const today = new Date().toISOString().slice(0, 10);
    const prompt = `You are the senior human editor of Crazy SEO Team Newsroom. Date: ${today}. Create concise, trustworthy, humanized news stories using ONLY the supplied source facts. Each article must be about 100 words of main editorial copy, not copied from the source. Make it useful for readers and naturally SEO optimized: clear keyword intent, semantic terms, concise sentences, no keyword stuffing, no robotic phrases. Never invent facts, quotes, statistics, dates, URLs or source names. Preserve the exact source URL. Return ONLY JSON {"articles":[...]}. Each item: {"title":"<=70 chars","meta_title":"<=60 chars","meta_description":"<=158 chars","focus_keyword":"2-4 words","nlp_keywords":["8-12 natural terms"],"category":"allowed category","source":"exact source","source_url":"exact URL","source_published_at":"ISO date if known","summary":"50-80 chars","image_alt":"descriptive alt","reading_minutes":1,"content_html":"about 100 words using <h2>Introduction</h2>, <h2>Key Updates</h2>, <h2>What This Means</h2>, <h2>Expert Take</h2>, <h2>Conclusion</h2>","faqs":[{"q":"...","a":"..."},{"q":"...","a":"..."},{"q":"...","a":"..."}]}. Allowed categories: ${CATEGORIES.join(", ")}. SOURCE FACTS:\n${packet}`;
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${AI}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "system", content: "Output valid JSON only. Use only supplied facts. Preserve exact source URL." }, { role: "user", content: prompt }], response_format: { type: "json_object" } }) });
    if (!aiRes.ok) throw new Error(`AI gateway ${aiRes.status}: ${await aiRes.text()}`);
    const raw = (await aiRes.json()).choices?.[0]?.message?.content ?? "{}"; const parsed = JSON.parse(raw); const items = (Array.isArray(parsed) ? parsed : parsed.articles ?? []).slice(0, 10).filter((x: any) => x?.title && x?.content_html && x?.source_url);
    if (!items.length) throw new Error("AI returned no usable source-linked articles");
    const stamp = Date.now(); const rows = items.map((i: any, idx: number) => { const cat = CATEGORIES.includes(i.category) ? i.category : "SEO"; const sourceDate = i.source_published_at && !Number.isNaN(new Date(i.source_published_at).getTime()) ? new Date(i.source_published_at).toISOString() : new Date(stamp - idx * 60000).toISOString(); return { slug: `${slugify(String(i.title))}-${stamp.toString(36)}-${idx}`, title: String(i.title).slice(0, 200), summary: String(i.summary ?? "").slice(0, 400), content: String(i.content_html ?? "").slice(0, 12000), category: cat, source: String(i.source ?? "").slice(0, 100), source_url: String(i.source_url), source_published_at: sourceDate, image_url: CATEGORY_IMAGES[cat] ?? CATEGORY_IMAGES.SEO, image_alt: String(i.image_alt ?? i.title).slice(0, 200), meta_title: String(i.meta_title ?? i.title).slice(0, 80), meta_description: String(i.meta_description ?? i.summary ?? "").slice(0, 200), focus_keyword: String(i.focus_keyword ?? "").slice(0, 80), nlp_keywords: Array.isArray(i.nlp_keywords) ? i.nlp_keywords.slice(0, 15).map((k: any) => String(k).slice(0, 60)) : [], faqs: Array.isArray(i.faqs) ? i.faqs.slice(0, 6) : [], reading_minutes: 1, author: "Crazy SEO Team Newsroom", published_at: sourceDate }; });
    const { error } = await supabase.from("news_articles").upsert(rows, { onConflict: "source_url", ignoreDuplicates: false }); if (error) throw error;
    const { data: oldRows } = await supabase.from("news_articles").select("id").order("published_at", { ascending: false }).range(40, 500); if (oldRows?.length) await supabase.from("news_articles").delete().in("id", oldRows.map((r: any) => r.id));
    return new Response(JSON.stringify({ success: true, fetched: candidates.length, inserted_or_updated: rows.length, sources: FEEDS.map((f) => f.name) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) { console.error("refresh-news error", e); return new Response(JSON.stringify({ success: false, error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});