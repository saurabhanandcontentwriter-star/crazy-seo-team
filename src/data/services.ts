export type ServiceCategory =
  | "SEO Services"
  | "AI SEO Services"
  | "Content Writing"
  | "Article Writing"
  | "Blog Writing"
  | "Ghostwriting"
  | "Copywriting"
  | "Google Ads"
  | "AI Software Development";

export type ServiceDef = {
  slug: string;
  category: ServiceCategory;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
  metaTitle: string;
  metaDescription: string;
};

// Helper to keep entries compact while still SEO-rich
const make = (
  category: ServiceCategory,
  title: string,
  slug: string,
  tagline: string,
  description: string,
  features: string[],
  deliverables: string[] = ["Strategy & audit", "Implementation", "Monthly reporting", "Dedicated specialist"],
  faqs: { q: string; a: string }[] = [
    { q: `How long until I see results from ${title}?`, a: "Most clients see measurable progress within 60–90 days, with compounding growth from month 4 onwards." },
    { q: `Do you guarantee results?`, a: "No ethical agency guarantees rankings or revenue, but we guarantee transparent reporting and measurable, accountable execution." },
  ],
): ServiceDef => ({
  slug,
  category,
  title,
  tagline,
  description,
  features,
  deliverables,
  faqs,
  metaTitle: `${title} — Crazy SEO Team | AI-Powered ${category}`,
  metaDescription: `${tagline} Enterprise-grade ${title.toLowerCase()} by Crazy SEO Team — built for Google and AI search 2026.`,
});

