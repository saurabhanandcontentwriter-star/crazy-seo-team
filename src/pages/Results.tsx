import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioSection from "@/components/PortfolioSection";
import StatsBar from "@/components/StatsBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOContentBlock from "@/components/SEOContentBlock";

const Results = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <StatsBar />
      <PortfolioSection />
      <SEOContentBlock page="results" />
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default Results;
