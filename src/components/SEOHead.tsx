import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://crazyseoteam.in";
const BRAND = "Crazy SEO Team";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/": { title: "AI SEO Platform for Google & AI Search | Crazy SEO Team", description: "Boost visibility in Google, ChatGPT, Gemini and AI Search with AI SEO, GEO, AEO and LLM optimization from Crazy SEO Team." },
  "/about": { title: "About Crazy SEO Team | AI SEO & Digital Marketing", description: "Learn about Crazy SEO Team and our approach to AI SEO, GEO, AEO, LLM optimization, automation and digital growth." },
  "/services": { title: "AI SEO & Digital Marketing Services | Crazy SEO Team", description: "Explore AI SEO, technical SEO, GEO, AEO, LLM SEO, content writing, automation and digital marketing services." },
  "/seo-tools": { title: "Free SEO Tools, Audit & AEO GEO Checkers | Crazy SEO Team", description: "Use practical SEO, AEO, GEO, LLM, keyword, schema, sitemap and website audit tools from Crazy SEO Team." },
  "/ai-tools": { title: "AI SEO Tools & AI Marketing Toolkit | Crazy SEO Team", description: "Explore AI-powered tools for content, SEO, visibility, automation and digital marketing optimization." },
  "/results": { title: "SEO Results & Case Studies | Crazy SEO Team", description: "See SEO, AI visibility and digital growth results delivered by Crazy SEO Team." },
  "/news": { title: "Latest SEO & AI News | Crazy SEO Team", description: "Follow the latest SEO, Google, AI, ChatGPT, Gemini and digital marketing updates from Crazy SEO Team." },
  "/blog": { title: "SEO & AI SEO Blog | Crazy SEO Team", description: "Read practical guides and insights about SEO, AI SEO, GEO, AEO, LLM optimization, content and digital marketing." },
  "/faq": { title: "SEO & AI SEO FAQs | Crazy SEO Team", description: "Answers to common questions about SEO, AI SEO, GEO, AEO, LLM optimization, audits and digital marketing." },
  "/pricing": { title: "SEO & AI Services Pricing | Crazy SEO Team", description: "Explore Crazy SEO Team service options for SEO, AI SEO, content, automation and digital growth." },
};

const faqSets: Record<string, Array<{ q: string; a: string }>> = {
  "/": [
    { q: "What is Crazy SEO Team?", a: "Crazy SEO Team is an AI-focused SEO and digital growth platform helping businesses improve Google and AI search visibility." },
    { q: "What is AI SEO?", a: "AI SEO combines technical SEO, semantic content, entity optimization and AI-search optimization to improve visibility across modern search experiences." },
    { q: "Do you optimize for Google AI Overviews?", a: "Yes. Our approach includes structured content, entity signals, helpful answers, internal linking and technical SEO designed for modern Google search experiences." },
    { q: "What is GEO optimization?", a: "GEO, or Generative Engine Optimization, focuses on making a brand and its content easier for generative AI systems to understand, retrieve and cite." },
    { q: "Can you audit my website?", a: "Yes. Crazy SEO Team provides website SEO, performance, accessibility and AI-visibility checks with actionable recommendations." },
  ],
  "/about": [
    { q: "What does Crazy SEO Team do?", a: "We work across SEO, AI SEO, GEO, AEO, LLM optimization, content, automation and digital growth." },
    { q: "Who can use your services?", a: "Businesses, agencies, creators, SaaS companies and organizations seeking stronger search and AI visibility can use our services." },
    { q: "Do you provide technical SEO?", a: "Yes. Technical SEO is part of our optimization approach, including crawlability, metadata, structured data, performance and internal linking." },
  ],
  "/services": [
    { q: "Which SEO services do you offer?", a: "Services include AI SEO, technical SEO, GEO, AEO, LLM SEO, content writing, article writing, ghostwriting and digital marketing support." },
    { q: "Do you offer AI automation?", a: "Yes. We support workflow automation, AI agents, AI chatbots and AI software development alongside SEO services." },
    { q: "Can services be customized?", a: "Yes. Service scope can be tailored to a website, business model, target audience and growth objectives." },
  ],
  "/seo-tools": [
    { q: "What SEO tools are available?", a: "The toolkit includes SEO audit, keyword research, meta generation, schema, sitemap, robots.txt, SERP preview, NLP, AEO, GEO and LLM checks." },
    { q: "Are the SEO tools free to use?", a: "Public tools are available directly on the website, with functionality depending on the specific tool and analysis requested." },
    { q: "Can I audit a website?", a: "Yes. The SEO audit tool analyzes accessible page signals and provides practical optimization recommendations." },
  ],
  "/ai-tools": [
    { q: "What are AI SEO tools?", a: "AI SEO tools help with content, semantic optimization, search visibility, analysis and workflows for modern search engines and AI systems." },
    { q: "Do AI tools support LLM optimization?", a: "Yes. The toolkit is designed around AI visibility, semantic relevance, answer optimization and LLM-oriented search workflows." },
    { q: "Can AI tools help with content?", a: "Yes. AI-assisted content workflows can support article planning, optimization, FAQs, metadata and structured content." },
  ],
  "/results": [
    { q: "What kind of SEO results do you track?", a: "Relevant metrics include organic visibility, technical health, keyword performance, content quality and AI-search visibility." },
    { q: "Do you measure AI visibility?", a: "Yes. AI visibility can be evaluated alongside conventional search and content metrics." },
  ],
  "/news": [
    { q: "What topics does Crazy SEO Team News cover?", a: "Coverage includes SEO, Google updates, AI SEO, ChatGPT, AI tools, technical SEO, digital marketing and related search developments." },
    { q: "How often is the news updated?", a: "The news system is designed for frequent refreshes so recent search and AI developments can be surfaced quickly." },
  ],
  "/blog": [
    { q: "What is the Crazy SEO Team blog about?", a: "The blog covers practical SEO, AI SEO, GEO, AEO, LLM optimization, content strategy and digital marketing topics." },
    { q: "Are the articles SEO focused?", a: "Yes. Articles are structured to be useful to readers while covering search intent, semantic topics and modern SEO practices." },
  ],
  "/faq": [
    { q: "What is SEO?", a: "SEO is the practice of improving a website so search engines can crawl, understand and rank its pages for relevant searches." },
    { q: "What is AEO?", a: "Answer Engine Optimization focuses on creating clear, structured answers that can perform well in answer-oriented search experiences." },
    { q: "What is LLM SEO?", a: "LLM SEO focuses on making information clear, authoritative, structured and context-rich for retrieval and understanding by large language model based search systems." },
  ],
  "/pricing": [
    { q: "What services can be included in a project?", a: "Projects can include SEO, AI SEO, content, technical optimization, GEO, AEO, automation and related digital growth services." },
    { q: "Can pricing be customized?", a: "Yes. Requirements, scope, website complexity and growth goals can affect the appropriate service package." },
  ],
};

