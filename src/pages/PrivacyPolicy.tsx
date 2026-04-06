import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-lg dark:prose-invert">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 6, 2026</p>

        <p>At <strong>Crazy SEO Team</strong>, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>crazyseoteam.in</strong>.</p>

        <h2>1. Information We Collect</h2>
        <h3>Personal Data</h3>
        <p>When you fill out a contact form or subscribe to our services, we may collect:</p>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Website URL</li>
          <li>Company name</li>
        </ul>

        <h3>Usage Data</h3>
        <p>We automatically collect information such as your IP address, browser type, pages visited, time spent on pages, and referring URLs using analytics tools.</p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain our digital marketing and AI services</li>
          <li>To respond to your inquiries and contact requests</li>
          <li>To send you project updates, reports, and promotional materials (with consent)</li>
          <li>To improve our website, services, and user experience</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2>3. Cookies & Tracking</h2>
        <p>We use cookies and similar tracking technologies to monitor activity on our website. You can manage cookie preferences through your browser settings or our cookie consent banner.</p>

        <h2>4. Data Sharing</h2>
        <p>We do <strong>not</strong> sell or rent your personal information. We may share data with:</p>
        <ul>
          <li>Trusted third-party service providers (e.g., Google Analytics, email marketing platforms)</li>
          <li>Legal authorities when required by law</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access, update, or delete your personal data</li>
          <li>Opt out of marketing communications</li>
          <li>Request a copy of the data we hold about you</li>
        </ul>

        <h2>7. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p><strong>Email:</strong> contact@crazyseoteam.in<br /><strong>Phone:</strong> +91 9876543210</p>
      </div>
    </div>
    <Footer />
    <WhatsAppButton />
  </div>
);

export default PrivacyPolicy;
