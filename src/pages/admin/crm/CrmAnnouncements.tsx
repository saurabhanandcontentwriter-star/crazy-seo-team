import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Megaphone, Pencil, Plus, RefreshCw, Send, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/crm/CrmUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Announcement = {
  id:string; title:string; description:string|null; status:string; priority:string; due_date:string|null; created_at:string;
};

export default function CrmAnnouncements(){
  const [items,setItems]=useState<Announcement[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [status,setStatus]=useState("published");
  const [priority,setPriority]=useState("medium");
  const [date,setDate]=useState("");
  const [filter,setFilter]=useState("all");
  const [editing,setEditing]=useState<string|null>(null);

  const load=async()=>{
    setLoading(true);
    const {data,error}=await supabase.from("crm_workspace_items").select("id,title,description,status,priority,due_date,created_at").eq("module","announcements").order("created_at",{ascending:false});
    if(error) toast({title:"Announcements load failed",description:error.message,variant:"destructive"});
    else setItems((data||[]) as Announcement[]);
    setLoading(false);
  };
  useEffect(()=>{void load()},[]);

  const stats=useMemo(()=>({
    total:items.length,
    published:items.filter(x=>x.status==="published").length,
    scheduled:items.filter(x=>x.status==="scheduled").length,
    drafts:items.filter(x=>x.status==="draft").length,
  }),[items]);

  const visible=useMemo(()=>filter==="all"?items:items.filter(x=>x.status===filter),[items,filter]);

  const reset=()=>{setTitle("");setDescription("");setStatus("published");setPriority("medium");setDate("");setEditing(null);};

  const save=async()=>{
    if(!title.trim()||!description.trim()) return toast({title:"Title and message required",variant:"destructive"});
    setBusy(true);
    const {data:u}=await supabase.auth.getUser();
    if(!u.user){toast({title:"Login required",variant:"destructive"});setBusy(false);return;}
    const payload={title:title.trim(),description:description.trim(),status,priority,due_date:date||null,updated_at:new Date().toISOString()};
    const query=editing
      ? supabase.from("crm_workspace_items").update(payload).eq("id",editing)
      : supabase.from("crm_workspace_items").insert({...payload,module:"announcements",created_by:u.user.id});
    const {error}=await query;
    if(error) toast({title:"Could not save announcement",description:error.message,variant:"destructive"});
    else {toast({title:editing?"Announcement updated":"Announcement published"});reset();await load();}
    setBusy(false);
  };

  const edit=(x:Announcement)=>{
    setEditing(x.id);setTitle(x.title);setDescription(x.description||"");setStatus(x.status);setPriority(x.priority);setDate(x.due_date||"");
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const remove=async(id:string)=>{
    const {error}=await supabase.from("crm_workspace_items").delete().eq("id",id);
    if(error) toast({title:"Delete failed",description:error.message,variant:"destructive"});
    else {setItems(v=>v.filter(x=>x.id!==id));toast({title:"Announcement deleted"});}
  };

  return <div className="space-y-5">
    <GlassCard className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Megaphone size={27}/></div>
          <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Company Communications</p><h2 className="text-2xl font-black mt-1">Announcements Workspace</h2><p className="text-sm text-muted-foreground mt-1">Create, schedule, edit and manage company-wide announcements from one dedicated workspace.</p></div>
        </div>
        <Button variant="outline" className="rounded-2xl" onClick={load}><RefreshCw size={14} className="mr-2"/>Refresh</Button>
      </div>
    </GlassCard>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-black mt-1">{stats.total}</p><p className="text-[11px] text-muted-foreground">announcements</p></GlassCard>
      <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Published</p><p className="text-2xl font-black mt-1">{stats.published}</p><p className="text-[11px] text-muted-foreground">live updates</p></GlassCard>
      <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Scheduled</p><p className="text-2xl font-black mt-1">{stats.scheduled}</p><p className="text-[11px] text-muted-foreground">upcoming</p></GlassCard>
      <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Drafts</p><p className="text-2xl font-black mt-1">{stats.drafts}</p><p className="text-[11px] text-muted-foreground">not published</p></GlassCard>
    </div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <GlassCard className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4"><div><p className="font-black text-lg">{editing?"Edit Announcement":"Create Announcement"}</p><p className="text-xs text-muted-foreground">Publish company news, HR updates, project updates or holiday notices.</p></div>{editing&&<Button variant="ghost" className="rounded-xl" onClick={reset}>Cancel edit</Button>}</div>
        <div className="space-y-3">
          <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Announcement title *" className="rounded-2xl"/>
          <Textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Write the full announcement message..." className="rounded-2xl min-h-40"/>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="rounded-2xl"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select>
            <Select value={priority} onValueChange={setPriority}><SelectTrigger className="rounded-2xl"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="low">Low priority</SelectItem><SelectItem value="medium">Medium priority</SelectItem><SelectItem value="high">High priority</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select>
            <div className="relative"><CalendarDays size={15} className="absolute left-3 top-3.5 text-muted-foreground"/><Input value={date} onChange={e=>setDate(e.target.value)} type="date" className="rounded-2xl pl-9"/></div>
          </div>
          <div className="flex gap-2"><Button onClick={save} disabled={busy} className="rounded-2xl"><Send size={15} className="mr-2"/>{busy?"Saving…":editing?"Update Announcement":"Publish Announcement"}</Button>{!editing&&<Button variant="outline" className="rounded-2xl" onClick={()=>{setStatus("draft");save()}} disabled={busy}><Plus size={15} className="mr-2"/>Save Draft</Button>}</div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <p className="font-black text-lg">Quick categories</p><p className="text-xs text-muted-foreground mt-1 mb-4">Use a clear title so employees know what the update is about.</p>
        <div className="space-y-2">{["Company News","HR Update","Project Update","Holiday Notice","Urgent Notice"].map(x=><button key={x} type="button" onClick={()=>setTitle(x+" — ")} className="w-full rounded-2xl border p-3 text-left hover:bg-muted/40 transition"><p className="font-semibold text-sm">{x}</p><p className="text-[11px] text-muted-foreground">Start an announcement</p></button>)}</div>
      </GlassCard>
    </div>

    <GlassCard className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"><div><p className="font-black text-lg">Announcement Feed</p><p className="text-xs text-muted-foreground">Manage all company communications.</p></div><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-full sm:w-44 rounded-2xl"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All announcements</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="draft">Drafts</SelectItem></SelectContent></Select></div>
      {loading?<p className="text-sm text-muted-foreground py-8 text-center">Loading announcements…</p>:visible.length===0?<div className="rounded-2xl border border-dashed p-10 text-center"><Megaphone className="mx-auto text-muted-foreground" size={30}/><p className="font-semibold mt-2">No announcements here</p><p className="text-xs text-muted-foreground mt-1">Create the first announcement above.</p></div>:<div className="space-y-3">{visible.map(x=><div key={x.id} className="rounded-2xl border p-4 hover:bg-muted/20 transition"><div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{x.title}</h3><span className="text-[10px] rounded-full bg-primary/10 px-2 py-1">{x.status}</span><span className="text-[10px] rounded-full bg-muted px-2 py-1">{x.priority}</span></div>{x.description&&<p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{x.description}</p>}<div className="flex flex-wrap gap-4 mt-3 text-[11px] text-muted-foreground">{x.due_date&&<span className="inline-flex items-center gap-1"><CalendarDays size={12}/>{x.due_date}</span>}<span className="inline-flex items-center gap-1">{x.status==="scheduled"?<Clock3 size={12}/>:<CheckCircle2 size={12}/>} {new Date(x.created_at).toLocaleString("en-IN")}</span></div></div><div className="flex gap-2 shrink-0"><Button size="sm" variant="outline" className="rounded-xl" onClick={()=>edit(x)}><Pencil size={13} className="mr-1"/>Edit</Button><Button size="sm" variant="ghost" className="rounded-xl text-destructive" onClick={()=>remove(x.id)}><Trash2 size={14}/></Button></div></div></div>)}</div>}
    </GlassCard>
  </div>;
}
