import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Megaphone, Search, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOContentBlock from "@/components/SEOContentBlock";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" /><div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-accent/10 blur-3xl" /></div>
        <div className="relative container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"><Sparkles className="h-4 w-4" /> About Crazy SEO Team</span>
            <h1 className="mt-7 text-4xl font-black leading-tight md:text-6xl">One Modern Digital Ecosystem for <span className="gradient-text">Search, AI, Businesses & Creators</span></h1>
            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">Crazy SEO Team is a modern AI-powered digital ecosystem for businesses, brands, entrepreneurs, product sellers, professionals and creators. From getting discovered on Google and AI search to promoting products and building a creator identity, the platform brings multiple digital growth experiences together.</p>
            <p className="mt-6 text-xl font-black">Discover. Create. Promote. Grow.</p>
            <div className="mt-8"><Button asChild size="lg" className="gradient-cta text-primary-foreground"><Link to="/services">Explore Crazy SEO Team <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30"><div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Digital Growth</p><h2 className="mt-3 text-3xl font-black md:text-5xl">⚡ Digital Growth with Crazy SEO Team</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">Build a stronger digital presence with modern SEO, AI and marketing solutions.</p></div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[["SEO Services","Modern SEO for stronger search visibility."],["AI SEO","AI-focused optimization for modern search experiences."],["AEO — Answer Engine Optimization","Make useful answers easier for answer engines to understand."],["GEO — Generative Engine Optimization","Optimize brand context for generative search experiences."],["AI Search & LLM Optimization","Build clearer, machine-readable brand information for AI discovery."],["Technical SEO & Website Audits","Identify technical issues and opportunities across your website."],["Content & SEO Strategy","Connect content, intent and search opportunities."],["Digital Marketing","Coordinate digital channels around measurable growth."],["Google Ads","Create paid search campaigns around relevant business goals."],["AI Automation","Automate repetitive marketing and business workflows."],["AI Agents","Build AI-assisted workflows for real business tasks."],["SaaS & AI Software Development","Develop custom AI-powered products and software."],["Website & Web Application Development","Create modern websites and web applications for your digital presence."]].map(([title,desc])=><div key={title} className="rounded-3xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10"><Search className="h-5 w-5 text-primary" /></div><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{desc}</p></div>)}
        </div>
        <p className="mt-10 text-center text-lg font-bold">Your website. Your brand. Your growth. Powered by modern search and AI.</p>
      </div></section>

      <section className="py-20"><div className="container mx-auto max-w-6xl px-4 grid gap-7 md:grid-cols-2">
        <div className="rounded-[2rem] border bg-card p-8 md:p-10"><Megaphone className="h-9 w-9 text-primary" /><h2 className="mt-5 text-3xl font-black">📣 Product Classified — Showcase What You Offer</h2><p className="mt-4 leading-8 text-muted-foreground">Have a product, service, business, offer or opportunity to promote? Use Product Classified Post to create a digital listing and showcase what you offer.</p><p className="mt-5 text-sm font-semibold text-muted-foreground">Add your: Product • Images • Description • Price • Features • Location • Contact • Website</p><p className="mt-5 leading-7 text-muted-foreground">Whether you're an entrepreneur, seller, startup, freelancer, local business or service provider, your listing can give people another way to discover what you offer.</p><p className="mt-5 font-black">Create. Publish. Get Discovered.</p><Button asChild className="mt-7"><Link to="/post-ad">Post Your Product or Service <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
        <div className="rounded-[2rem] border bg-card p-8 md:p-10"><Wand2 className="h-9 w-9 text-primary" /><h2 className="mt-5 text-3xl font-black">✨ Meet ANVYA — Create Your Identity</h2><p className="mt-4 leading-8 text-muted-foreground">Meet ANVYA is a modern creator and ideas space for people who want to create, share, express and connect. You don't need to be a famous creator to start. You just need an idea.</p><div className="mt-6 space-y-3 text-muted-foreground"><p>💡 <strong className="text-foreground">Have an Idea?</strong> Turn it into content.</p><p>✍️ <strong className="text-foreground">Have Knowledge?</strong> Share it with others.</p><p>🎨 <strong className="text-foreground">Have a Creative Perspective?</strong> Publish it.</p><p>🚀 <strong className="text-foreground">Have a Project or Concept?</strong> Introduce it.</p><p>🌱 <strong className="text-foreground">Want to Become a Creator?</strong> Start your journey with ANVYA.</p></div><p className="mt-6 font-black">Idea → Create → Publish → Discover → Connect → Grow</p><p className="mt-4 leading-7 text-muted-foreground">ANVYA gives creators a place to share ideas, knowledge, opinions, experiences, technology, AI, business concepts, startup thoughts, creative work and interesting perspectives.</p><Button asChild className="mt-7"><Link to="/anvya">Open ANVYA — Start Creating <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
      </div></section>

      <section className="py-20 bg-muted/30"><div className="container mx-auto max-w-6xl px-4"><div className="text-center mb-12"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">One Platform</p><h2 className="mt-3 text-3xl font-black md:text-5xl">🧩 One Platform. Different Possibilities.</h2></div><div className="grid gap-6 md:grid-cols-3">
        {[["🔎 Crazy SEO Team","Grow your online visibility.","SEO, AI SEO, AEO, GEO, digital marketing, automation and AI technology solutions.","/services","Explore Crazy SEO Team"],["📦 Product Classified","Put your product or service online.","Create listings and showcase what you sell or provide.","/post-ad","Create a Classified Post"],["🎨 Meet ANVYA","Turn your ideas into your creator journey.","Create content, share ideas and build your presence.","/anvya","Meet ANVYA"]].map(([icon,title,desc,href,label])=><div key={title} className="rounded-3xl border bg-card p-7"><div className="text-3xl">{icon}</div><h3 className="mt-4 text-2xl font-black">{title.replace(/^[^ ]+ /,"")}</h3><p className="mt-2 font-semibold">{desc}</p><p className="mt-3 text-sm leading-7 text-muted-foreground">{href === "/services" ? "SEO, AI SEO, AEO, GEO, digital marketing, automation and AI technology solutions." : desc}</p><Button asChild variant="outline" className="mt-6"><Link to={href}>{label} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>)}
      </div></div></section>

      <section className="py-20"><div className="container mx-auto max-w-5xl px-4"><div className="rounded-[2rem] glass-card glass-sheen p-8 text-center md:p-12"><Bot className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-5 text-3xl font-black md:text-5xl">🚀 Your Digital Journey Starts Here</h2><div className="mx-auto mt-7 max-w-2xl space-y-3 text-left text-muted-foreground"><p><strong className="text-foreground">Want more visibility?</strong> → Explore SEO & AI Services</p><p><strong className="text-foreground">Want to promote something?</strong> → Post a Product or Service</p><p><strong className="text-foreground">Want to create something?</strong> → Meet ANVYA & Start Creating</p><p><strong className="text-foreground">Want to learn?</strong> → Explore the Crazy SEO Team Blog</p></div><p className="mt-8 text-lg font-black">Build Your Presence. Share Your Ideas. Get Discovered.</p><p className="mx-auto mt-4 max-w-3xl leading-8 text-muted-foreground">Crazy SEO Team connects search, AI, businesses, products and creators in one modern digital ecosystem.</p><div className="mt-8 flex flex-wrap justify-center gap-4"><Button asChild className="gradient-cta text-primary-foreground"><Link to="/services">Explore SEO & AI Services</Link></Button><Button asChild variant="outline"><Link to="/anvya">Meet ANVYA</Link></Button></div></div></div></section>
    </main>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default About;
