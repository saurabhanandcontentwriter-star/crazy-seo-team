import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPublishedPosts } from "@/lib/blog";
import { Loader2 } from "lucide-react";

const BlogSection = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPosts().then((p) => { setPosts(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <section className="py-20 px-4 flex justify-center"><Loader2 className="animate-spin text-primary" /></section>;
  if (posts.length === 0) return null;

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <section id="blog" className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary mb-2">Expert Insights — April 2026</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Latest SEO & Marketing Articles</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">Deep-dive articles on SEO, AI, PPC, and digital marketing — updated weekly with actionable 2026 strategies.</p>
        </div>

        <Link to={`/blog/${featured.slug}`} className="block rounded-xl overflow-hidden border border-border bg-card mb-8 hover:shadow-lg transition-all group">
          {featured.img && (
            <img src={featured.img} alt={featured.title} className="w-full h-72 object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          )}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">{featured.tag}</span>
              <span className="text-xs text-muted-foreground">{featured.date}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{featured.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{featured.desc}</p>
            <div className="flex items-center gap-3 mt-6">
              <img src={featured.authorImg} alt={featured.author} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-foreground">{featured.author}</p>
                <p className="text-xs text-muted-foreground">{featured.role}</p>
              </div>
            </div>
          </div>
        </Link>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.slug} className="rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all group">
              {post.img && (
                <div className="h-44 overflow-hidden">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">{post.tag}</span>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.desc}</p>
                <div className="flex items-center gap-2 mt-4">
                  <img src={post.authorImg} alt={post.author} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-medium text-foreground">{post.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
