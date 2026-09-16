import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const faqs = [
  {
    question: "What do I agree to when I use Crazy SEO Team services?",
    answer:
      "By using the Crazy SEO Team website, submitting information, creating an account where available, purchasing a service, or engaging us for professional work, you agree to these Terms & Conditions and any service-specific agreement that applies to your engagement.",
  },
  {
    question: "Does Crazy SEO Team guarantee Google rankings or AI search visibility?",
    answer:
      "No specific Google ranking, traffic level, lead volume, revenue result, AI Overview placement, or citation in an AI answer is guaranteed. Search engines, advertising platforms, competitors, markets, algorithms, and third-party systems are outside our direct control.",
  },
  {
    question: "Who owns the content or deliverables created for a client?",
    answer:
      "Unless a separate written agreement states otherwise, Crazy SEO Team retains rights in its pre-existing materials, processes, templates, tools, systems, and know-how. Client-specific deliverables transfer or are licensed according to the applicable agreement and payment status.",
  },
  {
    question: "Can a service agreement be cancelled?",
    answer:
      "Termination depends on the applicable service agreement, order, subscription, or project terms. Where a written agreement provides a notice period, that notice period will apply. Outstanding fees and approved work may remain payable after termination.",
  },
  {
    question: "Are classified listings and seller information public?",
    answer:
      "Information intentionally published in a public classified listing, business profile, or seller profile may be visible to other website visitors. Users should avoid publishing confidential information, passwords, financial credentials, or other information they do not want to make public.",
  },
];

