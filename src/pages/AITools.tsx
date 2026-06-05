import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Sparkles, FileCode, Map, Search, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { auditPost } from "@/lib/seoAudit";
import { analyzeReadability } from "@/lib/readability";
import { supabase } from "@/integrations/supabase/client";


const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied"); };
const downloadFile = (name: string, content: string, type = "text/plain") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};

// ---------- Meta Generator ----------
const MetaGenerator = () => {
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");

  const html = `<title>${title || "Page title"}</title>
<meta name="description" content="${desc || "Page description"}" />
<meta name="keywords" content="${keyword || ""}" />
<link rel="canonical" href="${url || "https://example.com/"}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="website" />
${image ? `<meta property="og:image" content="${image}" />` : ""}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
${image ? `<meta name="twitter:image" content="${image}" />` : ""}`;

  const titleLen = title.length, descLen = desc.length;
  const titleColor = titleLen === 0 ? "text-muted-foreground" : titleLen > 60 ? "text-destructive" : titleLen < 30 ? "text-[hsl(45,90%,40%)]" : "text-[hsl(142,70%,40%)]";
  const descColor = descLen === 0 ? "text-muted-foreground" : descLen > 160 ? "text-destructive" : descLen < 120 ? "text-[hsl(45,90%,40%)]" : "text-[hsl(142,70%,40%)]";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div><Label>Page Title (H1)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} /><p className={`text-xs ${titleColor}`}>{titleLen}/60 chars</p></div>
        <div><Label>Target Keyword</Label><Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="ai seo services" /></div>
        <div><Label>Meta Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={200} /><p className={`text-xs ${descColor}`}>{descLen}/160 chars</p></div>
        <div><Label>Canonical URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com/page" /></div>
        <div><Label>OG Image URL</Label><Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://yoursite.com/og.jpg" /></div>
      </div>
      <div className="space-y-3">
        <Label>Google SERP Preview</Label>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-[hsl(142,40%,50%)]">{url || "https://example.com"}</p>
          <p className="text-lg text-primary truncate">{title || "Your title here"}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{desc || "Your meta description here..."}</p>
        </div>
        <Label>Generated HTML</Label>
        <pre className="p-3 rounded-lg border border-border bg-secondary/40 text-[11px] overflow-auto max-h-72 whitespace-pre-wrap break-all">{html}</pre>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => copy(html)}><Copy size={14} className="mr-1" /> Copy</Button>
          <Button size="sm" variant="outline" onClick={() => downloadFile("meta-tags.html", html, "text/html")}><Download size={14} className="mr-1" /> Download</Button>
        </div>
      </div>
    </div>
  );
};

