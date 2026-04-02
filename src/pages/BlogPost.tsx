import { useParams, Link } from "react-router-dom";
import { blogPosts } from "@/data/blogData";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
          <Link to="/#blog">
            <Button variant="outline">← Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/#blog" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">{post.tag}</span>
            <span className="text-sm text-muted-foreground">{post.date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
            <img src={post.authorImg} alt={post.author} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.role}</p>
            </div>
          </div>

          <img src={post.img} alt={post.title} className="w-full h-72 md:h-96 object-cover rounded-xl mb-8" />

          <div className="prose prose-lg max-w-none text-foreground
            prose-headings:text-foreground prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-muted-foreground
            prose-strong:text-foreground
            prose-ul:space-y-2 prose-ol:space-y-2
          ">
            {post.content.split("\n\n").map((block, i) => {
              if (block.startsWith("## ")) return <h2 key={i}>{block.replace("## ", "")}</h2>;
              if (block.startsWith("### ")) return <h3 key={i}>{block.replace("### ", "")}</h3>;
              if (block.startsWith("- ")) return (
                <ul key={i}>
                  {block.split("\n").map((li, j) => <li key={j}>{li.replace(/^- \*\*(.*?)\*\*/, "$1 —").replace("- ", "")}</li>)}
                </ul>
              );
              if (/^\d+\./.test(block)) return (
                <ol key={i}>
                  {block.split("\n").map((li, j) => <li key={j}>{li.replace(/^\d+\.\s\*\*(.*?)\*\*\s*—?\s*/, "$1 — ").replace(/^\d+\.\s/, "")}</li>)}
                </ol>
              );
              return <p key={i} dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
            })}
          </div>

          <div className="mt-12 p-6 rounded-xl gradient-bg text-primary-foreground text-center">
            <p className="font-bold text-xl mb-2">Need help with your SEO strategy?</p>
            <p className="text-sm opacity-90 mb-4">Get a free consultation with our experts.</p>
            <Link to="/#contact">
              <Button variant="secondary" className="font-semibold">Get Free Consultation</Button>
            </Link>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogPost;
