import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email().max(255);

const NewsletterSignup = ({ source = "footer" }: { source?: string }) => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { toast.error("Enter a valid email"); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { email: parsed.data, source },
      });
      if (error) throw error;
      if ((data as any)?.error === "rate_limited") {
        toast.error("Too many attempts — try again later");
      } else if ((data as any)?.duplicate) {
        toast.success("You're already subscribed!");
      } else {
        toast.success("Subscribed!", { description: "We'll send SEO insights to your inbox." });
        setEmail("");
      }
    } catch (e: any) {
      toast.error("Subscribe failed", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="pl-9" maxLength={255} />
      </div>
      <Button type="submit" disabled={busy} className="gradient-bg text-primary-foreground">
        {busy ? <Loader2 size={14} className="animate-spin" /> : "Subscribe"}
      </Button>
    </form>
  );
};

export default NewsletterSignup;
