import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LeadForm from "@/components/LeadForm";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  source?: string;
  defaultService?: string;
}

const ContactFormDialog = ({
  open,
  onOpenChange,
  title = "Get Your Free Proposal",
  description = "Fill in your details and we'll get back to you within 24 hours with a custom strategy.",
  source = "contact_form",
  defaultService,
}: ContactFormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl">{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <LeadForm source={source} defaultService={defaultService} onSuccess={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);

export default ContactFormDialog;