export const services: ServiceDef[] = [
  // ---------------- SEO SERVICES ----------------
  make("SEO Services", "Technical SEO", "technical-seo",
    "A site Google and AI can actually crawl, render, and rank.",
    "Core Web Vitals, crawl budget, indexation, schema, JavaScript rendering, internationalization, and site architecture — we engineer the foundation that uncaps your organic growth.",
    ["Core Web Vitals optimization", "Crawl & index audits", "Schema markup", "JS rendering audits", "Site architecture", "Hreflang & i18n", "Log file analysis", "Redirect mapping"]),

  make("SEO Services", "On-Page SEO", "on-page-seo",
    "Optimize every page for ranking, clicks, and conversions.",
    "Title tags, meta descriptions, headings, internal linking, image SEO, content optimization, and search intent matching — done at scale across your site.",
    ["Title & meta optimization", "Heading structure", "Internal linking", "Image SEO & alt text", "Content optimization", "Search intent matching", "Schema implementation"]),

  make("SEO Services", "Off-Page SEO", "off-page-seo",
    "Build authority signals that move rankings.",
    "White-hat link building, digital PR, brand mentions, citations, and authority signal engineering — the off-site work that compounds your rankings.",
    ["Digital PR campaigns", "Authority link building", "Brand mention building", "Citation building", "Unlinked mention reclamation", "Competitor backlink mining"]),

  make("SEO Services", "Link Building", "link-building",
    "Earn the high-authority backlinks Google trusts.",
    "Manual outreach, digital PR, guest posting, HARO, and broken-link reclamation — every link is editorial, relevant, and built to last.",
    ["Manual outreach campaigns", "Digital PR placements", "Guest posting", "HARO link building", "Broken link reclamation", "Resource page link building"]),

  make("SEO Services", "Local SEO", "local-seo",
    "Dominate Google Maps and 'near me' searches.",
    "Rank in the local pack with optimized Google Business Profile, citations, reviews, and locally-targeted landing pages — single or multi-location.",
    ["Google Business Profile optimization", "Local citations", "Review management", "Local landing pages", "Geo-targeted content", "Multi-location SEO"]),

  make("SEO Services", "Entity SEO", "entity-seo",
    "Become a verified entity Google and AI recognize.",
    "Entity disambiguation, Knowledge Graph optimization, Wikidata/Wikipedia signal building, and structured data engineering — the modern foundation of organic and AI search.",
    ["Entity research & mapping", "Knowledge Graph optimization", "Wikidata & Wikipedia signals", "Entity-rich schema", "Brand SERP optimization", "Topical authority maps"]),

  make("SEO Services", "Semantic SEO", "semantic-seo",
    "Rank for topics, not just keywords.",
    "Topical clusters, entity-rich content, NLP optimization, and pillar/cluster architectures that signal authoritative topical coverage to Google's AI systems.",
    ["Topical authority maps", "Pillar & cluster architecture", "NLP content optimization", "Entity-rich writing", "Internal linking strategy", "Content gap closure"]),

  make("SEO Services", "Technical SEO Audits", "technical-seo-audits",
    "Comprehensive audits that uncover what's holding you back.",
    "Deep technical SEO audits covering crawlability, indexability, performance, schema, internationalization, and JavaScript rendering — with a prioritized fix list.",
    ["Full crawl audit", "Performance audit", "Indexation audit", "Schema audit", "JS rendering audit", "Mobile UX audit", "Prioritized fix roadmap"]),

  // ---------------- AI SEO SERVICES ----------------
  make("AI SEO Services", "ChatGPT Optimization", "chatgpt-optimization",
    "Get cited and recommended inside ChatGPT.",
    "Optimize your brand, content, and entity signals so ChatGPT, ChatGPT Search, and SearchGPT cite, summarize, and recommend you in answers.",
    ["ChatGPT visibility audit", "Citation-worthy content", "Entity & schema signals", "Brand mention building", "SearchGPT optimization", "Tracking & monitoring"]),

  make("AI SEO Services", "Gemini Optimization", "gemini-optimization",
    "Win Google Gemini and AI Overview placements.",
    "Optimize for Gemini answers, Google AI Overviews, and AI Mode — the new front page of Google search.",
    ["AI Overview targeting", "Gemini citation building", "Structured data engineering", "Topical authority", "Source-quality signals", "Performance tracking"]),

  make("AI SEO Services", "Claude Optimization", "claude-optimization",
    "Get referenced by Anthropic's Claude.",
    "Position your brand as a high-trust source Claude cites and recommends in its answers across web, API, and enterprise deployments.",
    ["Claude visibility audit", "Authority signal building", "Citation engineering", "Content restructuring", "Brand entity signals", "Ongoing monitoring"]),

  make("AI SEO Services", "Perplexity Optimization", "perplexity-optimization",
    "Be the source Perplexity cites.",
    "Engineer your content and signals so Perplexity uses you as a primary source in its AI answers and Pro searches.",
    ["Perplexity source audit", "Citation hooks", "Schema & freshness signals", "Authority building", "Topical coverage", "Citation tracking"]),

  make("AI SEO Services", "Google AI Overview Optimization", "google-ai-overview-optimization",
    "Capture Google's AI Overview answer box.",
    "Win placements inside Google's AI Overviews — the AI-generated answer at the top of search results that consumes the click before it happens.",
    ["AI Overview opportunity audit", "Answer-engineered content", "Snippet & schema work", "Entity signals", "Citation-grade structure", "Tracking dashboard"]),

  make("AI SEO Services", "GEO Optimization", "geo-optimization",
    "Generative Engine Optimization that earns AI citations.",
    "GEO structures your content so large language models cite your brand. We engineer pages to be the source AI prefers across ChatGPT, Gemini, Claude, and Perplexity.",
    ["Citation-worthy content", "Entity authority building", "Source-quality signals", "Schema & structured data", "LLM citation tracking", "Brand mention monitoring"]),

  make("AI SEO Services", "AEO Optimization", "aeo-optimization",
    "Win Answer Engine results with structured authority.",
    "Answer Engine Optimization targets featured snippets, People Also Ask, voice search, and AI Overview answer boxes — where the click happens before the link.",
    ["Featured snippet engineering", "People Also Ask coverage", "Voice search optimization", "FAQ schema", "Question-first content", "Voice assistant testing"]),

  make("AI SEO Services", "LLM SEO Optimization", "llm-seo-optimization",
    "Engineer your content for the large language model era.",
    "We structure, chunk, and signal your content so LLMs index, embed, and retrieve it accurately — increasing the odds your brand appears in generated answers.",
    ["Semantic chunking", "Embedding-friendly structure", "Topical authority maps", "Entity disambiguation", "Citation hooks", "LLM readability audit"]),

  make("AI SEO Services", "AI Visibility Audits", "ai-visibility-audits",
    "Know exactly where you stand inside ChatGPT, Gemini, Claude & Perplexity.",
    "A complete audit of how AI assistants currently describe, cite, or omit your brand — plus a prioritized roadmap to win visibility.",
    ["Cross-LLM brand audit", "Citation gap analysis", "Competitor AI benchmarking", "Entity signal audit", "90-day GEO roadmap", "Tracking setup"]),

  // ---------------- CONTENT WRITING ----------------
  make("Content Writing", "SEO Content Writing", "seo-content-writing",
    "SEO + AI-optimized content that ranks and converts.",
    "Human-written content optimized for Google ranking factors and LLM citation signals — blogs, landing pages, product, and service pages.",
    ["Keyword & intent research", "Content briefs", "Human writing", "SEO + GEO optimization", "Editorial QA", "Publishing-ready files"]),

  make("Content Writing", "Website Content Writing", "website-content-writing",
    "Full website copy that ranks and converts.",
    "Homepage, about, service, product, and supporting pages — written to convert visitors and rank in search and AI.",
    ["Brand voice discovery", "Sitewide content plan", "Full page writing", "SEO optimization", "Revision rounds", "CMS-ready delivery"]),

  make("Content Writing", "Landing Page Writing", "landing-page-writing",
    "Conversion-optimized landing pages built to sell.",
    "Direct response landing pages engineered with research-backed copy frameworks, conversion psychology, and SEO best practices.",
    ["Audience & offer research", "Conversion framework", "Headline & hero copy", "Body & social proof", "CTA & form copy", "A/B variations"]),

  make("Content Writing", "Product Descriptions", "product-descriptions",
    "Product copy that ranks on Google and converts on PDPs.",
    "Unique, SEO-optimized product descriptions written at scale — for Shopify, WooCommerce, Amazon, and custom stores.",
    ["Keyword research per SKU", "Unique descriptions", "Feature/benefit structure", "Schema-ready copy", "Bulk delivery", "CMS integration"]),

  make("Content Writing", "Service Page Writing", "service-page-writing",
    "Service pages that rank, educate, and convert.",
    "Long-form service pages with the structure Google and AI reward — and the conversion psychology your prospects need.",
    ["Service & intent research", "Topical structure", "FAQ & schema", "Trust & proof sections", "CTA architecture", "SEO + GEO optimization"]),

  make("Content Writing", "Local SEO Content", "local-seo-content",
    "City and neighborhood pages that rank in local search.",
    "Locally-targeted content for multi-location brands, franchises, and service-area businesses — built to rank in the local pack and Maps.",
    ["Location keyword research", "Unique city pages", "Local schema", "Geo-targeted FAQs", "Internal linking", "Multi-location scale"]),

  // ---------------- ARTICLE WRITING ----------------
  make("Article Writing", "Research Articles", "research-articles",
    "Deeply-researched long-form articles that earn links and citations.",
    "Original research, data analysis, and expert-led articles designed to attract backlinks, AI citations, and authority.",
    ["Original research design", "Data collection & analysis", "Expert interviews", "Long-form writing", "Visual asset production", "Outreach-ready"]),

  make("Article Writing", "Educational Articles", "educational-articles",
    "How-to and explainer articles that teach and rank.",
    "Educational articles structured for search intent, snippet capture, and AI citation — perfect for top-of-funnel growth.",
    ["Intent research", "Structured tutorials", "Visual & code examples", "Snippet optimization", "Schema implementation", "Internal linking"]),

  make("Article Writing", "Industry Articles", "industry-articles",
    "Industry-specific thought leadership and analysis.",
    "Sector-specific articles — SaaS, e-commerce, finance, healthcare, legal — written by specialists who understand your industry.",
    ["Industry research", "Specialist writers", "Compliance review", "Data & citation backing", "Thought leadership angle", "Publishing-ready delivery"]),

  make("Article Writing", "News Articles", "news-articles",
    "Fast, accurate, SEO-optimized news writing.",
    "Topical news articles produced quickly with sourcing, fact-checking, and SEO structure — for publishers, media brands, and content sites.",
    ["Rapid turnaround", "Source verification", "SEO structure", "Schema markup", "Editorial QA", "Bulk capacity"]),

  make("Article Writing", "Long-form Articles", "long-form-articles",
    "2,000–6,000 word pillar articles that dominate topics.",
    "In-depth pillar content engineered for topical authority, snippet capture, link earning, and AI citation.",
    ["Topical research", "Pillar architecture", "Long-form writing", "Visual asset production", "Schema & FAQ", "Cluster linking"]),

  // ---------------- BLOG WRITING ----------------
  make("Blog Writing", "Weekly Blogs", "weekly-blogs",
    "Done-for-you weekly blog programs that compound traffic.",
    "Weekly SEO blog content — strategy, briefs, drafts, edits, and publishing — designed for compounding organic growth.",
    ["Weekly editorial calendar", "Keyword & intent research", "Briefs & drafts", "Editorial QA", "Publishing & promotion", "Performance reporting"]),

  make("Blog Writing", "Monthly Blog Management", "monthly-blog-management",
    "Full-service monthly blog management.",
    "End-to-end blog program management — from quarterly strategy through publishing, promotion, and reporting.",
    ["Quarterly strategy", "Monthly calendars", "Writing & editing", "Publishing & promotion", "Performance dashboards", "Quarterly QBRs"]),

  make("Blog Writing", "Content Planning", "content-planning",
    "Editorial calendars built on real search data.",
    "Quarterly and annual editorial calendars grounded in keyword research, search intent, competitor gaps, and topical authority goals.",
    ["Keyword & intent research", "Topical authority mapping", "Competitor gap analysis", "Quarterly calendars", "Content briefs library", "KPI framework"]),

  make("Blog Writing", "Topic Research", "topic-research",
    "Find the topics that will actually move the needle.",
    "Data-driven topic research using SERP analysis, AI citation gaps, competitor intelligence, and search demand modeling.",
    ["SERP analysis", "AI citation gap analysis", "Competitor topic mining", "Demand modeling", "Prioritized topic list", "Content briefs"]),

  make("Blog Writing", "Keyword Research", "keyword-research",
    "Enterprise keyword research with intent mapping.",
    "Deep keyword research with search intent classification, difficulty scoring, AI overlap analysis, and a prioritized content roadmap.",
    ["Seed & expansion research", "Intent classification", "Difficulty scoring", "AI/LLM overlap analysis", "Prioritized roadmap", "Tracking setup"]),

  // ---------------- GHOSTWRITING ----------------
  make("Ghostwriting", "CEO Ghostwriting", "ceo-ghostwriting",
    "Thought leadership written in your CEO voice.",
    "Long-form CEO ghostwriting for LinkedIn, op-eds, newsletters, and books — research-backed and written in your authentic voice.",
    ["Voice & tone discovery", "Editorial calendar", "Research & interviews", "Ghostwritten drafts", "Revision rounds", "Publishing support"]),

  make("Ghostwriting", "Founder Ghostwriting", "founder-ghostwriting",
    "Founder storytelling that builds audience and authority.",
    "Founder-led content programs — LinkedIn, newsletters, podcasts — that turn your story and insights into compounding brand equity.",
    ["Story & voice discovery", "Founder content strategy", "Weekly ghostwriting", "Multi-channel adaptation", "Engagement coaching", "Performance reporting"]),

  make("Ghostwriting", "LinkedIn Ghostwriting", "linkedin-ghostwriting",
    "LinkedIn content programs that grow audience and pipeline.",
    "Weekly LinkedIn ghostwriting for executives and founders — designed for reach, authority, and inbound leads.",
    ["Voice profile", "Weekly post calendar", "Ghostwritten posts", "Hook & engagement design", "Comment frameworks", "Monthly analytics"]),

  make("Ghostwriting", "Thought Leadership Content", "thought-leadership-content",
    "Original points of view that move your industry.",
    "Op-eds, manifestos, frameworks, and original research — content that earns citations, media, and inbound demand.",
    ["POV development", "Research & data", "Long-form drafting", "Visual asset production", "Distribution strategy", "PR-ready packaging"]),

  make("Ghostwriting", "Newsletter Writing", "newsletter-writing",
    "Newsletters subscribers actually open.",
    "Weekly and monthly newsletter writing — ghostwritten in your voice, engineered for opens, clicks, and trust.",
    ["Editorial strategy", "Weekly/monthly writing", "Subject line testing", "List growth advice", "Analytics review", "Revision rounds"]),

  // ---------------- COPYWRITING ----------------
  make("Copywriting", "Sales Pages", "sales-pages",
    "Long-form sales pages engineered to convert.",
    "Direct response sales pages backed by audience research, conversion psychology, and proven copy frameworks.",
    ["Audience & offer research", "Conversion framework", "Long-form copy", "Visual direction", "A/B variations", "Iteration support"]),

  make("Copywriting", "Landing Page Copy", "landing-page-copy",
    "Landing page copy that turns clicks into customers.",
    "High-converting landing pages for paid traffic, lead magnets, product launches, and SaaS signups.",
    ["Audience research", "Headline & hero", "Body & social proof", "CTA architecture", "Mobile UX copy", "A/B variations"]),

  make("Copywriting", "Email Copywriting", "email-copywriting",
    "Email sequences that nurture, sell, and re-engage.",
    "Welcome flows, nurture sequences, sales launches, and lifecycle emails — written to drive opens, clicks, and revenue.",
    ["Sequence strategy", "Welcome & nurture", "Sales sequences", "Lifecycle & winback", "Subject line testing", "Performance review"]),

  make("Copywriting", "Ad Copywriting", "ad-copywriting",
    "Ad copy that beats your control.",
    "Google, Meta, LinkedIn, YouTube, and X ad copy — written by direct response specialists who know each platform.",
    ["Audience & angle research", "Multi-variant ad copy", "Creative direction briefs", "Landing page alignment", "A/B testing plan", "Iteration cycles"]),

  make("Copywriting", "Conversion Copywriting", "conversion-copywriting",
    "Research-led copy rewrites that lift conversion.",
    "Conversion copy audits and rewrites grounded in customer research, voice of customer mining, and conversion psychology.",
    ["Customer research", "Message mining", "Page-by-page rewrites", "Wireframe direction", "A/B test design", "Result reporting"]),

  // ---------------- GOOGLE ADS ----------------
  make("Google Ads", "Search Ads", "google-search-ads",
    "Profitable Google Search campaigns powered by AI bidding.",
    "Full Google Search Ads management — keyword strategy, ad copy, bidding, landing pages, and conversion tracking — built for ROAS.",
    ["Keyword & intent strategy", "Ad copy & extensions", "AI-powered bidding", "Landing page alignment", "Conversion tracking", "Weekly optimization"]),

  make("Google Ads", "Display Ads", "google-display-ads",
    "Reach the right audience across 3M+ sites.",
    "Programmatic Display Ads — creative production, audience targeting, and bidding optimized for awareness and remarketing.",
    ["Audience strategy", "Creative production", "Smart targeting", "Remarketing audiences", "Bidding optimization", "Performance reporting"]),

  make("Google Ads", "Shopping Ads", "google-shopping-ads",
    "Profitable Google Shopping for ecommerce brands.",
    "Feed optimization, Shopping campaigns, Performance Max, and conversion-value bidding for ecommerce ROAS.",
    ["Product feed audit & optimization", "Shopping & PMax campaigns", "Bidding strategy", "Negative keyword sculpting", "Promotion & merchant center", "ROAS reporting"]),

  make("Google Ads", "YouTube Ads", "youtube-ads",
    "YouTube campaigns that drive awareness, leads, and sales.",
    "TrueView, in-stream, bumper, and shorts campaigns — with creative strategy, production direction, and conversion tracking.",
    ["Audience & campaign strategy", "Creative direction", "Bid & budget management", "Audience building", "Remarketing setup", "Performance reporting"]),

  make("Google Ads", "Performance Max", "performance-max",
    "AI-driven multi-channel Google campaigns.",
    "Performance Max reaches customers across Search, Display, YouTube, Discover, Gmail, and Maps from a single asset set — powered by Google's AI.",
    ["Asset group strategy", "Audience signals", "Conversion-value bidding", "Creative asset production", "Feed optimization", "Monthly reporting"]),

  make("Google Ads", "Google Ads Audit", "google-ads-audit",
    "Find the leaks in your Google Ads account.",
    "Comprehensive audit of structure, targeting, bidding, ad copy, landing pages, tracking, and PMax setup — with a prioritized action plan.",
    ["Account structure audit", "Targeting & bidding audit", "Ad copy & extensions audit", "Landing page audit", "Tracking & GA4 audit", "Prioritized roadmap"]),

  make("Google Ads", "Conversion Tracking", "conversion-tracking",
    "Track what actually drives revenue.",
    "End-to-end conversion tracking setup — Google Ads, GA4, server-side, enhanced conversions, and offline conversion imports.",
    ["Tag manager setup", "Google Ads conversions", "GA4 event design", "Enhanced conversions", "Server-side tagging", "Offline conversion imports"]),

  make("Google Ads", "GA4 Integration", "ga4-integration",
    "GA4 set up the right way for ads and SEO.",
    "GA4 implementation, event design, audience setup, BigQuery export, and Looker dashboards — built for marketing decisions.",
    ["GA4 implementation", "Event & conversion design", "Audiences for ads", "BigQuery export", "Looker dashboards", "Team enablement"]),

  // ---------------- AI SOFTWARE DEVELOPMENT ----------------
  make("AI Software Development", "Custom SaaS Development", "custom-saas-development",
    "Production SaaS products built fast with modern stacks.",
    "Full-stack SaaS development — auth, billing, multi-tenant, admin, analytics — built with Next.js, Supabase, and Stripe.",
    ["Discovery & spec", "UI/UX design", "Full-stack build", "Auth & billing", "Admin & analytics", "Production deployment"]),

  make("AI Software Development", "AI SaaS Platforms", "ai-saas-platforms",
    "AI-native SaaS products from prototype to production.",
    "AI-first SaaS platforms — LLM features, vector search, agents, RAG, billing-by-usage — engineered for scale and cost control.",
    ["AI product design", "LLM feature build", "Vector search & RAG", "Cost & rate-limit controls", "Usage-based billing", "Production deployment"]),

  make("AI Software Development", "CRM Development", "crm-development",
    "Custom CRMs that fit how your team actually works.",
    "Bespoke CRM development — pipelines, automations, integrations, AI assistants — without the rigidity of off-the-shelf tools.",
    ["Workflow discovery", "Custom CRM build", "Integrations (email, calls, ads)", "Automations", "Reporting dashboards", "Team training"]),

  make("AI Software Development", "ERP Systems", "erp-systems",
    "Modern ERP systems tailored to your operations.",
    "Custom ERP development covering inventory, procurement, finance, HR, and operations — modular and integration-friendly.",
    ["Process mapping", "Modular ERP build", "Integrations", "Roles & permissions", "Reporting & BI", "Rollout & training"]),

  make("AI Software Development", "AI Chatbots", "ai-chatbots",
    "Website, WhatsApp, and voice AI assistants.",
    "Production-grade AI chatbots for web, WhatsApp, and voice — trained on your data and connected to your business systems.",
    ["Bot design & flows", "RAG over your knowledge base", "Channel deployment", "CRM/Helpdesk integration", "Analytics dashboard", "Ongoing tuning"]),

  make("AI Software Development", "AI Agents", "ai-agents",
    "Autonomous agents that take action, not just answer.",
    "Goal-directed AI agents — research, outreach, ops, support — built with tools, guardrails, and human-in-the-loop controls.",
    ["Use case design", "Tool & API integration", "Guardrails & evals", "Human-in-the-loop UX", "Monitoring & cost controls", "Iteration cycles"]),

  make("AI Software Development", "AI Assistants", "ai-assistants",
    "Domain-trained AI assistants for your team and customers.",
    "Internal and external AI assistants — sales, support, HR, ops — grounded in your data with role-based access.",
    ["Knowledge ingestion", "RAG architecture", "Role-based access", "Channel deployment (web, Slack, Teams)", "Analytics & QA", "Continuous training"]),

  make("AI Software Development", "Workflow Automation", "workflow-automation",
    "Automate the repetitive work draining your team.",
    "n8n, Zapier, Make, and custom automation builds — with AI steps, error handling, and observability.",
    ["Process audit", "Automation design", "Build & integrate", "Error handling & alerts", "Documentation", "Maintenance"]),

  make("AI Software Development", "AI Integrations", "ai-integrations",
    "Drop AI into the software you already use.",
    "GPT, Gemini, and Claude integrations into your CRM, helpdesk, CMS, and internal tools — with prompts, evals, and cost controls.",
    ["Integration audit", "API & SDK integration", "Prompt engineering", "Eval framework", "Cost & rate-limit controls", "Monitoring"]),

  make("AI Software Development", "Mobile Apps", "mobile-apps",
    "iOS and Android apps built with React Native.",
    "Cross-platform mobile apps — React Native and native — with AI features, offline support, and App Store deployment.",
    ["UX & product design", "React Native build", "AI feature integration", "Offline & sync", "App Store / Play Store launch", "Crash & analytics"]),

  make("AI Software Development", "Enterprise Applications", "enterprise-applications",
    "Enterprise-grade applications with SSO, audit, and compliance.",
    "Internal portals, dashboards, and line-of-business applications built with enterprise security, SSO, audit logging, and compliance baked in.",
    ["Architecture & threat model", "SSO/SAML & RBAC", "Audit logging", "Compliance (SOC2, GDPR-ready)", "Performance & scale", "Production deployment"]),
];

export const getServiceBySlug = (slug: string) => services.find((s) => s.slug === slug);

export const servicesByCategory = (): Record<ServiceCategory, ServiceDef[]> => {
  const out = {} as Record<ServiceCategory, ServiceDef[]>;
  for (const s of services) {
    (out[s.category] ||= []).push(s);
  }
  return out;
};

export const categoryOrder: ServiceCategory[] = [
  "SEO Services",
  "AI SEO Services",
  "Content Writing",
  "Article Writing",
  "Blog Writing",
  "Ghostwriting",
  "Copywriting",
  "Google Ads",
  "AI Software Development",
];
