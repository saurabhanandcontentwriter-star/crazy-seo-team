import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, Loader2 } from "lucide-react";
import { COUNTRY_CODES, LEAD_SERVICES, leadSchema, submitLead } from "@/lib/leads";

interface LeadFormProps {
  source?: string;
  defaultService?: string;
  submitLabel?: string;
  compact?: boolean;
  onSuccess?: () => void;
}

const empty = {
  full_name: "", email: "", phone_country: "+91", phone: "", company: "",
  website: "", service: "", message: "", preferred_contact: "email" as const,
};

export default function LeadForm({
  source = "contact_form",
  defaultService,
  submitLabel = "Submit Request",
  compact = false,
  onSuccess,
}: LeadFormProps) {
  const [values, setValues] = useState({ ...empty, service: defaultService ?? "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof empty, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await submitLead(parsed.data, source);
      toast({ title: "Request received ✅", description: "Your service purpose and message have been added to our CRM for the team." });
      setValues({ ...empty, service: defaultService ?? "" });
      onSuccess?.();
    } catch (err) {
      toast({ title: "Could not submit", description: err instanceof Error ? err.message : "Please try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const Err = ({ k }: { k: string }) => errors[k] ? <p className="text-xs text-destructive mt-1">{errors[k]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={compact ? "space-y-3" : "grid sm:grid-cols-2 gap-3"}>
        <div><Label className="text-xs">Full name *</Label><Input value={values.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Rahul Sharma" /><Err k="full_name" /></div>
        <div><Label className="text-xs">Email address *</Label><Input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" /><Err k="email" /></div>
      </div>
      <div><Label className="text-xs">Mobile number *</Label><div className="flex gap-2"><Select value={values.phone_country} onValueChange={(v) => set("phone_country", v)}><SelectTrigger className="w-[145px] shrink-0"><SelectValue /></SelectTrigger><SelectContent className="bg-popover">{COUNTRY_CODES.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}</SelectContent></Select><Input inputMode="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98765 43210" /></div><Err k="phone" /></div>
      <div className={compact ? "space-y-3" : "grid sm:grid-cols-2 gap-3"}>
        <div><Label className="text-xs">Company (optional)</Label><Input value={values.company} onChange={(e) => set("company", e.target.value)} placeholder="Company name" /></div>
        <div><Label className="text-xs">Website (optional)</Label><Input value={values.website} onChange={(e) => set("website", e.target.value)} placeholder="example.com" /><Err k="website" /></div>
      </div>
      <div><Label className="text-xs">Purpose / service you need *</Label><Select value={values.service} onValueChange={(v) => set("service", v)}><SelectTrigger><SelectValue placeholder="What are you contacting us for?" /></SelectTrigger><SelectContent className="bg-popover max-h-72">{LEAD_SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><Err k="service" /></div>
      <div><Label className="text-xs">Purpose / message / requirement</Label><Textarea rows={4} value={values.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us exactly why you are contacting Crazy SEO Team, what you need, your goal, budget or deadline…" /></div>
      <div><Label className="text-xs">Preferred contact method</Label><Select value={values.preferred_contact} onValueChange={(v) => set("preferred_contact", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="bg-popover"><SelectItem value="email">Email</SelectItem><SelectItem value="phone">Phone call</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem></SelectContent></Select></div>
      <p className="flex items-start gap-2 text-[11px] text-muted-foreground rounded-xl bg-muted/50 p-2.5"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary" />We collect your details only to respond to this enquiry. The selected purpose/service and your message are stored with the lead so our CRM team knows why you contacted us.</p>
      <Button type="submit" disabled={loading} className="w-full gradient-bg text-primary-foreground hover:opacity-90">{loading ? <><Loader2 size={15} className="mr-2 animate-spin" /> Submitting…</> : submitLabel}</Button>
    </form>
  );
}
