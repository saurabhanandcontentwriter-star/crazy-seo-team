import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, ImageDown, Loader2, Search, Sparkles, Globe2, Bot, ShieldCheck, Tags, Code2, FileCode, Map, Eye, FileText, Link2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ToolId = "audit" | "aeo" | "geo" | "llm" | "keyword" | "meta" | "schema" | "robots" | "sitemap" | "serp" | "nlp" | "links";
type Check = { label: string; status: "pass" | "warn" | "fail"; detail: string };
type Result = { title: string; score?: number; summary: string; checks?: Check[]; code?: string; source?: string; error?: string };

type PageData = { url: string; html: string; doc: Document; text: string; links: HTMLAnchorElement[] };

const TOOLS: Array<{ id: ToolId; name: string; desc: string; icon: typeof Search }> = [
  { id: "audit", name: "SEO Audit", desc: "On-page signals", icon: ShieldCheck },
  { id: "aeo", name: "AEO Checker", desc: "Answer-engine readiness", icon: Sparkles },
  { id: "geo", name: "GEO Checker", desc: "Generative search readiness", icon: Globe2 },
  { id: "llm", name: "LLM Checker", desc: "AI/entity signals", icon: Bot },
  { id: "keyword", name: "Keyword Research", desc: "Keyword suggestions", icon: Search },
  { id: "meta", name: "Meta Generator", desc: "Title + description", icon: Tags },
  { id: "schema", name: "Schema Generator", desc: "JSON-LD", icon: Code2 },
  { id: "robots", name: "Robots.txt", desc: "Crawler rules", icon: FileCode },
  { id: "sitemap", name: "Sitemap", desc: "XML URL map", icon: Map },
  { id: "serp", name: "SERP Preview", desc: "Search snippet", icon: Eye },
  { id: "nlp", name: "NLP Analyzer", desc: "Topics + entities", icon: FileText },
  { id: "links", name: "Internal Link Checker", desc: "Link signals", icon: Link2 },
];

const normalize = (value: string) => {
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

const safeUrl = (value: string) => {
  try { return new URL(normalize(value)); } catch { throw new Error("Please enter a valid website URL, e.g. https://example.com"); }
};

const stripHtml = (html: string) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const firstMatch = (html: string, pattern: RegExp) => html.match(pattern)?.[1]?.trim() || "";
const attr = (element: Element | null, name: string) => element?.getAttribute(name)?.trim() || "";

async function fetchViaProxy(target: string, timeoutMs = 15000) {
  const url = normalize(target);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const payload = await response.json();
    const status = Number(payload?.status?.http_code || 200);
    const contents = String(payload?.contents || "");
    if (status >= 400) throw new Error(`Website returned HTTP ${status}`);
    if (!contents) throw new Error("No response content was returned.");
    return contents;
  } finally { window.clearTimeout(timer); }
}

async function fetchPublicPage(input: string): Promise<PageData> {
  const url = normalize(input);
  safeUrl(url);
  const html = await fetchViaProxy(url);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = (doc.body?.innerText || stripHtml(html)).replace(/\s+/g, " ").trim();
  const links = Array.from(doc.querySelectorAll("a[href]"));
  return { url, html, doc, text, links };
}

function score(checks: Check[]) {
  const value = checks.reduce((sum, item) => sum + (item.status === "pass" ? 100 : item.status === "warn" ? 55 : 0), 0) / Math.max(1, checks.length);
  return Math.max(0, Math.min(100, Math.round(value)));
}

