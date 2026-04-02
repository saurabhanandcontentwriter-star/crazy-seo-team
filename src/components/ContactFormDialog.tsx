import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const ContactFormDialog = ({ open, onOpenChange, title = "Get Your Free Proposal", description = "Fill in your details and we'll get back to you within 24 hours with a custom strategy." }: ContactFormDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      toast({ title: "Request Submitted! ✅", description: "Our team will contact you within 24 hours." });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input placeholder="Your Name *" required />
          <Input type="email" placeholder="Email Address *" required />
          <Input type="tel" placeholder="Phone Number" />
          <Input placeholder="Website URL" />
          <Textarea placeholder="Tell us about your project..." rows={3} />
          <Button type="submit" className="w-full gradient-bg text-primary-foreground hover:opacity-90" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormDialog;
