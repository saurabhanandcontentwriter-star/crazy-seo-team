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
import { Copy, Download, Sparkles, FileCode, Map, Search } from "lucide-react";
import { toast } from "sonner";
import { auditPost } from "@/lib/seoAudit";

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

const AITools = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Free AI SEO Tools — Meta, Schema, Sitemap & Audit | Crazy SEO Team</title>
      <meta name="description" content="Free AI-powered SEO tools: meta tag generator, JSON-LD schema builder, XML sitemap generator, and instant on-page SEO audit. Built by Crazy SEO Team." />
      <link rel="canonical" href="/ai-tools" />
    </Helmet>
    <Navbar />
    <div className="pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <Badge className="mb-3 gradient-bg text-primary-foreground"><Sparkles size={12} className="mr-1" /> Free Tools</Badge>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-3">AI SEO Toolkit</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Production-ready tools to generate meta tags, structured data, sitemaps, and run instant SEO audits — all free, no signup.</p>
        </div>
        <Tabs defaultValue="meta" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6">
            <TabsTrigger value="meta"><Search size={14} className="mr-1" /> Meta</TabsTrigger>
            <TabsTrigger value="schema"><FileCode size={14} className="mr-1" /> Schema</TabsTrigger>
            <TabsTrigger value="sitemap"><Map size={14} className="mr-1" /> Sitemap</TabsTrigger>
            <TabsTrigger value="audit"><Sparkles size={14} className="mr-1" /> Audit</TabsTrigger>
          </TabsList>
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