const TermsConditions = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Terms & Conditions | Crazy SEO Team</title>
      <meta
        name="description"
        content="Read the Crazy SEO Team Terms & Conditions covering SEO, AI SEO, digital marketing, AI tools, software services, payments, intellectual property, classified listings, privacy, liability, termination and service use."
      />
      <meta
        name="keywords"
        content="Crazy SEO Team terms and conditions, SEO terms, AI SEO terms, digital marketing terms, website terms of service, AI tools terms, classified marketplace terms"
      />
      <link rel="canonical" href="https://crazyseoteam.in/terms-and-conditions" />
      <meta property="og:title" content="Terms & Conditions | Crazy SEO Team" />
      <meta
        property="og:description"
        content="Terms governing the use of Crazy SEO Team's website, SEO services, AI SEO services, digital marketing, AI tools, software and marketplace features."
      />
      <meta property="og:url" content="https://crazyseoteam.in/terms-and-conditions" />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Terms & Conditions",
          url: "https://crazyseoteam.in/terms-and-conditions",
          description:
            "Terms governing use of the Crazy SEO Team website, services, tools, software and marketplace features.",
          isPartOf: {
            "@type": "WebSite",
            name: "Crazy SEO Team",
            url: "https://crazyseoteam.in/",
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

    <main className="pt-24 pb-16 px-4">
      <article className="container mx-auto max-w-4xl prose prose-lg dark:prose-invert">
        <header className="mb-10 not-prose">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
            Legal & Service Information
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground mb-2">Last updated: September 16, 2026</p>
          <p className="text-muted-foreground max-w-3xl">
            These Terms & Conditions explain the rules for using the Crazy SEO Team website,
            digital marketing services, SEO and AI SEO services, software, tools, content,
            classified marketplace features and related products or services.
          </p>
        </header>

        <p>
          Welcome to <strong>Crazy SEO Team</strong>. Crazy SEO Team provides SEO, AI SEO,
          generative search optimization, content, advertising, automation, software and other
          digital growth services. Our website also includes informational resources and, where
          available, tools and marketplace features. By accessing the website, using a tool,
          submitting a form, creating an account, posting a listing, purchasing a service, or
          otherwise engaging with Crazy SEO Team, you agree to follow these Terms & Conditions.
        </p>

        <p>
          These terms should be read together with any proposal, quotation, order, subscription,
          statement of work, service agreement, payment policy, privacy policy or other written
          terms that specifically apply to your purchase or project. If a signed or service-specific
          agreement conflicts with these general terms, the specific written agreement will govern
          to the extent of the conflict.
        </p>

        <h2>1. About Crazy SEO Team and These Terms</h2>
        <p>
          Crazy SEO Team operates as an AI-powered SEO and digital growth business serving clients
          across SEO, AI search optimization, content marketing, paid advertising, automation and
          AI software development. Our services can change over time as technology, search platforms,
          advertising products and business requirements evolve.
        </p>
        <p>
          You agree to provide accurate information, use the website lawfully, respect the rights
          of other users and clients, and avoid using our website, tools or services for fraudulent,
          abusive, deceptive, unlawful or harmful activities.
        </p>

        <h2>2. Services We Provide</h2>
        <p>
          Depending on the service selected, Crazy SEO Team may provide technical SEO, on-page SEO,
          off-page SEO, local SEO, entity and semantic SEO, AI SEO, GEO, AEO, LLM optimization,
          content writing, article writing, blog management, ghostwriting, copywriting, Google Ads,
          analytics, website optimization, AI automation, AI agents, chatbots, CRM development,
          custom AI software and related consulting.
        </p>
        <p>
          Service scope, timelines, deliverables, revisions, access requirements, fees and support
          levels may differ between projects. The applicable proposal, quotation, order or service
          agreement should be used to determine the exact scope of a paid engagement.
        </p>

        <h2>3. Website, SEO Tools and AI Tools</h2>
        <p>
          Crazy SEO Team may provide public or account-based tools such as SEO audits, keyword
          research, metadata generation, schema generation, sitemap or robots.txt assistance, SERP
          previews, NLP analysis, AI visibility checks and other marketing utilities. These tools
          are intended to provide analysis, guidance or automation and should not be treated as a
          guarantee of search-engine performance.
        </p>
        <p>
          Tool outputs can depend on the information supplied by the user, publicly available web
          data, third-party APIs, model responses, search-engine behavior and technical limitations.
          You are responsible for reviewing important outputs before publishing, deploying or using
          them for business decisions.
        </p>

        <h2>4. Client Responsibilities</h2>
        <ul>
          <li>Provide accurate, complete and timely information required for the project.</li>
          <li>Provide lawful access to websites, analytics, advertising accounts and other systems when required.</li>
          <li>Maintain ownership or authorization for any content, trademarks, images, data or accounts supplied to us.</li>
          <li>Review and approve deliverables, drafts, campaigns or technical changes within agreed timeframes.</li>
          <li>Make payments according to the applicable invoice, quotation, subscription or agreement.</li>
          <li>Promptly notify us about material changes to your business, website, products or marketing goals.</li>
          <li>Use our website and tools in compliance with applicable law and third-party platform rules.</li>
        </ul>

        <h2>5. Accounts, Login and Security</h2>
        <p>
          Some features may require an account or authenticated access. You are responsible for
          protecting your login credentials and for activity performed through your account. You
          should notify us promptly if you believe your account has been accessed without permission.
        </p>
        <p>
          We may suspend or restrict access where reasonably necessary to protect the website, users,
          data, infrastructure or third-party services, or where there is suspected misuse or a
          violation of these terms.
        </p>

        <h2>6. Payments, Fees and Billing</h2>
        <p>
          Fees, taxes where applicable, billing dates, deposits, subscriptions, milestones and
          payment methods are determined by the applicable quotation, invoice, order or service
          agreement. Unless a specific agreement states otherwise, clients are responsible for
          providing accurate billing information and paying invoices by their stated due date.
        </p>
        <p>
          Work may be paused when an account has overdue payments or when required project approvals,
          information or access are not provided. Additional work outside the agreed scope may require
          a revised quotation or written approval.
        </p>

        <h2>7. Intellectual Property and Ownership</h2>
        <p>
          Crazy SEO Team retains its rights in pre-existing intellectual property, including its
          internal processes, frameworks, templates, software, reusable components, tools, prompts,
          methodologies, know-how, branding and systems. Client ownership or licensing of project
          deliverables is determined by the applicable agreement and payment status.
        </p>
        <p>
          Unless expressly agreed otherwise, third-party software, stock assets, platform features,
          open-source components and external services remain subject to their own licenses and terms.
          You are responsible for ensuring that materials supplied by you can lawfully be used for
          your project.
        </p>

        <h2>8. Content, AI-Generated Material and Approvals</h2>
        <p>
          AI-assisted content, copy, recommendations, summaries, code, SEO suggestions and other
          generated material may contain errors, omissions or outdated information. AI output should
          be reviewed by an appropriate human before publication or use in a high-impact decision.
        </p>
        <p>
          Where we create content or marketing assets for you, you remain responsible for final review,
          factual accuracy, legal compliance, claims about your products or services, and approval for
          publication. We do not represent that AI-generated material is automatically suitable for
          every industry, audience or jurisdiction.
        </p>

        <h2>9. SEO, Advertising and Search Results Disclaimer</h2>
        <p>
          Search rankings and digital marketing performance are affected by factors outside our direct
          control, including search-engine algorithms, competitors, website changes, market demand,
          technical infrastructure, advertising-platform policies, user behavior and third-party data.
        </p>
        <p>
          Crazy SEO Team does not guarantee a particular Google ranking, traffic level, conversion
          rate, revenue amount, advertising result, AI Overview placement, ChatGPT citation, Gemini
          result, Perplexity citation or other specific outcome unless an applicable written agreement
          expressly states otherwise. Historical examples or case studies are illustrative and are not
          a promise of identical results for every client.
        </p>

        <h2>10. Classified Marketplace and User Listings</h2>
        <p>
          Where Crazy SEO Team provides classified, business-directory or seller-profile features,
          users are responsible for the accuracy and legality of their listings. You must not post
          fraudulent, misleading, illegal, infringing, abusive, unsafe or prohibited content.
        </p>
        <p>
          Public listing information may be visible to other visitors. Do not publish passwords,
          payment-card information, authentication codes or confidential information in a public
          listing. Crazy SEO Team may review, moderate, reject, restrict or remove listings that
          violate applicable rules, these terms or platform safety requirements.
        </p>
        <p>
          A marketplace listing does not mean that Crazy SEO Team endorses, verifies, guarantees or
          becomes a party to a transaction between buyers and sellers unless a separate written
          agreement expressly says so. Users are responsible for independently evaluating offers,
          products, services and counterparties.
        </p>

        <h2>11. Prohibited Uses</h2>
        <p>You must not use our website, tools or services to:</p>
        <ul>
          <li>Break applicable law or violate another person's rights.</li>
          <li>Distribute malware, harmful code, spam or deceptive material.</li>
          <li>Attempt unauthorized access to accounts, systems, databases or infrastructure.</li>
          <li>Scrape, copy or exploit website content or systems in a way that violates applicable rights or restrictions.</li>
          <li>Impersonate another person or business or submit knowingly false information.</li>
          <li>Publish unlawful, fraudulent, defamatory, abusive or infringing marketplace content.</li>
          <li>Use our services to bypass third-party platform rules or security controls.</li>
        </ul>

        <h2>12. Confidentiality</h2>
        <p>
          Both parties should take reasonable steps to protect confidential business information
          shared during a professional engagement. Confidential information does not generally include
          information that is already public, independently developed, lawfully received from another
          source, or required to be disclosed by law.
        </p>

        <h2>13. Third-Party Platforms and External Services</h2>
        <p>
          Our services may interact with third-party platforms such as search engines, advertising
          networks, analytics systems, hosting providers, AI platforms, communication tools and other
          external services. Those services have their own terms, availability, policies and technical
          limitations. Changes, outages or policy decisions by a third party may affect a project and
          are outside our direct control.
        </p>

        <h2>14. Website Availability and Changes</h2>
        <p>
          We aim to keep the website and services useful and available, but uninterrupted availability
          cannot be guaranteed. Maintenance, security events, infrastructure problems, third-party
          outages or product changes may temporarily affect functionality.
        </p>
        <p>
          Crazy SEO Team may add, modify, improve, suspend or discontinue website features, tools or
          service offerings. Material changes to these terms may be reflected by updating the date and
          publishing the revised version on this page.
        </p>

        <h2>15. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, Crazy SEO Team will not be responsible
          for indirect, incidental, special, consequential or loss-of-profit damages arising from the
          use of the website or services. Unless a specific written agreement states otherwise, our
          aggregate liability relating to a paid service will be limited to the fees actually paid for
          that service during the applicable period, subject to mandatory legal rights that cannot be
          excluded or limited.
        </p>

        <h2>16. Indemnity</h2>
        <p>
          To the extent permitted by applicable law, you agree to be responsible for claims arising
          from your unlawful use of the website, your violation of these terms, or materials and
          instructions supplied by you that infringe the rights of another person or entity.
        </p>

        <h2>17. Suspension and Termination</h2>
        <p>
          We may restrict or terminate access to a website feature, account or service where there is
          a material violation of these terms, non-payment, suspected fraud, security risk, unlawful
          activity or other legitimate operational reason. Project-specific termination rights and
          notice periods are governed by the applicable service agreement.
        </p>
        <p>
          Termination does not automatically remove obligations that by their nature should continue,
          including payment obligations already incurred, intellectual property provisions,
          confidentiality, limitations of liability and dispute-related provisions.
        </p>

        <h2>18. Privacy and Personal Information</h2>
        <p>
          Use of personal information is described in our Privacy Policy. By using the website or
          submitting information, you acknowledge that personal information may be processed as
          described there and as permitted by applicable law.
        </p>
        <p>
          For more information, read our <a href="/privacy-policy">Privacy Policy</a> and review the
          applicable information shown when you submit a form, create an account or use a feature.
        </p>

        <h2>19. Links to Other Websites</h2>
        <p>
          Our website may contain links to third-party websites or services. Such links are provided
          for convenience or reference. Crazy SEO Team does not control every external website and is
          not responsible for its content, availability, privacy practices or terms.
        </p>

        <h2>20. Governing Law and Dispute Resolution</h2>
        <p>
          These general terms are intended to be governed by the laws of India, subject to applicable
          mandatory legal requirements. Disputes should first be raised with Crazy SEO Team so the
          parties have an opportunity to seek a practical resolution. Where a dispute cannot be
          resolved informally, it may be addressed before a court or other competent forum as permitted
          by applicable law.
        </p>

        <h2>21. Changes to These Terms & Conditions</h2>
        <p>
          We may update these Terms & Conditions when our services, website features, business
          processes, legal requirements or marketplace features change. The latest version will be
          published on this page with an updated revision date. Your continued use of the website or
          services after an update may constitute acceptance to the extent permitted by law.
        </p>

        <h2>22. Contact Crazy SEO Team</h2>
        <p>
          If you have a question about these Terms & Conditions, a service agreement, a website
          feature, or a marketplace listing, contact Crazy SEO Team using the details below.
        </p>
        <ul>
          <li><strong>Business:</strong> Crazy SEO Team</li>
          <li><strong>Email:</strong> hello@crazyseoteam.in</li>
          <li><strong>Phone:</strong> +91 62051 53346</li>
          <li><strong>Website:</strong> <a href="https://crazyseoteam.in/">crazyseoteam.in</a></li>
        </ul>

        <h2>Frequently Asked Questions About Our Terms</h2>
        {faqs.map((faq) => (
          <section key={faq.question}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </section>
        ))}

        <h2>Related Crazy SEO Team Policies</h2>
        <ul>
          <li><a href="/privacy-policy">Privacy Policy</a> — information about privacy and data handling.</li>
          <li><a href="/payment-policy">Payment Policy</a> — payment and billing information.</li>
          <li><a href="/faq">Frequently Asked Questions</a> — common questions about our services.</li>
          <li><a href="/services">SEO, AI SEO, Content, Advertising and AI Software Services</a>.</li>
        </ul>

        <p>
          <strong>Important:</strong> These website terms are general information and should be read
          with any contract or service-specific agreement that applies to your engagement. They are not
          a substitute for legal advice tailored to a particular situation or jurisdiction.
        </p>
      </article>
    </main>

    <Footer />
    <WhatsAppButton />
  </div>
);

export default TermsConditions;
