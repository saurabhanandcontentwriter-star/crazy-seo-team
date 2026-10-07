import React from "react";

const copy: Record<string, {title:string; intro:string; points:string[]}> = {
  about: {
    title: "How we approach SEO and AI search",
    intro: "Search has become more varied, but the fundamentals still matter: a site needs to be crawlable, useful, easy to understand and connected to a clear business goal. We combine technical work, content, internal linking, structured data and measurement rather than chasing a single SEO trick.",
    points: [
      "Technical SEO: crawlability, indexation, metadata, canonical URLs, structured data, internal links, redirects and performance.",
      "AI-search optimization: clear information, useful answers, strong topical coverage and trustworthy sources that make a site easier for modern search systems to interpret.",
      "Content strategy: search-intent mapping, useful service pages, topic clusters, FAQs and editorial updates based on what people actually need to know.",
      "Measurement: traffic, conversions, page performance and search visibility are reviewed together so decisions are based on business outcomes, not one ranking number."
    ]
  },
  services: {
    title: "SEO and AI-search work built around real business needs",
    intro: "Good SEO is more than adding keywords. It connects technical health, useful content, site structure, authority, user experience and measurement. Our work is designed around the pages that matter to a business and the people trying to find them.",
    points: [
      "AI-search and semantic work improve topical coverage, relationships between important concepts and content structure.",
      "Technical SEO addresses crawlability, indexation, canonicalization, site architecture, structured data and Core Web Vitals.",
      "GEO and AEO focus on clear answers, useful question coverage and information that can be understood in answer-focused search experiences.",
      "Content and digital marketing support can connect service pages, articles, case studies and conversion paths into a clearer site journey."
    ]
  },
  "seo-tools": {
    title: "Practical SEO tools for repeatable checks",
    intro: "Our tools help marketers and developers handle repeatable checks faster. They are meant to support human review, not replace technical judgment or real performance data.",
    points: [
      "Audit important on-page and technical signals before a page is published.",
      "Generate title, description, canonical, Open Graph and Twitter metadata from a consistent template.",
      "Create JSON-LD for supported content types such as Article, Organization, Service, LocalBusiness and FAQPage when the visible page content supports it.",
      "Use sitemap, robots.txt, keyword, NLP, AEO and GEO workflows as supporting checks alongside Search Console and real performance data."
    ]
  },
  "ai-tools": {
    title: "AI tools for SEO, content and search growth",
    intro: "AI tools are most useful when they remove repetitive work while keeping strategy, facts and editorial judgment under human control. Crazy SEO Team's AI SEO tools combine content workflows with technical SEO, semantic optimization and AI-search visibility checks.",
    points: [
      "Primary focus: AI tools for practical SEO work, including content planning, article generation, metadata, audits and structured data.",
      "Supporting workflows: AI SEO tools, SEO tools and AI content tools for search intent, internal linking, FAQs, semantic coverage and content optimization.",
      "AI-search support: AEO, GEO and LLM optimization workflows help make useful information clearer to answer engines and generative search systems.",
      "Quality control: review facts, citations, brand claims and commercial statements before publishing; measure outcomes with search performance, engagement and conversions."
    ]
  },
  results: {
    title: "SEO reporting should explain what changed",
    intro: "A useful SEO report should answer three questions: what changed, why it changed and what we should do next. We look at search visibility alongside traffic, conversions, technical improvements and the pages that support the business.",
    points: [
      "Track organic clicks, impressions, conversions and important landing pages in Search Console and analytics.",
      "Separate technical improvements from content and authority work so teams can understand what changed and why.",
      "Monitor high-value service and product pages instead of relying only on site-wide averages.",
      "Use repeatable audits and reporting to turn findings into prioritized developer, content and marketing actions."
    ]
  },
  news: {
    title: "SEO and AI news with context",
    intro: "Search and AI platforms change quickly. This section is intended to explain developments in plain language and separate confirmed announcements from commentary. For important production changes, always check the original source and your own site data.",
    points: [
      "Google Search and AI-search changes can affect how pages are discovered, displayed and measured.",
      "AI product announcements can change content, automation and workflow capabilities.",
      "Technical SEO updates should be evaluated against the site's own crawl, indexation and performance data.",
      "Source links and publication dates help readers understand when a development was reported and where the underlying information originated."
    ]
  },
  faq: {
    title: "Frequently asked questions about SEO and AI search",
    intro: "These answers cover common questions about SEO, website performance, AI search optimization and digital growth. SEO outcomes vary by website, competition, content quality and implementation. Treat these answers as practical guidance and validate technical changes with your own analytics and Search Console data.",
    points: [
      "SEO combines technical accessibility, useful content, internal linking, authority and a clear site structure.",
      "AI-search optimization benefits from accurate entities, concise answers, topical depth, trustworthy information and strong technical foundations.",
      "Structured data helps search engines understand eligible page content, but it does not guarantee a particular search appearance.",
      "Performance improvements should be measured using real-user Core Web Vitals and controlled tests rather than a single lab score."
    ]
  }
};

export default function SEOContentBlock({ page }: { page: keyof typeof copy }) {
  const data = copy[page];
  return (
    <section className="border-t border-border bg-secondary/20 py-14 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{data.title}</h2>
        <p className="text-base md:text-lg leading-8 text-muted-foreground max-w-4xl">{data.intro}</p>
        <div className="mt-7 grid md:grid-cols-2 gap-4">
          {data.points.map((point, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm md:text-base leading-7 text-muted-foreground">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
