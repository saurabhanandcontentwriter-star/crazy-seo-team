import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const faqs = [
  {
    question: "What do I agree to when I use Crazy SEO Team?",
    answer:
      "By accessing the website, using our tools, submitting a form, creating an account, posting a listing, purchasing a service, or engaging Crazy SEO Team for professional work, you agree to these Terms & Conditions and any specific written agreement that applies to your service.",
  },
  {
    question: "Does Crazy SEO Team guarantee Google rankings or AI search visibility?",
    answer:
      "No. Search rankings, AI search visibility, traffic, leads, conversions and revenue can be affected by algorithms, competitors, market conditions, website changes and third-party platforms. We use professional strategies and best practices, but no specific result is guaranteed unless expressly stated in a written agreement.",
  },
  {
    question: "Who owns the content and deliverables created for a client?",
    answer:
      "Client-specific ownership or licensing is determined by the applicable project agreement and payment status. Crazy SEO Team retains rights to its pre-existing tools, templates, systems, frameworks, processes, reusable components and know-how unless a written agreement states otherwise.",
  },
  {
    question: "Can I cancel a service?",
    answer:
      "Cancellation and termination are governed by the applicable proposal, order, subscription or service agreement. If a written agreement contains a notice period, that notice period applies. Fees already incurred, approved work and other continuing obligations may remain payable.",
  },
  {
    question: "Are classified listings visible to other users?",
    answer:
      "Information intentionally published in a public classified listing, business profile or seller profile may be visible to other visitors. Do not publish passwords, OTPs, payment-card information or confidential information in a public listing.",
  },
];

