import { useState, useRef, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { fetchPostBySlug, fetchPublishedPosts } from "@/lib/blog";
import { ArrowLeft, Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DOMPurify from "dompurify";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const location = useLocation();

  // Load post + related from DB
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([fetchPostBySlug(slug), fetchPublishedPosts()])
      .then(([p, all]) => {
        setPost(p);
        setRelated((all || []).filter((x: any) => x.slug !== slug).slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!synthRef.current) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    return () => {
      synthRef.current?.cancel();
      setSpeaking(false);
    };
  }, [location.pathname]);

  // SEO meta
  useEffect(() => {
    if (!post) return;
    const siteUrl = window.location.origin;
    const url = `${siteUrl}/blog/${post.slug}`;
    document.title = `${post.meta_title || post.title} | Crazy SEO Team Blog`;

    const setMeta = (selector: string, attr: string, key: string, content: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (!el) {
        el = document.createElement(selector.startsWith("link") ? "link" : "meta") as any;
        if (selector.startsWith("link")) (el as HTMLLinkElement).rel = "canonical";
        else (el as HTMLMetaElement).setAttribute(attr, key);
        document.head.appendChild(el);
      }
      if (selector.startsWith("link")) (el as HTMLLinkElement).href = content;
      else (el as HTMLMetaElement).content = content;
    };

    const desc = post.meta_description || post.desc || post.description || "";
    const img = post.img || post.hero_image || "";
    setMeta('meta[name="description"]', "name", "description", desc);
    setMeta('meta[property="og:title"]', "property", "og:title", post.title);
    setMeta('meta[property="og:description"]', "property", "og:description", desc);
    if (img) setMeta('meta[property="og:image"]', "property", "og:image", img);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:type"]', "property", "og:type", "article");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('link[rel="canonical"]', "rel", "canonical", url);

    let ld = document.getElementById("blog-jsonld") as HTMLScriptElement | null;
    if (!ld) {
      ld = document.createElement("script");
      ld.id = "blog-jsonld";
      ld.type = "application/ld+json";
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: desc,
      image: img,
      author: { "@type": "Person", name: post.author, jobTitle: post.role || post.author_role },
      publisher: { "@type": "Organization", name: "Crazy SEO Team" },
      datePublished: post.published_at || post.date,
      mainEntityOfPage: url,
    });
  }, [post]);

  const languages = [
    { code: "en-US", label: "🇺🇸 English" },
    { code: "hi-IN", label: "🇮🇳 हिन्दी" },
    { code: "es-ES", label: "🇪🇸 Español" },
    { code: "fr-FR", label: "🇫🇷 Français" },
    { code: "de-DE", label: "🇩🇪 Deutsch" },
    { code: "ja-JP", label: "🇯🇵 日本語" },
    { code: "zh-CN", label: "🇨🇳 中文" },
    { code: "ar-SA", label: "🇸🇦 العربية" },
    { code: "pt-BR", label: "🇧🇷 Português" },
    { code: "ko-KR", label: "🇰🇷 한국어" },
    { code: "ru-RU", label: "🇷🇺 Русский" },
    { code: "it-IT", label: "🇮🇹 Italiano" },
  ];
  const speeds = [0.75, 1, 1.25, 1.5, 2];

  const pickVoice = (langCode: string) => {
    if (!voices.length) return undefined;
    const baseLang = langCode.split("-")[0];
    return (
      voices.find((v) => v.lang === langCode && /google|natural|neural|premium/i.test(v.name)) ||
      voices.find((v) => v.lang === langCode) ||
      voices.find((v) => v.lang.startsWith(baseLang + "-")) ||
      voices.find((v) => v.lang.startsWith(baseLang))
    );
  };

  const chunkText = (text: string, maxLen = 200) => {
    const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+|\S+$/g) || [text];
    const chunks: string[] = [];
    let current = "";
    for (const s of sentences) {
      if ((current + s).length > maxLen && current) { chunks.push(current.trim()); current = s; }
      else current += s;
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  };

  const toggleSpeech = () => {
    if (!synthRef.current || !post) return;
    if (speaking) { synthRef.current.cancel(); setSpeaking(false); return; }
    const cleanText = post.content
      .replace(/#{1,3}\s/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^- /gm, "");
    const fullText = `${post.title}. By ${post.author}. ${cleanText}`;
    const chunks = chunkText(fullText);
    const voice = pickVoice(selectedLang);
    setSpeaking(true);
    let index = 0;
    const speakNext = () => {
      if (index >= chunks.length) { setSpeaking(false); return; }
      const u = new SpeechSynthesisUtterance(chunks[index]);
      u.lang = selectedLang;
      u.rate = speed;
      if (voice) u.voice = voice;
      u.onend = () => { index++; speakNext(); };
      u.onerror = () => setSpeaking(false);
      synthRef.current!.speak(u);
    };
    speakNext();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }
  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
          <Link to="/blog"><Button variant="outline">← Back to Blog</Button></Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const c = post.content || "";
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(c);
    if (isHtml) {
      return <div className="prose-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c) }} />;
    }
    return c.split("\n\n").map((block: string, i: number) => {
      if (block.startsWith("## ")) return <h2 key={i} className="text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4">{block.replace("## ", "")}</h2>;
      if (block.startsWith("### ")) return <h3 key={i} className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-3">{block.replace("### ", "")}</h3>;
      const linkify = (s: string) => DOMPurify.sanitize(s
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>'));
      if (block.startsWith("- ")) return (
        <ul key={i} className="space-y-2 my-4 ml-4">
          {block.split("\n").map((li, j) => (
            <li key={j} className="text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: linkify(li.replace(/^- /, "")) }} />
            </li>
          ))}
        </ul>
      );
      if (/^\d+\./.test(block)) return (
        <ol key={i} className="space-y-2 my-4 ml-4 list-decimal list-inside">
          {block.split("\n").map((li, j) => (
            <li key={j} className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: linkify(li.replace(/^\d+\.\s*/, "")) }} />
          ))}
        </ol>
      );
      return <p key={i} className="text-muted-foreground leading-relaxed mb-4 text-base md:text-lg" dangerouslySetInnerHTML={{ __html: linkify(block) }} />;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">{post.tag}</span>
            <span className="text-sm text-muted-foreground">{post.date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-6">{post.title}</h1>

          <div className="flex items-center gap-3 mb-6">
            
            <div>
              <p className="font-semibold text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.role || post.author_role}</p>
            </div>
            {post.author_linkedin && (
              <a href={post.author_linkedin} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                LinkedIn ↗
              </a>
            )}
          </div>

          <div className="mb-8 p-4 rounded-xl bg-[hsl(220,20%,14%)] text-[hsl(0,0%,95%)]">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button onClick={toggleSpeech} className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  {speaking ? <Pause size={18} className="text-primary" /> : <Play size={18} className="text-primary ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase opacity-70">Listen Along</p>
                  <p className="text-xs opacity-50">AI Voice</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={selectedLang}
                  onChange={(e) => { setSelectedLang(e.target.value); if (speaking) { synthRef.current?.cancel(); setSpeaking(false); } }}
                  className="text-xs border border-[hsl(220,14%,30%)] rounded-lg px-2 py-1.5 bg-[hsl(220,20%,18%)] text-[hsl(0,0%,90%)]">
                  {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <div className="flex items-center gap-1 bg-[hsl(220,20%,18%)] rounded-lg px-2 py-1">
                  {speeds.map((s) => (
                    <button key={s} onClick={() => { setSpeed(s); if (speaking) { synthRef.current?.cancel(); setSpeaking(false); } }}
                      className={`text-xs px-2 py-0.5 rounded ${speed === s ? "bg-primary/20 text-primary font-bold" : "text-[hsl(0,0%,60%)]"}`}>
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {post.img && <img src={post.img} alt={post.hero_image_alt || post.title} className="w-full h-72 md:h-96 object-cover rounded-xl mb-8" loading="lazy" />}

          <div className="max-w-none">{renderContent()}</div>

          {(post.author_bio || post.author_linkedin) && (
            <div className="mt-12 p-6 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-4">
                <img src={post.authorImg} alt={post.author} className="w-16 h-16 rounded-full object-cover shrink-0" />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">About the Author</p>
                  <p className="font-bold text-foreground text-lg">{post.author}</p>
                  <p className="text-sm text-muted-foreground mb-2">{post.role || post.author_role}</p>
                  {post.author_bio && <p className="text-sm text-foreground leading-relaxed">{post.author_bio}</p>}
                  {post.author_linkedin && (
                    <a href={post.author_linkedin} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-primary hover:underline font-medium">
                      Connect on LinkedIn ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 p-6 rounded-xl gradient-bg text-primary-foreground text-center">
            <p className="font-bold text-xl mb-2">Need help with your SEO strategy?</p>
            <p className="text-sm opacity-90 mb-4">Get a free consultation with our experts.</p>
            <Link to="/"><Button variant="secondary" className="font-semibold">Get Free Consultation</Button></Link>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map((p) => (
                  <Link to={`/blog/${p.slug}`} key={p.slug} className="rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all group">
                    {p.img && (
                      <div className="h-36 overflow-hidden">
                        <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="text-xs text-primary font-medium">{p.tag}</span>
                      <h3 className="text-sm font-bold text-foreground mt-1 line-clamp-2">{p.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogPost;
