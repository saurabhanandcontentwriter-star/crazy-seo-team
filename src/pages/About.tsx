import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <AboutSection />
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default About;
