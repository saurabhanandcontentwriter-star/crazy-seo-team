import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import SEOContentBlock from "@/components/SEOContentBlock";

const Services = () => (
  <div className="cst-public-page min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">
      <ServicesSection />
      <SEOContentBlock page="services" />
    </main>
    <Footer />
  </div>
);

export default Services;
