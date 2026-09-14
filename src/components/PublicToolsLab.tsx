import { useMemo, useState } from "react";
import { Download, ImageDown, Loader2, Search, ShieldCheck, Sparkles, Globe2, Bot, FileText, Code2, FileCode, Map, Eye, Link2, Tags, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ToolId = "audit" | "aeo" | "geo" | "llm" | "keyword" | "meta" | "schema" | "robots" | "sitemap" | "serp" | "nlp" | "links";
type Check = { label: string; status: "pass" | "warn" | "fail"; detail: string; };

const TOOLS: { id: ToolId; name: string; desc: string; icon: any }[] = [
  { id: "audit", name: "SEO Audit", desc: "Real on-page crawl signals", icon: ShieldCheck },
  { id: "aeo", name: "AEO Checker", desc: "Answer-engine readiness", icon: Sparkles },
  { id: "geo", name: "GEO Checker", desc: "Generative search readiness", icon: Globe2 },
  { id: "llm", name: "LLM Checker", desc: "AI crawler & entity signals", icon: Bot },
  { id: "keyword", name: "Keyword Research", desc: "Seed and intent ideas", icon: Search },
  { id: "meta", name: "Meta Generator", desc: "SEO title + description", icon: Tags },
  { id: "schema", name: "Schema Generator", desc: "Valid JSON-LD starter", icon: Code2 },
  { id: "robots", name: "Robots.txt", desc: "Production-safe template", icon: FileCode },
  { id: "sitemap", name: "Sitemap", desc: "XML sitemap starter", icon: Map },
  { id: "serp", name: "SERP Preview", desc: "Google-style snippet", icon: Eye },
  { id: "nlp", name: "NLP Analyzer", desc: "Entities and topical terms", icon: FileText },
  { id: "links", name: "Internal Link Checker", desc: "Link structure signals", icon: Link2 },
];

const normalize = (v: string) => {
  let u = v.trim();
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
};
const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const get = (html: string, re: RegExp) => (html.match(re)?.[1] || "").trim();

async function fetchPage(input: string) {
  const url = normalize(input);
  const started = performance.now();
  const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`Fetch failed (${r.status})`);
  const d = await r.json();
  return { url, html: d.contents || "", status: d.status?.http_code || 0, ms: Math.round(performance.now() - started) };
}

function scoreChecks(checks: Check[]) { return Math.max(0, Math.round(checks.reduce((s, c) => s + (c.status === "pass" ? 100 : c.status === "warn" ? 60 : 20), 0) / Math.max(1, checks.length))); }