function getBasePath(pathname: string) {
  if (pathname.startsWith("/blog/")) return "/blog";
  if (pathname.startsWith("/services/")) return "/services";
  return pathname.replace(/\/$/, "") || "/";
}

export default function SEOHead() {
  const location = useLocation();
  const basePath = getBasePath(location.pathname);
  const meta = pageMeta[basePath] ?? {
    title: `${BRAND} | AI SEO, GEO, AEO & Digital Growth`,
    description: "Crazy SEO Team helps businesses improve SEO, AI search visibility, content performance and digital growth.",
  };
  const canonical = `${SITE}${location.pathname === "/" ? "/" : location.pathname.replace(/\/$/, "")}`;
  const faqs = faqSets[basePath] ?? [];
  const breadcrumbs = location.pathname.split("/").filter(Boolean).map((part, index, arr) => ({
    name: part.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    item: `${SITE}/${arr.slice(0, index + 1).join("/")}`,
  }));

  useEffect(() => {
    const applyAltText = () => {
      document.querySelectorAll<HTMLImageElement>("img:not([alt]), img[alt='']").forEach((img) => {
        const source = img.currentSrc || img.src || "";
        const name = source.split("/").pop()?.split("?")[0]?.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
        const nearby = img.closest("figure")?.querySelector("figcaption")?.textContent?.trim();
        img.alt = nearby || name || `${BRAND} SEO and AI search platform`;
      });
    };
    applyAltText();
    const observer = new MutationObserver(applyAltText);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE,
    description: "AI SEO, GEO, AEO, LLM optimization and digital growth platform.",
  };
  const faqSchema = faqs.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  } : null;
  const breadcrumbSchema = breadcrumbs.length ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE }, ...breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 2, name: b.name, item: b.item }))],
  } : null;

  return (
    <Helmet>
      <html lang="en" />
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={basePath === "/blog" || basePath === "/news" ? "website" : "website"} />
      <meta property="og:site_name" content={BRAND} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      {basePath === "/" && <link rel="preconnect" href="https://fonts.googleapis.com" />}
      {basePath === "/" && <link rel="dns-prefetch" href="https://fonts.googleapis.com" />}
      <script type="application/ld+json">{JSON.stringify(organization)}</script>
      {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
    </Helmet>
  );
}
