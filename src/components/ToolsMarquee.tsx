const tools = [
  { name: "Google Search Console", logo: "https://cdn.simpleicons.org/googlesearchconsole" },
  { name: "Google Ads", logo: "https://cdn.simpleicons.org/googleads" },
  { name: "Google Analytics", logo: "https://cdn.simpleicons.org/googleanalytics" },
  { name: "Meta Ads", logo: "https://cdn.simpleicons.org/meta" },
  { name: "LinkedIn", logo: "https://cdn.simpleicons.org/linkedin/0A66C2" },
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
          <span
            key={`${tool.name}-${i}`}
            className="mx-8 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-background hover:text-foreground hover:shadow-md"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-white shadow-sm">
              <img
                src={tool.logo}
                alt={`${tool.name} logo`}
                width={20}
                height={20}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-5 w-5 object-contain"
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            </span>
            {tool.name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default ToolsMarquee;
