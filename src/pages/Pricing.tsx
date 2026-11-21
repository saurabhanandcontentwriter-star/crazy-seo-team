import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

const Pricing = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="pt-24">
      <section className="container mx-auto max-w-5xl px-4 py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground"><Link to="/">Home</Link> / Pricing</nav>
        <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">SEO & AI search services pricing</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">Crazy SEO Team uses project-based and ongoing engagement quotes. We do not publish a fixed universal rate card because scope, site size, competition, deliverables and implementation requirements vary.</p>
        <div className="mt-10 rounded-3xl border border-border bg-card p-8">
          <h2 className="text-2xl font-bold">How pricing is determined</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {["Website size and technical complexity","Number and type of deliverables","Content volume and research requirements","Implementation, reporting and support needs"].map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary"/><span>{item}</span></li>)}
          </ul>
          <h2 className="mt-8 text-xl font-bold">What happens next?</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>Share your website, goals and main business priorities.</li>
            <li>We review the requirements and recommend a suitable scope.</li>
            <li>You receive a proposal with deliverables, timeline and a tailored quote before work begins.</li>
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">No fixed public prices are listed on this page. A quote is provided after requirements are reviewed; do not treat example budgets or third-party estimates as Crazy SEO Team rates.</p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Request a quote <ArrowRight className="h-4 w-4"/></Link>
        </div>
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Pricing FAQs</h2>
          <div className="mt-5 space-y-5">
            <article><h3 className="font-semibold">Do you have a fixed SEO package price?</h3><p className="mt-2 text-muted-foreground">We provide a tailored quote based on scope and business needs rather than a one-size-fits-all public rate.</p></article>
            <article><h3 className="font-semibold">Can I request pricing for a single SEO audit?</h3><p className="mt-2 text-muted-foreground">Yes. Share the website and the audit areas you need, and the team can assess the appropriate scope.</p></article>
            <article><h3 className="font-semibold">What is included in a proposal?</h3><p className="mt-2 text-muted-foreground">A proposal should clarify scope, deliverables, timing, responsibilities and the quoted fee before you approve the work.</p></article>
          </div>
        </section>
      </section>
    </main>
    <Footer />
  </div>
);

export default Pricing;
