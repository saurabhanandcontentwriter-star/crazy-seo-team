import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOToolsSection from "@/components/SEOToolsSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const SEOTools = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <SEOToolsSection />
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default SEOTools;
