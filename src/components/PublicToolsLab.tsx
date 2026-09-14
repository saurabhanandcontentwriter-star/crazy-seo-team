import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, ImageDown, Loader2, Search, Sparkles, Globe2, Bot, ShieldCheck, Tags, Code2, FileCode, Map, Eye, FileText, Link2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ToolId = "audit" | "aeo" | "geo" | "llm" | "keyword" | "meta" | "schema" | "robots" | "sitemap" | "serp" | "nlp" | "links";
type Check = { label: string; status: "pass" | "warn" | "fail"; detail: string };
type Result = { title: string; score?: number; summary: string; checks?: Check[]; code?: string; source?: string; error?: string };

const TOOLS: Array<{ id: ToolId; name: string; desc: string; icon: typeof Search }> = [
  { id: "audit", name: "SEO Audit", desc: "On-page signals", icon: ShieldCheck },
  { id: "aeo", name: "AEO Checker", desc: "Answer-engine readiness", icon: Sparkles },
  { id: "geo", name: "GEO Checker", desc: "Generative search readiness", icon: Globe2 },
  { id: "llm", name: "LLM Checker", desc: "AI/entity signals", icon: Bot },
  { id: "keyword", name: "Keyword Research", desc: "Keyword seeds", icon: Search },
  { id: "meta", name: "Meta Generator", desc: "Title + description", icon: Tags },
  { id: "schema", name: "Schema Generator", desc: "JSON-LD", icon: Code2 },
  { id: "robots", name: "Robots.txt", desc: "Crawler rules", icon: FileCode },
  { id: "sitemap", name: "Sitemap", desc: "XML starter", icon: Map },
  { id: "serp", name: "SERP Preview", desc: "Search snippet", icon: Eye },
  { id: "nlp", name: "NLP Analyzer", desc: "Topics + entities", icon: FileText },
  { id: "links", name: "Internal Link Checker", desc: "Link signals", icon: Link2 },
];

