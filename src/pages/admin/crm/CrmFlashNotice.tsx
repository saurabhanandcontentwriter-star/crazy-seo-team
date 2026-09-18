import { useEffect,useState } from "react";
import { Megaphone, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
export default function CrmFlashNotice(){
 const [notice,setNotice]=useState<any>(null); const [closed,setClosed]=useState(false);
 const load=async()=>{const {data}=await supabase.from("crm_workspace_items").select("id,title,description,due_date,created_at,priority").eq("module","announcements").eq("status","published").order("created_at",{ascending:false}).limit(1);setNotice(data?.[0]||null)};
 useEffect(()=>{load();const t=setInterval(load,30000);return()=>clearInterval(t)},[]);
 if(!notice||closed)return null;
 return <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-violet-500/10 to-cyan-500/10 p-4 shadow-sm">
  <div className="flex items-start gap-3"><div className="h-9 w-9 shrink-0 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Megaphone size={18}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black uppercase tracking-wider text-primary">HR Notification</span><span className="text-[10px] rounded-full bg-background/70 px-2 py-1">{notice.created_at.slice(0,10)}</span></div><p className="font-black mt-1">{notice.title}</p>{notice.description&&<p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{notice.description}</p>}</div><button onClick={()=>setClosed(true)} className="rounded-lg p-1 text-muted-foreground hover:bg-background/70" aria-label="Close notification"><X size={16}/></button></div>
 </div>
}