const BlogSection = () => (
  <section id="blog" className="py-20 px-4 bg-secondary/30">
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-sm font-semibold text-primary mb-2">Latest Insights</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Stay Ahead of the Curve</h2>
        </div>
        <a href="#" className="text-sm font-medium text-primary hover:underline hidden md:block">
          View all articles →
        </a>
      </div>

      <div className="rounded-xl overflow-hidden border border-border bg-card">
        <img
          src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="AI-powered search"
          className="w-full h-72 object-cover"
        />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">SEO Strategy</span>
            <span className="text-xs text-muted-foreground">March 30, 2026</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            SEO in 2026: Navigating the AI-First Search Landscape
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The search landscape has fundamentally shifted. With AI Overviews (SGE) dominating results and zero-click searches at an all-time high, here is how you need to adapt your strategy to win in 2026.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
              alt="Author"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">Anand Kumar Singh</p>
              <p className="text-xs text-muted-foreground">Founder & SEO Expert</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BlogSection;
