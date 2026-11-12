import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Home, Search, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-16">
      <Helmet>
        <title>Page Not Found (404) | Crazy SEO Team</title>
        <meta name="description" content="The page you requested could not be found. Return to Crazy SEO Team to explore SEO services, tools, insights and contact options." />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content="Page Not Found | Crazy SEO Team" />
        <meta property="og:description" content="Explore Crazy SEO Team services, SEO tools and latest insights." />
        <meta property="og:image" content="https://crazyseoteam.in/images/hero-ai-seo.webp" />
      </Helmet>
      <div className="w-full max-w-xl rounded-3xl border bg-background p-8 text-center shadow-xl sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-primary">Crazy SEO Team</p>
        <h1 className="mt-4 text-7xl font-black tracking-tight">404</h1>
        <h2 className="mt-3 text-2xl font-bold">This page could not be found</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">The link may be outdated, or the page may have moved. Use one of the links below to continue.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"><Home size={17}/> Home</Link>
          <Link to="/services" className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold">Explore Services <ArrowRight size={17}/></Link>
          <Link to="/seo-tools" className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold"><Search size={17}/> SEO Tools</Link>
        </div>
        <nav aria-label="Helpful links" className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link className="hover:text-primary" to="/blog">Blog</Link><Link className="hover:text-primary" to="/news">News</Link><Link className="hover:text-primary" to="/contact">Contact</Link>
        </nav>
      </div>
    </main>
  );
};
export default NotFound;