const TermsConditions = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Terms & Conditions | Crazy SEO Team</title>
      <meta
        name="description"
        content="Read the complete Crazy SEO Team Terms & Conditions for SEO, AI SEO, digital marketing, content, Google Ads, AI tools, software, marketplace listings, payments, intellectual property and website usage."
      />
      <meta
        name="keywords"
        content="Crazy SEO Team Terms and Conditions, Terms of Service, SEO terms, AI SEO terms, digital marketing terms, AI tools terms, classified marketplace terms, website terms"
      />
      <link rel="canonical" href="https://crazyseoteam.in/terms-and-conditions" />
      <meta property="og:title" content="Terms & Conditions | Crazy SEO Team" />
      <meta
        property="og:description"
        content="Complete Terms & Conditions for using Crazy SEO Team services, website, AI SEO tools, digital marketing solutions and marketplace features."
      />
      <meta property="og:url" content="https://crazyseoteam.in/terms-and-conditions" />
      <meta property="og:type" content="article" />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Terms & Conditions | Crazy SEO Team",
          description:
            "Complete Terms & Conditions for Crazy SEO Team website, SEO services, AI SEO, digital marketing, AI tools, software and marketplace features.",
          url: "https://crazyseoteam.in/terms-and-conditions",
          dateModified: "2026-09-16",
          author: { "@type": "Organization", name: "Crazy SEO Team" },
          publisher: { "@type": "Organization", name: "Crazy SEO Team" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://crazyseoteam.in/terms-and-conditions",
          },
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        })}
      </script>
    </Helmet>

    <Navbar />

    <main className="pt-24 pb-20 px-4">
      <article className="container mx-auto max-w-4xl">
        <header className="border-b border-border pb-10 mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            Legal • Terms of Service
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-6">
            Last updated: September 16, 2026
          </p>
          <p className="text-lg md:text-xl leading-8 text-muted-foreground max-w-3xl">
            These Terms & Conditions explain how you may use the Crazy SEO Team website,
            SEO and AI SEO services, digital marketing solutions, content services, AI tools,
            software products and classified marketplace features.
          </p>
        </header>

        <div className="space-y-12 text-foreground leading-8">
          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">Welcome to Crazy SEO Team</h2>
            <p className="mb-5">
              Welcome to <strong>Crazy SEO Team</strong>. We are an AI-powered SEO and digital growth
              company working across search engine optimization, AI search optimization, content,
              advertising, automation, analytics and custom AI software. Our website also provides
              educational resources, SEO tools, AI tools and marketplace functionality where available.
            </p>
            <p>
              By visiting our website, using any online tool, submitting an enquiry, creating an
              account, posting a classified listing, purchasing a service or otherwise using our
              services, you acknowledge that you have read and understood these Terms & Conditions.
              If you do not agree with these terms, please do not use the applicable website feature
              or service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">1. About These Terms</h2>
            <p className="mb-5">
              These Terms & Conditions are the general rules governing your use of Crazy SEO Team's
              website and services. They should be read together with our Privacy Policy, Payment
              Policy and any proposal, quotation, order, subscription, statement of work or separate
              service agreement provided for a specific project.
            </p>
            <p>
              Where a signed or service-specific written agreement contains terms that conflict with
              these general website terms, the specific written agreement will control to the extent
              of that conflict.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">2. Our Services</h2>
            <p className="mb-5">
              Crazy SEO Team offers a broad range of digital growth and technology services. Depending
              on the project, these may include technical SEO, on-page SEO, off-page SEO, local SEO,
              entity SEO, semantic SEO, AI SEO, GEO, AEO, LLM optimization, content writing, article
              writing, blog writing, ghostwriting, copywriting, Google Ads, analytics, AI automation,
              AI agents, chatbots, CRM systems, custom SaaS platforms and AI software development.
            </p>
            <p>
              Our public website describes service categories and capabilities, but the exact scope of
              a paid engagement is determined by the applicable proposal, quotation, order or service
              agreement. Deliverables, timelines, revisions, support and access requirements can vary
              by project.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">3. Using the Crazy SEO Team Website</h2>
            <p className="mb-5">
              You may use our website for legitimate business, research, communication, marketing and
              service-related purposes. You agree not to interfere with the operation or security of
              the website and not to use our systems in a way that could harm Crazy SEO Team, another
              user, a client, a third-party platform or the wider internet.
            </p>
            <p>
              You are responsible for the information you submit. Information provided through forms,
              accounts, service requests or listings should be accurate, current and not intentionally
              misleading.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">4. Client Responsibilities</h2>
            <p className="mb-5">
              Successful SEO, AI SEO, advertising, content and software projects require timely
              cooperation. Clients are responsible for providing information and access that is
              reasonably necessary for the agreed work.
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>Provide accurate and complete project information.</li>
              <li>Provide lawful access to websites, analytics, advertising accounts or other systems when required.</li>
              <li>Own or have permission to use content, trademarks, images, data and materials supplied to us.</li>
              <li>Review and approve drafts, campaigns, content and technical changes within agreed timelines.</li>
              <li>Pay invoices, subscriptions, deposits or milestones according to the applicable agreement.</li>
              <li>Tell us about important changes to your website, business, products or marketing objectives.</li>
              <li>Use our services in accordance with applicable law and third-party platform policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">5. SEO and AI Search Results</h2>
            <p className="mb-5">
              Search visibility is influenced by many factors outside the direct control of an SEO or
              digital marketing provider. Search engine algorithms, AI systems, competitors, market
              demand, website quality, technical changes, user behavior, advertising policies and
              third-party data can all affect results.
            </p>
            <p className="mb-5">
              Crazy SEO Team does not guarantee a particular Google ranking, traffic level, lead
              volume, conversion rate, revenue amount, AI Overview placement, ChatGPT citation, Gemini
              visibility, Perplexity citation or other specific search result unless a written agreement
              expressly provides otherwise.
            </p>
            <p>
              Any examples, case studies, historical performance figures or marketing results shown on
              our website are illustrative. Individual outcomes can differ based on industry, website
              condition, competition, budget, implementation and other factors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">6. SEO Tools, AI Tools and Automated Results</h2>
            <p className="mb-5">
              Crazy SEO Team may offer tools for SEO audits, keyword research, metadata generation,
              schema generation, sitemap and robots.txt assistance, SERP previews, NLP analysis,
              internal-link analysis, AI visibility checks and other digital marketing tasks.
            </p>
            <p className="mb-5">
              Tool results are provided for analysis and assistance. Results may depend on website
              accessibility, third-party data, public web information, APIs, AI models and technical
              limitations. Automated recommendations can contain errors or omissions and should be
              reviewed before publication, deployment or use in an important business decision.
            </p>
            <p>
              You remain responsible for checking generated content, code, metadata, schema, marketing
              claims and other outputs before using them on a live website or advertising account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">7. AI-Generated Content and Human Review</h2>
            <p className="mb-5">
              AI-assisted workflows can be used to create articles, ideas, summaries, SEO suggestions,
              marketing copy, code, research drafts and other material. AI systems can produce incorrect,
              incomplete, outdated or contextually unsuitable information.
            </p>
            <p>
              Before publishing or relying on AI-generated material, users and clients should review
              facts, claims, sources, brand requirements, legal requirements, originality and suitability
              for the intended audience. Final approval and responsibility for published client material
              remains with the person or business approving that material unless a written agreement
              states otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">8. Payments, Billing and Project Scope</h2>
            <p className="mb-5">
              Service fees, payment schedules, deposits, subscriptions, milestones and applicable taxes
              are determined by the relevant quotation, invoice, order or service agreement. Clients are
              responsible for providing correct billing information and making payments by the stated due
              dates.
            </p>
            <p className="mb-5">
              Work may be paused where payments are overdue or where required information, access or
              approvals are not provided. Requests that fall outside the agreed scope may require a
              revised quotation or additional approval before work begins.
            </p>
            <p>
              Payment and refund matters are also subject to the Crazy SEO Team Payment Policy and any
              specific terms provided with the purchased service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">9. Intellectual Property</h2>
            <p className="mb-5">
              Crazy SEO Team retains rights in its pre-existing intellectual property, including its
              internal processes, frameworks, templates, software, reusable components, prompts,
              methodologies, systems, tools, documentation and know-how.
            </p>
            <p className="mb-5">
              Ownership or licensing of client-specific deliverables is determined by the applicable
              project agreement and payment status. Unless expressly agreed otherwise, third-party
              software, stock assets, open-source components and external services remain subject to
              their own licenses and terms.
            </p>
            <p>
              Clients are responsible for ensuring that any content, data, trademarks, images or other
              materials they provide to Crazy SEO Team may legally be used for the intended purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">10. Confidentiality</h2>
            <p>
              Both parties should take reasonable steps to protect confidential business information
              shared during a professional engagement. Confidential information generally does not
              include information that is already public, independently developed, lawfully obtained
              from another source or required to be disclosed by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">11. Classified Marketplace and Business Listings</h2>
            <p className="mb-5">
              Where classified advertisements, seller profiles or business-directory features are
              available, users are responsible for the accuracy, legality and authenticity of their
              listings. A listing should clearly represent the product, property, service or business
              being offered.
            </p>
            <p className="mb-5">
              Users must not publish fraudulent, deceptive, illegal, infringing, abusive, unsafe or
              prohibited content. Do not publish passwords, OTPs, payment-card information, private
              authentication details or confidential documents in a public listing.
            </p>
            <p>
              Crazy SEO Team may review, moderate, reject, restrict or remove listings that violate
              these terms, applicable law, platform rules or safety requirements. A listing does not
              automatically mean that Crazy SEO Team endorses, verifies or guarantees the seller,
              product, service or transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">12. User-to-User Transactions</h2>
            <p className="mb-5">
              Buyers and sellers using marketplace features are responsible for evaluating each other,
              checking the accuracy of information, agreeing on commercial terms and completing their
              transactions lawfully.
            </p>
            <p>
              Unless a separate written agreement expressly states otherwise, Crazy SEO Team is not a
              party to private transactions between marketplace users and does not guarantee payment,
              delivery, product quality, seller identity or transaction completion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">13. Prohibited Activities</h2>
            <p className="mb-5">You must not use our website, tools or services to:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li>Break applicable law or violate another person's rights.</li>
              <li>Distribute malware, harmful code, spam or deceptive material.</li>
              <li>Attempt unauthorized access to accounts, databases, systems or infrastructure.</li>
              <li>Impersonate another person, company or organization.</li>
              <li>Submit knowingly false or fraudulent information.</li>
              <li>Publish unlawful, abusive, defamatory, fraudulent or infringing marketplace content.</li>
              <li>Interfere with website availability, security or normal operation.</li>
              <li>Use our services to bypass third-party security controls or platform restrictions.</li>
              <li>Misuse automated tools or access systems in a way that violates applicable restrictions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">14. Third-Party Platforms and Services</h2>
            <p>
              Our services may interact with Google, advertising platforms, analytics systems, AI
              platforms, hosting providers, social networks, communication services and other
              third-party technologies. These third parties operate under their own terms, policies,
              availability and technical limitations.
            </p>
            <p className="mt-5">
              Changes to third-party algorithms, policies, APIs, pricing, availability, security or
              access can affect a project. Crazy SEO Team cannot control third-party decisions or
              guarantee uninterrupted access to external services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">15. Website Availability and Changes</h2>
            <p className="mb-5">
              We work to keep the Crazy SEO Team website and services available, secure and useful,
              but uninterrupted availability cannot be guaranteed. Maintenance, infrastructure issues,
              security events, third-party outages and software updates may temporarily affect some
              features.
            </p>
            <p>
              We may add, improve, modify, suspend or discontinue website features, tools or services as
              our platform evolves. We may also update these Terms & Conditions when our services,
              features or legal requirements change.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">16. Privacy and Personal Information</h2>
            <p className="mb-5">
              Personal information is handled according to our Privacy Policy and applicable law. When
              you submit information through a form, account, service request or marketplace feature,
              the relevant information may be processed as described in our Privacy Policy.
            </p>
            <p>
              Read our <a className="text-primary underline underline-offset-4" href="/privacy-policy">Privacy Policy</a>
              for information about data collection, use, sharing, retention and privacy choices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">17. Limitation of Liability</h2>
            <p className="mb-5">
              To the maximum extent permitted by applicable law, Crazy SEO Team will not be responsible
              for indirect, incidental, special, consequential or loss-of-profit damages arising from
              use of the website or services.
            </p>
            <p>
              Unless a specific written agreement states otherwise, aggregate liability relating to a
              paid service will be limited to the fees actually paid for that service during the
              applicable period, subject to mandatory legal rights that cannot lawfully be excluded or
              limited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">18. Indemnification</h2>
            <p>
              To the extent permitted by applicable law, you agree to be responsible for claims arising
              from your unlawful use of the website, violation of these Terms & Conditions, or materials
              and instructions supplied by you that infringe the rights of another person or entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">19. Suspension and Termination</h2>
            <p className="mb-5">
              We may restrict or terminate access to a feature, account or service where there is a
              material violation of these terms, non-payment, suspected fraud, security risk, unlawful
              activity or another legitimate operational reason.
            </p>
            <p>
              Project-specific cancellation rights, notice periods and termination fees are governed by
              the applicable service agreement. Obligations that should naturally continue after
              termination, including payment obligations already incurred, confidentiality,
              intellectual property and liability provisions, may continue to apply.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">20. Governing Law and Dispute Resolution</h2>
            <p className="mb-5">
              These general terms are intended to be governed by the laws of India, subject to mandatory
              legal requirements that may apply to a particular user or transaction.
            </p>
            <p>
              If a concern or dispute arises, the parties should first contact Crazy SEO Team and try
              to resolve the matter in good faith. Where an informal resolution is not possible, the
              matter may be addressed before a competent court or forum as permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">21. Changes to These Terms & Conditions</h2>
            <p>
              We may update these Terms & Conditions when our website, services, technology, business
              processes or legal requirements change. The latest version will be published on this page
              with the revision date. Continued use of the website or services after an update may
              constitute acceptance to the extent permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">22. Contact Crazy SEO Team</h2>
            <p className="mb-5">
              If you have questions about these Terms & Conditions, a service agreement, a website
              feature, an SEO project or a marketplace listing, please contact Crazy SEO Team.
            </p>
            <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-3">
              <p><strong>Business:</strong> Crazy SEO Team</p>
              <p><strong>Email:</strong> <a className="text-primary underline underline-offset-4" href="mailto:hello@crazyseoteam.in">hello@crazyseoteam.in</a></p>
              <p><strong>Phone:</strong> <a className="text-primary underline underline-offset-4" href="tel:+916205153346">+91 62051 53346</a></p>
              <p><strong>Website:</strong> <a className="text-primary underline underline-offset-4" href="https://crazyseoteam.in/">crazyseoteam.in</a></p>
            </div>
          </section>

          <section className="border-t border-border pt-12">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              Frequently Asked Questions
            </p>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-8">Terms & Conditions FAQs</h2>
            <div className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.question} className="border-b border-border pb-7 last:border-b-0">
                  <h3 className="text-xl font-semibold leading-snug mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-12">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-6">Related Crazy SEO Team Policies</h2>
            <ul className="space-y-4 list-disc pl-6">
              <li><a className="text-primary underline underline-offset-4" href="/privacy-policy">Privacy Policy</a> — information about privacy and data handling.</li>
              <li><a className="text-primary underline underline-offset-4" href="/payment-policy">Payment Policy</a> — payment and billing information.</li>
              <li><a className="text-primary underline underline-offset-4" href="/faq">Frequently Asked Questions</a> — common questions about our services.</li>
              <li><a className="text-primary underline underline-offset-4" href="/services">Services</a> — SEO, AI SEO, content, advertising and AI software services.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Important Legal Notice</h2>
            <p className="text-muted-foreground">
              These website terms are general information and should be read together with any
              contract, quotation, order or service-specific agreement that applies to your engagement.
              They are not a substitute for legal advice tailored to a particular business, transaction
              or jurisdiction.
            </p>
          </section>
        </div>
      </article>
    </main>

    <Footer />
    <WhatsAppButton />
  </div>
);

export default TermsConditions;
