import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOContentBlock from "@/components/SEOContentBlock";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <AboutSection />
      <SEOContentBlock page="about" />
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default About;