// ---------- Schema Generator ----------
const SchemaGenerator = () => {
  const [type, setType] = useState<"Article" | "Organization" | "FAQPage" | "Service" | "LocalBusiness">("Article");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("Crazy SEO Team");
  const [faqs, setFaqs] = useState([{ q: "", a: "" }]);

  const buildSchema = () => {
    const base: any = { "@context": "https://schema.org", "@type": type, name, description: desc, url };
    if (image) base.image = image;
    if (type === "Article") { base.headline = name; base.author = { "@type": "Person", name: author }; base.datePublished = new Date().toISOString(); }
    if (type === "FAQPage") base.mainEntity = faqs.filter(f => f.q && f.a).map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }));
    if (type === "Service") base.provider = { "@type": "Organization", name: author };
    return JSON.stringify(base, null, 2);
  };
  const schema = buildSchema();
  const html = `<script type="application/ld+json">\n${schema}\n</script>`;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div>
          <Label>Schema Type</Label>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="Article">Article</option>
            <option value="Organization">Organization</option>
            <option value="FAQPage">FAQ Page</option>
            <option value="Service">Service</option>
            <option value="LocalBusiness">Local Business</option>
          </select>
        </div>
        <div><Label>Name / Title</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} /></div>
        <div><Label>URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
        <div><Label>Image URL</Label><Input value={image} onChange={(e) => setImage(e.target.value)} /></div>
        {type === "Article" && <div><Label>Author</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} /></div>}
        {type === "FAQPage" && (
          <div className="space-y-2">
            <Label>FAQs</Label>
            {faqs.map((f, i) => (
              <div key={i} className="space-y-1 p-2 border border-border rounded">
                <Input placeholder="Question" value={f.q} onChange={(e) => setFaqs(faqs.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} />
                <Textarea placeholder="Answer" rows={2} value={f.a} onChange={(e) => setFaqs(faqs.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} />
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setFaqs([...faqs, { q: "", a: "" }])}>+ Add FAQ</Button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <Label>Generated JSON-LD</Label>
        <pre className="p-3 rounded-lg border border-border bg-secondary/40 text-[11px] overflow-auto max-h-96 whitespace-pre-wrap break-all">{html}</pre>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => copy(html)}><Copy size={14} className="mr-1" /> Copy</Button>
          <Button size="sm" variant="outline" onClick={() => downloadFile("schema.html", html, "text/html")}><Download size={14} className="mr-1" /> Download</Button>
        </div>
      </div>
    </div>
  );
};

// ---------- Sitemap Generator ----------
const SitemapGenerator = () => {
  const [base, setBase] = useState("https://yoursite.com");
  const [paths, setPaths] = useState("/\n/about\n/services\n/pricing\n/blog\n/contact");
  const today = new Date().toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.split("\n").filter(Boolean).map(p => {
    const url = base.replace(/\/$/, "") + (p.startsWith("/") ? p : "/" + p);
    const priority = p.trim() === "/" ? "1.0" : "0.8";
    return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join("\n")}
</urlset>`;

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${base.replace(/\/$/, "")}/sitemap.xml`;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div><Label>Base URL</Label><Input value={base} onChange={(e) => setBase(e.target.value)} /></div>
        <div><Label>Paths (one per line)</Label><Textarea value={paths} onChange={(e) => setPaths(e.target.value)} rows={12} className="font-mono text-xs" /></div>
      </div>
      <div className="space-y-4">
        <div>
          <Label>sitemap.xml ({paths.split("\n").filter(Boolean).length} URLs)</Label>
          <pre className="p-3 rounded-lg border border-border bg-secondary/40 text-[10px] overflow-auto max-h-60 whitespace-pre-wrap break-all">{xml}</pre>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => copy(xml)}><Copy size={14} className="mr-1" /> Copy</Button>
            <Button size="sm" variant="outline" onClick={() => downloadFile("sitemap.xml", xml, "application/xml")}><Download size={14} className="mr-1" /> Download</Button>
          </div>
        </div>
        <div>
          <Label>robots.txt</Label>
          <pre className="p-3 rounded-lg border border-border bg-secondary/40 text-xs whitespace-pre-wrap">{robots}</pre>
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => copy(robots)}><Copy size={14} className="mr-1" /> Copy</Button>
            <Button size="sm" variant="outline" onClick={() => downloadFile("robots.txt", robots)}><Download size={14} className="mr-1" /> Download</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- SEO Auditor ----------
const SEOAuditor = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [keyword, setKeyword] = useState("");
  const [content, setContent] = useState("");
  const audit = auditPost({ title, description: desc, meta_title: title, meta_description: desc, target_keyword: keyword, content, author: "You", published_at: new Date().toISOString() });
  const scoreColor = audit.score >= 80 ? "text-[hsl(142,70%,40%)]" : audit.score >= 60 ? "text-[hsl(45,90%,40%)]" : "text-destructive";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div><Label>Page Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label>Meta Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} /></div>
        <div><Label>Target Keyword</Label><Input value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
        <div><Label>Content (paste HTML or markdown)</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} className="font-mono text-xs" /></div>
      </div>
      <div className="space-y-2">
        <div className="text-center p-4 rounded-lg bg-secondary/40">
          <p className={`text-6xl font-black ${scoreColor}`}>{audit.score}<span className="text-sm text-muted-foreground">/100</span></p>
          <p className="text-xs text-muted-foreground">SEO Score</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-secondary/40"><p className="font-bold">{audit.stats.wordCount}</p><p className="text-muted-foreground">words</p></div>
          <div className="p-2 rounded bg-secondary/40"><p className="font-bold">{audit.stats.h2Count}</p><p className="text-muted-foreground">H2s</p></div>
          <div className="p-2 rounded bg-secondary/40"><p className="font-bold">{audit.stats.keywordDensity}%</p><p className="text-muted-foreground">density</p></div>
        </div>
        <div className="space-y-1.5 max-h-96 overflow-auto">
          {audit.checks.map(c => (
            <div key={c.id} className="p-2 rounded border border-border text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{c.label}</span>
                <Badge variant={c.status === "pass" ? "default" : c.status === "warn" ? "secondary" : "destructive"} className="text-[10px]">{c.status.toUpperCase()}</Badge>
              </div>
              <p className="text-muted-foreground mt-1 whitespace-pre-line">{c.detail}</p>
              {c.recommendation && <p className="text-primary mt-1">💡 {c.recommendation}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- AI Article Generator ----------
type GeneratedArticle = {
  title?: string;
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  content_html?: string;
  faqs?: { q: string; a: string }[];
  internal_link_suggestions?: string[];
  schema?: any;
  featured_image_prompt?: string;
};

const ArticleGenerator = () => {
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<"SEO" | "GEO" | "AEO" | "LLM Optimized">("SEO");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState<"Short" | "Medium" | "Long-form">("Long-form");
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [tab, setTab] = useState<"preview" | "html" | "meta" | "schema" | "faqs">("preview");

  const generate = async () => {
    if (!topic.trim()) { toast.error("Enter a topic"); return; }
    setLoading(true); setArticle(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { topic, keyword, type, tone, length },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setArticle(data as GeneratedArticle);
      toast.success("Article generated");
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = () => {
    if (!article) return;
    const drafts = JSON.parse(localStorage.getItem("ai_article_drafts") || "[]");
    drafts.unshift({ ...article, _savedAt: new Date().toISOString() });
    localStorage.setItem("ai_article_drafts", JSON.stringify(drafts.slice(0, 20)));
    toast.success("Saved to local drafts");
  };

  const exportMd = () => {
    if (!article) return;
    const md = `# ${article.title}\n\n${(article.content_html || "").replace(/<[^>]+>/g, "")}\n\n## FAQs\n${(article.faqs||[]).map(f=>`**${f.q}**\n${f.a}`).join("\n\n")}`;
    downloadFile(`${article.slug || "article"}.md`, md, "text/markdown");
  };

  const readability = article?.content_html ? analyzeReadability(article.content_html) : null;
  const audit = article
    ? auditPost({
        title: article.title || "",
        description: article.meta_description || "",
        meta_title: article.meta_title || article.title || "",
        meta_description: article.meta_description || "",
        target_keyword: keyword,
        content: article.content_html || "",
        author: "Crazy SEO Team",
        published_at: new Date().toISOString(),
      })
    : null;

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <div className="space-y-3">
        <div><Label>Topic *</Label><Textarea rows={2} value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="How AI search is changing SEO in 2026" /></div>
        <div><Label>Target Keyword</Label><Input value={keyword} onChange={(e)=>setKeyword(e.target.value)} placeholder="ai seo 2026" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Type</Label>
            <select value={type} onChange={(e)=>setType(e.target.value as any)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option>SEO</option><option>GEO</option><option>AEO</option><option>LLM Optimized</option>
            </select>
          </div>
          <div>
            <Label>Length</Label>
            <select value={length} onChange={(e)=>setLength(e.target.value as any)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option>Short</option><option>Medium</option><option>Long-form</option>
            </select>
          </div>
        </div>
        <div>
          <Label>Tone</Label>
          <select value={tone} onChange={(e)=>setTone(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
            <option>Professional</option><option>Conversational</option><option>Authoritative</option><option>Friendly</option><option>Technical</option>
          </select>
        </div>
        <Button onClick={generate} disabled={loading} className="w-full gradient-bg text-primary-foreground">
          {loading ? <><Loader2 className="mr-2 animate-spin" size={16} /> Generating…</> : <><Wand2 className="mr-2" size={16}/> Generate Article</>}
        </Button>
        {article && (
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={saveDraft}>Save Draft</Button>
            <Button size="sm" variant="outline" onClick={exportMd}><Download size={14} className="mr-1"/> Export .md</Button>
            <Button size="sm" variant="outline" onClick={()=>copy(article.content_html || "")}>Copy HTML</Button>
            <Button size="sm" variant="outline" onClick={()=>copy(JSON.stringify(article.schema || {}, null, 2))}>Copy Schema</Button>
          </div>
        )}
        {audit && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
            <div className="p-2 rounded bg-secondary/40"><p className="text-xl font-black text-primary">{audit.score}</p><p className="text-muted-foreground">SEO</p></div>
            <div className="p-2 rounded bg-secondary/40"><p className="text-xl font-black text-primary">{readability?.fleschScore.toFixed(0) ?? "—"}</p><p className="text-muted-foreground">Read</p></div>
            <div className="p-2 rounded bg-secondary/40"><p className="text-xl font-black text-primary">{audit.stats.keywordDensity}%</p><p className="text-muted-foreground">Density</p></div>
          </div>
        )}
      </div>

      <div className="min-h-[500px] border border-border rounded-lg bg-card">
        {!article && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 text-muted-foreground">
            <Sparkles size={32} className="mb-3 text-primary" />
            <p className="font-semibold text-foreground">AI Article Generator</p>
            <p className="text-sm">Enter a topic and click Generate to produce an SEO/GEO/AEO/LLM-optimized article with meta, schema, FAQs and image prompt.</p>
          </div>
        )}
        {loading && (
          <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>
        )}
        {article && (
          <div className="p-4">
            <div className="flex gap-1 mb-3 border-b border-border">
              {(["preview","html","meta","schema","faqs"] as const).map(t => (
                <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border-b-2 -mb-px ${tab===t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{t}</button>
              ))}
            </div>
            {tab === "preview" && (
              <article className="prose prose-sm dark:prose-invert max-w-none">
                <h1>{article.title}</h1>
                <p className="text-muted-foreground italic">{article.meta_description}</p>
                <div dangerouslySetInnerHTML={{ __html: article.content_html || "" }} />
              </article>
            )}
            {tab === "html" && (
              <pre className="p-3 rounded bg-secondary/40 text-[11px] overflow-auto max-h-[600px] whitespace-pre-wrap break-all">{article.content_html}</pre>
            )}
            {tab === "meta" && (
              <div className="space-y-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Slug</p><code className="text-xs">{article.slug}</code></div>
                <div><p className="text-xs text-muted-foreground">Meta Title ({article.meta_title?.length || 0}/60)</p><p>{article.meta_title}</p></div>
                <div><p className="text-xs text-muted-foreground">Meta Description ({article.meta_description?.length || 0}/160)</p><p>{article.meta_description}</p></div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Internal Link Suggestions</p>
                  <ul className="list-disc pl-5 text-sm">{(article.internal_link_suggestions||[]).map((l,i)=><li key={i}>{l}</li>)}</ul>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">AI Featured Image Prompt</p>
                  <p className="text-sm italic">{article.featured_image_prompt}</p>
                </div>
              </div>
            )}
            {tab === "schema" && (
              <pre className="p-3 rounded bg-secondary/40 text-[11px] overflow-auto max-h-[600px] whitespace-pre-wrap break-all">{JSON.stringify(article.schema, null, 2)}</pre>
            )}
            {tab === "faqs" && (
              <div className="space-y-3">
                {(article.faqs||[]).map((f,i) => (
                  <div key={i} className="p-3 border border-border rounded">
                    <p className="font-semibold text-foreground">{f.q}</p>
                    <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AITools = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Free AI SEO Tools — Article Generator, Meta, Schema, Sitemap & Audit | Crazy SEO Team</title>
      <meta name="description" content="Free AI-powered SEO tools: AI article generator (SEO/GEO/AEO/LLM), meta tag generator, JSON-LD schema builder, XML sitemap generator, and on-page SEO audit." />
      <link rel="canonical" href="/ai-tools" />
    </Helmet>
    <Navbar />
    <div className="pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <Badge className="mb-3 gradient-bg text-primary-foreground"><Sparkles size={12} className="mr-1" /> Free Tools</Badge>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-3">AI SEO Toolkit</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Production-ready tools: AI article generator, meta tags, structured data, sitemaps, and instant SEO audits — all free, no signup.</p>
        </div>
        <Tabs defaultValue="article" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full mb-6">
            <TabsTrigger value="article"><Wand2 size={14} className="mr-1" /> Article AI</TabsTrigger>
            <TabsTrigger value="meta"><Search size={14} className="mr-1" /> Meta</TabsTrigger>
            <TabsTrigger value="schema"><FileCode size={14} className="mr-1" /> Schema</TabsTrigger>
            <TabsTrigger value="sitemap"><Map size={14} className="mr-1" /> Sitemap</TabsTrigger>
            <TabsTrigger value="audit"><Sparkles size={14} className="mr-1" /> Audit</TabsTrigger>
          </TabsList>
          <TabsContent value="article"><ArticleGenerator /></TabsContent>
          <TabsContent value="meta"><MetaGenerator /></TabsContent>
          <TabsContent value="schema"><SchemaGenerator /></TabsContent>
          <TabsContent value="sitemap"><SitemapGenerator /></TabsContent>
          <TabsContent value="audit"><SEOAuditor /></TabsContent>
        </Tabs>
      </div>
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default AITools;

