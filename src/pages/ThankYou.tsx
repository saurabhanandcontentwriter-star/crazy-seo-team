import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ThankYou() {
  const location = useLocation();
  const enquiryId = (location.state as { enquiryId?: string } | null)?.enquiryId;
  return (
    <main className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <Helmet>
        <title>Thank You for Contacting Us | Crazy SEO Team</title>
        <meta name="description" content="Your enquiry has been submitted to Crazy SEO Team. Our team will review your request and get back to you." />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content="Thank You | Crazy SEO Team" />
        <meta property="og:description" content="Your enquiry has been received by Crazy SEO Team." />
        <meta property="og:image" content="https://crazyseoteam.in/images/hero-ai-seo.webp" />
      </Helmet>
      <section className="w-full max-w-xl rounded-3xl border bg-card p-8 text-center shadow-xl sm:p-12">
        <CheckCircle2 className="mx-auto size-16 text-emerald-600" />
        <h1 className="mt-5 text-3xl font-black">Thank you for contacting us!</h1>
        <p className="mt-3 text-muted-foreground">Your enquiry has been received. The Crazy SEO Team will review your details and get back to you.</p>
        {enquiryId && <p className="mt-5 rounded-xl bg-muted p-3 text-sm">Enquiry reference: <strong>{enquiryId}</strong></p>}
        <Link to="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Back to Home <ArrowRight size={17}/></Link>
      </section>
    </main>
  );
}
