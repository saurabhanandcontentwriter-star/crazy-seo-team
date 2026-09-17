import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, UserRound, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PROFILE_KEY = "cst_classified_profile";

function makeProfileId(userId: string) {
  const compact = userId.replace(/-/g, "").toUpperCase();
  return `CST-${compact.slice(0, 8)}`;
}

export default function ClassifiedProfileGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        setLoading(false);
        return;
      }
      setUserId(data.user.id);
      const metadata = (data.user.user_metadata || {}) as Record<string, any>;
      const saved = localStorage.getItem(PROFILE_KEY);
      let profile: any = null;
      try { profile = saved ? JSON.parse(saved) : null; } catch { profile = null; }
      setForm({
        name: profile?.name || metadata.classified_profile?.name || metadata.full_name || metadata.name || "",
        email: profile?.email || metadata.classified_profile?.email || data.user.email || "",
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const profileId = useMemo(() => userId ? makeProfileId(userId) : "CST-PROFILE", [userId]);
  const complete = Boolean(form.name.trim() && form.email.trim());

  const saveProfile = async () => {
    if (!userId) return navigate(`/admin/login?returnTo=${encodeURIComponent("/post-ad")}`);
    if (!complete) return toast.error("Name and email are required before posting.");
    setSaving(true);
    try {
      const profile = { id: profileId, name: form.name.trim(), email: form.email.trim().toLowerCase() };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      const { error } = await supabase.auth.updateUser({ data: { classified_profile: profile } });
      if (error) throw error;
      toast.success(`Profile ${profileId} created successfully`);
    } catch (error: any) {
      toast.error(error?.message || "Could not save your classified profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container mx-auto flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin" /></div>;

  if (!userId) return <div className="container mx-auto px-4 py-16"><Card className="mx-auto max-w-xl"><CardHeader><Badge className="w-fit">Classified Marketplace</Badge><CardTitle className="text-2xl">Login required to post</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-muted-foreground">Please login first. Your name and email will be taken from your signed-in account.</p><Button className="w-full" onClick={() => navigate(`/admin/login?returnTo=${encodeURIComponent("/post-ad")}`)}>Login to continue<ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card></div>;

  const savedProfile = (() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch { return null; } })();
  if (savedProfile?.id === profileId && savedProfile?.name && savedProfile?.email) return <>{children}</>;

  return <div className="container mx-auto px-4 py-10 md:py-16"><Card className="mx-auto max-w-2xl overflow-hidden rounded-3xl shadow-xl"><CardHeader className="border-b bg-gradient-to-b from-primary/10 to-background"><Badge className="w-fit">Step 1 of 2</Badge><CardTitle className="text-2xl md:text-3xl">Create your Classified Profile</CardTitle><p className="text-sm text-muted-foreground">Your profile is linked to your login account. Name and email are used automatically; phone and location are optional.</p></CardHeader><CardContent className="space-y-5 p-5 md:p-7"><div className="grid gap-4 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">Profile ID</p><p className="font-bold tracking-wide">{profileId}</p></div></div><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-2 text-primary"><UserRound className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">Account</p><p className="font-medium">Logged-in account</p></div></div></div><div className="grid gap-4 md:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium">Full name *</span><Input value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value }))} placeholder="Your full name" /></label><label className="space-y-2"><span className="text-sm font-medium">Email</span><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={form.email} readOnly className="pl-9" /></div></label></div><div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Phone and location are optional. Email comes directly from the signed-in account.</div><Button className="w-full" size="lg" disabled={saving || !complete} onClick={saveProfile}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}Create Profile & Continue<ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card></div>;
}
