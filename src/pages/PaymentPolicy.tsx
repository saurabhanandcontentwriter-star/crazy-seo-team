import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const faqs = [
  {
    question: "What payment methods does Crazy SEO Team accept?",
    answer:
      "Depending on the project, Crazy SEO Team may accept bank transfer, UPI, credit or debit cards, Razorpay, and PayPal for eligible international transactions. The available method will be confirmed in the invoice or payment link.",
  },
  {
    question: "What is the payment schedule for one-time projects?",
    answer:
      "Unless a written proposal states otherwise, one-time projects generally require 50% advance payment before work begins and the remaining 50% on completion and delivery.",
  },
  {
    question: "Are monthly SEO and digital marketing services prepaid?",
    answer:
      "Monthly retainer services are generally billed in advance for the applicable service period. The exact billing date and plan duration are confirmed in the proposal, invoice, or service agreement.",
  },
  {
    question: "Can I request a refund after paying for a service?",
    answer:
      "Refund eligibility depends on the timing of cancellation, whether work has started, the type of service, and the applicable written agreement. Completed work, launched campaigns, third-party advertising spend, and approved custom development are generally non-refundable.",
  },
  {
    question: "Is advertising spend included in Crazy SEO Team service fees?",
    answer:
      "Advertising spend for platforms such as Google Ads or Meta Ads is separate from professional service fees unless a written commercial agreement specifically states otherwise.",
  },
];

