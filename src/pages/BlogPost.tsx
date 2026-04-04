import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "@/data/blogData";
import { ArrowLeft, Volume2, VolumeX, SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);
  const [speaking, setSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [speed, setSpeed] = useState(1);
  const synthRef = useRef(window.speechSynthesis);

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

  const toggleSpeech = () => {
    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      return;
    }
    if (!post) return;
    const text = post.content.replace(/#{1,3}\s/g, "").replace(/\*\*(.*?)\*\*/g, "$1");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.rate = speed;
    utterance.onend = () => setSpeaking(false);
    synthRef.current.speak(utterance);
    setSpeaking(true);
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
          <Link to="/"><Button variant="outline">← Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    return post.content.split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) return <h2 key={i} className="text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4">{block.replace("## ", "")}</h2>;
      if (block.startsWith("### ")) return <h3 key={i} className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-3">{block.replace("### ", "")}</h3>;
      if (block.startsWith("- ")) return (
        <ul key={i} className="space-y-2 my-4 ml-4">
          {block.split("\n").map((li, j) => (
            <li key={j} className="text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: li.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
            </li>
          ))}
        </ul>
      );
      if (/^\d+\./.test(block)) return (
        <ol key={i} className="space-y-2 my-4 ml-4 list-decimal list-inside">
          {block.split("\n").map((li, j) => (
            <li key={j} className="text-muted-foreground" dangerouslySetInnerHTML={{
              __html: li.replace(/^\d+\.\s*/, "").replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
            }} />
          ))}
        </ol>
      );
      return <p key={i} className="text-muted-foreground leading-relaxed mb-4 text-base md:text-lg" dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />;
    });
  };

  // Related posts
  const related = blogPosts.filter(p => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">{post.tag}</span>
            <span className="text-sm text-muted-foreground">{post.date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <img src={post.authorImg} alt={post.author} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.role}</p>
            </div>
          </div>

          {/* Audio Player */}
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
                <select
                  value={selectedLang}
                  onChange={(e) => { setSelectedLang(e.target.value); if (speaking) { synthRef.current.cancel(); setSpeaking(false); } }}
                  className="text-xs border border-[hsl(220,14%,30%)] rounded-lg px-2 py-1.5 bg-[hsl(220,20%,18%)] text-[hsl(0,0%,90%)]"
                >
                  {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <div className="flex items-center gap-1 bg-[hsl(220,20%,18%)] rounded-lg px-2 py-1">
                  {speeds.map((s) => (
                    <button key={s} onClick={() => { setSpeed(s); if (speaking) { synthRef.current.cancel(); setSpeaking(false); } }}
                      className={`text-xs px-2 py-0.5 rounded ${speed === s ? "bg-primary/20 text-primary font-bold" : "text-[hsl(0,0%,60%)]"}`}>
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <img src={post.img} alt={post.title} className="w-full h-72 md:h-96 object-cover rounded-xl mb-8" />

          <div className="max-w-none">
            {renderContent()}
          </div>

          {/* CTA */}
          <div className="mt-12 p-6 rounded-xl gradient-bg text-primary-foreground text-center">
            <p className="font-bold text-xl mb-2">Need help with your SEO strategy?</p>
            <p className="text-sm opacity-90 mb-4">Get a free consultation with our experts.</p>
            <Link to="/">
              <Button variant="secondary" className="font-semibold">Get Free Consultation</Button>
            </Link>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map(p => (
                  <Link to={`/blog/${p.slug}`} key={p.slug} className="rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all group">
                    <div className="h-36 overflow-hidden">
                      <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
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
