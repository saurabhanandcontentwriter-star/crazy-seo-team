const tools = [
  { name: "Google Search Console", logo: "https://cdn.simpleicons.org/googlesearchconsole" },
  { name: "Google Ads", logo: "https://cdn.simpleicons.org/googleads" },
  { name: "Google Analytics", logo: "https://cdn.simpleicons.org/googleanalytics" },
  { name: "Meta Ads", logo: "https://cdn.simpleicons.org/meta" },
  { name: "LinkedIn Ads", logo: "https://cdn.simpleicons.org/linkedin" },
  { name: "Ahrefs", logo: "https://cdn.simpleicons.org/ahrefs" },
  { name: "SEMRush", logo: "https://cdn.simpleicons.org/semrush" },
  { name: "Moz", logo: "https://cdn.simpleicons.org/moz" },
  { name: "HubSpot", logo: "https://cdn.simpleicons.org/hubspot" },
  { name: "Screaming Frog", logo: "https://cdn.simpleicons.org/screamingfrog" },
];

const ToolsMarquee = () => (
  <section className="py-10 border-y border-border bg-secondary/50 overflow-hidden">
    <p className="text-center text-sm font-medium text-muted-foreground mb-6">
      Powered by Industry-Leading Tools
    </p>
    <div className="relative overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...tools, ...tools, ...tools].map((tool, i) => (
          <span key={i} className="mx-8 flex items-center gap-2.5 text-base font-semibold text-muted-foreground/70">
            <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 border border-border/70 shadow-sm">
              <img
                src={tool.logo}
                alt={tool.name + " logo"}
                width={20}
                height={20}
                loading="lazy"
                decoding="async"
                className="w-5 h-5 object-contain"
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
