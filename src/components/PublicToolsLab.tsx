import { useMemo, useState } from "react";
import { Download, ImageDown, Loader2, Search, ShieldCheck, Sparkles, Globe2, Bot, FileText, Code2, FileCode, Map, Eye, Link2, Tags, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ToolId = "audit" | "aeo" | "geo" | "llm" | "keyword" | "meta" | "schema" | "robots" | "sitemap" | "serp" | "nlp" | "links";
type Check = { label: string; status: "pass" | "warn" | "fail"; detail: string };
type Result = { error?: string; code?: string; title?: string; score?: number; checks?: Check[]; summary?: string; source?: { ms: number; status: number; url: string } };

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

const normalize = (value: string) => {
  const v = value.trim();
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};
const stripText = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const get = (html: string, re: RegExp) => (html.match(re)?.[1] || "").trim();

async function fetchPage(input: string) {
  const url = normalize(input);
  const started = performance.now();
  const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Fetch failed (${response.status})`);
  const payload = await response.json();
  const status = Number(payload?.status?.http_code || 0);
  return { url, html: String(payload?.contents || ""), status, ms: Math.round(performance.now() - started) };
}

function scoreChecks(checks: Check[]) {
  return Math.max(0, Math.min(100, Math.round(checks.reduce((sum, c) => sum + (c.status === "pass" ? 100 : c.status === "warn" ? 60 : 20), 0) / Math.max(1, checks.length))));
}

function analyze(html: string, url: string, tool: ToolId) {
  const title = get(html, /<title[^>]*>([^<]*)<\/title>/i);
  const desc = get(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const canonical = get(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const h1 = html.match(/<h1[\s>][\s\S]*?<\/h1>/gi)?.length || 0;
  const imgs = html.match(/<img[^>]*>/gi) || [];
  const noAlt = imgs.filter(tag => !/\salt\s*=/i.test(tag)).length;
  const links = html.match(/<a\s[^>]*href=["'][^"']+["'][^>]*>/gi) || [];
  const jsonLd = /application\/ld\+json/i.test(html);
  const og = /property=["']og:/i.test(html);
  const body = stripText(html);
  const words = body ? body.split(/\s+/).length : 0;
  const faq = /faq|frequently asked|question/i.test(body);
  const answerPatterns = /\bwhat is\b|\bhow to\b|\bwhy\b|\bwhen\b|\bwhere\b/i.test(body);
  const entities = (body.match(/\b[A-Z][A-Za-z0-9&.-]{2,}\b/g) || []).slice(0, 12);
  const aiTerms = ["Organization", "sameAs", "author", "about", "mentions", "citation", "source", "FAQPage"].filter(k => new RegExp(k, "i").test(html));
  let checks: Check[];
  if (tool === "aeo") checks = [
    { label: "Answer-oriented headings", status: answerPatterns ? "pass" : "warn", detail: answerPatterns ? "Question/answer phrasing detected." : "Add direct question headings." },
    { label: "FAQ content", status: faq ? "pass" : "warn", detail: faq ? "FAQ/question content detected." : "Add concise FAQs with direct answers." },
    { label: "Structured data", status: jsonLd ? "pass" : "fail", detail: jsonLd ? "JSON-LD detected." : "No JSON-LD detected." },
    { label: "Single primary H1", status: h1 === 1 ? "pass" : "warn", detail: `${h1} H1 tag(s) detected.` },
    { label: "Content depth", status: words >= 500 ? "pass" : "warn", detail: `${words.toLocaleString()} visible words detected.` },
    { label: "Crawlable links", status: links.length >= 5 ? "pass" : "warn", detail: `${links.length} links detected.` },
  ];
  else if (tool === "geo") checks = [
    { label: "Entity signals", status: entities.length >= 6 ? "pass" : "warn", detail: `${entities.length} candidate entities found.` },
    { label: "Author / source context", status: /author|about|source/i.test(html) ? "pass" : "warn", detail: /author|about|source/i.test(html) ? "Context signals detected." : "Strengthen author, organization and source context." },
    { label: "Canonical identity", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical URL detected." : "Canonical URL not detected." },
    { label: "Open Graph", status: og ? "pass" : "warn", detail: og ? "Open Graph metadata detected." : "Add OG metadata." },
    { label: "Machine-readable schema", status: jsonLd ? "pass" : "fail", detail: jsonLd ? "JSON-LD detected." : "Add Organization/Article/FAQ/Service schema." },
    { label: "Content completeness", status: words >= 700 ? "pass" : words >= 350 ? "warn" : "fail", detail: `${words.toLocaleString()} visible words detected.` },
  ];
  else if (tool === "llm") checks = [
    { label: "Structured data", status: jsonLd ? "pass" : "warn", detail: jsonLd ? "JSON-LD detected." : "No JSON-LD detected." },
    { label: "Entity/context vocabulary", status: aiTerms.length >= 3 ? "pass" : "warn", detail: `${aiTerms.length} AI-readable context signals detected.` },
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
    { label: "Image alt text", status: imgs.length === 0 || noAlt === 0 ? "pass" : "warn", detail: imgs.length ? `${noAlt}/${imgs.length} images lack alt.` : "No images detected." },
    { label: "Schema", status: jsonLd ? "pass" : "warn", detail: jsonLd ? "JSON-LD detected." : "No JSON-LD detected." },
    { label: "Canonical", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical detected." : "Canonical missing." },
    { label: "Open Graph", status: og ? "pass" : "warn", detail: og ? "OG metadata detected." : "OG metadata missing." },
    { label: "Content depth", status: words >= 600 ? "pass" : words >= 300 ? "warn" : "fail", detail: `${words.toLocaleString()} visible words.` },
    { label: "Internal/external links", status: links.length >= 5 ? "pass" : "warn", detail: `${links.length} links detected.` },
  ];
  return { title: `${tool.toUpperCase()} analysis`, score: scoreChecks(checks), checks, summary: `${tool.toUpperCase()} analysis completed for ${url}.` };
}

function generator(tool: ToolId, input: string) {
  const u = normalize(input);
  const parsed = new URL(u);
  const host = parsed.hostname.replace(/^www\./, "");
  const name = host.split(".")[0].replace(/[-_]/g, " ");
  if (tool === "meta") return { code: `<title>${name} — Official Website & Services</title>\n<meta name="description" content="Explore ${name}, services, solutions, resources and latest updates from the official website.">` };
  if (tool === "schema") return { code: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name, url: u, sameAs: [] }, null, 2) };
  if (tool === "robots") return { code: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${parsed.origin}/sitemap.xml` };
  if (tool === "sitemap") return { code: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${parsed.origin}/</loc></url>\n  <url><loc>${parsed.origin}/services</loc></url>\n  <url><loc>${parsed.origin}/blog</loc></url>\n  <url><loc>${parsed.origin}/contact</loc></url>\n</urlset>` };
  if (tool === "keyword") return { code: [name, `${name} services`, `${name} company`, `${name} solutions`, `${name} pricing`, `${name} reviews`, `${name} near me`, `best ${name}`, `${name} online`, `${name} official website`].join("\n") };
  if (tool === "serp") return { code: `${name} — Official Website & Services\n${u}\nExplore trusted services, solutions and latest resources. Learn more and get started today.` };
  if (tool === "nlp") return { code: `Topical terms:\n${name}\nservices\nsolutions\nwebsite\nresources\nupdates\n\nUse these as seed terms and validate them against your real page copy.` };
  return { code: `Internal link audit target: ${u}\nReview contextual links to key service, product, category and supporting content pages.` };
}

export default function PublicToolsLab() {
  const [tool, setTool] = useState<ToolId>("audit");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const selected = useMemo(() => TOOLS.find(item => item.id === tool)!, [tool]);

  const run = async () => {
    if (!url.trim()) return;
    setLoading(true); setResult(null);
    try {
      if (["audit", "aeo", "geo", "llm"].includes(tool)) {
        const page = await fetchPage(url);
        if (!page.html) throw new Error("No HTML was returned. The website may block automated requests.");
        if (page.status >= 400) throw new Error(`Website returned HTTP ${page.status}`);
        setResult({ ...analyze(page.html, page.url, tool), source: page });
      } else setResult(generator(tool, url));
    } catch (error: any) {
      setResult({ error: error?.message || "Unable to process this URL. Make sure the website is public." });
    } finally { setLoading(false); }
  };

  const getNode = () => document.getElementById("cst-tool-result");
  const makeCanvas = async () => {
    const node = getNode();
    if (!node) throw new Error("Run a tool first.");
    return html2canvas(node, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: "#ffffff", logging: false });
  };
  const downloadPdf = async () => {
    try {
      const canvas = await makeCanvas();
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = 190; const pageH = 277; const imgH = (canvas.height * pageW) / canvas.width;
      const img = canvas.toDataURL("image/png");
      let offset = 0;
      while (offset < imgH) { if (offset > 0) pdf.addPage(); pdf.setFontSize(16); if (offset === 0) pdf.text("Crazy SEO Team — Tool Report", 10, 10); pdf.addImage(img, "PNG", 10, 18 - offset, pageW, imgH); offset += pageH; }
      pdf.save(`crazy-seo-${tool}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error: any) { setResult(prev => ({ ...(prev || {}), error: error?.message || "PDF export failed." })); }
  };
  const downloadScreenshot = async () => {
    try {
      const canvas = await makeCanvas();
      const link = document.createElement("a"); link.download = `crazy-seo-${tool}-report.png`; link.href = canvas.toDataURL("image/png"); link.click();
    } catch (error: any) { setResult(prev => ({ ...(prev || {}), error: error?.message || "Screenshot export failed." })); }
  };
  const downloadText = () => {
    if (!result) return;
    const blob = new Blob([result.code || JSON.stringify(result, null, 2)], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a"); link.download = `crazy-seo-${tool}-result.txt`; link.href = URL.createObjectURL(blob); link.click(); URL.revokeObjectURL(link.href);
  };

  return (
    <section id="public-tools-lab" className="relative border-y border-slate-200/70 bg-slate-50/70 px-4 py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 text-center"><span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700"><Sparkles size={14} /> Public AI SEO Lab</span><h2 className="mt-4 text-4xl font-black text-slate-900 md:text-5xl">Free SEO, AEO & GEO Tools</h2><p className="mx-auto mt-3 max-w-3xl text-slate-600">No login. Run public on-page checks, generate SEO assets and export professional reports. Scores use signals available from the public URL; traffic and backlink numbers are never fabricated.</p></div>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="grid h-max grid-cols-2 gap-2 lg:grid-cols-1">{TOOLS.map(item => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => { setTool(item.id); setResult(null); }} className={`rounded-xl border p-3 text-left transition-all ${tool === item.id ? "border-blue-400 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200"}`}><div className="flex items-center gap-3"><Icon size={18} className="text-blue-600" /><div><div className="text-sm font-bold text-slate-900">{item.name}</div><div className="text-[11px] text-slate-500">{item.desc}</div></div></div></button>; })}</div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 md:p-7">
            <div className="mb-5 flex items-center gap-3"><selected.icon className="text-blue-600" /><div><h3 className="text-xl font-black text-slate-900">{selected.name}</h3><p className="text-sm text-slate-500">{selected.desc}</p></div></div>
            <div className="flex flex-col gap-3 sm:flex-row"><input value={url} onChange={event => setUrl(event.target.value)} onKeyDown={event => { if (event.key === "Enter") void run(); }} placeholder="https://example.com" className="h-12 flex-1 rounded-xl border border-slate-300 px-4 outline-none focus:ring-4 focus:ring-blue-100" /><button type="button" onClick={() => void run()} disabled={loading || !url.trim()} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} Run {selected.name}</button></div>
            {result && <div id="cst-tool-result" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              {result.error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{result.error}</div>}
              {result.code ? <><pre className="max-h-[460px] overflow-auto rounded-xl bg-slate-950 p-5 text-sm text-slate-100">{result.code}</pre><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={downloadText} className="flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold"><Download size={16} /> Download</button><button type="button" onClick={() => void downloadPdf()} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"><Download size={16} /> PDF</button><button type="button" onClick={() => void downloadScreenshot()} className="flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold"><ImageDown size={16} /> Screenshot</button></div></> : result.checks && <><div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-slate-500">Score</p><div className="text-5xl font-black text-blue-600">{result.score}<span className="text-lg text-slate-400">/100</span></div></div><div className="text-sm text-slate-600">{result.summary}<br />{result.source?.ms}ms fetch • HTTP {result.source?.status}</div></div><div className="grid gap-2 sm:grid-cols-2">{result.checks.map(check => <div key={check.label} className="rounded-xl border border-slate-200 p-3"><div className="flex items-start gap-2">{check.status === "pass" ? <CheckCircle2 className="text-emerald-600" size={17} /> : check.status === "fail" ? <XCircle className="text-red-600" size={17} /> : <AlertTriangle className="text-amber-500" size={17} />}<div><b className="text-sm">{check.label}</b><p className="mt-1 text-xs text-slate-500">{check.detail}</p></div></div></div>)}</div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => void downloadPdf()} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"><Download size={16} /> Download PDF Report</button><button type="button" onClick={() => void downloadScreenshot()} className="flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold"><ImageDown size={16} /> Save Screenshot</button></div></>}
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}