const normalize = (value: string) => {
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

const stripHtml = (html: string) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const firstMatch = (html: string, pattern: RegExp) => html.match(pattern)?.[1]?.trim() || "";

async function fetchPublicPage(input: string) {
  const url = normalize(input);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Website fetch failed (${response.status})`);
    const payload = await response.json();
    const html = String(payload?.contents || "");
    const status = Number(payload?.status?.http_code || 0);
    if (!html) throw new Error("No public HTML returned. The website may block automated requests.");
    if (status >= 400) throw new Error(`Website returned HTTP ${status}`);
    return { url, html };
  } finally {
    window.clearTimeout(timer);
  }
}

function score(checks: Check[]) {
  const value = checks.reduce((sum, item) => sum + (item.status === "pass" ? 100 : item.status === "warn" ? 60 : 20), 0) / Math.max(1, checks.length);
  return Math.max(0, Math.min(100, Math.round(value)));
}

function analyze(html: string, url: string, tool: ToolId): Result {
  const title = firstMatch(html, /<title[^>]*>([^<]*)<\/title>/i);
  const description = firstMatch(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const canonical = firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const h1 = (html.match(/<h1[\s>][\s\S]*?<\/h1>/gi) || []).length;
  const images = html.match(/<img[^>]*>/gi) || [];
  const missingAlt = images.filter((tag) => !/\salt\s*=/i.test(tag)).length;
  const links = html.match(/<a\s[^>]*href=["'][^"']+["'][^>]*>/gi) || [];
  const hasSchema = /application\/ld\+json/i.test(html);
  const hasOg = /property=["']og:/i.test(html);
  const body = stripHtml(html);
  const words = body ? body.split(/\s+/).length : 0;
  const faq = /faq|frequently asked|question/i.test(body);
  const answerStyle = /\bwhat is\b|\bhow to\b|\bwhy\b|\bwhen\b|\bwhere\b/i.test(body);
  const entityCount = (body.match(/\b[A-Z][A-Za-z0-9&.-]{2,}\b/g) || []).length;
  const context = /author|publisher|about|source|organization/i.test(html);
  const checks: Check[] = [];

  if (tool === "aeo") {
    checks.push({ label: "Answer-oriented content", status: answerStyle ? "pass" : "warn", detail: answerStyle ? "Question/answer phrasing detected." : "Add direct question headings and answers." });
    checks.push({ label: "FAQ signals", status: faq ? "pass" : "warn", detail: faq ? "FAQ/question content detected." : "Add concise FAQs with direct answers." });
    checks.push({ label: "Structured data", status: hasSchema ? "pass" : "fail", detail: hasSchema ? "JSON-LD detected." : "Add FAQ, Article, Organization or Service schema." });
    checks.push({ label: "Primary H1", status: h1 === 1 ? "pass" : "warn", detail: `${h1} H1 tag(s) detected.` });
    checks.push({ label: "Content depth", status: words >= 500 ? "pass" : "warn", detail: `${words.toLocaleString()} visible words detected.` });
    checks.push({ label: "Crawlable links", status: links.length >= 5 ? "pass" : "warn", detail: `${links.length} links detected.` });
  } else if (tool === "geo") {
    checks.push({ label: "Entity signals", status: entityCount >= 6 ? "pass" : "warn", detail: `${Math.min(entityCount, 99)} candidate entities detected.` });
    checks.push({ label: "Source and author context", status: context ? "pass" : "warn", detail: context ? "Context signals detected." : "Strengthen organization, author and source context." });
    checks.push({ label: "Canonical identity", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical URL detected." : "Canonical URL missing." });
    checks.push({ label: "Open Graph", status: hasOg ? "pass" : "warn", detail: hasOg ? "Open Graph metadata detected." : "Add OG metadata." });
    checks.push({ label: "Machine-readable schema", status: hasSchema ? "pass" : "fail", detail: hasSchema ? "JSON-LD detected." : "Add machine-readable schema." });
    checks.push({ label: "Content completeness", status: words >= 700 ? "pass" : words >= 350 ? "warn" : "fail", detail: `${words.toLocaleString()} visible words detected.` });
  } else if (tool === "llm") {
    checks.push({ label: "Structured data", status: hasSchema ? "pass" : "warn", detail: hasSchema ? "JSON-LD detected." : "No JSON-LD detected." });
    checks.push({ label: "Entity/context vocabulary", status: context ? "pass" : "warn", detail: context ? "Entity context signals detected." : "Add clear organization, author and source context." });
    checks.push({ label: "Canonical URL", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical identity present." : "Canonical identity missing." });
    checks.push({ label: "Open Graph", status: hasOg ? "pass" : "warn", detail: hasOg ? "OG metadata present." : "OG metadata missing." });
    checks.push({ label: "Semantic content", status: words >= 500 ? "pass" : "warn", detail: `${words.toLocaleString()} visible words detected.` });
  } else {
    checks.push({ label: "HTTPS", status: url.startsWith("https://") ? "pass" : "fail", detail: url.startsWith("https://") ? "HTTPS detected." : "Use HTTPS." });
    checks.push({ label: "Title", status: title.length >= 30 && title.length <= 60 ? "pass" : title ? "warn" : "fail", detail: title ? `${title.length} characters.` : "Missing title." });
    checks.push({ label: "Meta description", status: description.length >= 120 && description.length <= 160 ? "pass" : description ? "warn" : "fail", detail: description ? `${description.length} characters.` : "Missing description." });
    checks.push({ label: "One H1", status: h1 === 1 ? "pass" : "warn", detail: `${h1} H1 tag(s) detected.` });
    checks.push({ label: "Image alt text", status: images.length === 0 || missingAlt === 0 ? "pass" : "warn", detail: images.length ? `${missingAlt}/${images.length} images lack alt text.` : "No images detected." });
    checks.push({ label: "Schema", status: hasSchema ? "pass" : "warn", detail: hasSchema ? "JSON-LD detected." : "No JSON-LD detected." });
    checks.push({ label: "Canonical", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical detected." : "Canonical missing." });
    checks.push({ label: "Open Graph", status: hasOg ? "pass" : "warn", detail: hasOg ? "OG metadata detected." : "OG metadata missing." });
    checks.push({ label: "Content depth", status: words >= 600 ? "pass" : words >= 300 ? "warn" : "fail", detail: `${words.toLocaleString()} visible words.` });
    checks.push({ label: "Links", status: links.length >= 5 ? "pass" : "warn", detail: `${links.length} links detected.` });
  }

  return { title: `${tool.toUpperCase()} Analysis`, score: score(checks), summary: `Analysis completed for ${url}.`, checks, source: url };
}

function generate(tool: ToolId, input: string): Result {
  const url = normalize(input);
  const parsed = new URL(url);
  const host = parsed.hostname.replace(/^www\./, "");
  const name = host.split(".")[0].replace(/[-_]/g, " ");
  let code = "";
  if (tool === "meta") code = `<title>${name} — Official Website & Services</title>\n<meta name="description" content="Explore ${name}, services, solutions, resources and latest updates from the official website.">`;
  else if (tool === "schema") code = JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name, url, sameAs: [] }, null, 2);
  else if (tool === "robots") code = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${parsed.origin}/sitemap.xml`;
  else if (tool === "sitemap") code = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${parsed.origin}/</loc></url>\n  <url><loc>${parsed.origin}/services</loc></url>\n  <url><loc>${parsed.origin}/blog</loc></url>\n  <url><loc>${parsed.origin}/contact</loc></url>\n</urlset>`;
  else if (tool === "keyword") code = [name, `${name} services`, `${name} company`, `${name} solutions`, `${name} pricing`, `${name} reviews`, `best ${name}`, `${name} online`, `${name} official website`].join("\n");
  else if (tool === "serp") code = `${name} — Official Website & Services\n${url}\nExplore trusted services, solutions and latest resources. Learn more and get started today.`;
  else if (tool === "nlp") code = `Topical terms:\n${name}\nservices\nsolutions\nwebsite\nresources\nupdates\n\nUse these as seed terms and validate them against your real page copy.`;
  else code = `Internal link audit target: ${url}\nReview contextual links to key service, product, category and supporting pages.`;
  return { title: `${TOOLS.find((item) => item.id === tool)?.name || "Tool"} Result`, summary: "Generated successfully.", code, source: url };
}

export default function PublicToolsLab() {
  const [tool, setTool] = useState<ToolId>("audit");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const selected = useMemo(() => TOOLS.find((item) => item.id === tool) || TOOLS[0], [tool]);

  const run = async () => {
    if (!url.trim()) {
      setResult({ title: "Enter a website", summary: "Enter a public website URL first.", error: "Example: https://example.com" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      if (["audit", "aeo", "geo", "llm"].includes(tool)) {
        const page = await fetchPublicPage(url);
        setResult(analyze(page.html, page.url, tool));
      } else {
        setResult(generate(tool, url));
      }
    } catch (error) {
      setResult({ title: "Tool could not complete", summary: "The requested website could not be processed.", error: error instanceof Error ? error.message : "Please check the URL and try again." });
    } finally {
      setLoading(false);
    }
  };

  const resultNode = () => document.getElementById("cst-tool-result");

  const screenshot = async () => {
    const node = resultNode();
    if (!node) throw new Error("Run a tool first.");
    const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    link.download = `crazy-seo-${tool}-report.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const pdf = async () => {
    const node = resultNode();
    if (!node) throw new Error("Run a tool first.");
    const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const doc = new jsPDF("p", "mm", "a4");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    const image = canvas.toDataURL("image/png");
    const pageHeight = 277;
    let offset = 0;
    while (offset < height) {
      if (offset > 0) doc.addPage();
      doc.setFontSize(14);
      if (offset === 0) doc.text("Crazy SEO Team — Tool Report", 10, 10);
      doc.addImage(image, "PNG", 10, 18 - offset, width, height);
      offset += pageHeight;
    }
    doc.save(`crazy-seo-${tool}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const safeExport = async (action: () => Promise<void>, message: string) => {
    try { await action(); } catch (error) { setResult((current) => ({ ...(current || { title: "Export error", summary: "" }), error: error instanceof Error ? error.message : message })); }
  };

  return (
    <section className="container mx-auto px-4 py-12" aria-label="Public SEO tools">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"><Sparkles className="h-4 w-4" /> Public AI Search & SEO Lab</span>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">Free SEO, AEO, GEO & LLM tools</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Run public checks without login, generate SEO assets, and export a report as PDF or PNG.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {TOOLS.map((item) => {
          const Icon = item.icon;
          const active = item.id === tool;
          return <button key={item.id} type="button" onClick={() => { setTool(item.id); setResult(null); }} className={`rounded-xl border p-4 text-left transition ${active ? "border-primary bg-primary/10 shadow-sm" : "hover:bg-muted/60"}`}><Icon className="h-5 w-5" /><div className="mt-2 font-semibold">{item.name}</div><div className="text-xs text-muted-foreground">{item.desc}</div></button>;
        })}
      </div>

      <div className="mx-auto mt-8 max-w-4xl rounded-2xl border bg-background/80 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void run(); }} placeholder={selected.id === "keyword" ? "example.com or seed topic" : "https://example.com"} className="h-12 flex-1 rounded-xl border bg-background px-4 outline-none focus:ring-2 focus:ring-primary" aria-label="Website URL" />
          <button type="button" onClick={() => void run()} disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {loading ? "Analyzing…" : "Run tool"}</button>
        </div>
      </div>

      {result && <div id="cst-tool-result" className="mx-auto mt-8 max-w-4xl rounded-2xl border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><h3 className="text-2xl font-bold">{result.title}</h3><p className="mt-1 text-muted-foreground">{result.summary}</p>{result.source && <p className="mt-1 break-all text-xs text-muted-foreground">Source: {result.source}</p>}</div>
          {typeof result.score === "number" && <div className="rounded-2xl border px-5 py-3 text-center"><div className="text-3xl font-bold">{result.score}</div><div className="text-xs text-muted-foreground">/ 100</div></div>}
        </div>
        {result.error && <div className="mt-5 flex gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{result.error}</span></div>}
        {result.checks && <div className="mt-6 grid gap-3 md:grid-cols-2">{result.checks.map((item) => <div key={item.label} className="rounded-xl border p-4"><div className="flex items-center gap-2 font-semibold">{item.status === "pass" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{item.label}</div><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p></div>)}</div>}
        {result.code && <pre className="mt-6 max-h-[480px] overflow-auto rounded-xl bg-muted p-4 text-sm whitespace-pre-wrap break-words">{result.code}</pre>}
        {!result.error && <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => void safeExport(pdf, "PDF export failed.")} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-medium"><Download className="h-4 w-4" /> Download PDF</button><button type="button" onClick={() => void safeExport(screenshot, "Screenshot export failed.")} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-medium"><ImageDown className="h-4 w-4" /> Save Screenshot</button></div>}
      </div>}
    </section>
  );
}
