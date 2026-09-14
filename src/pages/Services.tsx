import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";

const Services = () => (
  <div className="cst-public-page min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">
      <ServicesSection />
    </main>
    <Footer />
  </div>
);

export default Services;
