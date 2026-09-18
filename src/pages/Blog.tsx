import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogSection from "@/components/BlogSection";
import SEOContentBlock from "@/components/SEOContentBlock";

const Blog = () => (
  <div className="cst-public-page min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">
      <BlogSection />
      <SEOContentBlock page="blog" />
    </main>
    <Footer />
  </div>
);

export default Blog;
