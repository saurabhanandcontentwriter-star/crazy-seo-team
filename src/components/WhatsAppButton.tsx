import { useEffect, useMemo, useState } from "react";

const WHATSAPP = "916205153346";

const NAVRATRI = [
  { day: 1, date: 11, goddess: "Maa Shailputri", quote: "Strong foundation, better rankings, bigger growth." },
  { day: 2, date: 12, goddess: "Maa Brahmacharini", quote: "SEO mein shortcut nahi—consistent optimization hi long-term growth banata hai." },
  { day: 3, date: 13, goddess: "Maa Chandraghanta", quote: "Be visible. Be relevant. Be remembered." },
  { day: 4, date: 14, goddess: "Maa Kushmanda", quote: "Good content attracts. Great SEO converts." },
  { day: 5, date: 15, goddess: "Maa Skandamata", quote: "Right keywords + right intent = right audience." },
  { day: 6, date: 16, goddess: "Maa Katyayani", quote: "Fix the crawl. Improve the index. Grow the visibility." },
  { day: 7, date: 17, goddess: "Maa Kalaratri", quote: "Algorithm changes aayein ya competition badhe—SEO strategy rukni nahi chahiye." },
  { day: 8, date: 18, goddess: "Maa Mahagauri", quote: "Clean structure. Clear intent. Better search visibility." },
  { day: 9, date: 19, goddess: "Maa Siddhidatri", quote: "SEO is not just about ranking—it is about the right business outcome." },
  { day: 10, date: 20, goddess: "Maa Durga", quote: "May your business grow, your website rank, and your digital journey shine brighter every day." },
];

function getNavratriDay() {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
  }).formatToParts(new Date());

  const day = Number(parts.find((p) => p.type === "day")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);

  if (month !== 10) return null;
  return NAVRATRI.find((item) => item.date === day) ?? null;
}

const WhatsAppButton = () => {
  const [campaign, setCampaign] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const current = getNavratriDay();
    setCampaign(current);

    if (!current) return;

    const key = `cst-navratri-popup-${new Date().getFullYear()}-${current.date}`;
    const alreadyShown = window.localStorage.getItem(key);

    const timer = window.setTimeout(() => {
      if (!alreadyShown) {
        setPopupOpen(true);
        window.localStorage.setItem(key, "1");
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  const whatsappUrl = useMemo(() => {
    if (!campaign) return `https://wa.me/${WHATSAPP}`;
    const text = `🙏 Happy Navratri from Crazy SEO Team! Day ${campaign.day}: ${campaign.goddess}. ${campaign.quote}`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  }, [campaign]);

  if (!campaign) return null;

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[9990] border-b border-amber-200/40 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2 text-center text-sm font-bold text-white shadow-lg">
        🙏 Navratri Day {campaign.day} • {campaign.goddess} • <span className="font-black">{campaign.quote}</span>
      </div>

      {popupOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-orange-200 bg-background p-6 shadow-2xl">
            <button
              type="button"
              aria-label="Close Navratri wishes"
              onClick={() => setPopupOpen(false)}
              className="absolute right-3 top-3 rounded-full px-3 py-1 text-xl text-muted-foreground hover:bg-muted"
            >
              ×
            </button>

            <div className="text-center">
              <div className="text-4xl">🌺🙏🌺</div>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Navratri Day {campaign.day}
              </p>
              <h2 className="mt-2 text-2xl font-black">{campaign.goddess}</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {campaign.quote}
              </p>
              <p className="mt-3 text-sm font-semibold">
                ✨ Happy Navratri from Crazy SEO Team ✨
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 font-bold text-white shadow-lg transition hover:scale-[1.01]"
              >
                💬 Connect on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-[9980] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-2xl transition hover:scale-105"
      >
        💬
      </a>
    </>
  );
};

export default WhatsAppButton;
