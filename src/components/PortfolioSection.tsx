const projects = [
  {
    img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    tag: "Meta Ads",
    category: "Interior Design Studio",
    title: "Design Inside",
    desc: "Generated 2,450+ quality leads through strategic Meta Ads campaigns with cost-efficient CPL optimization.",
  },
  {
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    tag: "Website Development",
    category: "Stock Trading Company",
    title: "Trading Ai",
    desc: "Built a high-converting landing page for an AI-powered stock market indicator platform.",
  },
  {
    img: "https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    tag: "SEO Optimization",
    category: "E-Commerce Brand",
    title: "Luxe Apparel",
    desc: "Increased organic traffic by 340% and doubled online revenue within 6 months through technical SEO and content strategy.",
  },
  {
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    tag: "Google Ads (PPC)",
    category: "SaaS Startup",
    title: "DataFlow Analytics",
    desc: "Scaled user acquisition with a 4.2x ROAS using highly targeted Google Search and Display network campaigns.",
  },
];

const PortfolioSection = () => (
  <section id="results" className="py-20 px-4 bg-secondary/30">
    <div className="container mx-auto">
      <p className="text-sm font-semibold text-primary text-center mb-2">Our Work</p>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3">
        Real Results for Real Brands
      </h2>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
        See how we've helped businesses across various industries scale their operations and dominate their markets.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <div key={p.title} className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all">
            <div className="h-56 overflow-hidden">
              <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">{p.category}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">{p.tag}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PortfolioSection;
