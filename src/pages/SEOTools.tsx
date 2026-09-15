import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOToolsGrid from "@/components/SEOToolsGrid";
import SEOToolsSection from "@/components/SEOToolsSection";
import ToolsCloudRunner from "@/components/ToolsCloudRunner";

const SEOTools = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>Free SEO, AEO & GEO Tools 2026 | Crazy SEO Team</title>
      <meta name="description" content="Free public SEO, AEO, GEO and LLM checkers plus keyword, schema, robots, sitemap, SERP and NLP tools. Run checks without login and download results." />
      <link rel="canonical" href="/seo-tools" />
    </Helmet>
    <Navbar />
    <div className="pt-16">
      <SEOToolsGrid />
      <ToolsCloudRunner />
      <div id="seo-tools-interactive">
        <SEOToolsSection />
      </div>
    </div>
    <Footer />
  </div>
);

export default SEOTools;
