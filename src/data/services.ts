export type ServiceDef = {
  slug: string;
  category: "SEO" | "AI SEO" | "Content" | "Google Ads" | "AI Development";
  title: string;
  tagline: string;
  description: string;
  features: string[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
  metaTitle: string;
  metaDescription: string;
};

export const services: ServiceDef[] = [
  {
    slug: "seo-services",
    category: "SEO",
    title: "SEO Services",
    tagline: "Rank #1 on Google with AI-powered SEO.",
    description:
      "End-to-end SEO covering keyword research, on-page, technical, entity, semantic SEO, link building, and local SEO — engineered to dominate Google SERPs in 2026.",
    features: [
      "Keyword & intent research",
      "On-page optimization",
      "Technical SEO audits",
      "Entity & semantic SEO",
      "Authority link building",
      "Local SEO & Google Business Profile",
    ],
    deliverables: [
      "Monthly SEO roadmap",
      "Ranking & traffic reports",
      "Competitor gap analysis",
      "Content briefs",
    ],
    faqs: [
      { q: "How long until I see SEO results?", a: "Most clients see meaningful movement in 60–90 days, with compounding growth from month 4 onwards." },
      { q: "Do you guarantee #1 rankings?", a: "No ethical SEO agency guarantees rankings. We do guarantee transparent reporting and measurable progress." },
    ],
    metaTitle: "SEO Services — Crazy SEO Team | Rank #1 on Google 2026",
    metaDescription: "Enterprise SEO services covering technical, on-page, entity, and local SEO. Powered by AI, built for Google's 2026 search landscape.",
  },
  {
    slug: "ai-seo-services",
    category: "AI SEO",
    title: "AI SEO Services",
    tagline: "Get found in ChatGPT, Gemini, Claude & Perplexity.",
    description:
      "AI search is the new Google. We optimize your brand for generative engines so you appear in ChatGPT answers, Gemini overviews, Claude citations, and Perplexity sources.",
    features: [
      "ChatGPT visibility optimization",
      "Gemini & Google AI Overview optimization",
      "Claude citation building",
      "Perplexity source optimization",
      "Bing Copilot presence",
      "LLM-readable content engineering",
    ],
    deliverables: [
      "AI visibility audit",
      "Generative engine ranking report",
      "LLM-optimized content set",
      "Entity & schema implementation",
    ],
    faqs: [
      { q: "What is AI SEO?", a: "AI SEO (also called GEO/AEO/LLM SEO) optimizes your content so AI assistants cite, summarize, and recommend your brand." },
      { q: "Is AI SEO different from Google SEO?", a: "It overlaps — strong technical SEO and structured data help both — but AI SEO requires extra signals like entity clarity, citations, and chunk-friendly formatting." },
    ],
    metaTitle: "AI SEO Services — ChatGPT, Gemini, Claude & Perplexity Optimization",
    metaDescription: "Rank in AI search engines. We optimize your site for ChatGPT, Gemini, Claude, Perplexity and Bing Copilot.",
  },
  {
    slug: "geo-optimization",
    category: "AI SEO",
    title: "GEO Optimization",
    tagline: "Generative Engine Optimization that earns AI citations.",
    description:
      "Generative Engine Optimization (GEO) is the discipline of structuring content so large language models cite your brand. We engineer your pages to be the source AI prefers.",
    features: [
      "Citation-worthy content structure",
      "Entity authority building",
      "Source-quality signal optimization",
      "Schema & structured data",
      "Brand mention monitoring across LLMs",
    ],
    deliverables: ["GEO audit report", "LLM citation tracker", "Content rewrite pack", "Schema implementation"],
    faqs: [
      { q: "What's the difference between GEO and SEO?", a: "SEO targets ranking links; GEO targets being quoted inside AI answers." },
    ],
    metaTitle: "GEO Optimization — Get Cited by ChatGPT, Gemini & Perplexity",
    metaDescription: "Generative Engine Optimization services to make your brand the source AI assistants cite.",
  },
  {
    slug: "aeo-optimization",
    category: "AI SEO",
    title: "AEO Optimization",
    tagline: "Win Answer Engine results with structured authority.",
    description:
      "Answer Engine Optimization (AEO) targets featured snippets, People Also Ask, voice search, and AI Overview answer boxes — where the click happens before the link.",
    features: [
      "Featured snippet engineering",
      "People Also Ask coverage",
      "Voice search optimization",
      "FAQ schema implementation",
      "Question-first content design",
    ],
    deliverables: ["Snippet capture report", "Question keyword cluster", "FAQ schema pack"],
    faqs: [{ q: "What is AEO?", a: "Answer Engine Optimization positions your content as the direct answer in Google's answer boxes and voice assistants." }],
    metaTitle: "AEO Optimization — Answer Engine SEO for Snippets & Voice",
    metaDescription: "Capture featured snippets, People Also Ask, voice search and AI Overview answers with AEO.",
  },
  {
    slug: "llm-seo-optimization",
    category: "AI SEO",
    title: "LLM SEO Optimization",
    tagline: "Engineer your content for the large language model era.",
    description:
      "We structure, chunk, and signal your content so LLMs index, embed, and retrieve it accurately — increasing the odds your brand appears in generated answers.",
    features: [
      "Semantic chunking",
      "Embedding-friendly structure",
      "Topical authority maps",
      "Entity disambiguation",
      "Citation hooks",
    ],
    deliverables: ["LLM readability audit", "Content restructure plan", "Topical authority map"],
    faqs: [{ q: "Will LLM SEO hurt my Google rankings?", a: "No. The same signals that help LLMs (clarity, structure, schema, authority) also help Google." }],
    metaTitle: "LLM SEO Optimization — Content Engineering for AI Search",
    metaDescription: "Optimize your content for large language models. Better embeddings, better retrieval, better AI visibility.",
  },
  {
    slug: "technical-seo",
    category: "SEO",
    title: "Technical SEO",
    tagline: "A site Google and AI can actually crawl.",
    description:
      "Core Web Vitals, crawl budget, indexation, schema, internationalization, JavaScript rendering — we fix the engineering issues that cap your growth.",
    features: ["Core Web Vitals optimization", "Crawl & index audits", "Schema markup", "JS rendering audits", "Site architecture", "Hreflang & i18n"],
    deliverables: ["Full technical audit", "Prioritized fix list", "Implementation support"],
    faqs: [{ q: "Do you fix the issues or just report?", a: "We do both — audit, prioritize, and implement directly or with your dev team." }],
    metaTitle: "Technical SEO Services — Core Web Vitals, Schema, Crawl Audits",
    metaDescription: "Enterprise technical SEO audits and fixes covering Core Web Vitals, schema, indexation, and architecture.",
  },
  {
    slug: "local-seo",
    category: "SEO",
    title: "Local SEO",
    tagline: "Dominate local search in your city.",
    description:
      "Rank in Google Maps, the local pack, and 'near me' searches with optimized Google Business Profile, citations, reviews, and locally-targeted content.",
    features: ["Google Business Profile optimization", "Local citations", "Review management", "Local landing pages", "Geo-targeted content"],
    deliverables: ["Local SEO audit", "GBP optimization", "Monthly local ranking report"],
    faqs: [{ q: "Do you do multi-location SEO?", a: "Yes — we handle single-location and multi-location franchise SEO programs." }],
    metaTitle: "Local SEO Services — Google Maps & Local Pack Rankings",
    metaDescription: "Rank #1 in Google Maps and local search with full local SEO optimization.",
  },
  {
    slug: "google-ads-services",
    category: "Google Ads",
    title: "Google Ads Services",
    tagline: "Profitable PPC powered by AI bidding.",
    description:
      "Search, Display, Shopping, YouTube, and Performance Max — built, optimized, and scaled by certified Google Ads specialists with AI-driven bid management.",
    features: ["Search campaigns", "Performance Max", "Shopping ads", "YouTube ads", "Remarketing", "Conversion tracking"],
    deliverables: ["Account audit", "Campaign builds", "Weekly optimization", "ROI reports"],
    faqs: [
      { q: "What's the minimum ad spend you work with?", a: "We typically work with budgets starting at ₹50,000 / $600 per month in ad spend." },
      { q: "Do you charge a % of spend?", a: "We offer both fixed-fee and percentage-of-spend models depending on account size." },
    ],
    metaTitle: "Google Ads Services — PPC, Performance Max & YouTube Ads Agency",
    metaDescription: "Profitable Google Ads management across Search, Shopping, YouTube, and Performance Max.",
  },
  {
    slug: "performance-max",
    category: "Google Ads",
    title: "Performance Max Services",
    tagline: "AI-driven multi-channel Google campaigns.",
    description:
      "Performance Max campaigns reach customers across Search, Display, YouTube, Discover, Gmail, and Maps from a single asset set, powered by Google's AI.",
    features: ["Asset group strategy", "Audience signals", "Conversion-value bidding", "Creative asset production", "Feed optimization"],
    deliverables: ["PMax campaign builds", "Asset library", "Monthly performance reports"],
    faqs: [{ q: "Is Performance Max right for my business?", a: "PMax works best for ecommerce, lead gen with strong conversion data, and brands with rich creative assets." }],
    metaTitle: "Performance Max Services — Google AI Campaign Management",
    metaDescription: "Performance Max campaign management across Search, YouTube, Display, Discover, Gmail, and Maps.",
  },
  {
    slug: "content-writing-services",
    category: "Content",
    title: "Content Writing Services",
    tagline: "SEO + AI-optimized content that ranks and converts.",
    description:
      "Blog posts, landing pages, product descriptions, service pages, and local SEO content — written by humans, optimized for Google and LLMs.",
    features: ["SEO blog writing", "Landing page copy", "Product descriptions", "Service pages", "Local SEO content"],
    deliverables: ["Content briefs", "Drafts & revisions", "Optimization checklist", "Publishing-ready files"],
    faqs: [{ q: "Is the content AI-written?", a: "Our writers use AI for research and outlines but write and edit every piece by hand." }],
    metaTitle: "Content Writing Services — SEO & AI-Optimized Content",
    metaDescription: "Human-written, SEO and LLM-optimized content for blogs, landing pages, and product pages.",
  },
  {
    slug: "blog-writing-services",
    category: "Content",
    title: "Blog Writing Services",
    tagline: "Weekly & monthly blog programs that compound traffic.",
    description:
      "Done-for-you blog content programs — strategy, briefs, drafts, edits, and publishing — designed for organic growth.",
    features: ["Weekly blog writing", "Monthly content calendars", "Topic strategy", "SEO optimization", "AI visibility tuning"],
    deliverables: ["Editorial calendar", "Weekly/monthly posts", "Performance reports"],
    faqs: [{ q: "How many blogs per month?", a: "Packages range from 4 to 30 posts/month depending on your growth goals." }],
    metaTitle: "Blog Writing Services — Weekly SEO Blog Content Programs",
    metaDescription: "Weekly and monthly SEO blog writing programs that grow your organic traffic month after month.",
  },
  {
    slug: "ghostwriting-services",
    category: "Content",
    title: "Ghostwriting Services",
    tagline: "Thought leadership content in your voice.",
    description:
      "CEO, founder, and executive ghostwriting for LinkedIn, newsletters, op-eds, and books — research-backed and written in your authentic voice.",
    features: ["CEO/founder ghostwriting", "LinkedIn thought leadership", "Newsletter ghostwriting", "Op-eds & guest posts"],
    deliverables: ["Voice & tone guide", "Editorial calendar", "Monthly content batch"],
    faqs: [{ q: "How do you capture my voice?", a: "We start with 1–2 voice interviews and analyze your existing writing to build a voice profile." }],
    metaTitle: "Ghostwriting Services — CEO, Founder & LinkedIn Ghostwriters",
    metaDescription: "Executive ghostwriting for LinkedIn, newsletters, and thought leadership content.",
  },
  {
    slug: "copywriting-services",
    category: "Content",
    title: "Copywriting Services",
    tagline: "Conversion copy that sells.",
    description:
      "Sales pages, landing pages, email sequences, and ad copy engineered for conversion — written by direct response copywriters.",
    features: ["Sales pages", "Landing pages", "Email sequences", "Ad copy", "Conversion copywriting"],
    deliverables: ["Research & strategy", "Copy drafts", "A/B test variations"],
    faqs: [{ q: "Do you write for ads too?", a: "Yes — Google, Meta, LinkedIn, and YouTube ad copy." }],
    metaTitle: "Copywriting Services — Sales Pages, Landing Pages & Ad Copy",
    metaDescription: "Conversion-focused copywriting for sales pages, landing pages, email, and ad campaigns.",
  },
  {
    slug: "ai-software-development",
    category: "AI Development",
    title: "AI Software Development",
    tagline: "Custom AI applications, agents, and SaaS platforms.",
    description:
      "We build custom AI software — chatbots, agents, RAG systems, AI SaaS platforms, and workflow automation — from prototype to production.",
    features: ["Custom GPT solutions", "AI agents & assistants", "RAG knowledge bases", "AI SaaS platforms", "Workflow automation"],
    deliverables: ["Discovery & spec", "MVP build", "Production deployment", "Ongoing support"],
    faqs: [
      { q: "What tech stack do you use?", a: "TypeScript, Next.js, Node, Python, OpenAI, Gemini, Claude, LangChain, Pinecone — selected per project." },
      { q: "Do you build mobile apps?", a: "Yes — React Native for iOS and Android." },
    ],
    metaTitle: "AI Software Development — Custom AI Apps, Agents & SaaS",
    metaDescription: "Custom AI software development: chatbots, agents, RAG systems, and AI SaaS platforms.",
  },
  {
    slug: "ai-chatbots",
    category: "AI Development",
    title: "AI Chatbots",
    tagline: "Website, WhatsApp, and voice AI assistants.",
    description:
      "Production-grade AI chatbots for websites, WhatsApp, and voice channels — trained on your data and connected to your business systems.",
    features: ["Website chatbots", "WhatsApp bots", "Voice assistants", "RAG over your knowledge base", "CRM integration"],
    deliverables: ["Bot design", "Training & RAG setup", "Channel deployment", "Analytics dashboard"],
    faqs: [{ q: "Which AI models do you use?", a: "GPT, Gemini, and Claude — selected based on use case, cost, and latency." }],
    metaTitle: "AI Chatbots — Website, WhatsApp & Voice AI Assistants",
    metaDescription: "Build production AI chatbots for web, WhatsApp, and voice with RAG and CRM integration.",
  },
];

export const getServiceBySlug = (slug: string) => services.find((s) => s.slug === slug);
