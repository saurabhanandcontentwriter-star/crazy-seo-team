import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const PaymentPolicy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-lg dark:prose-invert">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Payment Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 6, 2026</p>

        <p>This Payment Policy outlines the terms related to billing, payments, and refunds for services provided by <strong>Crazy SEO Team</strong>.</p>

        <h2>1. Payment Methods</h2>
        <p>We accept the following payment methods:</p>
        <ul>
          <li>Bank Transfer (NEFT/RTGS/IMPS)</li>
          <li>UPI (Google Pay, PhonePe, Paytm)</li>
          <li>Credit / Debit Cards</li>
          <li>PayPal (for international clients)</li>
          <li>Razorpay</li>
        </ul>

        <h2>2. Payment Schedule</h2>
        <h3>One-Time Projects</h3>
        <ul>
          <li><strong>50% advance</strong> before project commencement</li>
          <li><strong>50% balance</strong> upon project completion and delivery</li>
        </ul>

        <h3>Monthly Retainer Services</h3>
        <ul>
          <li>Full monthly payment due <strong>before the 5th</strong> of each service month</li>
          <li>Quarterly and annual plans available at discounted rates</li>
        </ul>

        <h2>3. Late Payments</h2>
        <p>Payments overdue by more than <strong>7 days</strong> may result in:</p>
        <ul>
          <li>Temporary suspension of active campaigns and services</li>
          <li>A late fee of <strong>2% per week</strong> on the outstanding amount</li>
          <li>Permanent suspension after 30 days of non-payment</li>
        </ul>

        <h2>4. Refund Policy</h2>
        <h3>Eligible for Refund</h3>
        <ul>
          <li>Service not initiated within 15 days of payment — full refund</li>
          <li>Cancellation within 48 hours of payment (before work begins) — full refund</li>
        </ul>

        <h3>Not Eligible for Refund</h3>
        <ul>
          <li>Work already completed or campaigns already launched</li>
          <li>Ad spend paid to third-party platforms (Google, Meta, etc.)</li>
          <li>Custom development work delivered and approved</li>
        </ul>

        <h2>5. Ad Spend</h2>
        <p>Ad spend (Google Ads, Meta Ads, etc.) is separate from our service fees. Clients are responsible for funding their ad accounts directly or through us with a transparent billing process.</p>

        <h2>6. Invoicing</h2>
        <p>All invoices are sent via email with GST-compliant documentation. We provide:</p>
        <ul>
          <li>Proforma invoice before payment</li>
          <li>Tax invoice after payment confirmation</li>
          <li>Monthly reports with performance metrics</li>
        </ul>

        <h2>7. Contact for Billing Queries</h2>
        <p><strong>Email:</strong> billing@crazyseoteam.in<br /><strong>Phone:</strong> +91 9876543210</p>
      </div>
    </div>
    <Footer />
