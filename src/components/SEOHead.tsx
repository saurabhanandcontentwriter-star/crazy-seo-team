import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SITE = "https://crazyseoteam.in";
const BRAND = "Crazy SEO Team";
const CORE_TOPICS = "AI SEO, SEO, Generative Engine Optimization, GEO, Answer Engine Optimization, AEO, LLM optimization, semantic SEO, NLP, technical SEO, content optimization, AI automation, digital marketing";
const pageMeta: Record<string, { title: string; description: string; keywords: string }> = {
  "/": { title: "AI SEO Platform for Google & AI Search | Crazy SEO Team", description: "Boost visibility in Google, ChatGPT, Gemini and AI Search with AI SEO, GEO, AEO and LLM optimization from Crazy SEO Team.", keywords: "AI SEO, SEO agency, LLM SEO, GEO, AEO, NLP SEO, semantic SEO, AI search optimization" },
  "/about": { title: "About Crazy SEO Team | AI SEO & Digital Marketing", description: "Learn about Crazy SEO Team and our approach to AI SEO, GEO, AEO, LLM optimization, automation and digital growth.", keywords: "Crazy SEO Team, AI SEO company, SEO experts, LLM optimization, digital marketing" },
  "/services": { title: "AI SEO & Digital Marketing Services | Crazy SEO Team", description: "Explore AI SEO, technical SEO, GEO, AEO, LLM SEO, content writing, automation and digital marketing services.", keywords: "AI SEO services, technical SEO, GEO services, AEO, LLM SEO, content writing, digital marketing" },
  "/seo-tools": { title: "Free SEO Tools, Audit & AEO GEO Checkers | Crazy SEO Team", description: "Use practical SEO, AEO, GEO, LLM, keyword, schema, sitemap and website audit tools from Crazy SEO Team.", keywords: "SEO tools, SEO audit, keyword research, NLP analyzer, schema generator, GEO checker, AEO checker, LLM checker" },
  "/ai-tools": { title: "AI SEO Tools & AI Marketing Toolkit | Crazy SEO Team", description: "Explore AI-powered tools for content, SEO, visibility, automation and digital marketing optimization.", keywords: "AI SEO tools, AI marketing tools, content optimization, LLM tools, AI visibility" },
  "/results": { title: "SEO Results & Case Studies | Crazy SEO Team", description: "See SEO, AI visibility and digital growth results delivered by Crazy SEO Team.", keywords: "SEO results, SEO case studies, AI visibility, organic growth, search optimization" },
  "/news": { title: "Latest SEO & AI News | Crazy SEO Team", description: "Follow the latest SEO, Google, AI, ChatGPT, Gemini and digital marketing updates from Crazy SEO Team.", keywords: "SEO news, Google updates, AI SEO news, ChatGPT SEO, Gemini SEO, AI search" },
  "/blog": { title: "SEO & AI SEO Blog | Crazy SEO Team", description: "Read practical guides and insights about SEO, AI SEO, GEO, AEO, LLM optimization, content and digital marketing.", keywords: "SEO blog, AI SEO blog, GEO, AEO, LLM optimization, NLP, content strategy" },
  "/faq": { title: "SEO & AI SEO FAQs | Crazy SEO Team", description: "Answers to common questions about SEO, AI SEO, GEO, AEO, LLM optimization, audits and digital marketing.", keywords: "SEO FAQ, AI SEO FAQ, GEO FAQ, AEO FAQ, LLM SEO questions" },
  "/pricing": { title: "SEO & AI Services Pricing | Crazy SEO Team", description: "Explore Crazy SEO Team service options for SEO, AI SEO, content, automation and digital growth.", keywords: "SEO pricing, AI SEO pricing, SEO services, AI automation services" },
  "/classifieds": { title: "Classifieds Marketplace India | Buy, Sell, Jobs, Property & Services | Crazy SEO Team", description: "Browse approved classifieds across India for products, services, jobs, property, vehicles, businesses, education and more on Crazy SEO Team.", keywords: "classifieds India, online marketplace, buy sell India, jobs, property, cars, mobiles, services, business listings" },
  "/ideas": { title: "ANVYA Ideas | Discover AI, SEO, Tech, Travel & Business Ideas | Crazy SEO Team", description: "Explore public ideas, questions, discussions and events across AI, SEO, technology, travel, science and economics on ANVYA by Crazy SEO Team.", keywords: "ANVYA Ideas, ideas platform, AI ideas, SEO ideas, technology ideas, travel ideas, business ideas, public discussions, questions, events" },
  "/post-ad": { title: "Post an Ad in India | Classifieds Marketplace | Crazy SEO Team", description: "Create an account, complete your profile and submit a moderated classified ad for products, services, jobs, property, vehicles and businesses on Crazy SEO Team.", keywords: "post ad India, submit classified ad, free classified listing, sell online India, business listing, property listing, jobs listing" },
};
const faqSets: Record<string, Array<{ q: string; a: string }>> = {
  "/faq": [
    { q: "What is SEO and why does my business need it?", a: "SEO improves a website's visibility on search engines by combining technical accessibility, useful content, internal linking and authority signals." },
    { q: "How long does it take to see results from SEO?", a: "SEO is a long-term process. Technical improvements can show earlier effects, while meaningful organic growth depends on competition, content quality, authority and implementation consistency." },
    { q: "What is the difference between On-Page and Off-Page SEO?", a: "On-Page SEO covers content and technical elements on your site, while Off-Page SEO covers external signals such as relevant links, mentions and reputation." },
    { q: "Do you guarantee a #1 ranking on Google?", a: "No ethical SEO process can guarantee a specific ranking because search systems change and results vary by query, competition, location and user context." },
    { q: "How do you measure the success of an SEO campaign?", a: "Useful measurements include organic clicks, impressions, conversions, landing-page performance, technical health and relevant visibility trends." },
  ],

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
  "/news": [
    { q: "What topics does Crazy SEO Team News cover?", a: "Coverage includes SEO, Google updates, AI SEO, ChatGPT, AI tools, technical SEO, digital marketing and related search developments." },
    { q: "How often is the news updated?", a: "The news system is designed for frequent refreshes so recent search and AI developments can be surfaced quickly." },
  ],
  "/blog": [
    { q: "What is the Crazy SEO Team blog about?", a: "The blog covers practical SEO, AI SEO, GEO, AEO, LLM optimization, content strategy and digital marketing topics." },
    { q: "Are the articles SEO focused?", a: "Yes. Articles are structured to be useful to readers while covering search intent, semantic topics and modern SEO practices." },
  ],
};
function getBasePath(pathname: string) {
  if (pathname.startsWith("/blog/")) return "/blog";
  if (pathname.startsWith("/services/")) return "/services";
  if (pathname.startsWith("/classifieds")) return "/classifieds";
  return pathname.replace(/\/$/, "") || "/";
}

