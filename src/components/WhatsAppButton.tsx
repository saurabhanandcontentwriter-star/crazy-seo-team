import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const faqs = [
  { q: "What services do you offer?", a: "We offer SEO, PPC Advertising, Social Media Marketing, Web Development, AI Development, Gen AI Solutions, and AI Voice Calling services." },
  { q: "How much does SEO cost?", a: "Our SEO packages start from ₹15,000/month. We customize plans based on your business goals and competition level." },
  { q: "How long to see SEO results?", a: "Typically 3-6 months for significant organic growth. Some quick wins can show within 4-6 weeks." },
  { q: "Do you offer Gen AI solutions?", a: "Yes! We build custom Gen AI apps, AI chatbots, content generators, and automation tools powered by latest LLMs." },
  { q: "Can I get a free audit?", a: "Absolutely! Click 'Get Free Audit' on our website or message us your website URL here." },
];

const WhatsAppButton = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; from: "bot" | "user" }[]>([
    { text: "Hi there! 👋 How can we help you? Choose a question below or type your own.", from: "bot" },
  ]);
  const [input, setInput] = useState("");

  const handleFaqClick = (faq: typeof faqs[0]) => {
    setMessages((prev) => [
      ...prev,
      { text: faq.q, from: "user" },
      { text: faq.a, from: "bot" },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim().toLowerCase();
    setMessages((prev) => [...prev, { text: input.trim(), from: "user" }]);
    setInput("");

    // Simple keyword matching for auto-reply
    setTimeout(() => {
      let reply = "Thanks for your message! 🙏 For a detailed response, our team will connect with you on WhatsApp. Click below to start a chat.";
      if (userMsg.includes("price") || userMsg.includes("cost") || userMsg.includes("package")) {
        reply = "Our packages start from ₹15,000/month for SEO, ₹20,000/month for PPC, and custom pricing for AI/Gen AI solutions. Want a detailed quote? Chat with us on WhatsApp!";
      } else if (userMsg.includes("seo")) {
        reply = "We provide end-to-end SEO — Technical Audits, On-page, Off-page, Local SEO & Content Strategy. Results typically show in 3-6 months!";
      } else if (userMsg.includes("ai") || userMsg.includes("gen ai") || userMsg.includes("chatbot")) {
        reply = "We build custom Gen AI solutions — AI chatbots, content generators, RAG systems, and process automation using latest LLMs like GPT & Gemini!";
      } else if (userMsg.includes("web") || userMsg.includes("website") || userMsg.includes("develop")) {
        reply = "We build lightning-fast, SEO-optimized websites using React, Next.js & modern frameworks. E-commerce, SaaS, landing pages — we do it all!";
      } else if (userMsg.includes("hello") || userMsg.includes("hi") || userMsg.includes("hey")) {
        reply = "Hello! 👋 Welcome to Crazy SEO Team. How can we help you grow your business today?";
      }
      setMessages((prev) => [...prev, { text: reply, from: "bot" }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-80 sm:w-96 animate-fade-in-up overflow-hidden flex flex-col" style={{ maxHeight: "70vh" }}>
          {/* Header */}
          <div className="bg-[hsl(142,70%,40%)] p-4 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-[hsl(0,0%,100%)] flex items-center justify-center">
              <MessageCircle size={20} className="text-[hsl(142,70%,40%)]" />
            </div>
            <div>
              <p className="font-bold text-[hsl(0,0%,100%)] text-sm">Crazy SEO Team</p>
              <p className="text-[hsl(142,50%,85%)] text-xs">● Online — replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-[hsl(0,0%,100%)] hover:opacity-80">
              <X size={18} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[hsl(142,10%,96%)]" style={{ minHeight: 120, maxHeight: 280 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.from === "user" ? "bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)]" : "bg-card text-foreground shadow-sm border border-border"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick FAQ buttons */}
          <div className="px-3 py-2 border-t border-border bg-card shrink-0">
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Quick Questions:</p>
            <div className="flex flex-wrap gap-1.5">
              {faqs.map((faq, i) => (
                <button
                  key={i}
                  onClick={() => handleFaqClick(faq)}
                  className="text-xs px-2.5 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                >
                  {faq.q.length > 28 ? faq.q.slice(0, 28) + "…" : faq.q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-border bg-card flex gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message…"
              className="flex-1 text-sm bg-secondary rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button onClick={handleSend} className="w-9 h-9 rounded-lg bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] flex items-center justify-center hover:bg-[hsl(142,70%,35%)] transition-colors">
              <Send size={16} />
            </button>
          </div>

          {/* WhatsApp CTA */}
          <div className="p-3 border-t border-border shrink-0">
            <a
              href="https://wa.me/916205153346?text=Hi%20Crazy%20SEO%20Team!%20I'm%20interested%20in%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-lg bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] font-medium text-sm hover:bg-[hsl(142,70%,35%)] transition-colors"
            >
              Continue on WhatsApp →
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] shadow-lg hover:bg-[hsl(142,70%,35%)] transition-all flex items-center justify-center hover:scale-110 animate-pulse"
        aria-label="Chat on WhatsApp"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default WhatsAppButton;