function analyze(html: string, url: string, tool: ToolId): { title: string; score: number; checks: Check[]; summary: string; data?: any } {
  const title = get(html, /<title[^>]*>([^<]*)<\/title>/i);
  const desc = get(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const canonical = get(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const h1 = html.match(/<h1[\s>][\s\S]*?<\/h1>/gi)?.length || 0;
  const h2 = html.match(/<h2[\s>][\s\S]*?<\/h2>/gi)?.length || 0;
  const imgs = html.match(/<img[^>]*>/gi) || [];
  const noAlt = imgs.filter(x => !/\salt\s*=/i.test(x)).length;
  const links = html.match(/<a\s[^>]*href=["'][^"']+["'][^>]*>/gi) || [];
  const jsonLd = /application\/ld\+json/i.test(html);
  const og = /property=["']og:/i.test(html);
  const body = text(html);
  const words = body ? body.split(/\s+/).length : 0;
  const faq = /faq|frequently asked|question/i.test(body);
  const answerPatterns = /\bwhat is\b|\bhow to\b|\bwhy\b|\bwhen\b|\bwhere\b/i.test(body);
  const entities = (body.match(/\b[A-Z][A-Za-z0-9&.-]{2,}\b/g) || []).slice(0, 12);
  const aiTerms = ["Organization", "sameAs", "author", "about", "mentions", "citation", "source", "FAQPage"].filter(k => new RegExp(k, "i").test(html));

  let checks: Check[];
  if (tool === "aeo") checks = [
    { label: "Clear answer-oriented headings", status: answerPatterns ? "pass" : "warn", detail: answerPatterns ? "Question/answer phrasing detected." : "Add direct question headings for answer engines." },
    { label: "FAQ content", status: faq ? "pass" : "warn", detail: faq ? "FAQ/question content detected." : "Add concise FAQs with direct answers." },
    { label: "Structured data", status: jsonLd ? "pass" : "fail", detail: jsonLd ? "JSON-LD detected." : "No JSON-LD detected." },
    { label: "Single primary H1", status: h1 === 1 ? "pass" : "warn", detail: `${h1} H1 tag(s) detected.` },
    { label: "Readable content depth", status: words >= 500 ? "pass" : "warn", detail: `${words.toLocaleString()} visible words detected.` },
    { label: "Crawlable links", status: links.length >= 5 ? "pass" : "warn", detail: `${links.length} links detected.` },
  ];
  else if (tool === "geo") checks = [
    { label: "Entity signals", status: entities.length >= 6 ? "pass" : "warn", detail: `${entities.length} candidate entities found in visible content.` },
    { label: "Author / source context", status: /author|about|source/i.test(html) ? "pass" : "warn", detail: /author|about|source/i.test(html) ? "Author/about/source signals detected." : "Strengthen author, organization and source context." },
    { label: "Canonical identity", status: canonical ? "pass" : "warn", detail: canonical ? `Canonical: ${canonical}` : "Canonical URL not detected." },
    { label: "Open Graph context", status: og ? "pass" : "warn", detail: og ? "Open Graph metadata detected." : "Add OG title, description and image." },
    { label: "Machine-readable schema", status: jsonLd ? "pass" : "fail", detail: jsonLd ? "JSON-LD detected." : "Add Organization/Article/FAQ/Service schema." },
    { label: "Content completeness", status: words >= 700 ? "pass" : words >= 350 ? "warn" : "fail", detail: `${words.toLocaleString()} visible words detected.` },
  ];
  else if (tool === "llm") checks = [
    { label: "Structured data", status: jsonLd ? "pass" : "warn", detail: jsonLd ? "JSON-LD detected." : "No JSON-LD detected." },
    { label: "Entity/context vocabulary", status: aiTerms.length >= 3 ? "pass" : "warn", detail: `${aiTerms.length} useful AI-readable context signals detected.` },
    { label: "About/author/source signals", status: /about|author|publisher|source/i.test(html) ? "pass" : "warn", detail: "Check author, publisher and entity context." },
    { label: "Canonical URL", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical identity present." : "Canonical identity missing." },
    { label: "Open Graph", status: og ? "pass" : "warn", detail: og ? "Social/entity metadata present." : "OG metadata missing." },
    { label: "Semantic content", status: words >= 500 ? "pass" : "warn", detail: `${words.toLocaleString()} visible words detected.` },
  ];
  else checks = [
    { label: "HTTPS", status: url.startsWith("https://") ? "pass" : "fail", detail: url.startsWith("https://") ? "HTTPS URL detected." : "Use HTTPS." },
    { label: "Title tag", status: title.length >= 30 && title.length <= 60 ? "pass" : title ? "warn" : "fail", detail: title ? `${title.length} characters.` : "Missing title." },
    { label: "Meta description", status: desc.length >= 120 && desc.length <= 160 ? "pass" : desc ? "warn" : "fail", detail: desc ? `${desc.length} characters.` : "Missing description." },
    { label: "One H1", status: h1 === 1 ? "pass" : "warn", detail: `${h1} H1 tag(s).` },
    { label: "Image alt text", status: imgs.length === 0 || noAlt === 0 ? "pass" : "warn", detail: imgs.length ? `${noAlt}/${imgs.length} images lack alt.` : "No images detected.`" },
    { label: "Schema", status: jsonLd ? "pass" : "warn", detail: jsonLd ? "JSON-LD detected." : "No JSON-LD detected." },
    { label: "Canonical", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical detected." : "Canonical missing." },
    { label: "Open Graph", status: og ? "pass" : "warn", detail: og ? "OG metadata detected." : "OG metadata missing." },
    { label: "Content depth", status: words >= 600 ? "pass" : words >= 300 ? "warn" : "fail", detail: `${words.toLocaleString()} visible words.` },
    { label: "Internal/external links", status: links.length >= 5 ? "pass" : "warn", detail: `${links.length} links detected.` },
  ];
  const score = scoreChecks(checks);
  return { title: `${tool.toUpperCase()} analysis`, score, checks, summary: `${tool.toUpperCase()} analysis completed for ${url}.`, data: { title, desc, canonical, h1, h2, images: imgs.length, noAlt, links: links.length, words, entities } };
}

const generator = (tool: ToolId, input: string) => {
  const u = normalize(input);
  const host = new URL(u).hostname.replace(/^www\./, "");
  const name = host.split(".")[0].replace(/[-_]/g, " ");
  if (tool === "meta") return { code: `<title>${name} — Official Website & Services</title>\n<meta name="description" content="Explore ${name}, services, solutions, resources and latest updates. Discover trusted information, tools and insights from the official website.">` };
  if (tool === "schema") return { code: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name, url: u, sameAs: [] }, null, 2) };
  if (tool === "robots") return { code: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${new URL(u).origin}/sitemap.xml` };
  if (tool === "sitemap") return { code: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${new URL(u).origin}/</loc></url>\n  <url><loc>${new URL(u).origin}/services</loc></url>\n  <url><loc>${new URL(u).origin}/blog</loc></url>\n  <url><loc>${new URL(u).origin}/contact</loc></url>\n</urlset>` };
  if (tool === "keyword") return { code: [name, `${name} services`, `${name} company`, `${name} solutions`, `${name} pricing`, `${name} reviews`, `${name} near me`, `best ${name}`, `${name} online`, `${name} official website`].join("\n") };
  if (tool === "serp") return { code: `${name} — Official Website & Services\n${u}\nExplore trusted services, solutions and latest resources. Learn more and get started today.` };
  if (tool === "nlp") return { code: `Topical terms:\n${name}\nservices\nsolutions\nwebsite\nresources\nupdates\n\nTip: replace these seed terms with terms extracted from your real page copy.` };
  return { code: `Internal link audit target: ${u}\nReview contextual links to key service, product, category and supporting content pages.` };
};

export default function PublicToolsLab() {
  const [tool, setTool] = useState<ToolId>("audit");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const selected = useMemo(() => TOOLS.find(t => t.id === tool)!, [tool]);
  const run = async () => {
    if (!url.trim()) return;
    setLoading(true); setResult(null);
    try {
      if (["audit", "aeo", "geo", "llm"].includes(tool)) {
        const page = await fetchPage(url);
        if (page.status >= 400) throw new Error(`Website returned HTTP ${page.status}`);
        setResult({ ...analyze(page.html, page.url, tool), source: page });
      } else {
        setResult({ ...generator(tool, url), generatedAt: new Date().toLocaleString() });
      }
    } catch (e: any) {
      setResult({ error: e?.message || "Unable to analyze this URL. Make sure the site is public." });
    } finally { setLoading(false); }
  };

  const downloadPdf = async () => {
    const node = document.getElementById("cst-tool-result"); if (!node) return;
    const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const img = canvas.toDataURL("image/png"); const pdf = new jsPDF("p", "mm", "a4");
    const w = 190; const h = canvas.height * w / canvas.width; let y = 10; let remaining = h;
    pdf.setFontSize(16); pdf.text("Crazy SEO Team — Tool Report", 10, y); y += 8;
    let offset = 0; while (remaining > 0) { pdf.addImage(img, "PNG", 10, y - offset, w, h); remaining -= 277; offset += 277; if (remaining > 0) pdf.addPage(); }
    pdf.save(`crazy-seo-${tool}-${new Date().toISOString().slice(0,10)}.pdf`);
  };
  const downloadScreenshot = async () => {
    const node = document.getElementById("cst-tool-result"); if (!node) return;
    const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const a = document.createElement("a"); a.download = `crazy-seo-${tool}-screenshot.png`; a.href = canvas.toDataURL("image/png"); a.click();
  };
  const downloadText = () => {
    const value = result?.code || JSON.stringify(result, null, 2); const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.download = `crazy-seo-${tool}-result.txt`; a.href = URL.createObjectURL(blob); a.click(); URL.revokeObjectURL(a.href);
  };

  return <section id="public-tools-lab" className="relative py-20 px-4 bg-slate-50/70 border-y border-slate-200/70">
    <div className="container mx-auto max-w-7xl">
      <div className="text-center mb-10"><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-white text-xs font-bold text-blue-700"><Sparkles size={14}/> Public AI SEO Lab</span><h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4">Free SEO, AEO & GEO Tools</h2><p className="text-slate-600 mt-3 max-w-3xl mx-auto">No login. Run public on-page checks, generate SEO assets and export professional reports. Results are based on signals actually available from the public URL; traffic/backlink numbers are not fabricated here.</p></div>
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 h-max">{TOOLS.map(t => { const I=t.icon; return <button key={t.id} onClick={()=>{setTool(t.id);setResult(null)}} className={`text-left p-3 rounded-xl border transition-all ${tool===t.id?"border-blue-400 bg-blue-50 shadow-sm":"border-slate-200 bg-white hover:border-blue-200"}`}><div className="flex items-center gap-3"><I size={18} className="text-blue-600"/><div><div className="font-bold text-sm text-slate-900">{t.name}</div><div className="text-[11px] text-slate-500">{t.desc}</div></div></div></button> })}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 mb-5"><selected.icon className="text-blue-600"/><div><h3 className="font-black text-xl text-slate-900">{selected.name}</h3><p className="text-sm text-slate-500">{selected.desc}</p></div></div>
          <div className="flex flex-col sm:flex-row gap-3"><input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")run()}} placeholder="https://example.com" className="flex-1 h-12 rounded-xl border border-slate-300 px-4 outline-none focus:ring-4 focus:ring-blue-100"/><button onClick={run} disabled={loading||!url.trim()} className="h-12 px-6 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">{loading?<Loader2 className="animate-spin" size={18}/>:<Search size={18}/>} Run {selected.name}</button></div>
          {result && <div id="cst-tool-result" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">{result.error ? <div className="text-red-600 font-semibold">{result.error}</div> : result.code ? <><pre className="whitespace-pre-wrap text-sm bg-slate-950 text-slate-100 rounded-xl p-5 overflow-auto max-h-[460px]">{result.code}</pre><div className="flex flex-wrap gap-2 mt-4"><button onClick={downloadText} className="px-4 py-2 rounded-lg border font-semibold flex gap-2 items-center"><Download size={16}/> Download</button><button onClick={downloadPdf} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold flex gap-2 items-center"><Download size={16}/> PDF</button><button onClick={downloadScreenshot} className="px-4 py-2 rounded-lg border font-semibold flex gap-2 items-center"><ImageDown size={16}/> Screenshot</button></div></> : <><div className="flex flex-wrap items-center justify-between gap-4 mb-5"><div><p className="text-xs uppercase tracking-wider text-slate-500">Score</p><div className="text-5xl font-black text-blue-600">{result.score}<span className="text-lg text-slate-400">/100</span></div></div><div className="text-sm text-slate-600">{result.summary}<br/>{result.source?.ms}ms fetch • HTTP {result.source?.status}</div></div><div className="grid sm:grid-cols-2 gap-2">{result.checks.map((c:Check)=><div key={c.label} className="p-3 rounded-xl border border-slate-200"><div className="flex gap-2 items-start">{c.status==="pass"?<CheckCircle2 className="text-emerald-600" size={17}/>:c.status==="fail"?<XCircle className="text-red-600" size={17}/>:<AlertTriangle className="text-amber-500" size={17}/>}<div><b className="text-sm">{c.label}</b><p className="text-xs text-slate-500 mt-1">{c.detail}</p></div></div></div>)}</div><div className="flex flex-wrap gap-2 mt-5"><button onClick={downloadPdf} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold flex gap-2 items-center"><Download size={16}/> Download PDF Report</button><button onClick={downloadScreenshot} className="px-4 py-2 rounded-lg border font-semibold flex gap-2 items-center"><ImageDown size={16}/> Save Screenshot</button></div></>}
          </div>}
        </div>
      </div>
    </div>
  </section>;
}
