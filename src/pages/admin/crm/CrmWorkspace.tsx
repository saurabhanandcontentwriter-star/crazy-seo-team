import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, Users, KanbanSquare, CalendarDays, ArrowRight, UserRound, Lightbulb, MessageSquare, RefreshCw, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type CommunityStats={users:number;posts:number;pending:number;approved:number;messages:number;countries:number};
type UserRow={user_id:string;display_name:string|null;first_name:string|null;last_name:string|null;email:string|null;public_id:string|null;avatar_url:string|null;country:string|null;created_at?:string|null};
type PostRow={id:string;title:string;display_name?:string|null;status:string;post_type?:string|null;created_at:string};

export default function CrmWorkspace(){
 const [stats,setStats]=useState<CommunityStats>({users:0,posts:0,pending:0,approved:0,messages:0,countries:0});
 const [users,setUsers]=useState<UserRow[]>([]);
 const [posts,setPosts]=useState<PostRow[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 const load=async()=>{
  setLoading(true); setError("");
  try{
   const [{count:usersCount,error:uErr},{count:postsCount,error:pErr},{count:pendingCount,error:peErr},{count:approvedCount,error:aeErr},{data:profiles,error:prErr}]=await Promise.all([
    supabase.from("idea_profiles").select("user_id",{count:"exact",head:true}),
    supabase.from("idea_posts").select("id",{count:"exact",head:true}),
    supabase.from("idea_posts").select("id",{count:"exact",head:true}).eq("status","pending"),
    supabase.from("idea_posts").select("id",{count:"exact",head:true}).eq("status","approved"),
    supabase.from("idea_profiles").select("user_id,display_name,first_name,last_name,email,public_id,avatar_url,country").order("updated_at",{ascending:false}).limit(6)
   ]);
   if(uErr||pErr||peErr||aeErr||prErr) throw new Error((uErr||pErr||peErr||aeErr||prErr)?.message||"Community data could not load");
   const {data:postRows,error:postsErr}=await supabase.from("idea_posts").select("id,title,status,post_type,created_at").order("created_at",{ascending:false}).limit(6);
   if(postsErr) throw postsErr;
   setUsers((profiles||[]) as UserRow[]);
   setPosts((postRows||[]) as PostRow[]);
   setStats({users:usersCount||0,posts:postsCount||0,pending:pendingCount||0,approved:approvedCount||0,messages:0,countries:new Set((profiles||[]).map((x:any)=>x.country).filter(Boolean)).size});
  }catch(e:any){setError(e?.message||"Could not load ANVYA data");}
  finally{setLoading(false);}
 };
 useEffect(()=>{load()},[]);

 return <div className="space-y-5">
  <GlassCard className="p-6">
   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Customer Relationship Management</p><h2 className="text-2xl font-black mt-1">CRM Workspace</h2><p className="text-sm text-muted-foreground mt-1">Leads, clients, community users, conversations and business activity in one workspace.</p></div>
    <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}><RefreshCw size={14} className={loading?"mr-2 animate-spin":"mr-2"}/>Refresh data</Button>
   </div>
  </GlassCard>

  <GlassCard className="p-5">
   <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">ANVYA 360°</p><h3 className="text-xl font-black mt-1">Community data in CRM</h3><p className="text-xs text-muted-foreground mt-1">Live data from ANVYA is surfaced here for CRM follow-up and management.</p></div><Link to="/admin/crm/ideas" className="inline-flex items-center gap-1 text-xs font-bold text-primary">Open full ANVYA CRM <ExternalLink size={13}/></Link></div>
   {error?<div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">{error}</div>:<div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
    {[["Users",stats.users,Users],["Posts",stats.posts,Lightbulb],["Pending",stats.pending,MessageSquare],["Approved",stats.approved,Lightbulb],["Countries",stats.countries,Users]].map(([label,value,Icon]:any)=><div key={label} className="rounded-2xl border bg-muted/20 p-4"><Icon size={17} className="text-primary"/><p className="text-xs text-muted-foreground mt-2">{label}</p><p className="text-2xl font-black">{loading?"—":value}</p></div>)}
   </div>}
  </GlassCard>

  <div className="grid gap-4 lg:grid-cols-2">
   <GlassCard className="p-5">
    <div className="flex items-center justify-between"><div><h3 className="font-black text-lg">Recent ANVYA users</h3><p className="text-xs text-muted-foreground">Latest community profiles</p></div><Users size={19} className="text-primary"/></div>
    <div className="mt-4 space-y-2">{loading?<p className="text-sm text-muted-foreground">Loading users…</p>:users.length===0?<p className="text-sm text-muted-foreground">No ANVYA users found.</p>:users.map(u=><div key={u.user_id} className="flex items-center gap-3 rounded-2xl border p-3"><img src={u.avatar_url||"/favicon.ico"} alt="" className="h-9 w-9 rounded-xl object-cover bg-muted"/><div className="min-w-0 flex-1"><p className="text-sm font-bold truncate">{[u.first_name,u.last_name].filter(Boolean).join(" ")||u.display_name||"ANVYA User"}</p><p className="text-xs text-muted-foreground truncate">{u.email||u.public_id||"No email"}</p></div>{u.country&&<span className="text-[10px] text-muted-foreground">{u.country}</span>}</div>)}</div>
   </GlassCard>
   <GlassCard className="p-5">
    <div className="flex items-center justify-between"><div><h3 className="font-black text-lg">Recent ANVYA activity</h3><p className="text-xs text-muted-foreground">Latest posts and suggestions</p></div><Lightbulb size={19} className="text-primary"/></div>
    <div className="mt-4 space-y-2">{loading?<p className="text-sm text-muted-foreground">Loading activity…</p>:posts.length===0?<p className="text-sm text-muted-foreground">No posts found.</p>:posts.map(p=><div key={p.id} className="rounded-2xl border p-3"><div className="flex items-center gap-2"><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{p.post_type||"post"}</span><span className="rounded-full border px-2 py-1 text-[10px] uppercase">{p.status}</span></div><p className="mt-2 text-sm font-bold line-clamp-2">{p.title||"Untitled post"}</p><p className="mt-1 text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p></div>)}</div>
   </GlassCard>
  </div>

  <div className="grid gap-4 md:grid-cols-3">{[
   ["Leads","Capture and manage prospects","/admin/crm/leads",Users],
   ["Pipeline","Track deals through stages","/admin/crm/pipeline",KanbanSquare],
   ["Follow-ups & Meetings","Plan customer conversations","/admin/crm/calendar",CalendarDays]
  ].map(([t,d,u,I]:any)=><Link key={t} to={u}><GlassCard className="p-5 hover:border-primary/40 transition"><I className="text-primary" size={22}/><h3 className="font-black mt-3">{t}</h3><p className="text-xs text-muted-foreground mt-1">{d}</p><span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-4">Open workspace <ArrowRight size={13}/></span></GlassCard></Link>)}</div>

  <GlassCard className="p-5"><div className="flex items-center gap-2"><BriefcaseBusiness className="text-primary" size={20}/><h3 className="font-black">CRM Workflow</h3></div><div className="grid gap-3 sm:grid-cols-5 mt-4">{["Lead","Qualified","Proposal","Deal","Client"].map((x,i)=><div key={x} className="rounded-2xl border p-4 text-center"><div className="mx-auto h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{i+1}</div><p className="font-semibold mt-2">{x}</p></div>)}</div></GlassCard>
 </div>
}