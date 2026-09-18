import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock3, Megaphone, RefreshCw, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/crm/CrmUI";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Notice={id:string;title:string;description:string|null;status:string;priority:string;created_at:string;due_date:string|null};

export default function CrmNotificationsWorkspace(){
 const [items,setItems]=useState<Notice[]>([]);
 const [loading,setLoading]=useState(true);
 const [filter,setFilter]=useState<"all"|"unread"|"announcements">("all");

 const load=useCallback(async()=>{
  setLoading(true);
  const {data,error}=await supabase.from("crm_workspace_items").select("id,title,description,status,priority,created_at,due_date").in("module",["notifications","announcements"]).order("created_at",{ascending:false}).limit(100);
  if(error) toast({title:"Notifications could not load",description:error.message,variant:"destructive"}); else setItems((data||[]) as Notice[]);
  setLoading(false);
 },[]);
 useEffect(()=>{void load(); const t=window.setInterval(()=>void load(),30000); return()=>window.clearInterval(t)},[load]);

 const visible=useMemo(()=>items.filter(x=>filter==="all" || (filter==="unread" && !["read","completed","closed","done"].includes(x.status)) || (filter==="announcements" && (x.title.toLowerCase().includes("announcement") || x.priority==="high"))),[items,filter]);
 const announcementCount=items.filter(x=>x.title.toLowerCase().includes("announcement")||x.priority==="high").length;
 const markRead=async(id:string)=>{
  const {error}=await supabase.from("crm_workspace_items").update({status:"read"}).eq("id",id);
  if(error) toast({title:"Could not update notification",description:error.message,variant:"destructive"}); else setItems(v=>v.map(x=>x.id===id?{...x,status:"read"}:x));
 };
 const unread=items.filter(x=>!["read","completed","closed","done"].includes(x.status)).length;
 return <div className="space-y-5">
  <GlassCard className="p-6">
   <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div><div className="flex items-center gap-2 text-primary"><Bell size={21}/><span className="text-xs font-bold uppercase tracking-wider">Company Notifications</span></div><h1 className="text-2xl font-black mt-1">Notifications Center</h1><p className="text-sm text-muted-foreground mt-1">Live company alerts, HR announcements, follow-ups and operational updates.</p></div>
    <Button variant="outline" onClick={()=>void load()}><RefreshCw size={16} className="mr-2"/>Refresh</Button>
   </div>
  </GlassCard>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
   <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-black">{items.length}</p></GlassCard>
   <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Unread</p><p className="text-2xl font-black">{unread}</p></GlassCard>
   <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Announcements</p><p className="text-2xl font-black">{announcementCount}</p></GlassCard>
   <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Auto Refresh</p><p className="text-2xl font-black">30s</p></GlassCard>
  </div>
  <div className="flex flex-wrap gap-2">
   {(["all","unread","announcements"] as const).map(x=><Button key={x} variant={filter===x?"default":"outline"} onClick={()=>setFilter(x)}>{x==="all"?"All":x==="unread"?"Unread":"Announcements"}</Button>)}
  </div>
  <GlassCard className="p-5">
   {loading?<p className="text-sm text-muted-foreground">Loading notifications…</p>:visible.length===0?<div className="py-12 text-center"><CheckCircle2 className="mx-auto text-primary" size={32}/><p className="font-bold mt-3">You’re all caught up</p><p className="text-sm text-muted-foreground">No notifications in this view.</p></div>:
   <div className="space-y-3">{visible.map(n=><div key={n.id} className="rounded-2xl border p-4 hover:bg-muted/20 transition">
    <div className="flex gap-3">
     <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{n.title.toLowerCase().includes("announcement")?<Megaphone size={19}/>:<Bell size={19}/>}</div>
     <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-black">{n.title}</p><span className="text-[10px] rounded-full border px-2 py-0.5 uppercase">{n.status}</span><span className="text-[10px] rounded-full border px-2 py-0.5 uppercase">{n.priority}</span></div>
      {n.description&&<p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{n.description}</p>}
      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock3 size={12}/>{new Date(n.created_at).toLocaleString()}</p>
     </div>
     {!["read","completed","closed","done"].includes(n.status)&&<Button size="sm" variant="outline" onClick={()=>void markRead(n.id)}><CheckCircle2 size={14} className="mr-1"/>Mark read</Button>}
    </div>
   </div>)}</div>}
  </GlassCard>
 </div>;
}