import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getServiceBySlug } from "@/data/services";

const SITE = "https://crazyseoteam.in";
const BRAND = "Crazy SEO Team";
const CORE_TOPICS = "SEO, technical SEO, AI search optimization, AEO, GEO, generative engine optimization, LLM optimization, AI SEO, content engineering, semantic SEO, entity SEO, content strategy, marketing automation, AI software, digital marketing";
const AI_SEARCH_TOPICS = [
  "AI Search Optimization",
  "Technical SEO Services",
  "Generative Engine Optimization (GEO)",
  "Content Engineering Services",
  "Marketing Automation & AI Software",
  "Answer Engine Optimization (AEO)",
  "LLM Optimization & AI Visibility",
  "Semantic SEO & Entity Optimization",
  "AI SEO Content Strategy",
  "AI Search Content & Citation Readiness",
];
const pageMeta: Record<string, { title: string; description: string; keywords: string }> = {
  "/": { title: "Crazy SEO Team | AI SEO, GEO & Digital Marketing Agency", description: "AI SEO and digital marketing agency helping businesses grow with technical SEO, GEO, AEO, content, automation and AI search optimization.", keywords: "AI SEO agency, SEO agency, technical SEO services, AI search optimization, generative engine optimization, GEO, answer engine optimization, AEO, LLM optimization, LLM SEO, content engineering, semantic SEO, entity SEO, marketing automation, AI software, digital marketing, SEO services" },
  "/about": { title: "About Crazy SEO Team | AI SEO & Digital Marketing", description: "Learn how Crazy SEO Team approaches SEO, content, AI-search visibility, automation and digital growth.", keywords: "Crazy SEO Team, AI SEO company, SEO experts, LLM optimization, digital marketing" },
  "/services": { title: "AI SEO & Digital Marketing Services | Crazy SEO Team", description: "Explore SEO, content, technical optimization, AI-search support, automation and digital marketing services.", keywords: "AI SEO services, AI search optimization, technical SEO services, GEO services, generative engine optimization, AEO, answer engine optimization, LLM optimization, content engineering services, semantic SEO, entity SEO, marketing automation, AI software, content writing, digital marketing" },
  "/industries": { title: "Industries We Serve | SEO & AI Search Growth | Crazy SEO Team", description: "Explore industry-specific SEO, AI search, content, local visibility and digital growth strategies for e-commerce, SaaS, healthcare, education, finance and more.", keywords: "industry SEO, ecommerce SEO, SaaS SEO, healthcare SEO, education SEO, fintech SEO, real estate SEO, local SEO" },
  "/seo-tools": { title: "Free SEO Tools, Audit & AEO GEO Checkers | Crazy SEO Team", description: "Use practical tools for SEO audits, keywords, metadata, schema, sitemaps and other website checks.", keywords: "SEO tools, SEO audit, keyword research, NLP analyzer, schema generator, GEO checker, AEO checker, LLM checker" },
  "/ai-tools": { title: "AI Tools for SEO & Content | Free AI SEO Toolkit | Crazy SEO Team", description: "Explore free AI tools for SEO, content optimization and search growth, including article generation, audits, metadata, schema and AI-search workflows.", keywords: "AI tools, AI SEO tools, SEO tools, AI content tools, AI marketing tools, SEO content generator, content optimization, AEO, GEO, LLM optimization, AI visibility" },
  "/results": { title: "SEO Results & Case Studies | Crazy SEO Team", description: "Review selected SEO, search-visibility and digital growth work from Crazy SEO Team.", keywords: "SEO results, SEO case studies, AI visibility, organic growth, search optimization" },
  "/news": { title: "Latest SEO & AI News | Crazy SEO Team", description: "Follow practical updates on SEO, Google Search, AI tools and digital marketing.", keywords: "SEO news, Google updates, AI SEO news, ChatGPT SEO, Gemini SEO, AI search" },
  "/blog": { title: "SEO & AI SEO Blog | Crazy SEO Team", description: "Read practical guides about SEO, content, AI search, website performance and digital marketing.", keywords: "SEO blog, AI SEO blog, GEO, AEO, LLM optimization, NLP, content strategy" },
  "/faq": { title: "SEO & AI SEO FAQs | Crazy SEO Team", description: "Answers to common questions about SEO, website optimization, content, audits and digital marketing.", keywords: "SEO FAQ, AI SEO FAQ, GEO FAQ, AEO FAQ, LLM SEO questions" },
  "/pricing": { title: "SEO & AI Services Pricing | Crazy SEO Team", description: "Explore Crazy SEO Team service options for SEO, AI SEO, content, automation and digital growth.", keywords: "SEO pricing, AI SEO pricing, SEO services, AI automation services" },
  "/classifieds": { title: "Classifieds Marketplace India | Buy, Sell, Jobs, Property & Services | Crazy SEO Team", description: "Browse approved classifieds across India for products, services, jobs, property, vehicles, businesses, education and more on Crazy SEO Team.", keywords: "classifieds India, online marketplace, buy sell India, jobs, property, cars, mobiles, services, business listings" },
  "/anvya": { title: "ANVYA | Ideas, Q&A, Blogs & Communities | AI, SEO & Technology", description: "ANVYA is a community knowledge platform for ideas, Q&A, blogs, discussions, events and networking across AI, SEO, technology, science, travel, business and economics.", keywords: "ANVYA, community platform, knowledge sharing platform, ideas platform, Q&A platform, question answer website, blogging platform, discussion forum, online community, AI community, SEO community, technology community, AI discussions, SEO discussions, technology discussions, community events, networking platform" },
  "/anvya/explore": { title: "Explore AI, SEO, Technology Ideas & Communities | ANVYA", description: "Explore public ideas, questions, blogs, profiles, communities and events on ANVYA across AI, SEO, technology, science, travel, business and economics.", keywords: "ANVYA explore, explore ideas, AI discussions, SEO discussions, technology discussions, AI questions, SEO questions, technology questions, public Q&A, blogs and posts, community discovery, knowledge discovery, online communities" },
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
  "/anvya": [
    { q: "What is ANVYA?", a: "ANVYA is a community knowledge platform for sharing ideas, asking questions, publishing blogs, joining discussions, discovering people and building topic-based communities around AI, SEO, technology, science, travel, business and economics." },
    { q: "Who is ANVYA for?", a: "ANVYA is for creators, professionals, learners, founders, developers, marketers and anyone who wants to share knowledge, ask useful questions, discover people and participate in communities." },
    { q: "What makes ANVYA useful for knowledge discovery?", a: "ANVYA combines public ideas, Q&A, blog-style posts, profiles, communities, events and topic discovery in one searchable community experience." },
    { q: "Can AI and SEO professionals use ANVYA?", a: "Yes. ANVYA supports AI, SEO, technology and digital-marketing discussions where professionals can publish insights, ask questions, exchange practical knowledge and discover relevant people." },
    { q: "What can I do on ANVYA?", a: "You can publish ideas and blogs, ask questions, join public discussions, explore community content, discover profiles and participate in topic-based conversations." },
    { q: "Can I ask questions on ANVYA?", a: "Yes. ANVYA supports public Q&A so members can ask questions, share knowledge and take part in discussions." },
    { q: "Can I publish a blog or idea on ANVYA?", a: "Yes. Members can publish ideas and blog-style posts and share useful knowledge with the wider community." },
    { q: "Which topics are covered on ANVYA?", a: "ANVYA supports discussions across AI, SEO, technology, travel, science, economics, business and other community interests." },
    { q: "Is ANVYA useful for networking and collaboration?", a: "Yes. Public profiles, discussions and community content can help people discover relevant interests and connect around shared topics." },
    { q: "How does ANVYA help with knowledge sharing?", a: "ANVYA brings ideas, questions, blogs and discussions into one place so people can learn from community contributions and exchange practical knowledge." },
  ],
};
const industryMeta: Record<string, { title: string; description: string; keywords: string }> = {
  "e-commerce": { title: "E-Commerce SEO & Digital Growth | Crazy SEO Team", description: "E-Commerce SEO, product optimization, shopping visibility and conversion-focused digital growth strategies from Crazy SEO Team.", keywords: "ecommerce SEO, e-commerce SEO, product SEO, shopping SEO, ecommerce marketing" },
  education: { title: "Education SEO & Digital Marketing | Crazy SEO Team", description: "Education SEO, admissions growth, content strategy and search visibility solutions for education brands and institutions.", keywords: "education SEO, education marketing, admissions SEO, education digital marketing" },
  healthcare: { title: "Healthcare SEO & Patient Growth | Crazy SEO Team", description: "Healthcare SEO, local search visibility, trusted content and patient-growth strategies for healthcare organizations.", keywords: "healthcare SEO, medical SEO, healthcare marketing, local SEO, patient growth" },
  "real-estate": { title: "Real Estate SEO & Lead Generation | Crazy SEO Team", description: "Real estate SEO, property search visibility, local SEO and lead-generation strategies for property businesses.", keywords: "real estate SEO, property SEO, real estate marketing, local SEO, property leads" },
  "saas-tech": { title: "SaaS & Technology SEO | Crazy SEO Team", description: "SaaS and technology SEO, B2B content, programmatic SEO and demand-generation strategies for software companies.", keywords: "SaaS SEO, technology SEO, B2B SEO, programmatic SEO, SaaS marketing" },
  "finance-fintech": { title: "Finance & Fintech SEO | Crazy SEO Team", description: "Finance and fintech SEO, authority-focused content, technical optimization and digital acquisition strategies.", keywords: "fintech SEO, finance SEO, fintech marketing, financial content SEO" },
  "travel-hospitality": { title: "Travel & Hospitality SEO | Crazy SEO Team", description: "Travel and hospitality SEO, local visibility, content strategy and booking-focused digital growth.", keywords: "travel SEO, hospitality SEO, hotel SEO, tourism marketing, booking SEO" },
  legal: { title: "Legal SEO & Search Visibility | Crazy SEO Team", description: "Legal SEO, local search, authority content and qualified lead-generation strategies for law firms and legal businesses.", keywords: "legal SEO, law firm SEO, lawyer SEO, legal marketing, local SEO" },
  "local-businesses": { title: "Local SEO for Businesses | Crazy SEO Team", description: "Local SEO, Google Maps visibility, business profile optimization and local lead generation for service-area businesses.", keywords: "local SEO, Google Maps SEO, local business SEO, Google Business Profile, local leads" },
};

