import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "cookie-consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

const getConsent = () => {
  const cookieMatch = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_KEY}=([^;]*)`)
  );

  if (cookieMatch?.[1]) return decodeURIComponent(cookieMatch[1]);

  return localStorage.getItem(CONSENT_KEY);
};

const saveConsent = (value: "accepted" | "rejected") => {
  localStorage.setItem(CONSENT_KEY, value);
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(value)}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax`;
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) {
      const timer = window.setTimeout(() => setVisible(true), 800);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    saveConsent("accepted");
    setVisible(false);
  };

  const handleReject = () => {
    saveConsent("rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 animate-fade-in-up">
      <div className="container mx-auto max-w-5xl rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="mb-1 font-semibold text-foreground">🍪 We use cookies</p>
            <p className="text-sm leading-6 text-muted-foreground">
              We use cookies to enhance your browsing experience, serve personalized
              ads, and analyze our traffic. Choose Accept or Reject to save your
              preference.
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReject}
              aria-label="Reject cookies"
            >
              Reject
            </Button>

            <Button
              type="button"
              className="gradient-bg text-primary-foreground hover:opacity-90"
              onClick={handleAccept}
              aria-label="Accept cookies"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