export default function SEOHead() {
  const location = useLocation();
  const basePath = getBasePath(location.pathname);
  const [listing, setListing] = useState<any>(null);
  const isIdeas = basePath === "/ideas";
  const isPostAd = basePath === "/post-ad";
  const meta = pageMeta[basePath] ?? { title: `${BRAND} | AI SEO, GEO, AEO & Digital Growth`, description: "Crazy SEO Team helps businesses improve SEO, AI search visibility, content performance and digital growth.", keywords: CORE_TOPICS };
  const canonical = `${SITE}${location.pathname === "/" ? "/" : location.pathname.replace(/\/$/, "")}`;
  const faqs = faqSets[basePath] ?? [];
  const breadcrumbs = location.pathname.split("/").filter(Boolean).map((part, index, arr) => ({ name: part.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), item: `${SITE}/${arr.slice(0, index + 1).join("/")}` }));

  useEffect(() => {
    let cancelled = false;
    setListing(null);
    const id = location.pathname.match(/^\/listing\/([^/]+)$/)?.[1];
    if (!id) return () => { cancelled = true; };
    (async () => {
      const { data } = await (supabase as any).from("classified_listings").select("*").eq("id", id).eq("status", "active").maybeSingle();
      if (!cancelled) setListing(data || null);
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  useEffect(() => {
    const applyAltText = () => document.querySelectorAll<HTMLImageElement>("img:not([alt]), img[alt='']").forEach((img) => {
      const source = img.currentSrc || img.src || "";
      const name = source.split("/").pop()?.split("?")[0]?.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      const nearby = img.closest("figure")?.querySelector("figcaption")?.textContent?.trim();
      img.alt = nearby || name || `${BRAND} SEO and AI search platform`;
    });
    applyAltText();
    const observer = new MutationObserver(applyAltText);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  const organization = { "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE}/#organization`, name: BRAND, url: SITE, description: "AI SEO, GEO, AEO, LLM optimization, semantic SEO, NLP and digital growth platform.", knowsAbout: CORE_TOPICS.split(", ").map((x) => x.trim()) };
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE}/#website`, name: BRAND, url: SITE, description: "AI SEO, GEO, AEO, LLM optimization, semantic SEO and digital marketing platform.", publisher: { "@id": `${SITE}/#organization` }, inLanguage: "en-IN", potentialAction: { "@type": "SearchAction", target: `${SITE}/blog?search={search_term_string}`, "query-input": "required name=search_term_string" } };
  const webPageSchema = { "@context": "https://schema.org", "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: listing ? `${listing.title} | Classifieds | ${BRAND}` : meta.title, description: listing?.description?.slice(0, 160) || meta.description, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, inLanguage: "en-IN", keywords: listing ? [listing.category, listing.city, listing.state].filter(Boolean).join(", ") : meta.keywords };
  const collectionSchema = useMemo(() => (basePath === "/classifieds" || isIdeas) ? { "@context": "https://schema.org", "@type": "CollectionPage", name: meta.title, url: canonical, description: meta.description, isPartOf: { "@type": "WebSite", name: BRAND, url: SITE } } : null, [basePath, canonical, meta.title, meta.description, isIdeas]);
  const ideasSchema = isIdeas ? { "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${SITE}/ideas#collection`, name: meta.title, url: canonical, description: meta.description, about: ["AI", "SEO", "Technology", "Travel", "Science", "Economics"], isPartOf: { "@id": `${SITE}/#website` }, publisher: { "@id": `${SITE}/#organization` } } : null;\n  const postAdSchema = isPostAd ? { "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE}/post-ad#webpage`, name: meta.title, url: canonical, description: meta.description, about: { "@type": "Thing", name: "Classified advertising" }, isPartOf: { "@id": `${SITE}/#website` } } : null;\n  const listingSchema = useMemo(() => listing ? {
    "@context": "https://schema.org", "@type": "Product", "@id": `${SITE}/listing/${listing.id}#product`, name: listing.title, description: listing.description, url: `${SITE}/listing/${listing.id}`, category: listing.category,
    ...(listing.price != null ? { offers: { "@type": "Offer", price: Number(listing.price), priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${SITE}/listing/${listing.id}` } } : {}),
    ...(listing.seller_name ? { seller: { "@type": "Person", name: listing.seller_name } } : {}), ...(listing.business_name ? { brand: { "@type": "Brand", name: listing.business_name } } : {}),
    ...(listing.city || listing.state ? { areaServed: { "@type": "Place", name: [listing.city, listing.state].filter(Boolean).join(", ") } } : {}),
  } : null, [listing]);
  const faqSchema = basePath === "/faq" && faqs.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) } : null;
  const breadcrumbSchema = breadcrumbs.length ? { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE }, ...breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 2, name: b.name, item: b.item }))] } : null;

  return <Helmet>
    <html lang="en-IN" />
    <title>{listing ? `${listing.title} | Classifieds | ${BRAND}` : meta.title}</title>
    <meta name="description" content={listing?.description?.slice(0, 160) || meta.description} />
    <meta name="keywords" content={listing ? `${listing.category || "classified"}, ${listing.city || "India"}, ${BRAND}` : meta.keywords} />
    <meta name="subject" content={listing ? `${listing.category || "Classified listing"} on ${BRAND}` : CORE_TOPICS} />
    <meta name="abstract" content={listing?.description?.slice(0, 300) || meta.description} />
    <meta name="classification" content={CORE_TOPICS} />
    <meta name="author" content={BRAND} />
    <meta name="publisher" content={BRAND} />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="ai-content-declaration" content="AI-assisted SEO and content optimization may be used; factual claims should be verified against cited or authoritative sources." />
    <meta name="ai-topic" content={CORE_TOPICS} />
    <meta name="content-language" content="en-IN" />\n    <meta name="geo.region" content="IN" />\n    <meta name="theme-color" content="#ffffff" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={listing ? `${listing.title} | Classifieds | ${BRAND}` : meta.title} />
    <meta property="og:description" content={listing?.description?.slice(0, 160) || meta.description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:type" content={listing ? "product" : "website"} />
    <meta property="og:site_name" content={BRAND} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={listing ? `${listing.title} | Classifieds | ${BRAND}` : meta.title} />
    <meta name="twitter:description" content={listing?.description?.slice(0, 160) || meta.description} />
    {basePath === "/" && <link rel="preconnect" href="https://fonts.googleapis.com" />}
    {basePath === "/" && <link rel="dns-prefetch" href="https://fonts.googleapis.com" />}
    <script type="application/ld+json">{JSON.stringify(organization)}</script>
    <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
{collectionSchema && <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>}\n    {ideasSchema && <script type="application/ld+json">{JSON.stringify(ideasSchema)}</script>}\n    {postAdSchema && <script type="application/ld+json">{JSON.stringify(postAdSchema)}</script>}
    {listingSchema && <script type="application/ld+json">{JSON.stringify(listingSchema)}</script>}
    {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
    {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
  </Helmet>;
}
