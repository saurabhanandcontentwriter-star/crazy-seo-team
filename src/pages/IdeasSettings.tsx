import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Bell, Lock, ShieldCheck, UserCircle2, Moon, Globe2, LogOut, ChevronRight, Mail, Eye, KeyRound } from "lucide-react";

type SettingKey = "privateProfile" | "activityStatus" | "emailNotifications" | "pushNotifications";

export default function IdeasSettings(){
  const nav=useNavigate();
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [loading,setLoading]=useState(true);
  const [dark,setDark]=useState(false);
  const [language,setLanguage]=useState("English");
  const [region,setRegion]=useState("Global");
  const [settings,setSettings]=useState<Record<SettingKey,boolean>>({
    privateProfile:false,activityStatus:true,emailNotifications:true,pushNotifications:true
  });

  useEffect(()=>{
    (async()=>{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){nav("/anvya/login",{replace:true});return}
      setEmail(user.email||"");
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
  const logout=async()=>{await supabase.auth.signOut();sessionStorage.removeItem("ideas_direct_profile");toast.success("Logged out.");nav("/anvya/login",{replace:true})};

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
          {["Account","Privacy","Security","Notifications","Appearance"].map((x,i)=><button key={x} onClick={()=>document.getElementById("settings-"+x.toLowerCase())?.scrollIntoView({behavior:"smooth"})} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-muted"><span>{x}</span>{i===0?<Badge variant="secondary">Gmail</Badge>:<ChevronRight className="size-4 text-muted-foreground"/>}</button>)}
        </CardContent></Card>
        <div className="space-y-5">
          <Card id="settings-account" className="rounded-3xl"><CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-3"><div className="rounded-2xl bg-primary/10 p-3"><Mail className="text-primary"/></div><div><h1 className="text-xl font-black">Account</h1><p className="text-sm text-muted-foreground">Your ANVYA identity is connected to Google/Gmail.</p></div></div>
            <div className="mt-5 rounded-2xl border bg-muted/20 p-4"><p className="text-xs font-bold uppercase text-muted-foreground">Signed in as</p><p className="mt-1 font-semibold break-all">{name}</p><p className="text-sm text-muted-foreground break-all">{email}</p></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><Button variant="outline" onClick={()=>nav("/anvya/profile/me")}><UserCircle2 className="mr-2 size-4"/>Edit Profile</Button><Button variant="outline" onClick={logout}><LogOut className="mr-2 size-4"/>Log out</Button></div>
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
