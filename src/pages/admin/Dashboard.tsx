import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllPostsAdmin, slugify, type BlogPost } from "@/lib/blog";
import { auditPost, type SeoAuditResult } from "@/lib/seoAudit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Sparkles, LogOut, ExternalLink, CheckCircle2, AlertTriangle, XCircle, FileText, Wand2, Brain } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type DraftPost = Partial<BlogPost> & { id?: string };

const StatusIcon = ({ status }: { status: "pass" | "warn" | "fail" }) => {
  if (status === "pass") return <CheckCircle2 size={16} className="text-[hsl(142,70%,40%)] shrink-0" />;
  if (status === "fail") return <XCircle size={16} className="text-destructive shrink-0" />;
  return <AlertTriangle size={16} className="text-[hsl(45,90%,50%)] shrink-0" />;
};

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

// Convert simple markdown to HTML (one-time, when editing legacy posts)
const mdToHtml = (md: string): string => {
  if (!md) return "";
  if (/<\/?[a-z][\s\S]*>/i.test(md)) return md; // already HTML
  const blocks = md.split(/\n\n+/).map((b) => {
    if (b.startsWith("### ")) return `<h3>${b.slice(4)}</h3>`;
    if (b.startsWith("## ")) return `<h2>${b.slice(3)}</h2>`;
    if (b.startsWith("# ")) return `<h2>${b.slice(2)}</h2>`;
    if (b.startsWith("- ")) {
      const items = b.split("\n").map((l) => `<li>${l.replace(/^- /, "")}</li>`).join("");
      return `<ul>${items}</ul>`;
    }
    if (/^\d+\.\s/.test(b)) {
      const items = b.split("\n").map((l) => `<li>${l.replace(/^\d+\.\s*/, "")}</li>`).join("");
      return `<ol>${items}</ol>`;
    }
    let p = b.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return `<p>${p}</p>`;
  });
  return blocks.join("");
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") !== "1") {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);
  const [posts, setPosts] = useState<(BlogPost & { id: string })[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [draft, setDraft] = useState<DraftPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiKeyword, setAiKeyword] = useState("");
  const [aiTag, setAiTag] = useState("SEO");
  const [aiBusy, setAiBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const adminUserId = sessionStorage.getItem("admin_user_id") || "Crazyseoteam";

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image too large (max 5MB)"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setDraft((d) => d ? { ...d, hero_image: data.publicUrl } : d);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error("Upload failed", { description: e.message });
    } finally {
      setUploading(false);
    }
  };

  const loadPosts = async () => {
    setLoadingList(true);
    try {
      const all = await fetchAllPostsAdmin();
      setPosts(all as any);
    } catch (e: any) {
      toast.error("Failed to load posts", { description: e.message });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleSignOut = () => {
    sessionStorage.removeItem("admin_authed");
    navigate("/admin/login", { replace: true });
  };

  const startNew = () => setDraft({ slug: "", title: "", description: "", content: "", tag: "SEO", author: "Crazy SEO Team", author_role: "Editorial", source: "manual", published: true, target_keyword: "", meta_title: "", meta_description: "", hero_image: "", hero_image_alt: "" });

  const editPost = (p: any) => setDraft({
    id: p.id, slug: p.slug, title: p.title, description: p.description, content: mdToHtml(p.content),
    tag: p.tag, author: p.author, author_role: p.author_role, author_img: p.author_img,
    hero_image: p.hero_image, hero_image_alt: p.hero_image_alt,
    meta_title: p.meta_title, meta_description: p.meta_description,
    target_keyword: p.target_keyword, source: p.source, published: p.published,
  });

  const savePost = async () => {
    if (!draft) return;
    if (!draft.title || !draft.title.trim()) { toast.error("Title required"); return; }
    if (!draft.slug || !draft.slug.trim()) { toast.error("Slug required"); return; }
    setSaving(true);
    try {
      const payload = {
        slug: draft.slug!.trim(),
        title: draft.title!.trim(),
        description: draft.description || "",
        content: draft.content || "",
        tag: draft.tag || "SEO",
        author: draft.author || "Crazy SEO Team",
        author_role: draft.author_role || "Editorial",
        hero_image: draft.hero_image || null,
        hero_image_alt: draft.hero_image_alt || null,
        meta_title: draft.meta_title || null,
        meta_description: draft.meta_description || null,
        target_keyword: draft.target_keyword || null,
        source: draft.source || "manual",
        published: draft.published !== false,
      };
      let res;
      if (draft.id) {
        res = await supabase.from("blog_posts").update(payload).eq("id", draft.id);
      } else {
        res = await supabase.from("blog_posts").insert(payload);
      }
      if (res.error) throw res.error;
      toast.success(draft.id ? "Post updated" : "Post created");
      setDraft(null);
      loadPosts();
    } catch (e: any) {
      toast.error("Save failed", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error("Delete failed", { description: error.message });
    toast.success("Post deleted");
    loadPosts();
  };

  const generateAI = async () => {
    if (!aiTopic.trim()) { toast.error("Enter a topic"); return; }
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: { topic: aiTopic, keyword: aiKeyword || aiTopic, tag: aiTag },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const a = (data as any).article;
      setDraft({
        slug: slugify(a.slug || a.title),
        title: a.title,
        description: a.description,
        content: mdToHtml(a.content),
        tag: a.tag || aiTag,
        author: "Crazy SEO Team",
        author_role: "AI Editorial",
        meta_title: a.meta_title,
        meta_description: a.meta_description,
        target_keyword: a.target_keyword || aiKeyword || aiTopic,
        source: "ai",
        published: false,
        hero_image: "",
      });
      setAiTopic(""); setAiKeyword("");
      toast.success("Article generated", { description: "Review and publish when ready." });
    } catch (e: any) {
      toast.error("AI generation failed", { description: e.message });
    } finally {
      setAiBusy(false);
    }
  };

  const autoOptimize = async () => {
    if (!draft) return;
    if (!(draft.title || "").trim() && !(draft.content || "").trim()) {
      toast.error("Add a title or some content first"); return;
    }
    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("llm-seo-optimize", {
        body: {
          title: draft.title, description: draft.description, content: draft.content,
          keyword: draft.target_keyword, tag: draft.tag, rewriteBody: true,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const o = (data as any).optimized;
      setDraft((d) => d ? {
        ...d,
        meta_title: o.meta_title || d.meta_title,
        meta_description: o.meta_description || d.meta_description,
        target_keyword: o.target_keyword || d.target_keyword,
        description: o.description || d.description,
        hero_image_alt: o.hero_image_alt || d.hero_image_alt,
        content: o.content_html || d.content,
        title: o.title || d.title,
      } : d);
      toast.success("Optimized for LLM + Google SEO");
    } catch (e: any) {
      toast.error("Optimize failed", { description: e.message });
    } finally {
      setOptimizing(false);
    }
  };

  // Live audit for the current draft
  const audit: SeoAuditResult | null = useMemo(() => draft ? auditPost(draft) : null, [draft]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center"><FileText size={18} className="text-primary-foreground" /></div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">{adminUserId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/blog" target="_blank"><Button variant="outline" size="sm"><ExternalLink size={14} className="mr-1" /> View blog</Button></Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}><LogOut size={14} className="mr-1" /> Sign out</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {!draft ? (
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts">All Posts ({posts.length})</TabsTrigger>
              <TabsTrigger value="ai"><Sparkles size={14} className="mr-1" /> AI Generator</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button onClick={startNew} className="gradient-bg text-primary-foreground"><Plus size={16} className="mr-1" /> New post</Button>
              </div>
              {loadingList ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-2">
                  {posts.map((p) => {
                    const a = auditPost(p);
                    const scoreColor = a.score >= 80 ? "text-[hsl(142,70%,40%)]" : a.score >= 60 ? "text-[hsl(45,90%,40%)]" : "text-destructive";
                    return (
                      <div key={p.id} className="p-4 rounded-lg border border-border bg-card flex items-center gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{p.title}</h3>
                            {!p.published && <Badge variant="outline" className="text-xs">Draft</Badge>}
                            {p.source === "ai" && <Badge className="bg-primary/10 text-primary text-xs"><Sparkles size={10} className="mr-1" /> AI</Badge>}
                            {p.source === "seed" && <Badge variant="secondary" className="text-xs">Seed</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">/blog/{p.slug} · {p.tag}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-black ${scoreColor}`}>{a.score}<span className="text-xs text-muted-foreground">/100</span></p>
                          <p className="text-[10px] text-muted-foreground">SEO score</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => editPost(p)}>Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => deletePost(p.id)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
                        </div>
                      </div>
                    );
                  })}
                  {posts.length === 0 && <p className="text-center text-muted-foreground py-12">No posts yet. Create one or use the AI generator.</p>}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="mt-4">
              <div className="max-w-2xl mx-auto p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Generate a full SEO article</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  Powered by AI. The generated article will be saved as a <strong>draft</strong> for you to review before publishing.
                </p>
                <div className="space-y-4">
                  <div>
                    <Label>Topic</Label>
                    <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. How to rank in ChatGPT search results in 2026" maxLength={200} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Target keyword</Label>
                      <Input value={aiKeyword} onChange={(e) => setAiKeyword(e.target.value)} placeholder="ChatGPT search ranking" />
                    </div>
                    <div>
                      <Label>Tag</Label>
                      <Input value={aiTag} onChange={(e) => setAiTag(e.target.value)} placeholder="AI Search SEO" />
                    </div>
                  </div>
                  <Button onClick={generateAI} disabled={aiBusy} className="w-full gradient-bg text-primary-foreground">
                    {aiBusy ? <><Loader2 size={16} className="mr-2 animate-spin" /> Generating (~20s)...</> : <><Sparkles size={16} className="mr-2" /> Generate article</>}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-bold text-foreground">{draft.id ? "Edit post" : "New post"}</h2>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={autoOptimize} disabled={optimizing}>
                    {optimizing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Brain size={16} className="mr-2" />}
                    Auto-optimize for LLM SEO
                  </Button>
                  <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
                  <Button onClick={savePost} disabled={saving} className="gradient-bg text-primary-foreground">
                    {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                    {draft.published ? "Save & publish" : "Save draft"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Title (H1)</Label><Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || slugify(e.target.value) })} maxLength={120} /></div>
                <div><Label>Slug</Label><Input value={draft.slug || ""} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} /></div>
                <div><Label>Tag</Label><Input value={draft.tag || ""} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} /></div>
                <div className="col-span-2"><Label>Description (card excerpt)</Label><Textarea value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} maxLength={300} /></div>
                <div><Label>Meta title</Label><Input value={draft.meta_title || ""} onChange={(e) => setDraft({ ...draft, meta_title: e.target.value })} maxLength={70} /></div>
                <div><Label>Target keyword</Label><Input value={draft.target_keyword || ""} onChange={(e) => setDraft({ ...draft, target_keyword: e.target.value })} /></div>
                <div className="col-span-2"><Label>Meta description</Label><Textarea value={draft.meta_description || ""} onChange={(e) => setDraft({ ...draft, meta_description: e.target.value })} rows={2} maxLength={200} /></div>
                <div className="col-span-2 space-y-2">
                  <Label>Hero image</Label>
                  <div className="flex gap-2 items-center">
                    <Input value={draft.hero_image || ""} onChange={(e) => setDraft({ ...draft, hero_image: e.target.value })} placeholder="https://... or upload below" />
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }} />
                      <span className="inline-flex items-center px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-sm whitespace-nowrap">
                        {uploading ? <><Loader2 size={14} className="mr-1 animate-spin" /> Uploading</> : "Upload"}
                      </span>
                    </label>
                  </div>
                  {draft.hero_image && <img src={draft.hero_image} alt={draft.hero_image_alt || "Hero preview"} className="w-full max-h-48 object-cover rounded-md border border-border" />}
                </div>
                <div className="col-span-2"><Label>Hero image alt text (SEO)</Label><Input value={draft.hero_image_alt || ""} onChange={(e) => setDraft({ ...draft, hero_image_alt: e.target.value })} placeholder="Describe the image, include the target keyword if natural" maxLength={125} /></div>
                <div><Label>Author</Label><Input value={draft.author || ""} onChange={(e) => setDraft({ ...draft, author: e.target.value })} /></div>
                <div><Label>Author role</Label><Input value={draft.author_role || ""} onChange={(e) => setDraft({ ...draft, author_role: e.target.value })} /></div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="pub" checked={draft.published !== false} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
                  <Label htmlFor="pub" className="cursor-pointer">Published (visible on site)</Label>
                </div>
                <div className="col-span-2">
                  <Label>Content <span className="text-destructive">*</span></Label>
                  <div className="bg-background rounded-md border border-input mt-1">
                    <ReactQuill
                      theme="snow"
                      value={draft.content || ""}
                      onChange={(v) => setDraft({ ...draft, content: v })}
                      modules={quillModules}
                      placeholder="Write something amazing..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Audit panel */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-bold text-foreground mb-3">On-Page SEO Audit</h3>
                {audit && (
                  <>
                    <div className="text-center py-3 mb-3 rounded-lg bg-secondary/40">
                      <p className={`text-5xl font-black ${audit.score >= 80 ? "text-[hsl(142,70%,40%)]" : audit.score >= 60 ? "text-[hsl(45,90%,40%)]" : "text-destructive"}`}>{audit.score}</p>
                      <p className="text-xs text-muted-foreground">SEO Score / 100</p>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center mb-3 text-[10px]">
                      <div className="p-1 rounded bg-secondary/40"><p className="font-bold">{audit.stats.wordCount}</p><p className="text-muted-foreground">words</p></div>
                      <div className="p-1 rounded bg-secondary/40"><p className="font-bold">{audit.stats.h2Count}</p><p className="text-muted-foreground">H2s</p></div>
                      <div className="p-1 rounded bg-secondary/40"><p className="font-bold">{audit.stats.keywordDensity}%</p><p className="text-muted-foreground">density</p></div>
                    </div>
                    <div className="space-y-1.5">
                      {audit.checks.map((c) => (
                        <div key={c.id} className="p-2 rounded border border-border">
                          <div className="flex items-start gap-2">
                            <StatusIcon status={c.status} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground">{c.label}</p>
                              <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">{c.detail}</p>
                              {c.recommendation && <p className="text-[11px] text-primary mt-1">💡 {c.recommendation}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
