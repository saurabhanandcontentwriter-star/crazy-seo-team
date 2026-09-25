import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { firebaseAuth } from "@/integrations/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Bell, Lock, ShieldCheck, UserCircle2, Moon, Globe2, LogOut, ChevronRight, Mail, Eye, KeyRound, Link2, Copy, Save, Loader2 } from "lucide-react";

type SettingKey = "privateProfile" | "activityStatus" | "emailNotifications" | "pushNotifications";

export default function IdeasSettings(){
  const nav=useNavigate();
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [loading,setLoading]=useState(true);
  const [dark,setDark]=useState(false);
  const [language,setLanguage]=useState("English");
  const [region,setRegion]=useState("Global");
  const [userId,setUserId]=useState("");
  const [profileSlug,setProfileSlug]=useState("");
  const [editingUrl,setEditingUrl]=useState(false);
  const [savingUrl,setSavingUrl]=useState(false);
  const [profileUpdatedAt,setProfileUpdatedAt]=useState<string|null>(null);
  const [settings,setSettings]=useState<Record<SettingKey,boolean>>({
    privateProfile:false,activityStatus:true,emailNotifications:true,pushNotifications:true
  });

  useEffect(()=>{
    (async()=>{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){nav("/anvya/login",{replace:true});return}
      setEmail(user.email||"");
      setUserId(user.id);
      const {data:profile}=await supabase.from("idea_profiles").select("profile_slug,public_id,updated_at").eq("user_id",user.id).maybeSingle();
      setProfileSlug(profile?.profile_slug||profile?.public_id||"");
      setProfileUpdatedAt(profile?.updated_at||null);
      setName(user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split("@")[0]||"ANVYA Member");
      const saved=localStorage.getItem("anvya-settings");
      if(saved)try{setSettings(v=>({...v,...JSON.parse(saved)}))}catch{}
      const theme=localStorage.getItem("ideas-theme")||"system";
      const isDark=theme==="dark"||(theme==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDark(isDark);
      setLanguage(localStorage.getItem("ideas-language")||"English");
      setRegion(localStorage.getItem("ideas-region")||"Global");
      setLoading(false);
    })();
  },[nav]);

  const update=(key:SettingKey,value:boolean)=>{
    setSettings(v=>{const next={...v,[key]:value};localStorage.setItem("anvya-settings",JSON.stringify(next));return next});
    toast.success("Setting updated.");
  };
  const setTheme=(value:boolean)=>{
    const mode=value?"dark":"light";
    localStorage.setItem("ideas-theme",mode);
    document.documentElement.classList.toggle("dark",value);
    document.documentElement.style.colorScheme=value?"dark":"light";
    setDark(value);
  };
  const saveProfileUrl=async()=>{
    const slug=profileSlug.trim().toLowerCase().replace(/\\s+/g,"-").replace(/[^a-z0-9-]/g,"").replace(/^-+|-+$/g,"");
    if(slug.length<3){toast.error("Profile URL must be at least 3 characters.");return}
    setSavingUrl(true);
    try{
      const {data:existing,error:checkError}=await supabase.from("idea_profiles").select("user_id").eq("profile_slug",slug).neq("user_id",userId).maybeSingle();
      if(checkError)throw checkError;
      if(existing?.user_id){toast.error("This profile URL is already taken.");return}
      const {error}=await supabase.from("idea_profiles").update({profile_slug:slug,updated_at:new Date().toISOString()}).eq("user_id",userId);
      if(error)throw error;
      setProfileSlug(slug);setEditingUrl(false);toast.success("Profile URL updated.");
    }catch(e:any){toast.error(e?.message||"Could not update profile URL")}finally{setSavingUrl(false)}
  };
  const profileUrl=window.location.origin+"/anvya/profile/"+profileSlug;
  const copyProfileUrl=async()=>{try{await navigator.clipboard.writeText(profileUrl);toast.success("Profile URL copied.");}catch{toast.error("Could not copy the URL.")}};

  const logout=async()=>{const {error}=await supabase.auth.signOut();await firebaseSignOut(firebaseAuth).catch(()=>{});if(error){toast.error(error.message);return}sessionStorage.removeItem("ideas_direct_profile");sessionStorage.removeItem("ideas_congratulations");toast.success("Logged out successfully.");nav("/anvya/login",{replace:true})};

  if(loading)return <div className="min-h-screen grid place-items-center"><div className="animate-spin rounded-full border-2 border-primary border-t-transparent size-8"/></div>;

  const rows=[
    ["Privacy","Control who can see your profile and activity.",Eye,"privacy"],
    ["Security","Login, session and account protection.",ShieldCheck,"security"],
    ["Notifications","Email and push notification preferences.",Bell,"notifications"],
  ] as const;

  return <div className="min-h-screen bg-[#f8f9fc] dark:bg-background">
    <div className="mx-auto max-w-5xl px-4 py-5 md:px-7 md:py-8">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={()=>nav("/anvya")}><ArrowLeft className="mr-2 size-4"/>Home</Button>
        <Button variant="outline" onClick={()=>nav("/anvya/profile/me")}><UserCircle2 className="mr-2 size-4"/>Profile</Button>
      </div>
      <div className="mt-4 grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit rounded-3xl"><CardContent className="p-3">
          <div className="px-3 py-4"><p className="text-xl font-black">Settings</p><p className="mt-1 text-xs text-muted-foreground">Manage your ANVYA account.</p></div>
          {["Account","Profile","Privacy","Security","Notifications","Appearance"].map((x,i)=><button key={x} onClick={()=>document.getElementById("settings-"+x.toLowerCase())?.scrollIntoView({behavior:"smooth"})} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-muted"><span>{x}</span>{i===0?<Badge variant="secondary">Gmail</Badge>:x==="Profile"?<Badge variant="secondary">Edit</Badge>:<ChevronRight className="size-4 text-muted-foreground"/>}</button>)}
        </CardContent></Card>
        <div className="space-y-5">
          <Card id="settings-account" className="rounded-3xl"><CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-3"><div className="rounded-2xl bg-primary/10 p-3"><Mail className="text-primary"/></div><div><h1 className="text-xl font-black">Account</h1><p className="text-sm text-muted-foreground">Your ANVYA identity is connected to Google/Gmail.</p></div></div>
            <div className="mt-5 rounded-2xl border bg-muted/20 p-4"><p className="text-xs font-bold uppercase text-muted-foreground">Signed in as</p><p className="mt-1 font-semibold break-all">{name}</p><p className="text-sm text-muted-foreground break-all">{email}</p></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><Button variant="outline" onClick={()=>nav("/anvya/profile/me")}><UserCircle2 className="mr-2 size-4"/>Edit Profile</Button><Button variant="outline" onClick={logout}><LogOut className="mr-2 size-4"/>Log out</Button></div>
            <div id="settings-profile" className="mt-4 rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3"><UserCircle2 className="size-5 text-primary"/><div><p className="font-semibold">Profile</p><p className="text-xs text-muted-foreground">Update your name, bio, photo, cover, work, education and social links.</p></div></div>
                <Badge variant="secondary">Profile updated</Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">{profileUpdatedAt ? "Last updated " + new Date(profileUpdatedAt).toLocaleString() : "Profile information is ready to update."}</p>
                <Button size="sm" onClick={()=>nav("/anvya/profile/me")}><UserCircle2 className="mr-2 size-4"/>Edit Profile</Button>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border p-4">
              <div className="flex items-center gap-3"><Link2 className="size-5 text-primary"/><div><p className="font-semibold">Profile URL</p><p className="text-xs text-muted-foreground">Change the public username URL, like LinkedIn or Instagram.</p></div></div>
              {!editingUrl?<div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1 rounded-xl bg-muted/40 px-3 py-2 text-sm font-medium break-all">{profileUrl}</div>
                <div className="flex gap-2"><Button variant="outline" size="sm" onClick={copyProfileUrl}><Copy className="mr-2 size-4"/>Copy</Button><Button size="sm" onClick={()=>setEditingUrl(true)}><Link2 className="mr-2 size-4"/>Edit URL</Button></div>
              </div>:<div className="mt-3">
                <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">{window.location.origin}/anvya/profile/</span><Input value={profileSlug} onChange={e=>setProfileSlug(e.target.value.toLowerCase().replace(/\\s+/g,"-").replace(/[^a-z0-9-]/g,""))} placeholder="your-username"/></div>
                <p className="mt-2 text-xs text-muted-foreground">Use 3+ characters: letters, numbers and hyphens only.</p>
                <div className="mt-3 flex gap-2"><Button onClick={saveProfileUrl} disabled={savingUrl}>{savingUrl?<Loader2 className="mr-2 size-4 animate-spin"/>:<Save className="mr-2 size-4"/>}Save URL</Button><Button variant="outline" onClick={()=>setEditingUrl(false)}>Cancel</Button></div>
              </div>}
            </div>
          </CardContent></Card>

          <Card id="settings-privacy" className="rounded-3xl"><CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-3"><Eye className="text-primary"/><div><h2 className="font-black">Privacy</h2><p className="text-sm text-muted-foreground">Instagram/LinkedIn-style visibility controls.</p></div></div>
            <div className="mt-5 space-y-1">
              <div className="flex items-center justify-between gap-4 rounded-2xl border p-4"><div><Label>Private profile</Label><p className="text-xs text-muted-foreground">Limit profile visibility to approved connections.</p></div><Switch checked={settings.privateProfile} onCheckedChange={v=>update("privateProfile",v)}/></div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border p-4"><div><Label>Activity status</Label><p className="text-xs text-muted-foreground">Show when you are active to connections.</p></div><Switch checked={settings.activityStatus} onCheckedChange={v=>update("activityStatus",v)}/></div>
            </div>
          </CardContent></Card>

          <Card id="settings-security" className="rounded-3xl"><CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-3"><KeyRound className="text-primary"/><div><h2 className="font-black">Security & Login</h2><p className="text-sm text-muted-foreground">Google/Gmail remains the only ANVYA sign-in method.</p></div></div>
            <div className="mt-5 rounded-2xl border p-4"><div className="flex items-center gap-3"><Lock className="size-5"/><div><p className="font-semibold">Google account authentication</p><p className="text-xs text-muted-foreground">No separate ANVYA password or account-creation form is required.</p></div><Badge className="ml-auto">Active</Badge></div></div>
          </CardContent></Card>

          <Card id="settings-notifications" className="rounded-3xl"><CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-3"><Bell className="text-primary"/><div><h2 className="font-black">Notifications</h2><p className="text-sm text-muted-foreground">Choose what ANVYA can notify you about.</p></div></div>
            <div className="mt-5 space-y-1">
              <div className="flex items-center justify-between gap-4 rounded-2xl border p-4"><div><Label>Email notifications</Label><p className="text-xs text-muted-foreground">Updates and account activity by email.</p></div><Switch checked={settings.emailNotifications} onCheckedChange={v=>update("emailNotifications",v)}/></div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border p-4"><div><Label>Push notifications</Label><p className="text-xs text-muted-foreground">Alerts for messages, follows and activity.</p></div><Switch checked={settings.pushNotifications} onCheckedChange={v=>update("pushNotifications",v)}/></div>
            </div>
          </CardContent></Card>

          <Card id="settings-appearance" className="rounded-3xl"><CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-3"><Moon className="text-primary"/><div><h2 className="font-black">Appearance & Region</h2><p className="text-sm text-muted-foreground">Personalize your ANVYA experience.</p></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border p-4"><Label>Dark mode</Label><div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{dark?"On":"Off"}</span><Switch checked={dark} onCheckedChange={setTheme}/></div></div>
              <label className="rounded-2xl border p-4"><span className="flex items-center gap-2 font-semibold"><Globe2 className="size-4"/>Language</span><select className="mt-3 w-full rounded-lg border bg-background p-2 text-sm" value={language} onChange={e=>{setLanguage(e.target.value);localStorage.setItem("ideas-language",e.target.value);toast.success("Language preference saved.")}}><option>English</option><option>Hindi</option><option>Hinglish</option><option>Bengali</option><option>Urdu</option></select></label>
              <label className="rounded-2xl border p-4"><span className="flex items-center gap-2 font-semibold"><Globe2 className="size-4"/>Region</span><select className="mt-3 w-full rounded-lg border bg-background p-2 text-sm" value={region} onChange={e=>{setRegion(e.target.value);localStorage.setItem("ideas-region",e.target.value);toast.success("Region saved.")}}><option>Global</option><option>India</option><option>Asia</option><option>Europe</option><option>North America</option><option>Middle East</option><option>Africa</option><option>Oceania</option></select></label>
            </div>
          </CardContent></Card>
        </div>
      </div>
    </div>
  </div>;
}
