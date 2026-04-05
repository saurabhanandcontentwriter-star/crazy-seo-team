import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <FAQSection />
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default FAQ;
