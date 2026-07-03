import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_KEY = "cst-tour-v1-seen";

const WebsiteTour = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_KEY)) return;

    const t = setTimeout(() => {
      const d = driver({
        showProgress: true,
        overlayColor: "rgba(6, 8, 22, 0.75)",
        popoverClass: "cst-tour-popover",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Get started",
        steps: [
          { element: "#tour-logo", popover: { title: "Welcome to Crazy SEO Team ✨", description: "The AI SEO platform for Google, ChatGPT, Gemini & AI Search. Let's take a 30-second tour." } },
          { element: "#tour-nav", popover: { title: "Everything in one place", description: "Services, AI Tools, SEO Tools, Blog and live News — all AI-powered." } },
          { element: "#tour-cta", popover: { title: "Run a free AI audit", description: "Check your website's SEO, AI visibility and LLM readiness in seconds." } },
          { element: "#tour-chatbot", popover: { title: "Meet your AI concierge", description: "Chat with our AI SEO assistant — voice, streaming, and lead-gen ready.", side: "left" } },
        ],
        onDestroyed: () => localStorage.setItem(TOUR_KEY, "1"),
      });
      d.drive();
    }, 1200);

    return () => clearTimeout(t);
  }, []);

  return null;
};

export default WebsiteTour;
