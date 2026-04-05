import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const Services = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <ServicesSection />
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default Services;
