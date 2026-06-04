import { supabase } from "@/integrations/supabase/client";
import founderImg from "@/assets/founder.jpeg";
import cofounderImg from "@/assets/cofounder.jpeg";

export type BlogPost = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  tag: string;
  author: string;
  author_role: string;
  author_img?: string | null;
  author_bio?: string | null;
  author_linkedin?: string | null;
  hero_image?: string | null;
  hero_image_alt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  target_keyword?: string | null;
  source?: string;
  published?: boolean;
  published_at?: string;
};

// Map DB row to a normalized post (with author image fallback to local assets)
const normalize = (row: any): BlogPost & { date: string; img: string; authorImg: string; desc: string; role: string } => {
  const authorImg = row.author_img && row.author_img.startsWith("http")
    ? row.author_img
    : (row.author?.toLowerCase().includes("saurabh") ? cofounderImg : founderImg);
  return {
    ...row,
    img: row.hero_image || "",
    authorImg,
    desc: row.description,
    role: row.author_role,
    date: row.published_at ? new Date(row.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "",
  };
};

export async function fetchPublishedPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

export async function fetchPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function fetchAllPostsAdmin() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalize);
}

export function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
