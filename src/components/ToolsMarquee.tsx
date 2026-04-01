const tools = [
  "Google Search Console",
  "LinkedIn Ads",
  "Meta Ads",
  "Ahrefs",
  "Google Ads",
  "SEMRush",
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
              className="mx-8 text-lg font-semibold text-muted-foreground/60"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsMarquee;
