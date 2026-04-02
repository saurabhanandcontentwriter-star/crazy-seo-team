import { Search, BarChart3, Share2, Code, Brain, Megaphone, TrendingUp, Zap, Target, Globe } from "lucide-react";

const tools = [
  { name: "Google Search Console", Icon: Search },
  { name: "Google Ads", Icon: Megaphone },
  { name: "Google Analytics", Icon: BarChart3 },
  { name: "Meta Ads", Icon: Share2 },
  { name: "LinkedIn Ads", Icon: Globe },
  { name: "Ahrefs", Icon: TrendingUp },
  { name: "SEMRush", Icon: Target },
  { name: "Moz", Icon: Zap },
  { name: "HubSpot", Icon: Brain },
  { name: "Screaming Frog", Icon: Code },
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
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <tool.Icon size={18} className="text-primary" />
            </div>
            {tool.name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default ToolsMarquee;
