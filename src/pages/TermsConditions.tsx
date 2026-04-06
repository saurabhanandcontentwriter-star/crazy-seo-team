import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const TermsConditions = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-lg dark:prose-invert">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Terms & Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 6, 2026</p>

        <p>Welcome to <strong>Crazy SEO Team</strong>. By accessing and using our website and services, you agree to the following terms and conditions.</p>

        <h2>1. Services</h2>
        <p>Crazy SEO Team provides digital marketing services including but not limited to SEO, PPC advertising, social media marketing, web development, AI development, generative AI solutions, and AI voice calling.</p>

        <h2>2. Client Obligations</h2>
        <ul>
          <li>Provide accurate and complete information required for service delivery</li>
          <li>Grant necessary access to websites, analytics accounts, and ad platforms</li>
          <li>Make timely payments as per the agreed schedule</li>
          <li>Review and approve deliverables within the agreed timeframe</li>
        </ul>

        <h2>3. Intellectual Property</h2>
        <p>All content, strategies, and deliverables created by Crazy SEO Team remain our intellectual property until full payment is received. Upon complete payment, ownership of deliverables transfers to the client.</p>

        <h2>4. Confidentiality</h2>
        <p>Both parties agree to maintain the confidentiality of proprietary information, trade secrets, and business strategies shared during the engagement.</p>

        <h2>5. Limitation of Liability</h2>
        <p>Crazy SEO Team shall not be held liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the total fees paid by the client in the preceding 3 months.</p>

        <h2>6. Results Disclaimer</h2>
        <p>While we employ industry best practices, we cannot guarantee specific rankings, traffic numbers, or revenue outcomes as search engine algorithms and market conditions are beyond our control.</p>

        <h2>7. Termination</h2>
        <p>Either party may terminate the service agreement with 30 days written notice. Early termination fees may apply as outlined in individual service contracts.</p>

        <h2>8. Governing Law</h2>
        <p>These terms shall be governed by the laws of India. Any disputes shall be resolved in the courts of competent jurisdiction.</p>

        <h2>9. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of updated terms.</p>

        <h2>10. Contact</h2>
        <p><strong>Email:</strong> contact@crazyseoteam.in<br /><strong>Phone:</strong> +91 9876543210</p>
      </div>
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default TermsConditions;
