const [isSubmitting, setIsSubmitting] = useState(false);
const [success, setSuccess] = useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setIsSubmitting(true);
  setSuccess(false);

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        website: formData.website,
        service: formData.service,
        contactMethod: formData.contactMethod,
        message: formData.message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Submission failed");
    }

    setSuccess(true);

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      website: "",
      service: "",
      contactMethod: "Email",
      message: "",
    });

  } catch (error) {
    console.error("Contact form error:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
