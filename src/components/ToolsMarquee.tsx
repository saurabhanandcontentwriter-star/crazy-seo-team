const tools = [
  { name: "Google Search Console", logo: "https://cdn.simpleicons.org/googlesearchconsole" },
  { name: "Google Ads", logo: "https://cdn.simpleicons.org/googleads" },
  { name: "Google Analytics", logo: "https://cdn.simpleicons.org/googleanalytics" },
  { name: "Meta Ads", logo: "https://cdn.simpleicons.org/meta" },
  { name: "LinkedIn", logo: "inline-linkedin" },
  { name: "SEMRush", logo: "https://cdn.simpleicons.org/semrush" },
  { name: "HubSpot", logo: "https://cdn.simpleicons.org/hubspot" },
];

const ToolsMarquee = () => (
  <section className="relative overflow-hidden border-y border-border/70 bg-gradient-to-b from-background via-secondary/40 to-background py-12">
    <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
    <div className="relative mb-8 text-center">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Trusted ecosystem
      </div>
      <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        Our Partners & Platforms
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Powered by the tools and platforms trusted by modern marketing teams worldwide.
      </p>
    </div>
    <div className="relative overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...tools, ...tools, ...tools].map((tool, i) => (
          <span key={i} className="mx-8 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-background hover:text-foreground hover:shadow-md">
            <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 border border-border/70 shadow-sm">
              {tool.logo === "inline-linkedin" ? <svg viewBox="0 0 24 24" width="20" height="20" aria-label={tool.name + " logo"} className="w-5 h-5"><rect width="24" height="24" rx="4" fill="#0A66C2"/><path fill="#fff" d="M6.1 8.1A1.6 1.6 0 1 0 6.1 4.9a1.6 1.6 0 0 0 0 3.2ZM4.8 9.4h2.6V19H4.8V9.4Zm4.2 0h2.5v1.3h.04c.35-.67 1.2-1.65 2.78-1.65 2.97 0 3.52 1.95 3.52 4.48V19h-2.6v-4.84c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.84 1.25-1.84 2.55V19H9V9.4Z"/></svg> : <img src={tool.logo} alt={tool.name + " logo"} width={20} height={20} loading="lazy" decoding="async" className="w-5 h-5 object-contain" />}
            </span>
            {tool.name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default ToolsMarquee;
