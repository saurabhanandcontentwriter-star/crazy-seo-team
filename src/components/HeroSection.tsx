import { useState } from "react";
import { ArrowRight, TrendingUp, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";

const HeroSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <section className="pt-28 pb-16 px-4 overflow-hidden">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6 animate-flash-glow">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-primary">Top Rated Digital Agency</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-foreground">
              Dominate Search with{" "}
              <span className="gradient-text">AI-Powered SEO</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Crazy SEO Team is your strategic partner for explosive digital growth. We combine cutting-edge AI insights with proven SEO, PPC, and social media strategies to turn your website into a high-performance revenue engine.
            </p>

            <div className="flex flex-wrap gap-4 mt-8 stagger-children">
              <Button size="lg" className="gradient-bg text-primary-foreground hover:opacity-90 gap-2 text-base px-8 py-6 hover:scale-105 transition-transform" onClick={() => setDialogOpen(true)}>
                Start Growing Today <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 hover:scale-105 transition-transform" onClick={() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })}>
                View Our Work
              </Button>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 rounded-full border-2 border-background" alt="" />
                <img src="https://i.pravatar.cc/100?img=2" className="w-10 h-10 rounded-full border-2 border-background" alt="" />
                <img src="https://i.pravatar.cc/100?img=3" className="w-10 h-10 rounded-full border-2 border-background" alt="" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-foreground">+500</span>
                <span className="text-sm text-muted-foreground">Trusted by 500+ fast-growing companies</span>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-right">
            <div className="hero-card-bg rounded-2xl p-6 shadow-2xl animate-float">
              <div className="rounded-xl bg-[hsl(220,25%,12%)] p-5 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[hsl(220,14%,70%)]">Organic Traffic</span>
                  <TrendingUp size={20} className="text-[hsl(145,60%,50%)]" />
                </div>
                <p className="text-4xl font-black text-[hsl(0,0%,100%)]">+245%</p>
                <div className="mt-3 h-2 rounded-full bg-[hsl(220,20%,18%)] overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[hsl(145,60%,45%)] to-[hsl(145,60%,55%)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 stagger-children">
                <div className="rounded-xl bg-[hsl(220,25%,12%)] p-5">
                  <Target size={22} className="text-primary mb-2" />
                  <p className="text-2xl font-bold text-[hsl(0,0%,100%)]">12.5k</p>
                  <span className="text-xs text-[hsl(220,14%,60%)]">New Leads</span>
                </div>
                <div className="rounded-xl bg-[hsl(220,25%,12%)] p-5">
                  <Zap size={22} className="text-primary mb-2" />
                  <p className="text-2xl font-bold text-[hsl(0,0%,100%)]">4.8x</p>
                  <span className="text-xs text-[hsl(220,14%,60%)]">ROAS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default HeroSection;
