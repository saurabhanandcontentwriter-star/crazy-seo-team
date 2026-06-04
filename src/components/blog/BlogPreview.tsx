import DOMPurify from "dompurify";
import { Monitor, Smartphone, Search } from "lucide-react";
import { useState } from "react";

type Props = {
  title: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  content: string;
  heroImage?: string | null;
  author?: string;
  tag?: string;
};

const BlogPreview = ({ title, description, metaTitle, metaDescription, slug, content, heroImage, author, tag }: Props) => {
  const [mode, setMode] = useState<"desktop" | "mobile" | "serp">("desktop");
  const safeHtml = DOMPurify.sanitize(content || "");
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://example.com";
  const url = `${siteUrl}/blog/${slug || "preview"}`;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex border-b border-border">
        {([
          { k: "desktop", icon: Monitor, label: "Desktop" },
          { k: "mobile", icon: Smartphone, label: "Mobile" },
          { k: "serp", icon: Search, label: "SERP" },
        ] as const).map(({ k, icon: Icon, label }) => (
          <button
            key={k}
            type="button"
            onClick={() => setMode(k)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              mode === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="p-3 bg-secondary/30 max-h-[600px] overflow-auto">
        {mode === "serp" ? (
          <div className="bg-background rounded p-4 font-[Arial,sans-serif]">
            <p className="text-xs text-[hsl(220,9%,46%)] truncate">{url}</p>
            <h3 className="text-[20px] leading-tight text-[hsl(217,89%,40%)] hover:underline cursor-pointer mt-0.5 line-clamp-1">
              {metaTitle || title || "Your title"} 
            </h3>
            <p className="text-sm text-[hsl(0,0%,32%)] mt-1 line-clamp-2">
              {metaDescription || description || "Your meta description appears here…"}
            </p>
            <div className="mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground space-y-1">
              <div>Title length: <strong>{(metaTitle || title || "").length}</strong> / 60</div>
              <div>Description length: <strong>{(metaDescription || description || "").length}</strong> / 160</div>
            </div>
          </div>
        ) : (
          <div className={`mx-auto bg-background rounded shadow-sm ${mode === "mobile" ? "max-w-[375px]" : "max-w-full"}`}>
            {heroImage && <img src={heroImage} alt="" className="w-full h-40 object-cover rounded-t" />}
            <div className="p-4">
              {tag && <span className="inline-block text-[10px] uppercase tracking-wider text-primary font-bold">{tag}</span>}
              <h1 className={`font-black text-foreground leading-tight mt-1 ${mode === "mobile" ? "text-xl" : "text-2xl"}`}>
                {title || "Your title here"}
              </h1>
              {author && <p className="text-xs text-muted-foreground mt-2">By {author}</p>}
              {description && <p className="text-sm text-muted-foreground mt-2 italic">{description}</p>}
              <div
                className="prose-content mt-4 text-sm text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: safeHtml || "<p class='text-muted-foreground'>Start writing to see the preview…</p>" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPreview;
