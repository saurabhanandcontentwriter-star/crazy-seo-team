import React from "react";

const copy: Record<string, {title:string; intro:string; points:string[]}> = {
  about: {
    title: "AI SEO, GEO and AEO expertise for modern search",
    intro: "Crazy SEO Team focuses on the way people discover businesses across Google and AI-powered search experiences. Our approach combines technical SEO, helpful content, entity understanding, structured data, internal linking and measurement so important pages can be discovered, understood and connected to the right search intent.",
    points: [
      "Technical SEO: crawlability, indexation, metadata, canonical URLs, structured data, internal links, redirects and performance signals.",
      "AI search optimization: clear entities, concise answers, topical depth, trustworthy sources and content structures that are easier for answer engines and language models to interpret.",
      "Content strategy: search-intent mapping, topic clusters, FAQs, comparison content, service pages and editorial updates designed around real user questions.",
      "Measurement: organic traffic, conversions, page performance, keyword visibility and AI-search visibility should be reviewed together instead of relying on a single ranking metric."
    ]
  },
  services: {
    title: "SEO and AI search services built around measurable visibility",
    intro: "Modern SEO is no longer limited to adding keywords to a page. A strong service strategy connects technical health, content quality, authority, user experience and machine-readable information. Crazy SEO Team provides a combined framework for businesses that want their services, products and expertise to be understood across traditional search and AI-assisted discovery.",
    points: [
      "AI SEO and semantic SEO improve topical coverage, entity relationships and content structure.",
      "Technical SEO addresses crawlability, indexation, canonicalization, site architecture, structured data and Core Web Vitals.",
      "GEO and AEO focus on answer-oriented content, question coverage and information that can be clearly retrieved by AI search systems.",
      "Content and digital marketing support can connect service pages, blogs, case studies and conversion paths into one coherent topical architecture."
    ]
  },
  "seo-tools": {
    title: "Practical SEO tools for technical and content optimization",
    intro: "The Crazy SEO Team toolkit brings common SEO workflows into one place so teams can inspect pages, improve metadata, generate structured data and review search-focused signals before publishing. The goal is not to replace specialist analysis, but to make repeatable checks faster and easier for marketers, developers and content teams.",
    points: [
      "Audit important on-page and technical signals before a page is published.",
      "Generate title, description, canonical, Open Graph and Twitter metadata from a consistent template.",
      "Create JSON-LD for supported content types such as Article, Organization, Service, LocalBusiness and FAQPage when the visible page content supports it.",
      "Use sitemap, robots.txt, keyword, NLP, AEO and GEO workflows as supporting checks alongside Search Console and real performance data."
    ]
  },
  "ai-tools": {
    title: "AI tools for content, SEO workflows and search visibility",
    intro: "AI can accelerate SEO work when it is used with clear inputs, human review and reliable source material. Crazy SEO Team's AI toolkit is designed around practical workflows such as article planning, content optimization, semantic analysis, metadata generation and AI-search visibility. The emphasis is on useful output that can be reviewed and improved before publication.",
    points: [
      "Use AI-assisted workflows to build article outlines, FAQs, metadata and content briefs around a defined search intent.",
      "Combine AI generation with entity, topic and internal-link planning so content supports a wider site architecture.",
      "Review factual claims, citations, brand information and commercial statements before publishing AI-assisted content.",
      "Measure the finished page using search performance, engagement, conversions and technical health rather than generation volume alone."
    ]
  },
  results: {
    title: "SEO results should connect visibility with business outcomes",
    intro: "SEO performance is more useful when rankings are connected to traffic quality, conversions and the pages that actually support a business. Crazy SEO Team presents results through a broader visibility lens that can include organic discovery, technical improvements, content growth and AI-search presence. Historical performance should always be interpreted in the context of the period, market and pages measured.",
    points: [
      "Track organic clicks, impressions, conversions and important landing pages in Search Console and analytics.",
      "Separate technical improvements from content and authority work so teams can understand what changed and why.",
      "Monitor high-value service and product pages instead of relying only on site-wide averages.",
      "Use repeatable audits and reporting to turn findings into prioritized developer, content and marketing actions."
    ]
  },
  news: {
    title: "SEO and AI news with practical context",
    intro: "Search and AI platforms change quickly, so the Crazy SEO Team news section focuses on developments that can affect marketers, developers and website owners. News reporting should distinguish confirmed announcements from commentary, and readers should check the original source when a platform change could affect an important production website.",
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
