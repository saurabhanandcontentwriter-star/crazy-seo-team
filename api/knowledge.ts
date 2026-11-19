import { services } from "../src/data/services";

type KnowledgeDocument = {
  id: string;
  title: string;
  url: string;
  category: string;
  content: string;
  keywords: string[];
};

const SITE = "https://crazyseoteam.in";

function buildKnowledgeBase(): KnowledgeDocument[] {
  const serviceDocs: KnowledgeDocument[] = services.map((service) => ({
    id: `service:${service.slug}`,
    title: service.title,
    url: `${SITE}/services/${service.slug}`,
    category: service.category,
    content: [
      service.title,
      service.tagline,
      service.description,
      ...(service.features || []),
      ...(service.deliverables || []),
      ...(service.faqs || []).flatMap((faq) => [faq.q, faq.a]),
    ].filter(Boolean).join(". "),
    keywords: [
      service.seo?.primaryKeyword,
      ...(service.seo?.secondaryKeywords || []),
      ...(service.seo?.entities || []),
      service.category,
    ].filter(Boolean) as string[],
  }));

  const pageDocs: KnowledgeDocument[] = [
    {
      id: "page:home",
      title: "Crazy SEO Team — AI SEO and Digital Growth",
      url: SITE + "/",
      category: "Company",
      content: "Crazy SEO Team covers technical SEO, AI search optimization, Generative Engine Optimization (GEO), Answer Engine Optimization (AEO), LLM SEO, content strategy, marketing automation and AI software services. The website provides service information, SEO and AI tools, articles, FAQs and contact information.",
      keywords: ["Crazy SEO Team", "AI SEO agency", "SEO services", "GEO", "AEO", "LLM SEO"],
    },
    {
      id: "page:about",
      title: "About Crazy SEO Team",
      url: SITE + "/about",
      category: "Company",
      content: "Learn about Crazy SEO Team's approach to SEO, content, AI search visibility, automation and digital growth. For service enquiries, use the contact page.",
      keywords: ["about", "company", "team", "approach", "digital growth"],
    },
    {
      id: "page:faq",
      title: "Frequently Asked Questions",
      url: SITE + "/faq",
      category: "Help",
      content: "SEO improves website visibility through technical accessibility, useful content, internal linking and authority signals. SEO outcomes depend on competition, content quality, authority and implementation; no ethical SEO provider can guarantee a specific ranking.",
      keywords: ["FAQ", "SEO questions", "rankings", "SEO results"],
    },
    {
      id: "page:tools",
      title: "SEO and AI Tools",
      url: SITE + "/seo-tools",
      category: "Tools",
      content: "Crazy SEO Team offers website checks and tools covering SEO audits, keyword research, metadata, schema, sitemap, robots.txt, SERP preview, NLP, AEO, GEO and LLM-oriented checks. Tool results should be reviewed against live search and analytics data.",
      keywords: ["SEO tools", "AI tools", "SEO audit", "keyword research", "schema", "GEO checker", "AEO checker"],
    },
    {
      id: "page:contact",
      title: "Contact Crazy SEO Team",
      url: SITE + "/contact",
      category: "Contact",
      content: "Contact Crazy SEO Team to discuss technical SEO, AI SEO, GEO, AEO, content strategy, website optimization and digital marketing requirements.",
      keywords: ["contact", "consultation", "enquiry", "SEO agency"],
    },
  ];

  return [...pageDocs, ...serviceDocs];
}

function normalize(value: string): string[] {
  return value.toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/).filter((word) => word.length > 1);
}

function scoreDocument(queryTokens: string[], document: KnowledgeDocument): number {
  const titleTokens = new Set(normalize(document.title));
  const keywordTokens = new Set(normalize(document.keywords.join(" ")));
  const contentTokens = normalize(document.content);
  const contentCounts = new Map<string, number>();
  for (const token of contentTokens) contentCounts.set(token, (contentCounts.get(token) || 0) + 1);

  let score = 0;
  for (const token of new Set(queryTokens)) {
    if (titleTokens.has(token)) score += 5;
    if (keywordTokens.has(token)) score += 3;
    score += Math.min(contentCounts.get(token) || 0, 3);
  }
  const phrase = queryTokens.join(" ");
  if (phrase.length > 4 && document.title.toLowerCase().includes(phrase)) score += 8;
  return score;
}

export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const rawQuery = typeof req.query?.q === "string" ? req.query.q.trim() : "";
  if (!rawQuery) {
    return res.status(200).json({
      name: "Crazy SEO Team Knowledge Retrieval",
      description: "Search public website service and reference content for retrieval-augmented applications.",
      usage: "/api/knowledge?q=technical%20SEO",
      query_required: true,
      documents_available: buildKnowledgeBase().length,
    });
  }
  if (rawQuery.length > 240) {
    return res.status(400).json({ error: "Query must be 240 characters or fewer." });
  }

  const queryTokens = normalize(rawQuery);
  if (!queryTokens.length) {
    return res.status(400).json({ error: "Please provide a searchable query." });
  }

  const limitRaw = Number.parseInt(String(req.query?.limit || "5"), 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 8) : 5;
  const results = buildKnowledgeBase()
    .map((document) => ({ document, score: scoreDocument(queryTokens, document) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title))
    .slice(0, limit)
    .map(({ document, score }) => ({
      id: document.id,
      title: document.title,
      url: document.url,
      category: document.category,
      score,
      excerpt: document.content.slice(0, 900),
      keywords: document.keywords,
    }));

  return res.status(200).json({
    query: rawQuery,
    retrieval: "lexical",
    result_count: results.length,
    results,
    note: "These are retrieved source passages, not generated answers. Cite the returned source URLs and verify context before answering.",
  });
}
