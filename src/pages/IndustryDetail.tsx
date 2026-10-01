import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";

const industryImages = {
  "ecommerce": "https://images.unsplash.com/photo-1782405183431-893f08e24b1a?auto=format&fit=crop&w=1200&q=85",
  "education": "https://images.unsplash.com/photo-1778489769184-45868633c527?auto=format&fit=crop&w=1200&q=85",
  "healthcare": "https://images.unsplash.com/photo-1758205307916-4d302e3819f6?auto=format&fit=crop&w=1200&q=85",
  "realestate": "https://images.unsplash.com/photo-1769591364803-60457b0ac84c?auto=format&fit=crop&w=1200&q=85",
  "saas": "https://images.unsplash.com/photo-1633119747461-79f45df1913c?auto=format&fit=crop&w=1200&q=85",
  "finance": "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=1200&q=85",
  "travel": "https://images.unsplash.com/photo-1440190243641-996d004b8c66?auto=format&fit=crop&w=1200&q=85",
  "legal": "https://unsplash.com/photos/DZpc4UY8ZtY/download?force=true",
  "local": "https://images.unsplash.com/photo-1777879760931-3a21a9bf42d6?auto=format&fit=crop&w=1200&q=85"
};

const industries = [
  { slug: "e-commerce", label: "E-Commerce", img: industryImages.ecommerce, text: "Drive more sales with SEO, content and performance marketing.", services: ["Product SEO", "Shopping Ads", "Conversion Optimization"] },
  { slug: "education", label: "Education", img: industryImages.education, text: "Increase admissions and build a stronger digital presence.", services: ["Education SEO", "Admissions Growth", "Content Strategy"] },
  { slug: "healthcare", label: "Healthcare", img: industryImages.healthcare, text: "Reach more patients with trusted digital growth strategies.", services: ["Medical SEO", "Local Visibility", "Patient Growth"] },
  { slug: "real-estate", label: "Real Estate", img: industryImages.realestate, text: "Generate quality leads and showcase properties effectively.", services: ["Property SEO", "Local SEO", "Lead Generation"] },
  { slug: "saas-tech", label: "SaaS & Tech", img: industryImages.saas, text: "Scale your product with SEO, content and B2B growth.", services: ["B2B SEO", "Programmatic SEO", "Demand Generation"] },
  { slug: "finance-fintech", label: "Finance & Fintech", img: industryImages.finance, text: "Build trust and acquire high-value customers digitally.", services: ["Fintech SEO", "Content Authority", "Lead Generation"] },
  { slug: "travel-hospitality", label: "Travel & Hospitality", img: industryImages.travel, text: "Attract travelers and increase bookings with targeted strategies.", services: ["Travel SEO", "Local Visibility", "Booking Growth"] },
  { slug: "legal", label: "Legal", img: industryImages.legal, text: "Build authority and generate qualified enquiries consistently.", services: ["Law SEO", "Local Search", "Lead Generation"] },
  { slug: "local-businesses", label: "Local Businesses", img: industryImages.local, text: "Dominate local search and attract nearby customers.", services: ["Maps SEO", "Local SEO", "Local Leads"] },
];

const IndustryDetail = () => {
  const { slug } = useParams();
  const industry = industries.find((item) => item.slug === slug);

  if (!industry) {
    return (
      <main className="min-h-screen bg-background px-4 pt-36 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black text-foreground">Industry not found</h1>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground">
            <ArrowLeft size={17} /> Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 pt-36 pb-20">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} /> All Industries
        </Link>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              Industry Growth
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-foreground md:text-6xl">
              {industry.label}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{industry.text}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {industry.services.map((service) => (
                <div key={service} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <CheckCircle2 size={18} className="text-primary" />
                  <p className="mt-2 text-sm font-bold text-foreground">{service}</p>
                </div>
              ))}
            </div>

            <Link to="/services" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-3 font-bold text-white shadow-lg">
              Explore Services <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-2xl">
            <img src={industry.img} alt={`${industry.label} digital marketing`} width="800" height="420" className="w-full rounded-[1.5rem] object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/industry-fallback.svg"; }} />
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default IndustryDetail;
