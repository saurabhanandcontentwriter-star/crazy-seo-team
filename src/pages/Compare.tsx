import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const rows = [
  ["Primary goal","Improve organic search visibility and technical discoverability","Provide direct, concise answers to specific questions","Improve how useful brand or page information can be surfaced in generative search"],
  ["Typical work","Crawl/index checks, page titles, content, internal links, site architecture and performance","Question research, answer formatting, FAQs and supporting context","Entity clarity, source quality, content structure and relevant coverage"],
  ["Useful measures","Search impressions, clicks, rankings, organic conversions and technical health","Relevant question coverage, featured result visibility where measurable, qualified visits","Referral/citation observations, brand visibility checks and qualified traffic; platform reporting varies"],
  ["Relationship","Foundational discipline","Can complement SEO","Can complement SEO and AEO; not a replacement for SEO fundamentals"],
];

const Compare = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="pt-24">
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground"><Link to="/">Home</Link> / SEO comparison</nav>
        <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">SEO vs AEO vs GEO: what is the difference?</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">These disciplines overlap. Use this comparison to understand the focus of each, then build a combined plan around your audience and website rather than treating them as competing ranking tricks.</p>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-muted/60"><tr>{["Dimension","SEO","AEO","GEO"].map(h=><th key={h} className="p-4 font-bold">{h}</th>)}</tr></thead>
            <tbody>{rows.map((row,i)=><tr key={i} className="border-t border-border">{row.map((cell,j)=><td key={j} className={`p-4 align-top ${j===0?"font-semibold": "text-muted-foreground"}`}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-border p-6"><h2 className="text-xl font-bold">Search Engine Optimization</h2><p className="mt-3 text-muted-foreground">Build crawlable, indexable pages that satisfy search intent and earn qualified organic traffic.</p><Link className="mt-4 inline-block text-primary underline" to="/services/technical-seo">Technical SEO services</Link></article>
          <article className="rounded-2xl border border-border p-6"><h2 className="text-xl font-bold">Answer Engine Optimization</h2><p className="mt-3 text-muted-foreground">Organize clear answers with context, evidence and useful question coverage.</p><Link className="mt-4 inline-block text-primary underline" to="/services/aeo-optimization">AEO services</Link></article>
          <article className="rounded-2xl border border-border p-6"><h2 className="text-xl font-bold">Generative Engine Optimization</h2><p className="mt-3 text-muted-foreground">Make accurate brand and topic information easy to understand and reference in generative search experiences.</p><Link className="mt-4 inline-block text-primary underline" to="/services/geo-optimization">GEO services</Link></article>
        </section>
        <p className="mt-8 text-sm text-muted-foreground">This is a discipline-level comparison, not a ranking of named agencies or a guarantee of AI citations. Outcomes depend on the site, content, competition and search platform.</p>
      </section>
    </main>
    <Footer />
  </div>
);

export default Compare;
