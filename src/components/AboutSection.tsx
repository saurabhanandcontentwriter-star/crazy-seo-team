const AboutSection = () => (
  <section id="about" className="py-20 bg-background">
    <div className="container mx-auto px-4 max-w-4xl text-center">
      <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">About Crazy SEO Team</h2>
      <p className="text-lg text-muted-foreground leading-relaxed">
        We are an AI-powered SEO and digital growth agency helping businesses rank across Google,
        ChatGPT, Gemini, Claude, and Perplexity. We blend technical SEO, AI search optimization,
        content engineering, and performance marketing to deliver measurable growth.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
        {[
          { n: "1M+", l: "Keywords Ranked" },
          { n: "500+", l: "AI-Optimized Pages" },
          { n: "200+", l: "Projects Delivered" },
          { n: "50+", l: "Industries Served" },
        ].map((s) => (
          <div key={s.l} className="p-5 rounded-xl bg-card border border-border">
            <p className="text-3xl font-black gradient-text">{s.n}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
