import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, UserRound, ShieldCheck, ArrowRight, Loader2, Camera, Phone } from "lucide-react";
import { toast } from "sonner";

const PROFILE_KEY = "cst_classified_profile";

type Profile = { id: string; name: string; email: string; phone: string; photoUrl: string };

function makeProfileId(userId: string) {
  const compact = userId.replace(/-/g, "").toUpperCase();
  return `CST-${compact.slice(0, 8)}`;
}

export default function ClassifiedProfileGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", photoUrl: "" });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) { setLoading(false); return; }
      setUserId(data.user.id);
      const metadata = (data.user.user_metadata || {}) as Record<string, any>;
      let saved: Partial<Profile> | null = null;
      try { saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch {}
      setForm({
        name: saved?.name || metadata.classified_profile?.name || metadata.full_name || metadata.name || "",
        email: saved?.email || metadata.classified_profile?.email || data.user.email || "",
        phone: saved?.phone || metadata.classified_profile?.phone || data.user.phone || "",
        photoUrl: saved?.photoUrl || metadata.classified_profile?.photoUrl || "",
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const profileId = useMemo(() => userId ? makeProfileId(userId) : "CST-PROFILE", [userId]);
  const complete = Boolean(form.name.trim() && form.phone.trim() && form.photoUrl);

  const uploadPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Profile photo must be 5MB or smaller.");
    setSaving(true);
    try {
      const path = `classified-profiles/${userId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error } = await supabase.storage.from("blog-images").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setForm(x => ({ ...x, photoUrl: data.publicUrl }));
      toast.success("Profile photo uploaded");
    } catch (error: any) {
      toast.error(error?.message || "Could not upload profile photo");
    } finally { setSaving(false); }
  };

  const saveProfile = async () => {
    if (!userId) return navigate(`/admin/login?returnTo=${encodeURIComponent("/post-ad")}`);
    if (!form.name.trim() || !form.phone.trim() || !form.photoUrl) return toast.error("Name, phone number and profile photo are required before posting.");
    setSaving(true);
    try {
      const profile: Profile = { id: profileId, name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), photoUrl: form.photoUrl };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      const { error } = await supabase.from("classified_profiles").upsert({
        user_id: userId, name: profile.name, email: profile.email || null, phone: profile.phone, profile_photo_url: profile.photoUrl, updated_at: new Date().toISOString()
      });
      if (error) throw error;
      await supabase.auth.updateUser({ data: { classified_profile: profile } });
      toast.success("Profile saved. You can now publish classified posts.");
    } catch (error: any) {
      toast.error(error?.message || "Could not save your classified profile");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="container mx-auto flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin" /></div>;

  if (!userId) return <div className="container mx-auto px-4 py-16"><Card className="mx-auto max-w-xl"><CardHeader><Badge className="w-fit">Classified Marketplace</Badge><CardTitle className="text-2xl">Login required to create a seller profile</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-muted-foreground">Create your seller profile first. A name, phone number and profile photo are required before a classified post can be published.</p><Button className="w-full" onClick={() => navigate(`/admin/login?returnTo=${encodeURIComponent("/post-ad")}`)}>Login to continue<ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card></div>;

  let savedProfile: Partial<Profile> | null = null;
  try { savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch {}
  if (savedProfile?.id === profileId && savedProfile?.name && savedProfile?.phone && savedProfile?.photoUrl) return <>{children}</>;

  return <div className="container mx-auto px-4 py-10 md:py-16"><Card className="mx-auto max-w-2xl overflow-hidden rounded-3xl shadow-xl"><CardHeader className="border-b bg-gradient-to-b from-primary/10 to-background"><Badge className="w-fit">Step 1 of 2</Badge><CardTitle className="text-2xl md:text-3xl">Create your Classified Profile</CardTitle><p className="text-sm text-muted-foreground">Profile name and photo are shown on your classified posts. Phone number is required so buyers can contact you.</p></CardHeader><CardContent className="space-y-5 p-5 md:p-7"><div className="grid gap-4 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-3"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary"/><div><p className="text-xs text-muted-foreground">Profile ID</p><p className="font-bold tracking-wide">{profileId}</p></div></div><div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-primary"/><div><p className="text-xs text-muted-foreground">Seller</p><p className="font-medium">{form.name || "Your name"}</p></div></div><div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary"/><div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{form.phone || "Required"}</p></div></div></div><div className="grid gap-4 md:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium">Full name *</span><Input value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value }))} placeholder="Your full name" /></label><label className="space-y-2"><span className="text-sm font-medium">Phone number *</span><Input value={form.phone} onChange={e => setForm(x => ({ ...x, phone: e.target.value }))} placeholder="10-digit phone number" inputMode="tel" /></label></div><label className="space-y-2 block"><span className="text-sm font-medium">Email</span><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={form.email} readOnly className="pl-9" /></div></label><div className="rounded-2xl border p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border bg-muted flex items-center justify-center">{form.photoUrl ? <img src={form.photoUrl} alt="Seller profile" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-muted-foreground" />}</div><div className="space-y-2"><p className="font-semibold">Profile photo *</p><p className="text-sm text-muted-foreground">Upload a clear photo. Without it, the profile cannot be completed and the post cannot be published.</p><label><Button type="button" variant="outline" asChild disabled={saving}><span><Camera className="mr-2 h-4 w-4" />{form.photoUrl ? "Change photo" : "Upload profile photo"}</span></Button><input className="hidden" type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} /></label></div></div></div><Button className="w-full" size="lg" disabled={saving || !complete} onClick={saveProfile}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}Save Profile & Continue<ArrowRight className="ml-2 h-4 w-4" /></Button></CardContent></Card></div>;
}
