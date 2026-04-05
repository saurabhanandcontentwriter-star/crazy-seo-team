import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogSection from "@/components/BlogSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const Blog = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <BlogSection />
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default Blog;
