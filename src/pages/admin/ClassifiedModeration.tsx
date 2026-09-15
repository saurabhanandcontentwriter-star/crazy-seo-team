import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, Trash2, ExternalLink, Search, RefreshCw, Loader2, UserRound } from "lucide-react";

type Listing = { id:string; title:string; description:string; category:string; city?:string; state?:string; seller_name?:string; seller_email?:string; seller_phone?:string; status:string; created_at:string; is_verified?:boolean };

const statuses = ["all","pending","active","rejected"];

export default function ClassifiedModeration(){
  const [rows,setRows]=useState<Listing[]>([]); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState<string|null>(null); const [q,setQ]=useState(""); const [status,setStatus]=useState("pending");
  const load=async()=>{setLoading(true); const {data,error}=await (supabase as any).from("classified_listings").select("*").order("created_at",{ascending:false}); if(error){toast.error("Could not load classifieds",{description:error.message});setRows([])}else setRows(data||[]);setLoading(false)};
  useEffect(()=>{load()},[]);
  const act=async(id:string,next:string)=>{setBusy(id); const {error}=await (supabase as any).from("classified_listings").update({status:next,updated_at:new Date().toISOString()}).eq("id",id); if(error) toast.error(`${next} failed`,{description:error.message}); else {toast.success(next==="active"?"Listing accepted and published":next==="rejected"?"Listing rejected":"Listing deleted"); await load()} setBusy(null)};
  const remove=async(id:string)=>{if(!confirm("Permanently delete this listing and its media?"))return;setBusy(id);const {error}=await (supabase as any).from("classified_listings").delete().eq("id",id);if(error)toast.error("Delete failed",{description:error.message});else{toast.success("Listing permanently deleted");await load()}setBusy(null)};
  const filtered=useMemo(()=>rows.filter(r=>(status==="all"||r.status===status)&&(!q.trim()||`${r.title} ${r.description} ${r.seller_name} ${r.city} ${r.state}`.toLowerCase().includes(q.toLowerCase()))),[rows,status,q]);
  const count=(s:string)=>rows.filter(r=>r.status===s).length;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-black">Classified Moderation</h1><p className="text-sm text-muted-foreground">Review every listing before it appears publicly.</p></div><Button variant="outline" className="rounded-2xl" onClick={load}><RefreshCw className="mr-2 h-4 w-4"/>Refresh</Button></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[["pending","Pending"],["active","Published"],["rejected","Rejected"],["all","All Posts"]].map(([s,label])=><button key={s} onClick={()=>setStatus(s)} className={`rounded-2xl border p-4 text-left transition ${status===s?"border-primary bg-primary/5":"bg-card"}`}><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-black">{s==="all"?rows.length:count(s)}</div></button>)}</div>
    <div className="relative max-w-lg"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><Input className="pl-9 rounded-2xl" placeholder="Search title, seller, city..." value={q} onChange={e=>setQ(e.target.value)}/></div>
    {loading?<div className="flex justify-center py-16"><Loader2 className="animate-spin"/></div>:<div className="space-y-3">{filtered.map(r=><div key={r.id} className="rounded-3xl border bg-card/80 p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-lg">{r.title}</h2><Badge variant={r.status==="active"?"default":"outline"}>{r.status}</Badge></div><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p><div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5"/>{r.seller_name||"Marketplace Member"}</span><span>{r.seller_email||"No email"}</span><span>{r.city||"India"}{r.state?`, ${r.state}`:""}</span><span>{new Date(r.created_at).toLocaleString()}</span></div></div><div className="flex flex-wrap gap-2">{r.status!=="active"&&<Button size="sm" className="rounded-xl" disabled={busy===r.id} onClick={()=>act(r.id,"active")}><Check className="mr-1 h-4 w-4"/>Accept</Button>}{r.status!=="rejected"&&<Button size="sm" variant="outline" className="rounded-xl" disabled={busy===r.id} onClick={()=>act(r.id,"rejected")}><X className="mr-1 h-4 w-4"/>Reject</Button>}<Button size="sm" variant="outline" className="rounded-xl text-destructive" disabled={busy===r.id} onClick={()=>remove(r.id)}><Trash2 className="mr-1 h-4 w-4"/>Delete</Button><Button size="sm" variant="ghost" className="rounded-xl" asChild><a href={`/listing/${r.id}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4"/></a></Button></div></div></div>)}{filtered.length===0&&<div className="rounded-3xl border p-12 text-center text-muted-foreground">No listings in this queue.</div>}</div>}
  </div>
}
