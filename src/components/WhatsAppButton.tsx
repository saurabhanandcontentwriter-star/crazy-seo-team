import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const WhatsAppButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-80 animate-fade-in-up overflow-hidden">
          <div className="bg-[hsl(142,70%,40%)] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(0,0%,100%)] flex items-center justify-center">
              <MessageCircle size={20} className="text-[hsl(142,70%,40%)]" />
            </div>
            <div>
              <p className="font-bold text-[hsl(0,0%,100%)] text-sm">Crazy SEO Team</p>
              <p className="text-[hsl(142,50%,85%)] text-xs">Typically replies in minutes</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-[hsl(0,0%,100%)] hover:opacity-80">
              <X size={18} />
            </button>
          </div>
          <div className="p-4 bg-[hsl(142,20%,95%)]">
            <div className="bg-card rounded-xl p-3 shadow-sm">
              <p className="text-sm text-foreground">Hi there! 👋</p>
              <p className="text-sm text-muted-foreground mt-1">How can we help you with your SEO and digital marketing needs?</p>
            </div>
          </div>
          <div className="p-3 border-t border-border">
            <a
              href="https://wa.me/916205153346?text=Hi%20Crazy%20SEO%20Team!%20I'm%20interested%20in%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-lg bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] font-medium text-sm hover:bg-[hsl(142,70%,35%)] transition-colors"
            >
              Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] shadow-lg hover:bg-[hsl(142,70%,35%)] transition-all flex items-center justify-center hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default WhatsAppButton;
