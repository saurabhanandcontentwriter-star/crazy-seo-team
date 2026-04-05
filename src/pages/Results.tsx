import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioSection from "@/components/PortfolioSection";
import StatsBar from "@/components/StatsBar";
import WhatsAppButton from "@/components/WhatsAppButton";

const Results = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <StatsBar />
      <PortfolioSection />
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default Results;
