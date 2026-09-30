import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import healthcare from "@/assets/industries-healthcare.svg";
import realestate from "@/assets/industries-realestate.svg";
import ecommerce from "@/assets/industries-ecommerce.svg";
import saas from "@/assets/industries-saas.svg";
import education from "@/assets/industries-education.svg";
import finance from "@/assets/industries-finance.svg";
import legal from "@/assets/industries-legal.svg";
import travel from "@/assets/industries-travel.svg";
import local from "@/assets/industries-local.svg";

const industries = [
  { slug: "e-commerce", label: "E-Commerce", img: ecommerce, text: "Drive more sales with SEO, content and performance marketing.", services: ["Product SEO", "Shopping Ads", "Conversion Optimization"] },
  { slug: "education", label: "Education", img: education, text: "Increase admissions and build a stronger digital presence.", services: ["Education SEO", "Admissions Growth", "Content Strategy"] },
  { slug: "healthcare", label: "Healthcare", img: healthcare, text: "Reach more patients with trusted digital growth strategies.", services: ["Medical SEO", "Local Visibility", "Patient Growth"] },
  { slug: "real-estate", label: "Real Estate", img: realestate, text: "Generate quality leads and showcase properties effectively.", services: ["Property SEO", "Local SEO", "Lead Generation"] },
  { slug: "saas-tech", label: "SaaS & Tech", img: saas, text: "Scale your product with SEO, content and B2B growth.", services: ["B2B SEO", "Programmatic SEO", "Demand Generation"] },
  { slug: "finance-fintech", label: "Finance & Fintech", img: finance, text: "Build trust and acquire high-value customers digitally.", services: ["Fintech SEO", "Content Authority", "Lead Generation"] },
  { slug: "travel-hospitality", label: "Travel & Hospitality", img: travel, text: "Attract travelers and increase bookings with targeted strategies.", services: ["Travel SEO", "Local Visibility", "Booking Growth"] },
  { slug: "legal", label: "Legal", img: legal, text: "Build authority and generate qualified enquiries consistently.", services: ["Law SEO", "Local Search", "Lead Generation"] },
  { slug: "local-businesses", label: "Local Businesses", img: local, text: "Dominate local search and attract nearby customers.", services: ["Maps SEO", "Local SEO", "Local Leads"] },
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
            <img src={industry.img} alt={`${industry.label} digital marketing`} width="800" height="420" className="w-full rounded-[1.5rem] object-cover" />
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default IndustryDetail;
