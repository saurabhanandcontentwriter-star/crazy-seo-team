import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOToolsGrid from "@/components/SEOToolsGrid";
import SEOToolsSection from "@/components/SEOToolsSection";

const SEOTools = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>Free SEO Tools 2026 — 15 AI-Powered Tools | Crazy SEO Team</title>
      <meta name="description" content="15 free enterprise SEO tools: keyword research, website audit, AI article generator, LLM/GEO/AEO checkers, schema, sitemap & more. Instant results." />
      <link rel="canonical" href="/seo-tools" />
    </Helmet>
    <Navbar />
    <div className="pt-16">
      <SEOToolsGrid />
      <div id="seo-tools-interactive">
        <SEOToolsSection />
      </div>
    </div>
    <Footer />
  </div>
);

export default SEOTools;
