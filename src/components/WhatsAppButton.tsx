import { useEffect, useMemo, useState } from "react";

const WHATSAPP = "916205153346";

const NAVRATRI = [
  { day: 1, date: 11, goddess: "Maa Shailputri", mantra: "ॐ देवी शैलपुत्र्यै नमः॥", quote: "माँ शैलपुत्री आपके जीवन में शक्ति, साहस और नई शुरुआत का आशीर्वाद दें। नवरात्रि के प्रथम दिन की हार्दिक शुभकामनाएँ।", symbol: "🌺", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Shailaputri_Sanghasri_2010_Arnab_Dutta.JPG?width=700" },
  { day: 2, date: 12, goddess: "Maa Brahmacharini", mantra: "ॐ देवी ब्रह्मचारिण्यै नमः॥", quote: "माँ ब्रह्मचारिणी आपके जीवन में धैर्य, संयम और दृढ़ संकल्प भरें। हर कठिनाई में हिम्मत मिले और हर नेक संकल्प पूरा हो। दूसरे नवरात्रि की हार्दिक शुभकामनाएँ।", symbol: "🪷", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Brahmacharini.jpg?width=700" },
  { day: 3, date: 13, goddess: "Maa Chandraghanta", mantra: "ॐ देवी चन्द्रघण्टायै नमः॥", quote: "माँ चंद्रघंटा आपके जीवन से भय दूर करें और सुख, शांति व साहस प्रदान करें। जय माता दी! नवरात्रि के तीसरे दिन की शुभकामनाएँ।", symbol: "🔔", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chandraghanta.PNG?width=700" },
  { day: 4, date: 14, goddess: "Maa Kushmanda", mantra: "ॐ देवी कूष्माण्डायै नमः॥", quote: "माँ कूष्मांडा आपके घर में स्वास्थ्य, ऊर्जा, खुशहाली और समृद्धि का प्रकाश भरें। नवरात्रि के चौथे दिन की मंगलकामनाएँ।", symbol: "🪔", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kushmanda_Sanghasri_2010_Arnab_Dutta.JPG?width=700" },
  { day: 5, date: 15, goddess: "Maa Skandamata", mantra: "ॐ देवी स्कन्दमातायै नमः॥", quote: "माँ स्कंदमाता आपके परिवार को प्रेम, सुख और सुरक्षा का आशीर्वाद दें। आपके जीवन में खुशियाँ बनी रहें। पाँचवें नवरात्रि की शुभकामनाएँ।", symbol: "🌸", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Skandamata_Sanghasri_2010_Arnab_Dutta.JPG?width=700" },
  { day: 6, date: 16, goddess: "Maa Katyayani", mantra: "ॐ देवी कात्यायन्यै नमः॥", quote: "माँ कात्यायनी आपको साहस, आत्मविश्वास और सफलता प्रदान करें। हर अच्छे प्रयास में विजय मिले। छठे नवरात्रि की हार्दिक शुभकामनाएँ।", symbol: "✨", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Katyayani_Sanghasri_2010_Arnab_Dutta.JPG?width=700" },
  { day: 7, date: 17, goddess: "Maa Kalaratri", mantra: "ॐ देवी कालरात्र्यै नमः॥", quote: "माँ कालरात्रि आपके भय और बाधाओं को दूर करें, और आपके जीवन में सुरक्षा व नई आशा लाएँ। सातवें नवरात्रि की शुभकामनाएँ।", symbol: "🔥", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kalratri_Sanghasri_2010_Arnab_Dutta.JPG?width=700" },
  { day: 8, date: 18, goddess: "Maa Mahagauri", mantra: "ॐ देवी महागौर्यै नमः॥", quote: "माँ महागौरी आपके मन में शांति, जीवन में पवित्रता और परिवार में सुख-समृद्धि बनाए रखें। आठवें नवरात्रि की शुभकामनाएँ।", symbol: "🤍", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Mahagauri_Sanghasri_2010_Arnab_Dutta.JPG?width=700" },
  { day: 9, date: 19, goddess: "Maa Siddhidatri", mantra: "ॐ देवी सिद्धिदात्र्यै नमः॥", quote: "माँ सिद्धिदात्री आपके सभी शुभ कार्यों को सिद्ध करें और ज्ञान, विवेक व सफलता का आशीर्वाद दें। महानवमी की हार्दिक शुभकामनाएँ।", symbol: "🌟", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Siddhidatri_Sanghasri_2010_Arnab_Dutta.JPG?width=700" },
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

type NavratriCampaign = (typeof NAVRATRI)[number];

const WhatsAppButton = () => {
  const [campaign, setCampaign] = useState<NavratriCampaign | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const current = getNavratriDay();
    setCampaign(current);
    if (!current) return;
    setPopupOpen(true);
  }, []);

  const whatsappUrl = useMemo(() => {
    if (!campaign) return `https://wa.me/${WHATSAPP}`;
    const text = `🙏 ${campaign.goddess} — ${campaign.mantra} ${campaign.quote} | Crazy SEO Team`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  }, [campaign]);

  if (!campaign) return null;

  return (
    <>
      {popupOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 p-3 sm:items-center">
          <div className="relative max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-3xl border border-orange-200 bg-background p-5 shadow-2xl">
            <button type="button" aria-label="Close Navratri wishes" onClick={() => setPopupOpen(false)} className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xl text-gray-800 shadow">×</button>
            <div className="text-center">
              <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden bg-gradient-to-br from-[#fff5df] via-[#ffe1c5] to-[#ffd9e7] px-5 pb-4 pt-5">
                <img
                  src={campaign.image}
                  alt={campaign.goddess}
                  className="mx-auto h-56 w-full max-w-[260px] rounded-2xl bg-white object-contain p-2 shadow-lg ring-4 ring-white"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
                />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-orange-800">Navratri Day {campaign.day} of 9</p>
                <h2 className="mt-2 text-2xl font-black text-orange-950">{campaign.goddess}</h2>
                <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-orange-950">{campaign.mantra}</p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{campaign.quote}</p>
              <p className="mt-3 text-sm font-semibold">🙏 जय माता दी · Happy Navratri from Crazy SEO Team</p>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 font-bold text-white shadow-lg">💬 Share wishes on WhatsApp</a>
            </div>
          </div>
        </div>
      )}
      <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Share Navratri wishes on WhatsApp" className="fixed bottom-5 right-5 z-[9980] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-2xl">💬</a>
    </>
  );
};

export default WhatsAppButton;
