const blogPosts = [
  {
    img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "SEO Strategy",
    date: "March 30, 2026",
    title: "SEO in 2026: Navigating the AI-First Search Landscape",
    desc: "With AI Overviews dominating results and zero-click searches at an all-time high, here's how to adapt your strategy to win in 2026.",
    author: "Anand Kumar Singh",
    role: "Founder & SEO Expert",
    authorImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
  },
  {
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "AI & Automation",
    date: "March 25, 2026",
    title: "How AI Voice Agents Are Replacing Traditional Cold Calling",
    desc: "AI voice calling technology has matured significantly. Learn how businesses are using intelligent voice agents to scale outreach by 10x.",
    author: "Saurabh Anand",
    role: "Co-Founder",
    authorImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
  },
  {
    img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Google Ads",
    date: "March 18, 2026",
    title: "Performance Max Campaigns: The 2026 Playbook for Maximum ROAS",
    desc: "Google's Performance Max has evolved with new AI bidding features. Here's the updated playbook to maximize your return on ad spend.",
    author: "Anand Kumar Singh",
    role: "Founder & SEO Expert",
    authorImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
  },
  {
    img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Social Media",
    date: "March 12, 2026",
    title: "Instagram's Algorithm in 2026: What Changed & How to Adapt",
    desc: "Instagram's latest algorithm update prioritizes AI-curated content. Discover the new strategies for organic reach and engagement.",
    author: "Saurabh Anand",
    role: "Co-Founder",
    authorImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
  },
  {
    img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Technical SEO",
    date: "March 5, 2026",
    title: "Core Web Vitals 2026: The New Metrics Google Actually Cares About",
    desc: "Google has introduced new interaction metrics. Learn about INP, LCP changes, and how to optimize your site for the latest ranking signals.",
    author: "Anand Kumar Singh",
    role: "Founder & SEO Expert",
    authorImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
  },
  {
    img: "https://images.unsplash.com/photo-1555421689-d68471e189f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tag: "Content Strategy",
    date: "February 28, 2026",
    title: "E-E-A-T in 2026: Building Authority in the Age of AI Content",
    desc: "With AI-generated content flooding the web, Google's E-E-A-T signals matter more than ever. Here's how to stand out with authentic expertise.",
    author: "Saurabh Anand",
    role: "Co-Founder",
    authorImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
  },
];

const BlogSection = () => (
  <section id="blog" className="py-20 px-4 bg-secondary/30">
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-sm font-semibold text-primary mb-2">Latest Insights — March 2026</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Stay Ahead of the Curve</h2>
          <p className="text-muted-foreground mt-2 max-w-lg">Expert insights on SEO, AI, PPC, and digital marketing — updated weekly with the latest 2026 strategies.</p>
        </div>
        <a href="#" className="text-sm font-medium text-primary hover:underline hidden md:block">
          View all articles →
        </a>
      </div>

      {/* Featured post */}
      <div className="rounded-xl overflow-hidden border border-border bg-card mb-8">
        <img src={blogPosts[0].img} alt={blogPosts[0].title} className="w-full h-72 object-cover" />
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
      </div>

      {/* Grid of posts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.slice(1).map((post) => (
          <article key={post.title} className="rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all group cursor-pointer">
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
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default BlogSection;
