import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const LEAD_SERVICES = [
  "AI SEO Services",
  "Technical SEO Audit",
  "Local SEO",
  "Ecommerce SEO",
  "Keyword Research",
  "GEO / AEO / LLM Optimization",
  "AI Visibility Optimization",
  "Content Writing",
  "Ghostwriting",
  "AI Article Generation",
  "Link Building",
  "Google Ads / PPC",
  "Social Media Marketing",
  "AI Chatbot Development",
  "AI Automation",
  "AI Software Development",
  "Website Development",
  "Free Consultation",
  "Callback Request",
  "Other",
] as const;

export const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 India (+91)", min: 10, max: 10 },
  { code: "+1", label: "🇺🇸 USA/Canada (+1)", min: 10, max: 10 },
  { code: "+44", label: "🇬🇧 UK (+44)", min: 10, max: 10 },
  { code: "+971", label: "🇦🇪 UAE (+971)", min: 8, max: 9 },
  { code: "+61", label: "🇦🇺 Australia (+61)", min: 9, max: 9 },
  { code: "+65", label: "🇸🇬 Singapore (+65)", min: 8, max: 8 },
  { code: "+49", label: "🇩🇪 Germany (+49)", min: 10, max: 11 },
  { code: "+966", label: "🇸🇦 Saudi Arabia (+966)", min: 9, max: 9 },
  { code: "+880", label: "🇧🇩 Bangladesh (+880)", min: 10, max: 10 },
  { code: "+977", label: "🇳🇵 Nepal (+977)", min: 10, max: 10 },
];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const statusLabel = (s: string) =>
  ({
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal Sent",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
  })[s] ?? s;

export const leadSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone_country: z.string().min(2).max(6),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9\s-]{6,15}$/, "Enter a valid mobile number")
    .transform((v) => v.replace(/[\s-]/g, "")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(v), "Enter a valid website URL"),
  service: z.string().trim().min(2, "Select the service you need"),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
  preferred_contact: z.enum(["email", "phone", "whatsapp"]).default("email"),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Transparent 0–100 score from engagement signals only. */
export function scoreLead(input: {
  service: string;
  company?: string | null;
  website?: string | null;
  message?: string | null;
  phone?: string | null;
  source: string;
  toolRuns?: number;
  visits?: number;
}) {
  let s = 20;
  if (input.phone) s += 10;
  if (input.company) s += 8;
  if (input.website) s += 12;
  if ((input.message ?? "").length > 40) s += 10;
  if (/audit|consultation|callback|ads|software|automation/i.test(input.service)) s += 12;
  if (/audit|tool|checker|generator/i.test(input.source)) s += 10;
  s += Math.min(10, (input.toolRuns ?? 0) * 3);
  s += Math.min(8, Math.max(0, (input.visits ?? 1) - 1) * 2);
  return Math.max(0, Math.min(100, s));
}

export const scoreLabel = (score: number) =>
  score >= 70 ? { label: "Hot", emoji: "🔥" } : score >= 50 ? { label: "Warm", emoji: "🟠" } : score >= 30 ? { label: "Cold", emoji: "🟡" } : { label: "New", emoji: "⚪" };

type Geo = { country?: string | null; region?: string | null; city?: string | null; district?: string | null };

async function getGeo(): Promise<Geo> {
  try {
    const cached = sessionStorage.getItem("cst_geo");
    if (cached) {
      const g = JSON.parse(cached);
      return { country: g.country, region: g.region, city: g.city };
    }
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return {};
    const d = await res.json();
    return { country: d.country_name, region: d.region, city: d.city };
  } catch {
    return {};
  }
}

export async function submitLead(input: LeadInput, source: string) {
  const parsed = leadSchema.parse(input);
  const geo = await getGeo();
  const sessionId = localStorage.getItem("cst_session_id");
  let toolRuns = 0;
  if (sessionId) {
    const { count } = await supabase
      .from("tool_usage")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId);
    toolRuns = count ?? 0;
  }
  const score = scoreLead({ ...parsed, service: parsed.service ?? "", source, toolRuns });

  const { error } = await supabase.from("leads").insert({
    full_name: parsed.full_name,
    email: parsed.email,
    phone_country: parsed.phone_country,
    phone: parsed.phone,
    company: parsed.company || null,
    website: parsed.website || null,
    service: parsed.service,
    message: parsed.message || null,
    country: geo.country ?? null,
    state: geo.region ?? null,
    district: geo.district ?? null,
    city: geo.city ?? null,
    preferred_contact: parsed.preferred_contact,
    source,
    page_path: window.location.pathname,
    session_id: sessionId,
    score,
  });
  if (error) throw error;
  return { score };
}