const PaymentPolicy = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Helmet>
      <title>Payment Policy | Billing, Refunds &amp; Payments | Crazy SEO Team</title>
      <meta
        name="description"
        content="Read the Crazy SEO Team Payment Policy covering payment methods, project billing, monthly retainers, invoices, advertising spend, late payments, cancellations and refunds."
      />
      <meta
        name="keywords"
        content="Crazy SEO Team payment policy, SEO payment policy, digital marketing billing, SEO refund policy, AI SEO payment terms, agency payment terms, payment methods, service refunds"
      />
      <link rel="canonical" href="https://crazyseoteam.in/payment-policy" />
      <meta property="og:title" content="Payment Policy | Crazy SEO Team" />
      <meta
        property="og:description"
        content="Understand payment methods, billing schedules, invoices, advertising spend, cancellations and refunds for Crazy SEO Team services."
      />
      <meta property="og:url" content="https://crazyseoteam.in/payment-policy" />
      <meta property="og:type" content="article" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Payment Policy | Crazy SEO Team" />
      <meta
        name="twitter:description"
        content="Payment, billing and refund information for Crazy SEO Team SEO, AI SEO, content, advertising and AI development services."
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Payment Policy | Crazy SEO Team",
          description:
            "Payment, billing, invoice, advertising spend, cancellation and refund policy for Crazy SEO Team services.",
          datePublished: "2026-04-06",
          dateModified: "2026-09-16",
          author: { "@type": "Organization", name: "Crazy SEO Team", url: "https://crazyseoteam.in/" },
          publisher: { "@type": "Organization", name: "Crazy SEO Team", url: "https://crazyseoteam.in/" },
          mainEntityOfPage: { "@type": "WebPage", "@id": "https://crazyseoteam.in/payment-policy" },
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        })}
      </script>
    </Helmet>

    <Navbar />

    <main className="pt-24 pb-20 px-4">
      <article className="container mx-auto max-w-4xl">
        <header className="border-b border-border pb-10 mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            Billing &amp; Client Information
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Payment Policy
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-8 max-w-3xl mb-5">
            A complete guide to payments, billing, invoices, advertising spend,
            cancellations and refunds for Crazy SEO Team services.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>Last updated: September 16, 2026</span>
            <span aria-hidden="true">•</span>
            <span>Crazy SEO Team</span>
          </div>
        </header>

        <div className="space-y-12 leading-8">
          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">1. Welcome to the Crazy SEO Team Payment Policy</h2>
            <p className="mb-5">
              This Payment Policy explains how payments are handled when you purchase or engage services from <strong>Crazy SEO Team</strong>. Our goal is to keep the commercial side of every project clear, including payment timing, invoices, advertising budgets, cancellations and refunds.
            </p>
            <p>
              Crazy SEO Team provides SEO, AI SEO, GEO, AEO, LLM optimization, content writing, article writing, ghostwriting, Google Ads, automation, AI software development and related digital growth services. The exact commercial terms can vary according to project scope, duration and the written proposal or agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">2. What This Payment Policy Covers</h2>
            <p className="mb-5">
              This policy provides the general billing framework for one-time projects, monthly retainers, SEO campaigns, AI SEO programs, content services, advertising management, AI services, software development and other paid professional services.
            </p>
            <p>
              If a proposal, quotation, invoice, statement of work or signed agreement contains a specific payment term that differs from this general policy, the project-specific written term will govern that transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">3. Payment Methods</h2>
            <p className="mb-5">Depending on the project and client location, available payment methods may include:</p>
            <ul className="list-disc pl-6 space-y-3 mb-5">
              <li>Bank transfer through NEFT, RTGS or IMPS.</li>
              <li>UPI payments through supported UPI applications.</li>
              <li>Credit and debit card payments.</li>
              <li>Razorpay or another approved payment gateway.</li>
              <li>PayPal for eligible international transactions.</li>
            </ul>
            <p>
              Clients should use only payment details, invoices or payment links supplied through an authorized Crazy SEO Team communication channel. If payment instructions appear unusual or have changed unexpectedly, contact us before sending funds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">4. Payment Terms for One-Time Projects</h2>
            <p className="mb-6">
              Unless the proposal or agreement states otherwise, the standard structure for a one-time project is designed around an initial advance and a final payment after the agreed scope is completed.
            </p>
            <div className="rounded-2xl border border-border bg-muted/30 p-6 mb-5">
              <h3 className="text-xl font-semibold mb-3">Project Advance — 50%</h3>
              <p>Generally, 50% advance payment is required before project commencement, resource allocation and active production work.</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="text-xl font-semibold mb-3">Final Payment — 50%</h3>
              <p>The remaining 50% is generally due upon completion and delivery of the agreed project scope, subject to the applicable proposal or agreement.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">5. Monthly Retainer and Recurring Services</h2>
            <p className="mb-5">
              SEO campaigns, AI SEO programs, content retainers, digital marketing management and other recurring services are normally billed in advance for the applicable service period.
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>Monthly payments are generally due before the service month begins or by the billing date stated on the invoice.</li>
              <li>The standard monthly arrangement may require payment before the 5th of the applicable service month unless a different date is agreed in writing.</li>
              <li>Quarterly or annual arrangements may be available when included in a written commercial proposal.</li>
              <li>Recurring services may pause when an invoice remains unpaid after the applicable due date.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">6. Invoices, Receipts and Billing Records</h2>
            <p className="mb-5">
              Billing documents may include a quotation, proposal, proforma invoice, tax invoice, payment receipt or another transaction record, depending on the service and billing process.
            </p>
            <p className="mb-5">
              Clients should review the service description, billing period, amount, applicable taxes and payment due date before completing a transaction. If information appears incorrect, contact the billing team promptly so the record can be reviewed.
            </p>
            <p>Where applicable, Crazy SEO Team may issue tax documentation based on the information available for the transaction and applicable requirements.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">7. Taxes, Fees and Transaction Charges</h2>
            <p className="mb-5">
              Unless a quotation or invoice expressly states that a price is tax-inclusive, applicable taxes may be added to the service amount. Payment gateway fees, bank charges, currency conversion costs or other transaction expenses may also apply where relevant to the selected payment method.
            </p>
            <p>International clients are responsible for understanding taxes, withholding obligations, currency conversion charges or local payment requirements that apply to their own transaction, subject to the applicable agreement.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">8. Late or Missed Payments</h2>
            <p className="mb-5">
              Timely payment allows Crazy SEO Team to maintain project schedules, allocate specialists and keep campaigns running. When an invoice remains unpaid after its due date, we may send a reminder and may temporarily pause work or access associated with the unpaid service.
            </p>
            <p className="mb-5">
              Under the general commercial terms, an amount overdue by more than seven days may lead to temporary suspension. A late charge of up to <strong>2% per week</strong> may apply where such a charge is stated in the applicable commercial terms or invoice.
            </p>
            <p>Extended non-payment may result in suspension or termination of the affected service. Restarting a suspended campaign may require settlement of outstanding amounts and confirmation of a new schedule.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">9. Refunds and Cancellation Requests</h2>
            <p className="mb-6">
              Refunds are considered according to the nature of the service, whether work has started, how much work has been completed, and the applicable proposal or agreement. A refund is not automatic simply because a client changes their mind after work has begun.
            </p>
            <h3 className="text-xl md:text-2xl font-semibold mb-4">Situations That May Qualify for a Refund</h3>
            <ul className="list-disc pl-6 space-y-3 mb-7">
              <li>A service has not been initiated within 15 days of payment where the delay is attributable to Crazy SEO Team and no different schedule was agreed.</li>
              <li>A cancellation is requested within 48 hours of payment and substantive project work has not yet started.</li>
              <li>A project-specific written agreement expressly provides for a refund under the circumstances described in that agreement.</li>
            </ul>
            <h3 className="text-xl md:text-2xl font-semibold mb-4">Situations Generally Not Eligible for a Refund</h3>
            <ul className="list-disc pl-6 space-y-3">
              <li>Work that has already been completed or delivered.</li>
              <li>Campaigns or advertising work that has already launched.</li>
              <li>Advertising spend paid to third-party platforms such as Google, Meta or other advertising providers.</li>
              <li>Custom development, software or design work that has been delivered and approved.</li>
              <li>Third-party tools, subscriptions, licenses or services already purchased specifically for the project where those costs are non-refundable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">10. How to Request a Refund</h2>
            <p className="mb-5">
              Refund requests should be submitted in writing with the client name, invoice or transaction reference, service name, payment date and reason for the request. This allows the billing team to verify the transaction and determine the applicable policy.
            </p>
            <p>Approved refunds are processed through an appropriate payment channel and may take additional time to appear in the client's bank account or payment method because of payment-provider processing times.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">11. Advertising Spend Is Separate From Service Fees</h2>
            <p className="mb-5">
              Google Ads, Meta Ads and other paid-media budgets are separate from Crazy SEO Team's professional service fees unless a written proposal specifically combines them into one commercial arrangement.
            </p>
            <p>Advertising budgets purchase media or advertising inventory from third-party platforms. Auction prices, approvals, account restrictions, platform policies, performance and outages are controlled partly or entirely by those third parties and do not by themselves create a refund right for already-spent advertising budget.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">12. SEO, AI SEO and Performance-Based Services</h2>
            <p className="mb-5">
              SEO and AI search services involve optimization, testing, content, technical improvements and ongoing analysis. Search rankings, AI Overview visibility, ChatGPT or Gemini references, traffic, leads and conversions can be influenced by algorithms, competitors, markets and other factors outside the agency's control.
            </p>
            <p>Payment for an SEO or AI SEO service is payment for the agreed professional work and deliverables, not a guarantee of a particular ranking, traffic number, AI citation or revenue outcome unless a specific written agreement expressly states otherwise.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">13. AI Tools, SEO Tools and Automated Services</h2>
            <p className="mb-5">
              Crazy SEO Team may provide SEO audits, AI writing tools, keyword research, schema generation, AEO/GEO analysis, LLM visibility checks and other automated or AI-assisted tools. These tools generate recommendations from available data and technical signals, and automated output should be reviewed before business-critical use.
            </p>
            <p>Fees for paid access, professional implementation or custom work are governed by the applicable product or service terms. A temporary technical issue with an automated tool does not by itself create a refund entitlement for unrelated services already delivered.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">14. Custom AI Software, Websites and Development Projects</h2>
            <p className="mb-5">
              Custom software, SaaS, CRM, chatbot, AI agent, website and automation projects may require separate milestones, deposits, hosting costs, third-party API costs and maintenance charges.
            </p>
            <p>Development work that has been completed, delivered, deployed or approved is generally not refundable. Milestone-specific refund, cancellation or ownership terms should be reviewed in the project proposal or statement of work before development begins.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">15. Client Responsibilities Before Payment</h2>
            <p className="mb-5">
              Before making a payment, clients should review the project scope and confirm that the selected service matches their business requirements. Clients are also responsible for providing timely access, accurate information, approvals and materials where those items are required to start or continue a project.
            </p>
            <p>Delays caused by missing access, late approvals, unavailable content, incorrect business information or other client-side dependencies may affect delivery timelines without automatically changing agreed payment obligations.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">16. Subscription and Recurring Service Cancellation</h2>
            <p className="mb-5">For recurring services, cancellation should normally be requested before the next billing cycle. The applicable notice period, if any, will be stated in the service agreement or subscription terms.</p>
            <p>Cancelling a recurring service does not automatically reverse a payment for a service period that has already started or for work already performed during that period.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">17. Chargebacks and Payment Disputes</h2>
            <p className="mb-5">If you believe a payment was processed incorrectly, please contact Crazy SEO Team first so the transaction can be reviewed and resolved through the appropriate billing process.</p>
            <p>Unauthorized chargebacks or disputes that do not follow the applicable service agreement may result in temporary service suspension while the transaction is investigated. This does not limit rights available under applicable law.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">18. Third-Party Services and External Costs</h2>
            <p className="mb-5">Some projects may require third-party platforms, hosting, domains, advertising accounts, APIs, software licenses, AI model providers, stock assets or other external services. Unless specifically included in the proposal, these costs may be billed separately or paid directly by the client.</p>
            <p>Third-party pricing, availability and refund rules are controlled by the relevant provider. Crazy SEO Team cannot guarantee the refund policies or processing times of an independent third party.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">19. Payment Security and Fraud Prevention</h2>
            <p className="mb-5">Clients should never share card PINs, one-time passwords, CVVs, account passwords or other sensitive authentication information with anyone claiming to represent Crazy SEO Team.</p>
            <p>If you receive a suspicious payment request, verify it through an official Crazy SEO Team communication channel before making the payment. Sensitive authentication credentials should never be provided for a billing enquiry.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">20. Changes to Pricing or Commercial Terms</h2>
            <p className="mb-5">Service pricing may change as offerings, technology, scope, third-party costs or market conditions change. A price already confirmed in a valid project proposal or invoice will generally remain governed by that document for the relevant transaction unless the parties agree otherwise in writing.</p>
            <p>Future renewals, new projects or expanded scopes may be priced according to the rates applicable at that time.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">21. Relationship With the Terms &amp; Conditions</h2>
            <p>This Payment Policy should be read together with the Crazy SEO Team Terms &amp; Conditions and Privacy Policy. The Terms &amp; Conditions describe broader rules for using our website and services, while this page focuses specifically on billing, payments, cancellations and refunds.</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-6">22. Frequently Asked Questions About Payments</h2>
            <div className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-xl md:text-2xl font-semibold leading-tight mb-3">{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">23. Contact Crazy SEO Team About Billing</h2>
            <p className="mb-6">For questions about an invoice, payment, refund, cancellation, transaction or service charge, contact Crazy SEO Team with your invoice or transaction reference whenever possible.</p>
            <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 space-y-3">
              <p><strong>Business:</strong> Crazy SEO Team</p>
              <p><strong>Billing Email:</strong> billing@crazyseoteam.in</p>
              <p><strong>General Email:</strong> hello@crazyseoteam.in</p>
              <p><strong>Phone:</strong> +91 62051 53346</p>
              <p><strong>Website:</strong> crazyseoteam.in</p>
            </div>
          </section>

          <section className="border-t border-border pt-10">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">Important Notice</h2>
            <p className="mb-5">This page describes Crazy SEO Team's general payment and refund framework. A client proposal, invoice, statement of work, subscription agreement or other written commercial document may contain additional terms for a particular service.</p>
            <p>For formal legal, tax or regulatory questions, clients should obtain advice appropriate to their own circumstances. Nothing on this page is intended to guarantee a particular business, search, advertising or financial outcome.</p>
          </section>
        </div>
      </article>
    </main>

    <Footer />
    <WhatsAppButton />
  </div>
);

export default PaymentPolicy;
