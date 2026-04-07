import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const PrivacyPolicy = () => {
  return (
    <>
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Privacy Policy
          </h1>

          <p className="mb-6 text-gray-500">
            Last updated: April 6, 2026
          </p>

          <p className="mb-6">
            At <strong>Crazy SEO Team</strong>, we are committed to protecting your privacy.
          </p>

        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default PrivacyPolicy;
