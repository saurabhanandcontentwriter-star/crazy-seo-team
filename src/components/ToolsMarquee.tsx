const tools = [
  { name: "Google Search Console", icon: "https://cdn.jsdelivr.net/gh/nicedoc/brand-icons/icons/google.svg" },
  { name: "LinkedIn Ads", icon: "https://cdn.jsdelivr.net/gh/nicedoc/brand-icons/icons/linkedin.svg" },
  { name: "Meta Ads", icon: "https://cdn.jsdelivr.net/gh/nicedoc/brand-icons/icons/meta.svg" },
  { name: "Ahrefs", icon: "https://www.vectorlogo.zone/logos/ahrefs/ahrefs-icon.svg" },
  { name: "Google Ads", icon: "https://cdn.jsdelivr.net/gh/nicedoc/brand-icons/icons/google.svg" },
  { name: "SEMRush", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" },
  { name: "Google Analytics", icon: "https://cdn.jsdelivr.net/gh/nicedoc/brand-icons/icons/google.svg" },
  { name: "Moz", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firefox/firefox-original.svg" },
  { name: "HubSpot", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "Screaming Frog", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg" },
];

const ToolsMarquee = () => {
  return (
    <section className="py-10 border-y border-border bg-secondary/50 overflow-hidden">
      <p className="text-center text-sm font-medium text-muted-foreground mb-6">
        Powered by Industry-Leading Tools
      </p>
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...tools, ...tools, ...tools].map((tool, i) => (
            <span
              key={i}
              className="mx-8 flex items-center gap-2 text-lg font-semibold text-muted-foreground/60"
            >
              <img
                src={tool.icon}
                alt={tool.name}
                className="w-6 h-6 object-contain opacity-60"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {tool.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsMarquee;
