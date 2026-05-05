// On-page SEO audit for a single blog post (markdown body + metadata).
// Checks: H1/H2 structure, meta title/description length, keyword coverage,
// internal links, and schema/JSON-LD readiness.

import type { BlogPost } from "./blog";

export type SeoCheck = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  recommendation?: string;
};

export type SeoAuditResult = {
  score: number; // 0-100
  checks: SeoCheck[];
  stats: {
    wordCount: number;
    h2Count: number;
    h3Count: number;
    internalLinks: number;
    externalLinks: number;
    keywordOccurrences: number;
    keywordDensity: number;
  };
};

const countMatches = (haystack: string, re: RegExp) => (haystack.match(re) || []).length;

export function auditPost(post: Partial<BlogPost>): SeoAuditResult {
  const checks: SeoCheck[] = [];
  let score = 100;

  const title = (post.title || "").trim();
  const desc = (post.description || "").trim();
  const metaTitle = (post.meta_title || post.title || "").trim();
  const metaDesc = (post.meta_description || post.description || "").trim();
  const content = post.content || "";
  const keyword = (post.target_keyword || "").trim().toLowerCase();

  // ---- H1 ----
  // The post title acts as the H1 (rendered by the page). The content body should NOT contain another H1.
  const bodyH1 = countMatches(content, /^#\s+/gm);
  if (!title) {
    checks.push({ id: "h1", label: "H1 (Title)", status: "fail", detail: "No title set.", recommendation: "Add a clear, keyword-rich title under 60 characters." });
    score -= 15;
  } else if (bodyH1 > 0) {
    checks.push({ id: "h1", label: "H1 Structure", status: "warn", detail: `Title is the H1, but the body also contains ${bodyH1} extra H1 line(s).`, recommendation: "Convert any '# Heading' lines in the body to '## ' (H2) — only one H1 per page." });
    score -= 6;
  } else {
    checks.push({ id: "h1", label: "H1 Structure", status: "pass", detail: `Single H1 (the post title). Length: ${title.length} chars.` });
  }

  // ---- H2 / H3 structure ----
  const h2Count = countMatches(content, /^##\s+/gm);
  const h3Count = countMatches(content, /^###\s+/gm);
  if (h2Count >= 3) {
    checks.push({ id: "h2", label: "H2 Subheadings", status: "pass", detail: `${h2Count} H2 sections — strong content structure.` });
  } else if (h2Count >= 1) {
    checks.push({ id: "h2", label: "H2 Subheadings", status: "warn", detail: `Only ${h2Count} H2 section(s). Aim for 3+ for scannability.`, recommendation: "Break the article into 3–6 H2 sections that target related questions." });
    score -= 6;
  } else {
    checks.push({ id: "h2", label: "H2 Subheadings", status: "fail", detail: "No H2 subheadings found.", recommendation: "Add at least 3 '## ' subheadings to give Google clear content sections." });
    score -= 12;
  }

  // ---- Meta title length ----
  if (metaTitle.length === 0) {
    checks.push({ id: "metaTitle", label: "Meta Title", status: "fail", detail: "No meta title.", recommendation: "Add a SEO meta title (50–60 chars) including the target keyword." });
    score -= 10;
  } else if (metaTitle.length < 30) {
    checks.push({ id: "metaTitle", label: "Meta Title", status: "warn", detail: `${metaTitle.length} chars — too short.`, recommendation: "Expand the meta title to 50–60 characters." });
    score -= 5;
  } else if (metaTitle.length > 60) {
    checks.push({ id: "metaTitle", label: "Meta Title", status: "warn", detail: `${metaTitle.length} chars — Google truncates above 60.`, recommendation: "Shorten the meta title to ≤ 60 characters." });
    score -= 5;
  } else {
    checks.push({ id: "metaTitle", label: "Meta Title", status: "pass", detail: `${metaTitle.length} chars — optimal length.` });
  }

  // ---- Meta description length ----
  if (metaDesc.length === 0) {
    checks.push({ id: "metaDesc", label: "Meta Description", status: "fail", detail: "No meta description.", recommendation: "Add a unique meta description between 120–160 characters." });
    score -= 8;
  } else if (metaDesc.length < 120) {
    checks.push({ id: "metaDesc", label: "Meta Description", status: "warn", detail: `${metaDesc.length} chars — too short.`, recommendation: "Aim for 120–160 characters with the target keyword." });
    score -= 4;
  } else if (metaDesc.length > 160) {
    checks.push({ id: "metaDesc", label: "Meta Description", status: "warn", detail: `${metaDesc.length} chars — will be truncated in SERP.`, recommendation: "Keep the meta description ≤ 160 characters." });
    score -= 4;
  } else {
    checks.push({ id: "metaDesc", label: "Meta Description", status: "pass", detail: `${metaDesc.length} chars — well-sized for SERP snippet.` });
  }

  // ---- Word count ----
  const wordCount = content.replace(/[#*_`>\-]/g, " ").split(/\s+/).filter(Boolean).length;
  if (wordCount >= 800) {
    checks.push({ id: "words", label: "Content Length", status: "pass", detail: `${wordCount.toLocaleString()} words — strong depth for ranking.` });
  } else if (wordCount >= 400) {
    checks.push({ id: "words", label: "Content Length", status: "warn", detail: `${wordCount.toLocaleString()} words — consider expanding to 800+.`, recommendation: "Add 1–2 more H2 sections that answer related questions." });
    score -= 5;
  } else {
    checks.push({ id: "words", label: "Content Length", status: "fail", detail: `${wordCount.toLocaleString()} words — too thin.`, recommendation: "Long-form content (800–1500 words) ranks far better." });
    score -= 12;
  }

  // ---- Keyword coverage ----
  let keywordOccurrences = 0;
  let keywordDensity = 0;
  if (!keyword) {
    checks.push({ id: "keyword", label: "Target Keyword", status: "warn", detail: "No target keyword set.", recommendation: "Set a primary keyword so we can audit coverage and density." });
    score -= 6;
  } else {
    const lowered = (title + " " + desc + " " + content).toLowerCase();
    const re = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    keywordOccurrences = (lowered.match(re) || []).length;
    keywordDensity = wordCount > 0 ? (keywordOccurrences / wordCount) * 100 : 0;

    const inTitle = title.toLowerCase().includes(keyword);
    const inMeta = metaDesc.toLowerCase().includes(keyword);
    const inFirst100 = content.split(/\s+/).slice(0, 100).join(" ").toLowerCase().includes(keyword);

    const issues: string[] = [];
    if (!inTitle) issues.push("not in title");
    if (!inMeta) issues.push("not in meta description");
    if (!inFirst100) issues.push("not in first 100 words");

    if (keywordOccurrences === 0) {
      checks.push({ id: "keyword", label: "Keyword Coverage", status: "fail", detail: `Target keyword "${keyword}" not found anywhere.`, recommendation: "Use the target keyword in title, meta, intro, and 1–2 H2s." });
      score -= 15;
    } else if (issues.length > 0) {
      checks.push({ id: "keyword", label: "Keyword Coverage", status: "warn", detail: `Found ${keywordOccurrences}× (density ${keywordDensity.toFixed(2)}%) — but ${issues.join(", ")}.`, recommendation: "Place the keyword in the title, meta description, and within the first 100 words." });
      score -= 6;
    } else if (keywordDensity > 3) {
      checks.push({ id: "keyword", label: "Keyword Coverage", status: "warn", detail: `${keywordOccurrences}× — density ${keywordDensity.toFixed(2)}% may look spammy.`, recommendation: "Aim for 1–1.5% keyword density. Replace some occurrences with synonyms." });
      score -= 4;
    } else {
      checks.push({ id: "keyword", label: "Keyword Coverage", status: "pass", detail: `${keywordOccurrences}× occurrences (density ${keywordDensity.toFixed(2)}%) — in title, meta, and intro.` });
    }
  }

  // ---- Internal & external links ----
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  let internalLinks = 0;
  let externalLinks = 0;
  while ((m = linkRegex.exec(content)) !== null) {
    const href = m[2];
    if (/^https?:\/\//i.test(href)) externalLinks++;
    else internalLinks++;
  }
  if (internalLinks >= 2) {
    checks.push({ id: "intLinks", label: "Internal Links", status: "pass", detail: `${internalLinks} internal link(s) — good crawl & topical authority.` });
  } else if (internalLinks === 1) {
    checks.push({ id: "intLinks", label: "Internal Links", status: "warn", detail: "Only 1 internal link.", recommendation: "Add at least 2 links to related posts or service pages." });
    score -= 4;
  } else {
    checks.push({ id: "intLinks", label: "Internal Links", status: "fail", detail: "No internal links found.", recommendation: "Add 2–4 [anchor text](/path) links to related blog posts or service pages." });
    score -= 8;
  }

  // ---- Schema readiness ----
  // Our BlogPost page injects JSON-LD Article schema dynamically. Score is "ready" if all required schema fields are present.
  const schemaFields = { headline: !!title, description: !!metaDesc || !!desc, datePublished: !!post.published_at, author: !!post.author };
  const missing = Object.entries(schemaFields).filter(([_, v]) => !v).map(([k]) => k);
  if (missing.length === 0) {
    checks.push({ id: "schema", label: "Schema Readiness (Article JSON-LD)", status: "pass", detail: "All required schema fields present — Article JSON-LD will render correctly." });
  } else {
    checks.push({ id: "schema", label: "Schema Readiness (Article JSON-LD)", status: "warn", detail: `Missing: ${missing.join(", ")}.`, recommendation: "Fill in the missing fields so Article schema validates in Google Rich Results Test." });
    score -= 5;
  }

  // ---- Image alt / hero ----
  if (post.hero_image) {
    const alt = ((post as any).hero_image_alt || "").trim();
    if (alt.length >= 8 && alt.length <= 125) {
      const altHasKw = keyword && alt.toLowerCase().includes(keyword);
      checks.push({ id: "hero", label: "Hero Image + Alt Text", status: "pass", detail: `Hero image set with descriptive alt text (${alt.length} chars)${altHasKw ? " including the target keyword" : ""}.` });
    } else if (alt.length > 0) {
      checks.push({ id: "hero", label: "Hero Image Alt Text", status: "warn", detail: `Alt text is ${alt.length} chars — aim for 8–125.`, recommendation: "Write descriptive alt text (8–125 chars) and include the target keyword where natural." });
      score -= 3;
    } else {
      checks.push({ id: "hero", label: "Hero Image Alt Text", status: "fail", detail: "Hero image has no alt text.", recommendation: "Add SEO-friendly alt text describing the image (helps image search & accessibility)." });
      score -= 6;
    }
  } else {
    checks.push({ id: "hero", label: "Hero Image", status: "warn", detail: "No hero image.", recommendation: "Add a hero image (1200×630) with alt text for better OG/Twitter previews & image SEO." });
    score -= 2;
  }

  return {
    score: Math.max(score, 10),
    checks,
    stats: { wordCount, h2Count, h3Count, internalLinks, externalLinks, keywordOccurrences, keywordDensity: Number(keywordDensity.toFixed(2)) },
  };
}
