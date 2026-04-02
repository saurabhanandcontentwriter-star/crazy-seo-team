import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogData";

const BlogSection = () => (
  <section id="blog" className="py-20 px-4 bg-secondary/30">
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-sm font-semibold text-primary mb-2">Latest Insights — March 2026</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Stay Ahead of the Curve</h2>
          <p className="text-muted-foreground mt-2 max-w-lg">Expert insights on SEO, AI, PPC, and digital marketing — updated weekly with the latest 2026 strategies.</p>
        </div>
      </div>

      {/* Featured post */}
      <Link to={`/blog/${blogPosts[0].slug}`} className="block rounded-xl overflow-hidden border border-border bg-card mb-8 hover:shadow-lg transition-all group">
        <img src={blogPosts[0].img} alt={blogPosts[0].title} className="w-full h-72 object-cover group-hover:scale-[1.02] transition-transform duration-500" />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">{blogPosts[0].tag}</span>
            <span className="text-xs text-muted-foreground">{blogPosts[0].date}</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">{blogPosts[0].title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{blogPosts[0].desc}</p>
          <div className="flex items-center gap-3 mt-6">
            <img src={blogPosts[0].authorImg} alt={blogPosts[0].author} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-foreground">{blogPosts[0].author}</p>
              <p className="text-xs text-muted-foreground">{blogPosts[0].role}</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.slice(1).map((post) => (
          <Link to={`/blog/${post.slug}`} key={post.slug} className="rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all group">
            <div className="h-44 overflow-hidden">
              <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
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

export default BlogSection;