function getBasePath(pathname: string) {
  if (pathname.startsWith("/blog/")) return "/blog";
  if (pathname.startsWith("/services/")) return "/services";
  if (pathname.startsWith("/industries/")) return "/industries";
  if (pathname.startsWith("/classifieds")) return "/classifieds";
  return pathname.replace(/\/$/, "") || "/";
}

export default function SEOHead() {
  const location = useLocation();
  const basePath = getBasePath(location.pathname);
  const serviceSlug = location.pathname.match(/^\/services\/([^/]+)$/)?.[1] || null;
  const service = serviceSlug ? getServiceBySlug(serviceSlug) : null;
  const industrySlug = location.pathname.match(/^\/industries\/([^/]+)$/)?.[1] || null;
  const industry = industrySlug ? industryMeta[industrySlug] : null;
  const [listing, setListing] = useState<any>(null);
  const [anvyaPost, setAnvyaPost] = useState<any>(null);
  const anvyaSlug = location.pathname.match(/^\/anvya\/([^/]+)$/)?.[1] || null;
  const isAnvyaPost = !!anvyaSlug;
  const isIdeas = basePath === "/anvya" || basePath === "/anvya/explore";
  const isPostAd = basePath === "/post-ad";
  const isPrivateOrUtility = location.pathname.startsWith("/admin") || location.pathname.startsWith("/crm") || ["/anvya/login", "/anvya/settings", "/anvya/analytics", "/anvya/notifications", "/anvya/saved", "/classified-dashboard", "/classified-profile", "/post-ad"].includes(basePath);
  const meta = service
    ? { title: service.metaTitle, description: service.metaDescription, keywords: [service.seo.primaryKeyword, ...service.seo.secondaryKeywords, ...service.seo.entities].join(", ") }
    : industry
      ? industry
      : pageMeta[basePath] ?? { title: `${BRAND} | AI SEO, GEO, AEO & Digital Growth`, description: "Crazy SEO Team helps businesses improve SEO, AI search visibility, content performance and digital growth.", keywords: CORE_TOPICS };
  const canonical = `${SITE}${location.pathname === "/" ? "/" : location.pathname.replace(/\/$/, "")}`;
  const faqs = service?.faqs ?? faqSets[basePath] ?? [];
  const faqSchema = faqs.length && !isPrivateOrUtility ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) } : null;
  const breadcrumbs = location.pathname.split("/").filter(Boolean).map((part, index, arr) => ({ name: part.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), item: `${SITE}/${arr.slice(0, index + 1).join("/")}` }));

  useEffect(() => {
    let cancelled = false;
    setListing(null);
    setAnvyaPost(null);
    if (anvyaSlug) {
      (async () => {
        const { data } = await (supabase as any).from("idea_posts").select("id,title,content,slug,subject,display_name,image_url,created_at,status").eq("slug", decodeURIComponent(anvyaSlug)).eq("status", "approved").maybeSingle();
        if (!cancelled) setAnvyaPost(data || null);
      })();
    }
    const id = location.pathname.match(/^\/listing\/([^/]+)$/)?.[1];
    if (!id) return () => { cancelled = true; };
    (async () => {
      const { data } = await (supabase as any).from("classified_listings").select("*").eq("id", id).eq("status", "active").maybeSingle();
      if (!cancelled) setListing(data || null);
    })();
    return () => { cancelled = true; };
  }, [location.pathname, anvyaSlug]);

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

  const organization = { "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE}/#organization`, name: BRAND, url: SITE, description: "SEO, content, AI-search visibility and digital growth platform.", knowsAbout: [...CORE_TOPICS.split(", ").map((x) => x.trim()), ...AI_SEARCH_TOPICS] };
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE}/#website`, name: BRAND, url: SITE, description: "SEO, content, AI-search visibility and digital marketing platform.", publisher: { "@id": `${SITE}/#organization` }, inLanguage: "en-IN" };
  const webPageSchema = { "@context": "https://schema.org", "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: anvyaPost ? `${anvyaPost.title || "ANVYA Post"} | ANVYA | ${BRAND}` : listing ? `${listing.title} | Classifieds | ${BRAND}` : meta.title, description: anvyaPost ? String(anvyaPost.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) : listing?.description?.slice(0, 160) || meta.description, isPartOf: { "@id": `${SITE}/#website` }, about: AI_SEARCH_TOPICS.map((topic) => ({ "@type": "Thing", name: topic })), inLanguage: "en-IN", keywords: listing ? [listing.category, listing.city, listing.state].filter(Boolean).join(", ") : `${meta.keywords}, ${AI_SEARCH_TOPICS.join(", ")}` };
  const collectionSchema = useMemo(() => (basePath === "/classifieds" || basePath === "/industries" || isIdeas) ? { "@context": "https://schema.org", "@type": "CollectionPage", name: meta.title, url: canonical, description: meta.description, isPartOf: { "@type": "WebSite", name: BRAND, url: SITE } } : null, [basePath, canonical, meta.title, meta.description, isIdeas]);
  const ideasSchema = isIdeas ? { "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${SITE}/anvya#collection`, name: meta.title, url: canonical, description: meta.description, about: ["AI", "SEO", "Generative Engine Optimization", "Answer Engine Optimization", "LLM optimization", "Technology", "Digital marketing", "Travel", "Science", "Economics", "Business"], keywords: meta.keywords, audience: { "@type": "Audience", audienceType: "People seeking knowledge, discussions, networking and community collaboration" }, isPartOf: { "@id": `${SITE}/#website` }, publisher: { "@id": `${SITE}/#organization` } } : null;
  const postAdSchema = isPostAd ? { "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE}/post-ad#webpage`, name: meta.title, url: canonical, description: meta.description, about: { "@type": "Thing", name: "Classified advertising" }, isPartOf: { "@id": `${SITE}/#website` } } : null;
  const listingSchema = useMemo(() => listing ? {
    "@context": "https://schema.org", "@type": "Product", "@id": `${SITE}/listing/${listing.id}#product`, name: listing.title, description: listing.description, url: `${SITE}/listing/${listing.id}`, category: listing.category,
    ...(listing.price != null ? { offers: { "@type": "Offer", price: Number(listing.price), priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${SITE}/listing/${listing.id}` } } : {}),
    ...(listing.seller_name ? { seller: { "@type": "Person", name: listing.seller_name } } : {}), ...(listing.business_name ? { brand: { "@type": "Brand", name: listing.business_name } } : {}),
    ...(listing.city || listing.state ? { areaServed: { "@type": "Place", name: [listing.city, listing.state].filter(Boolean).join(", ") } } : {}),
  } : null, [listing]);
  const serviceSchema = service ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonical}#service`,
    name: service.title,
    alternateName: service.seo.primaryKeyword,
    description: service.description,
    serviceType: service.seo.primaryKeyword,
    provider: { "@id": `${SITE}/#organization` },
    areaServed: { "@type": "Place", name: "Worldwide" },
    url: canonical,
    mainEntityOfPage: { "@id": `${canonical}#webpage` },
    audience: { "@type": "Audience", audienceType: "Businesses and organizations seeking search and digital growth" },
    category: service.category,
    knowsAbout: [service.seo.primaryKeyword, ...service.seo.secondaryKeywords, ...service.seo.entities],
  } : null;
  const industrySchema = industry && industrySlug ? { "@context": "https://schema.org", "@type": "WebPage", "@id": `${canonical}#industry`, name: industry.title, description: industry.description, url: canonical, about: { "@type": "Thing", name: industrySlug.replace(/-/g, " ") }, isPartOf: { "@id": `${SITE}/#website` } } : null;
  const breadcrumbSchema = breadcrumbs.length ? { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE }, ...breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 2, name: b.name, item: b.item }))] } : null;

  return <Helmet>
    <html lang="en-IN" />
    <title>{anvyaPost ? `${anvyaPost.title || "ANVYA Post"} | ANVYA | ${BRAND}` : listing ? `${listing.title} | Classifieds | ${BRAND}` : meta.title}</title>
    <meta name="description" content={anvyaPost ? String(anvyaPost.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) : listing?.description?.slice(0, 160) || meta.description} />
    <meta name="keywords" content={anvyaPost ? `${anvyaPost.subject || "ANVYA"}, AI, SEO, technology, ${BRAND}` : listing ? `${listing.category || "classified"}, ${listing.city || "India"}, ${BRAND}` : meta.keywords} />
    <meta name="subject" content={listing ? `${listing.category || "Classified listing"} on ${BRAND}` : CORE_TOPICS} />
    <meta name="abstract" content={listing?.description?.slice(0, 300) || meta.description} />
    <meta name="classification" content={CORE_TOPICS} />
    <meta name="author" content={BRAND} />
    <meta name="publisher" content={BRAND} />
    <meta name="robots" content={isPrivateOrUtility ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
    <meta name="googlebot" content={isPrivateOrUtility ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
    <meta name="bingbot" content={isPrivateOrUtility ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
    <meta name="content-language" content="en-IN" />
    <meta name="geo.region" content="IN" />
    <meta name="theme-color" content={isIdeas || isAnvyaPost ? "#05070d" : "#ffffff"} />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="generator" content="Crazy SEO Team" />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hrefLang="en-IN" href={canonical} />
    <link rel="alternate" hrefLang="x-default" href={canonical} />
    <meta property="og:title" content={anvyaPost ? `${anvyaPost.title || "ANVYA Post"} | ANVYA | ${BRAND}` : listing ? `${listing.title} | Classifieds | ${BRAND}` : meta.title} />
    <meta property="og:description" content={anvyaPost ? String(anvyaPost.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) : listing?.description?.slice(0, 160) || meta.description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:type" content={listing ? "product" : isAnvyaPost ? "article" : "website"} />
    <meta property="og:site_name" content={BRAND} />
    <meta property="og:locale" content="en_IN" />
    {anvyaPost?.image_url && <meta property="og:image:alt" content={`${anvyaPost.title || "ANVYA community post"} | ANVYA`} />
    {(anvyaPost?.image_url || listing?.image_url) && <meta property="og:image" content={anvyaPost?.image_url || listing?.image_url} />}
    {(anvyaPost?.image_url || listing?.image_url) && <meta name="twitter:image" content={anvyaPost?.image_url || listing?.image_url} />}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={anvyaPost ? `${anvyaPost.title || "ANVYA Post"} | ANVYA | ${BRAND}` : listing ? `${listing.title} | Classifieds | ${BRAND}` : meta.title} />
    <meta name="twitter:description" content={anvyaPost ? String(anvyaPost.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) : listing?.description?.slice(0, 160) || meta.description} />
    {basePath === "/" && <link rel="preconnect" href="https://fonts.googleapis.com" />}
    {basePath === "/" && <link rel="dns-prefetch" href="https://fonts.googleapis.com" />}
    <script type="application/ld+json">{JSON.stringify(organization)}</script>
    <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
{collectionSchema && <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>}
    {ideasSchema && <script type="application/ld+json">{JSON.stringify(ideasSchema)}</script>}
    {postAdSchema && <script type="application/ld+json">{JSON.stringify(postAdSchema)}</script>}
    {listingSchema && <script type="application/ld+json">{JSON.stringify(listingSchema)}</script>}
    {serviceSchema && <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>}
    {industrySchema && <script type="application/ld+json">{JSON.stringify(industrySchema)}</script>}
    {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
    {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
  </Helmet>;
}
