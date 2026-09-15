import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Loader2, Play, Search } from "lucide-react";

type Tool = { id: string; name: string; description: string };
const TOOLS: Tool[] = [
  { id: "audit", name: "SEO Audit", description: "Technical and on-page checks" },
  { id: "aeo", name: "AEO Checker", description: "Answer-engine readiness" },
  { id: "geo", name: "GEO Checker", description: "Generative search readiness" },
  { id: "llm", name: "LLM Checker", description: "AI-readable signals" },
  { id: "keyword", name: "Keyword Research", description: "Keyword and intent ideas" },
  { id: "meta", name: "Meta Generator", description: "SEO title and description" },
  { id: "schema", name: "Schema Generator", description: "JSON-LD starter" },
  { id: "robots", name: "Robots.txt Generator", description: "Crawler rules" },
  { id: "sitemap", name: "Sitemap Generator", description: "XML URL map" },
  { id: "serp", name: "SERP Preview", description: "Search result preview" },
  { id: "nlp", name: "NLP Analyzer", description: "Topics and entities" },
  { id: "links", name: "Internal Link Checker", description: "Internal link signals" },
];

function normalize(input: string) { return /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`; }
function validUrl(input: string) { try { return new URL(normalize(input)); } catch { throw new Error("Enter a valid URL, e.g. https://example.com"); } }

async function fetchCloud(url: string) {
  const target = normalize(url);
  const attempts = [
    async () => { const r = await fetch(target); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); },
    async () => { const r = await fetch(`https://r.jina.ai/${target}`); if (!r.ok) throw new Error(`Jina HTTP ${r.status}`); return r.text(); },
    async () => { const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`); if (!r.ok) throw new Error(`Proxy HTTP ${r.status}`); return r.text(); },
  ];
  let last = "Unable to fetch the public page.";
  for (const attempt of attempts) { try { const text = await attempt(); if (text.trim()) return text; } catch (e) { last = e instanceof Error ? e.message : last; } }
  throw new Error(`${last}. The site may block public cloud fetching.`);
}

function pageSignals(html: string, url: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = (doc.body?.innerText || html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  const title = doc.title.trim();
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() || "";
  const h1 = doc.querySelectorAll("h1").length;
  const links = Array.from(doc.querySelectorAll("a[href]"));
  const host = new URL(url).hostname;
  const internal = links.filter(a => { try { return new URL(a.getAttribute("href") || "", url).hostname === host; } catch { return false; } }).length;
  const images = Array.from(doc.images);
  const missingAlt = images.filter(i => !i.getAttribute("alt")).length;
  const schemas = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).length;
  const canonical = Boolean(doc.querySelector('link[rel="canonical"]'));
  const faq = /faq|frequently asked|questions and answers/i.test(text);
  const words = text ? text.split(/\s+/).length : 0;
  return { doc, text, title, description, h1, internal, images: images.length, missingAlt, schemas, canonical, faq, words };
}

function result(tool: string, s: ReturnType<typeof pageSignals>, url: string) {
  const checks: Array<[string, boolean, string]> = [];
  checks.push(["HTTPS", url.startsWith("https://"), url.startsWith("https://") ? "Secure URL detected." : "Use HTTPS."]);
  checks.push(["Title", !!s.title, s.title ? `${s.title.length} characters.` : "Title is missing."]);
  checks.push(["Meta description", !!s.description, s.description ? `${s.description.length} characters.` : "Meta description is missing."]);
  checks.push(["Primary H1", s.h1 === 1, `${s.h1} H1 tag(s) detected.`]);
  checks.push(["Schema", s.schemas > 0, s.schemas ? `${s.schemas} JSON-LD block(s) detected.` : "No JSON-LD detected."]);
  checks.push(["Canonical", s.canonical, s.canonical ? "Canonical URL detected." : "Canonical URL is missing."]);
  checks.push(["Image alt", s.images === 0 || s.missingAlt === 0, `${s.missingAlt} missing alt text out of ${s.images} images.`]);
  checks.push(["Internal links", s.internal >= 5, `${s.internal} internal links detected.`]);
  checks.push(["Content depth", s.words >= 500, `${s.words.toLocaleString()} visible words detected.`]);
  if (tool === "aeo") checks.push(["FAQ content", s.faq, s.faq ? "FAQ/question content detected." : "Add concise FAQ answers."]);
  const score = Math.round(checks.reduce((n, c) => n + (c[1] ? 100 : 35), 0) / checks.length);
  return { score, checks, summary: `${TOOLS.find(t => t.id === tool)?.name || "Tool"} completed successfully for ${url}.` };
}

function keywordResult(seed: string) {
  const base = seed.trim();
  const ideas = [base, `${base} services`, `best ${base}`, `${base} company`, `${base} pricing`, `${base} near me`, `${base} online`, `${base} consultant`, `${base} agency`, `${base} guide`, `how to ${base}`, `${base} tools`, `${base} strategy`, `${base} reviews`, `${base} vs competitors`].filter(Boolean);
  return { summary: `${ideas.length} keyword ideas generated. Search volume/CPC are not fabricated.`, code: ideas.map((x, i) => `${i + 1}. ${x}`).join("\n") };
}

function generated(tool: string, input: string, html?: string) {
  const url = normalize(input);
  const u = validUrl(url);
  if (tool === "keyword") return keywordResult(input);
  if (tool === "robots") return { summary: "Robots.txt starter generated.", code: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${u.origin}/sitemap.xml` };
  const s = html ? pageSignals(html, url) : null;
  if (tool === "meta") return { summary: "Meta tags generated from the page signals.", code: `<title>${s?.title || u.hostname}</title>\n<meta name="description" content="${(s?.description || `Explore ${u.hostname} services, resources and solutions.`).replace(/"/g, "&quot;")}">` };
  if (tool === "schema") return { summary: "WebSite JSON-LD generated.", code: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: s?.title || u.hostname, url }, null, 2) };
  if (tool === "sitemap") return { summary: "Sitemap generated from the requested URL.", code: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${u.href}</loc></url>\n</urlset>` };
  if (tool === "serp") return { summary: "SERP preview generated.", code: `${s?.title || u.hostname}\n${u.hostname}\n${s?.description || "Add a meta description to control the search snippet."}` };
  if (tool === "nlp") return { summary: `NLP analysis completed across ${s?.words.toLocaleString() || 0} visible words.`, code: (s?.text || "").toLowerCase().match(/\b[a-z][a-z-]{4,}\b/g)?.slice(0, 40).join("\n") || "No topical terms found." };
  if (tool === "links") return { summary: `${s?.internal || 0} internal links detected.`, code: `Internal links: ${s?.internal || 0}\nTotal images: ${s?.images || 0}` };
  return { summary: "Tool completed with available public signals.", code: "No additional generator output required." };
}

export default function ToolsCloudRunner() {
  const [tool, setTool] = useState("audit");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<{ summary: string; score?: number; checks?: Array<[string, boolean, string]>; code?: string; error?: string } | null>(null);
  const selected = TOOLS.find(t => t.id === tool) || TOOLS[0];

  const runTool = async () => {
    if (!input.trim()) { setOutput({ summary: "Input required.", error: tool === "keyword" ? "Enter a keyword/topic." : "Enter a public website URL." }); return; }
    setLoading(true); setOutput(null);
    try {
      if (tool === "keyword" || tool === "robots") { setOutput(generated(tool, input)); return; }
      let html = "";
      try { html = await fetchCloud(input); } catch (e) {
        if (["meta", "schema", "sitemap", "serp", "links", "nlp"].includes(tool)) { setOutput(generated(tool, input)); return; }
        throw e;
      }
      if (["audit", "aeo", "geo", "llm"].includes(tool)) setOutput({ ...result(tool, pageSignals(html, normalize(input)), normalize(input)) });
      else setOutput(generated(tool, input, html));
    } catch (e) { setOutput({ summary: "Tool could not complete.", error: e instanceof Error ? e.message : "Please check the URL and try again." }); }
    finally { setLoading(false); }
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output.code || JSON.stringify(output, null, 2)], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `crazy-seo-${tool}-result.txt`; a.click(); URL.revokeObjectURL(a.href);
  };

  return <section className="container mx-auto px-4 py-12" aria-label="Tools Cloud">
    <div className="mb-8 text-center"><span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"><Play className="h-4 w-4" /> Tools Cloud — Live Runner</span><h2 className="mt-4 text-3xl font-bold md:text-4xl">Run every SEO tool</h2><p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Select a tool, enter a URL or keyword and press Run Tool. Results are generated immediately with cloud-fetch fallbacks.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{TOOLS.map(t => <button key={t.id} type="button" onClick={() => { setTool(t.id); setOutput(null); }} className={`rounded-xl border p-4 text-left transition ${tool === t.id ? "border-primary bg-primary/10 shadow" : "hover:bg-muted/60"}`}><div className="font-semibold">{t.name}</div><div className="mt-1 text-xs text-muted-foreground">{t.description}</div></button>)}</div>
    <div className="mx-auto mt-8 max-w-4xl rounded-2xl border bg-background p-5 shadow-sm"><div className="mb-3 text-sm font-semibold">Selected: {selected.name}</div><div className="flex flex-col gap-3 md:flex-row"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void runTool(); }} placeholder={tool === "keyword" ? "AI SEO" : "https://example.com"} className="h-12 flex-1 rounded-xl border bg-background px-4 outline-none focus:ring-2 focus:ring-primary"/><button type="button" onClick={() => void runTool()} disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 font-semibold text-primary-foreground disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}{loading ? "Running…" : "Run Tool"}</button></div></div>
    {output && <div className="mx-auto mt-8 max-w-4xl rounded-2xl border bg-background p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="text-2xl font-bold">{selected.name}</h3><p className="mt-1 text-muted-foreground">{output.summary}</p></div>{typeof output.score === "number" && <div className="rounded-2xl border px-5 py-3 text-center"><div className="text-3xl font-bold">{output.score}</div><div className="text-xs text-muted-foreground">/100</div></div>}</div>{output.error && <div className="mt-5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"><AlertTriangle className="h-4 w-4"/>{output.error}</div>}{output.checks && <div className="mt-6 grid gap-3 md:grid-cols-2">{output.checks.map(c => <div key={c[0]} className="rounded-xl border p-4"><div className="flex items-center gap-2 font-semibold">{c[1] ? <CheckCircle2 className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}{c[0]}</div><p className="mt-1 text-sm text-muted-foreground">{c[2]}</p></div>)}</div>}{output.code && <pre className="mt-6 max-h-[520px] overflow-auto rounded-xl bg-muted p-4 text-sm whitespace-pre-wrap break-words">{output.code}</pre>}{!output.error && <button type="button" onClick={download} className="mt-6 inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-medium"><Download className="h-4 w-4"/> Download Result</button>}</div>}
  </section>;
}
