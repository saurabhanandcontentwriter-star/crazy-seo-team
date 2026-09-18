import { useEffect, useState } from "react";
import { Settings, ShieldCheck, User, Bell, Palette, Database, LogOut, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/crm/CrmUI";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
export default function CrmSettingsWorkspace(){
 const [email,setEmail]=useState(""); const [loading,setLoading]=useState(true);
 useEffect(()=>{supabase.auth.getUser().then(({data})=>setEmail(data.user?.email||"")).finally(()=>setLoading(false))},[]);
 const signOut=async()=>{await supabase.auth.signOut();window.location.href="/admin/crm/login"};
 return <div className="space-y-5">
  <GlassCard className="p-6"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Settings size={24}/></div><div><h2 className="text-2xl font-black">CRM Settings</h2><p className="text-sm text-muted-foreground mt-1">Manage your workspace, account, notifications and security.</p></div></div></GlassCard>
  <div className="grid gap-4 md:grid-cols-2">
   <GlassCard className="p-5"><div className="flex items-center gap-3"><User className="text-primary"/><div><p className="font-black">Account</p><p className="text-xs text-muted-foreground">{loading?"Loading…":email||"Signed-in CRM account"}</p></div></div><div className="mt-4 flex gap-2"><Link to="/admin/crm/team"><Button variant="outline" className="rounded-xl">Team Workspace</Button></Link><Button variant="outline" className="rounded-xl" onClick={signOut}><LogOut size={14} className="mr-2"/>Sign Out</Button></div></GlassCard>
   <GlassCard className="p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-primary"/><div><p className="font-black">Roles & Permissions</p><p className="text-xs text-muted-foreground">Access is controlled by CRM roles and admin permissions.</p></div></div><Link to="/admin/users"><Button variant="outline" className="rounded-xl mt-4">Open User Management <ExternalLink size={13} className="ml-2"/></Button></Link></GlassCard>
   <GlassCard className="p-5"><div className="flex items-center gap-3"><Bell className="text-primary"/><div><p className="font-black">Notifications</p><p className="text-xs text-muted-foreground">Announcements and HR notices appear in the CRM notification area.</p></div></div><Link to="/admin/crm/notifications"><Button variant="outline" className="rounded-xl mt-4">Notification Center</Button></Link></GlassCard>
   <GlassCard className="p-5"><div className="flex items-center gap-3"><Palette className="text-primary"/><div><p className="font-black">Appearance</p><p className="text-xs text-muted-foreground">The CRM follows the website theme and responsive layout.</p></div></div><p className="text-xs text-muted-foreground mt-4">No destructive design changes are made from this panel.</p></GlassCard>
   <GlassCard className="p-5 md:col-span-2"><div className="flex items-center gap-3"><Database className="text-primary"/><div><p className="font-black">Workspace Status</p><p className="text-xs text-muted-foreground">Supabase-backed CRM workspace with live team, HR, sales and task data.</p></div></div></GlassCard>
  </div>
 </div>
}