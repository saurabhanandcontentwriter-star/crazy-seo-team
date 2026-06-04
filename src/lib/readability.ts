// Readability & lightweight NLP analysis for blog content.
// Pure client-side, no API calls.

export type ReadabilityResult = {
  fleschScore: number;
  fleschLabel: string;
  gradeLevel: number;
  sentences: number;
  words: number;
  syllables: number;
  avgWordsPerSentence: number;
  passiveCount: number;
  passiveRatio: number;
  topKeywords: { word: string; count: number }[];
  longSentences: number; // > 25 words
};

const STOPWORDS = new Set([
  "the","and","for","that","with","this","from","are","was","were","but","not","you","your","our",
  "have","has","had","will","can","they","their","them","its","it's","into","than","then","also",
  "what","when","why","how","all","any","some","more","most","such","very","just","like","over",
  "about","because","while","which","these","those","there","here","each","other","being","been",
  "i","a","an","of","to","in","on","is","be","as","at","by","or","we","do","if","so","no","yes","my","me",
]);

const countSyllables = (word: string): number => {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
};

export function analyzeReadability(htmlOrText: string): ReadabilityResult {
  const text = htmlOrText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) {
    return { fleschScore: 0, fleschLabel: "—", gradeLevel: 0, sentences: 0, words: 0, syllables: 0, avgWordsPerSentence: 0, passiveCount: 0, passiveRatio: 0, topKeywords: [], longSentences: 0 };
  }

  const sentenceArr = text.split(/[.!?]+\s/).filter((s) => s.trim().length > 0);
  const sentences = Math.max(sentenceArr.length, 1);
  const wordsArr = text.split(/\s+/).filter(Boolean);
  const words = wordsArr.length;
  const syllables = wordsArr.reduce((s, w) => s + countSyllables(w), 0);

  // Flesch Reading Ease
  const fleschScore = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / Math.max(words, 1));
  const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / Math.max(words, 1)) - 15.59;

  let fleschLabel = "Very Difficult";
  if (fleschScore >= 90) fleschLabel = "Very Easy";
  else if (fleschScore >= 80) fleschLabel = "Easy";
  else if (fleschScore >= 70) fleschLabel = "Fairly Easy";
  else if (fleschScore >= 60) fleschLabel = "Standard";
  else if (fleschScore >= 50) fleschLabel = "Fairly Difficult";
  else if (fleschScore >= 30) fleschLabel = "Difficult";

  // Passive voice estimate: "(was|were|been|being|is|are|be) <verb>ed"
  const passiveRe = /\b(?:was|were|been|being|is|are|be)\s+\w+(?:ed|en)\b/gi;
  const passiveCount = (text.match(passiveRe) || []).length;
  const passiveRatio = sentences ? (passiveCount / sentences) * 100 : 0;

  const longSentences = sentenceArr.filter((s) => s.split(/\s+/).length > 25).length;

  // Top keywords (NLP-lite)
  const freq = new Map<string, number>();
  for (const raw of wordsArr) {
    const w = raw.toLowerCase().replace(/[^a-z']/g, "");
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const topKeywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    fleschScore: Math.max(0, Math.min(100, Math.round(fleschScore))),
    fleschLabel,
    gradeLevel: Math.max(0, Math.round(gradeLevel * 10) / 10),
    sentences,
    words,
    syllables,
    avgWordsPerSentence: Math.round((words / sentences) * 10) / 10,
    passiveCount,
    passiveRatio: Math.round(passiveRatio * 10) / 10,
    topKeywords,
    longSentences,
  };
}