function analyze(page: PageData, tool: ToolId): Result {
  const { doc, text, url, links } = page;
  const title = doc.title.trim();
  const description = attr(doc.querySelector('meta[name="description"]'), "content");
  const canonicalRaw = attr(doc.querySelector('link[rel="canonical"]'), "href");
  const canonical = canonicalRaw ? new URL(canonicalRaw, url).href : "";
  const h1s = Array.from(doc.querySelectorAll("h1"));
  const headings = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  const images = Array.from(doc.images);
  const missingAlt = images.filter((image) => !image.hasAttribute("alt")).length;
  const emptyAlt = images.filter((image) => image.hasAttribute("alt") && !image.alt.trim()).length;
  const jsonLd = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  const schemaTypes = jsonLd.flatMap((node) => {
    try {
      const parsed = JSON.parse(node.textContent || "null");
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return items.flatMap((item) => {
        if (!item) return [];
        const type = item["@type"];
        return Array.isArray(type) ? type : type ? [String(type)] : [];
      });
    } catch { return []; }
  });
  const metaRobots = attr(doc.querySelector('meta[name="robots"]'), "content").toLowerCase();
  const viewport = Boolean(doc.querySelector('meta[name="viewport"]'));
  const lang = attr(doc.documentElement, "lang");
  const ogTitle = attr(doc.querySelector('meta[property="og:title"]'), "content");
  const ogDescription = attr(doc.querySelector('meta[property="og:description"]'), "content");
  const ogImage = attr(doc.querySelector('meta[property="og:image"]'), "content");
  const twitterCard = attr(doc.querySelector('meta[name="twitter:card"]'), "content");
  const bodyWords = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = bodyWords.length;
  const faq = /frequently asked questions|\bfaq\b|questions and answers/i.test(text);
  const answerStyle = /\bwhat is\b|\bhow to\b|\bwhy\b|\bwhen\b|\bwhere\b|\bcan you\b|\bdoes\b/i.test(text);
  const authorContext = /author|publisher|about|source|organization|expert/i.test(doc.documentElement.outerHTML);
  const internalLinks = links.filter((a) => {
    try { return new URL(a.href, url).hostname === new URL(url).hostname; } catch { return false; }
  });
  const externalLinks = links.length - internalLinks.length;
  const checks: Check[] = [];

  if (tool === "aeo") {
    checks.push({ label: "Direct-answer content", status: answerStyle ? "pass" : "warn", detail: answerStyle ? "Question-style language was detected." : "Add concise question headings followed by direct answers." });
    checks.push({ label: "FAQ coverage", status: faq ? "pass" : "warn", detail: faq ? "FAQ/question content detected." : "Add useful FAQs with concise answers." });
    checks.push({ label: "Structured data", status: schemaTypes.length ? "pass" : "fail", detail: schemaTypes.length ? `Schema detected: ${schemaTypes.slice(0, 5).join(", ")}.` : "Add FAQPage, Article, Organization or Service schema where appropriate." });
    checks.push({ label: "Single primary H1", status: h1s.length === 1 ? "pass" : "warn", detail: `${h1s.length} H1 tag(s) detected.` });
    checks.push({ label: "Useful content depth", status: wordCount >= 500 ? "pass" : wordCount >= 250 ? "warn" : "fail", detail: `${wordCount.toLocaleString()} visible words detected.` });
    checks.push({ label: "Crawlable internal links", status: internalLinks.length >= 5 ? "pass" : "warn", detail: `${internalLinks.length} internal link(s) detected.` });
    checks.push({ label: "Author/source context", status: authorContext ? "pass" : "warn", detail: authorContext ? "Author, source or organization context found." : "Add clear author, organization and source context." });
  } else if (tool === "geo") {
    const namedSignals = new Set(bodyWords.filter((w) => /^[A-Z][A-Za-z0-9&.-]{2,}$/.test(w))).size;
    checks.push({ label: "Entity signals", status: namedSignals >= 8 ? "pass" : "warn", detail: `${namedSignals} candidate named entities found in visible text.` });
    checks.push({ label: "Organization/author context", status: authorContext ? "pass" : "warn", detail: authorContext ? "Identity/context signals detected." : "Strengthen organization, author, source and about information." });
    checks.push({ label: "Canonical identity", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical URL detected." : "Canonical URL is missing." });
    checks.push({ label: "Open Graph", status: ogTitle && ogDescription && ogImage ? "pass" : "warn", detail: ogTitle && ogDescription && ogImage ? "OG title, description and image detected." : "Complete the main Open Graph fields." });
    checks.push({ label: "Machine-readable schema", status: schemaTypes.length ? "pass" : "fail", detail: schemaTypes.length ? schemaTypes.join(", ") : "No JSON-LD schema detected." });
    checks.push({ label: "Content completeness", status: wordCount >= 700 ? "pass" : wordCount >= 350 ? "warn" : "fail", detail: `${wordCount.toLocaleString()} visible words detected.` });
  } else if (tool === "llm") {
    checks.push({ label: "Structured data", status: schemaTypes.length ? "pass" : "warn", detail: schemaTypes.length ? `JSON-LD: ${schemaTypes.join(", ")}.` : "No JSON-LD detected." });
    checks.push({ label: "Entity/context vocabulary", status: authorContext ? "pass" : "warn", detail: authorContext ? "Organization/author/source context detected." : "Add explicit identity and source context." });
    checks.push({ label: "Canonical URL", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical identity present." : "Canonical identity missing." });
    checks.push({ label: "Open Graph", status: ogTitle && ogDescription ? "pass" : "warn", detail: ogTitle && ogDescription ? "OG title and description present." : "OG title/description missing." });
    checks.push({ label: "Semantic content", status: wordCount >= 500 ? "pass" : "warn", detail: `${wordCount.toLocaleString()} visible words detected.` });
    checks.push({ label: "Heading structure", status: h1s.length === 1 && headings.length >= 3 ? "pass" : "warn", detail: `${headings.length} headings detected; ${h1s.length} H1.` });
    checks.push({ label: "Crawlability", status: !metaRobots.includes("noindex") ? "pass" : "fail", detail: metaRobots.includes("noindex") ? "noindex is present." : "No noindex directive found." });
  } else {
    checks.push({ label: "HTTPS", status: url.startsWith("https://") ? "pass" : "fail", detail: url.startsWith("https://") ? "HTTPS detected." : "Use HTTPS." });
    checks.push({ label: "Title", status: title.length >= 30 && title.length <= 60 ? "pass" : title ? "warn" : "fail", detail: title ? `${title.length} characters: ${title}` : "Missing title." });
    checks.push({ label: "Meta description", status: description.length >= 120 && description.length <= 160 ? "pass" : description ? "warn" : "fail", detail: description ? `${description.length} characters.` : "Missing description." });
    checks.push({ label: "One H1", status: h1s.length === 1 ? "pass" : "warn", detail: `${h1s.length} H1 tag(s) detected.` });
    checks.push({ label: "Image alt text", status: images.length === 0 || (missingAlt === 0 && emptyAlt === 0) ? "pass" : "warn", detail: images.length ? `${missingAlt} missing alt, ${emptyAlt} empty alt out of ${images.length} images.` : "No images detected." });
    checks.push({ label: "Schema", status: schemaTypes.length ? "pass" : "warn", detail: schemaTypes.length ? `JSON-LD: ${schemaTypes.join(", ")}.` : "No JSON-LD detected." });
    checks.push({ label: "Canonical", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical detected." : "Canonical missing." });
    checks.push({ label: "Open Graph", status: ogTitle && ogDescription && ogImage ? "pass" : "warn", detail: ogTitle && ogDescription && ogImage ? "OG title, description and image present." : "One or more core OG fields are missing." });
    checks.push({ label: "Mobile viewport", status: viewport ? "pass" : "fail", detail: viewport ? "Responsive viewport meta tag detected." : "Viewport meta tag is missing." });
    checks.push({ label: "Language", status: lang ? "pass" : "warn", detail: lang ? `HTML language: ${lang}.` : "HTML lang attribute is missing." });
    checks.push({ label: "Content depth", status: wordCount >= 600 ? "pass" : wordCount >= 300 ? "warn" : "fail", detail: `${wordCount.toLocaleString()} visible words.` });
    checks.push({ label: "Internal links", status: internalLinks.length >= 5 ? "pass" : "warn", detail: `${internalLinks.length} internal, ${externalLinks} external link(s).` });
    checks.push({ label: "Crawlability", status: metaRobots.includes("noindex") ? "fail" : "pass", detail: metaRobots.includes("noindex") ? "noindex directive found." : "No noindex directive found." });
    checks.push({ label: "Social card", status: twitterCard ? "pass" : "warn", detail: twitterCard ? `Twitter card: ${twitterCard}.` : "Twitter card metadata is missing." });
  }

  return { title: `${TOOLS.find((item) => item.id === tool)?.name || "Tool"} Analysis`, score: score(checks), summary: `Live page analysis completed for ${url}.`, checks, source: url };
}

function cleanSeed(input: string) {
  const raw = input.trim();
  if (!raw) return "";
  try { return new URL(normalize(raw)).hostname.replace(/^www\./, "").split(".")[0].replace(/[-_]/g, " "); } catch { return raw.replace(/\s+/g, " "); }
}

function buildKeywordFallback(seed: string) {
  const base = seed.trim();
  return Array.from(new Set([
    base, `${base} services`, `${base} company`, `${base} agency`, `${base} consultant`, `best ${base}`, `${base} pricing`, `${base} reviews`, `${base} near me`, `${base} online`, `${base} tools`, `${base} solutions`, `${base} strategy`, `${base} guide`, `${base} vs competitors`, `how to choose ${base}`,
  ])).filter(Boolean);
}

async function keywordResearch(input: string): Promise<Result> {
  const seed = cleanSeed(input);
  if (!seed) throw new Error("Enter a keyword, topic or website for keyword research.");
  const variants = [seed, `${seed} `, `best ${seed}`, `how to ${seed}`, `${seed} services`];
  const suggestions = new Set<string>();
  for (const q of variants) {
    try {
      const raw = await fetchViaProxy(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`, 7000);
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed?.[1]) ? parsed[1] : [];
      items.forEach((item: unknown) => { if (typeof item === "string") suggestions.add(item); });
    } catch { /* fallback remains available */ }
  }
  const keywords = Array.from(new Set([...suggestions, ...buildKeywordFallback(seed)])).slice(0, 40);
  const grouped = keywords.map((keyword) => {
    const lower = keyword.toLowerCase();
    const intent = /\b(buy|price|pricing|cost|hire|agency|service|near me|quote)\b/.test(lower) ? "Commercial" : /\b(best|top|vs|review|alternative)\b/.test(lower) ? "Commercial investigation" : /\b(how|what|why|guide|tips|learn)\b/.test(lower) ? "Informational" : "Navigational / mixed";
    return `${keyword}  —  ${intent}`;
  });
  return { title: "Keyword Research Result", summary: `${keywords.length} keyword ideas generated from Google autocomplete signals plus local intent expansion. Search volume and CPC are not fabricated; connect a keyword-data API for those metrics.`, code: grouped.join("\n"), source: seed };
}

function generateMeta(page: PageData): Result {
  const { doc, url, text } = page;
  const currentTitle = doc.title.trim();
  const currentDescription = attr(doc.querySelector('meta[name="description"]'), "content");
  const h1 = attr(doc.querySelector("h1"), "textContent") || currentTitle || new URL(url).hostname;
  const cleanH1 = h1.replace(/\s+/g, " ").trim();
  const title = cleanH1.length <= 60 ? cleanH1 : `${cleanH1.slice(0, 57).replace(/\s+\S*$/, "")}...`;
  const fallback = text.slice(0, 155).replace(/\s+/g, " ").trim();
  const description = currentDescription || `${cleanH1}. Explore services, solutions, resources and the latest updates. Learn more and get started today.`;
  const finalDescription = description.length <= 160 ? description : `${description.slice(0, 157).replace(/\s+\S*$/, "")}...`;
  const code = `<title>${title}</title>\n<meta name="description" content="${finalDescription.replace(/"/g, "&quot;")}">\n<meta property="og:title" content="${title.replace(/"/g, "&quot;")}">\n<meta property="og:description" content="${finalDescription.replace(/"/g, "&quot;")}">`;
  return { title: "Meta Generator Result", summary: `Generated from the live page content. Existing title: ${currentTitle ? "found" : "missing"}; existing description: ${currentDescription ? "found" : "missing"}.`, code, source: url };
}

function generateSchema(page: PageData): Result {
  const { doc, url } = page;
  const title = doc.title.trim() || attr(doc.querySelector("h1"), "textContent") || new URL(url).hostname;
  const description = attr(doc.querySelector('meta[name="description"]'), "content");
  const image = attr(doc.querySelector('meta[property="og:image"]'), "content");
  const logo = attr(doc.querySelector('link[rel="icon"]'), "href");
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: title,
    url,
    description,
    ...(image ? { image: new URL(image, url).href } : {}),
    potentialAction: { "@type": "SearchAction", target: `${new URL(url).origin}/?q={search_term_string}`, "query-input": "required name=search_term_string" },
    ...(logo ? { logo: new URL(logo, url).href } : {}),
  };
  return { title: "Schema Generator Result", summary: "Generated JSON-LD from the live page title, description, URL and available social/image signals.", code: JSON.stringify(data, null, 2), source: url };
}

async function generateRobots(input: string): Promise<Result> {
  const site = safeUrl(input);
  const robotsUrl = `${site.origin}/robots.txt`;
  try {
    const content = await fetchViaProxy(robotsUrl, 10000);
    return { title: "Robots.txt Result", summary: "Live robots.txt fetched successfully.", code: content.trim(), source: robotsUrl };
  } catch {
    return { title: "Robots.txt Generator Result", summary: "The live robots.txt could not be fetched, so a safe starter file was generated.", code: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${site.origin}/sitemap.xml`, source: robotsUrl };
  }
}

function generateSitemap(page: PageData): Result {
  const site = new URL(page.url);
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const link of page.links) {
    try {
      const u = new URL(link.href, page.url);
      if (u.protocol !== "http:" && u.protocol !== "https:") return;
      if (u.hostname !== site.hostname) return;
      u.hash = "";
      if (!seen.has(u.href)) { seen.add(u.href); urls.push(u.href); }
    } catch { /* ignore malformed links */ }
  }
  if (!seen.has(site.href)) urls.unshift(site.href);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.slice(0, 100).map((u) => `  <url><loc>${u.replace(/&/g, "&amp;")}</loc></url>`).join("\n")}\n</urlset>`;
  return { title: "Sitemap Generator Result", summary: `Generated an XML sitemap from ${Math.min(urls.length, 100)} unique internal URLs discovered on the live page.`, code: xml, source: page.url };
}

function serpPreview(page: PageData): Result {
  const title = page.doc.title.trim() || "Untitled page";
  const description = attr(page.doc.querySelector('meta[name="description"]'), "content") || page.text.slice(0, 160);
  const displayTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;
  const displayDescription = description.length > 160 ? `${description.slice(0, 157)}...` : description;
  const host = new URL(page.url).hostname;
  return { title: "SERP Preview", summary: "Preview generated from the live page title, URL and meta description.", code: `${displayTitle}\n${host}\n${displayDescription}`, source: page.url };
}

function nlpAnalyze(page: PageData): Result {
  const stop = new Set("the a an and or but for with from this that these those are is was were be been being to of in on at by as into about how what why when where can could should would will your you we our their they it its this have has had do does did not no yes more most very using use used get make made page website service services official latest new best guide from than then also all any each".split(" "));
  const counts = new Map<string, number>();
  page.text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).forEach((word) => {
    const w = word.trim();
    if (w.length >= 4 && !stop.has(w) && !/^\d+$/.test(w)) counts.set(w, (counts.get(w) || 0) + 1);
  });
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 30);
  const headings = Array.from(page.doc.querySelectorAll("h1,h2,h3")).map((h) => h.textContent?.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 20);
  const entities = Array.from(new Set((page.text.match(/\b[A-Z][A-Za-z0-9&.-]{2,}\b/g) || []))).slice(0, 25);
  const code = `Top topical terms:\n${top.map(([word, count]) => `${word} (${count})`).join("\n")}\n\nHeadings:\n${headings.join("\n")}\n\nCandidate entities:\n${entities.join("\n")}`;
  return { title: "NLP Analyzer Result", summary: `Analyzed ${page.text.split(/\s+/).filter(Boolean).length.toLocaleString()} visible words and extracted frequent topical terms, headings and candidate entities.`, code, source: page.url };
}

function linkCheck(page: PageData): Result {
  const base = new URL(page.url);
  const internal = page.links.filter((a) => { try { return new URL(a.href, page.url).hostname === base.hostname; } catch { return false; } });
  const external = page.links.length - internal.length;
  const nofollow = page.links.filter((a) => /(^|\s)nofollow(\s|$)/i.test(attr(a, "rel"))).length;
  const blank = page.links.filter((a) => attr(a, "target") === "_blank").length;
  const emptyAnchor = page.links.filter((a) => !(a.textContent || "").trim() && !a.querySelector("img[alt]"));
  const duplicateTargets = new Map<string, number>();
  internal.forEach((a) => { try { const u = new URL(a.href, page.url); u.hash = ""; duplicateTargets.set(u.href, (duplicateTargets.get(u.href) || 0) + 1); } catch {} });
  const duplicateCount = Array.from(duplicateTargets.values()).filter((n) => n > 1).length;
  const checks: Check[] = [
    { label: "Internal links", status: internal.length >= 5 ? "pass" : internal.length ? "warn" : "fail", detail: `${internal.length} internal links found.` },
    { label: "External links", status: external ? "pass" : "warn", detail: `${external} external links found.` },
    { label: "Descriptive anchors", status: emptyAnchor.length === 0 ? "pass" : "warn", detail: `${emptyAnchor.length} links have no accessible anchor text.` },
    { label: "Duplicate destinations", status: duplicateCount <= 3 ? "pass" : "warn", detail: `${duplicateCount} internal destinations occur more than once.` },
    { label: "Nofollow usage", status: "pass", detail: `${nofollow} links use rel=nofollow.` },
    { label: "New-tab links", status: "pass", detail: `${blank} links open in a new tab.` },
  ];
  return { title: "Internal Link Checker Result", score: score(checks), summary: `Analyzed ${page.links.length} links on the live page.`, checks, source: page.url };
}

async function generate(tool: ToolId, input: string): Promise<Result> {
  if (tool === "keyword") return keywordResearch(input);
  const page = await fetchPublicPage(input);
  if (tool === "meta") return generateMeta(page);
  if (tool === "schema") return generateSchema(page);
  if (tool === "robots") return generateRobots(input);
  if (tool === "sitemap") return generateSitemap(page);
  if (tool === "serp") return serpPreview(page);
  if (tool === "nlp") return nlpAnalyze(page);
  if (tool === "links") return linkCheck(page);
  throw new Error("Unsupported tool.");
}

export default function PublicToolsLab() {
  const [tool, setTool] = useState<ToolId>("audit");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const selected = useMemo(() => TOOLS.find((item) => item.id === tool) || TOOLS[0], [tool]);

  const run = async () => {
    if (!url.trim()) {
      setResult({ title: "Enter a website or topic", summary: "Enter a public website URL, or a keyword/topic for Keyword Research.", error: tool === "keyword" ? "Example: AI SEO" : "Example: https://example.com" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      if (["audit", "aeo", "geo", "llm"].includes(tool)) {
        const page = await fetchPublicPage(url);
        setResult(analyze(page, tool));
      } else {
        setResult(await generate(tool, url));
      }
    } catch (error) {
      setResult({ title: "Tool could not complete", summary: "The requested analysis could not be completed.", error: error instanceof Error ? error.message : "Please check the URL and try again." });
    } finally { setLoading(false); }
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
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Run live public-page checks, generate SEO assets from real page content, research autocomplete keywords, and export reports.</p>
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
          <input value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void run(); }} placeholder={selected.id === "keyword" ? "example.com or seed topic" : "https://example.com"} className="h-12 flex-1 rounded-xl border bg-background px-4 outline-none focus:ring-2 focus:ring-primary" aria-label="Website URL or keyword" />
          <button type="button" onClick={() => void run()} disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {loading ? "Working…" : "Run tool"}</button>
        </div>
      </div>
      {result && <div id="cst-tool-result" className="mx-auto mt-8 max-w-4xl rounded-2xl border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><h3 className="text-2xl font-bold">{result.title}</h3><p className="mt-1 text-muted-foreground">{result.summary}</p>{result.source && <p className="mt-1 break-all text-xs text-muted-foreground">Source: {result.source}</p>}</div>
          {typeof result.score === "number" && <div className="rounded-2xl border px-5 py-3 text-center"><div className="text-3xl font-bold">{result.score}</div><div className="text-xs text-muted-foreground">/ 100</div></div>}
        </div>
        {result.error && <div className="mt-5 flex gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{result.error}</span></div>}
        {result.checks && <div className="mt-6 grid gap-3 md:grid-cols-2">{result.checks.map((item) => <div key={item.label} className="rounded-xl border p-4"><div className="flex items-center gap-2 font-semibold">{item.status === "pass" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{item.label}</div><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p></div>)}</div>}
        {result.code && <pre className="mt-6 max-h-[560px] overflow-auto rounded-xl bg-muted p-4 text-sm whitespace-pre-wrap break-words">{result.code}</pre>}
        {!result.error && <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => void safeExport(pdf, "PDF export failed.")} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-medium"><Download className="h-4 w-4" /> Download PDF</button><button type="button" onClick={() => void safeExport(screenshot, "Screenshot export failed.")} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-medium"><ImageDown className="h-4 w-4" /> Save Screenshot</button></div>}
      </div>}
    </section>
  );
}
