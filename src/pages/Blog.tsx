import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogSection from "@/components/BlogSection";

const Blog = () => (
  <div className="cst-public-page min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">
      <BlogSection />
    </main>
    <Footer />
  </div>
);

export default Blog;
