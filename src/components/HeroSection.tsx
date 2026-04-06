import { useState, useEffect, useRef } from "react";
import { ArrowRight, TrendingUp, Target, Zap, Sparkles, Bot, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";

const typingTexts = ["AI-Powered SEO", "Gen AI Solutions", "Digital Growth", "Smart Automation"];

const HeroSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [textIdx, setTextIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const current = typingTexts[textIdx];
    if (!deleting) {
      if (displayed.length < current.length) {
        timeoutRef.current = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
      } else {
        timeoutRef.current = setTimeout(() => setDeleting(true), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
      } else {
        setDeleting(false);
        setTextIdx((prev) => (prev + 1) % typingTexts.length);
      }
    }
    return () => clearTimeout(timeoutRef.current);
  }, [displayed, deleting, textIdx]);

  return (
    <>
      <section className="pt-28 pb-16 px-4 overflow-hidden relative">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-primary/3 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>

        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-fade-in-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6 animate-flash-glow">
              <Sparkles size={14} className="text-accent animate-pulse" />
              <span className="text-sm font-medium text-primary">AI + Digital Marketing Agency</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-foreground">
              Dominate With{" "}
              <span className="gradient-text">{displayed}</span>
              <span className="animate-pulse text-primary">|</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Crazy SEO Team is your strategic partner for explosive digital growth. We combine <strong className="text-foreground">Generative AI</strong> with proven SEO, PPC & social strategies to build high-performance revenue engines.
            </p>

            <div className="flex flex-wrap gap-4 mt-8 stagger-children">
              <Button size="lg" className="gradient-bg text-primary-foreground hover:opacity-90 gap-2 text-base px-8 py-6 hover:scale-105 transition-transform" onClick={() => setDialogOpen(true)}>
                Start Growing Today <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 hover:scale-105 transition-transform gap-2" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
                <Sparkles size={16} /> Explore AI Services
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
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[hsl(145,60%,45%)] to-[hsl(145,60%,55%)] animate-shimmer" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 stagger-children">
                <div className="rounded-xl bg-[hsl(220,25%,12%)] p-4 text-center">
                  <Target size={20} className="text-primary mx-auto mb-1.5" />
                  <p className="text-xl font-bold text-[hsl(0,0%,100%)]">12.5k</p>
                  <span className="text-[10px] text-[hsl(220,14%,60%)]">Leads</span>
                </div>
                <div className="rounded-xl bg-[hsl(220,25%,12%)] p-4 text-center">
                  <Zap size={20} className="text-accent mx-auto mb-1.5" />
                  <p className="text-xl font-bold text-[hsl(0,0%,100%)]">4.8x</p>
                  <span className="text-[10px] text-[hsl(220,14%,60%)]">ROAS</span>
                </div>
                <div className="rounded-xl bg-[hsl(220,25%,12%)] p-4 text-center">
                  <Bot size={20} className="text-[hsl(40,90%,55%)] mx-auto mb-1.5" />
                  <p className="text-xl font-bold text-[hsl(0,0%,100%)]">AI</p>
                  <span className="text-[10px] text-[hsl(220,14%,60%)]">Powered</span>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-lg animate-bounce">
              🚀 Gen AI Ready
            </div>
            <div className="absolute -bottom-3 -left-3 px-3 py-1.5 rounded-full bg-card border border-border text-foreground text-xs font-medium shadow-lg flex items-center gap-1.5 animate-flash-glow">
              <BarChart3 size={12} className="text-primary" /> Real-Time Analytics
            </div>
          </div>
        </div>
      </section>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default HeroSection;
