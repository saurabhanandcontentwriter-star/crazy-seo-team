import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CheckSquare, Wallet, Cpu, GraduationCap, Lightbulb, Megaphone, FileBarChart, Bell, Bot, Settings, Users2, Plus, Trash2, CheckCircle2, RefreshCw, Crown, UserRound, UsersRound, Code2, Calculator, BadgeCheck, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/crm/CrmUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { fetchTeam, type TeamMember } from "@/lib/crm";
import CrmTeam from "@/pages/admin/crm/CrmTeam";

type Item={id:string;module:string;title:string;description:string|null;status:string;priority:string;due_date:string|null;amount:number|null;created_at:string;};
const modules: Record<string,{title:string;description:string;icon:any;items:string[]}> = {
 employees:{title:"Employees",description:"Company people directory and role structure.",icon:Users2,items:["Founder","Managers","CTO","Team Leaders","Developers","Accountants","Executives","Interns"]},
 crm:{title:"CRM",description:"Manage the complete customer and sales lifecycle.",icon:BriefcaseBusiness,items:["Leads","Clients","Deals","Follow-ups","Meetings"]},
 projects:{title:"Projects",description:"Track delivery work, ownership and deadlines.",icon:BriefcaseBusiness,items:["Active Projects","Completed Projects","Deadlines"]},
 tasks:{title:"Tasks",description:"Central task workspace for company work.",icon:CheckSquare,items:["My Tasks","Team Tasks","Priority","Due Today","Overdue"]},
 finance:{title:"Finance",description:"Finance workspace for revenue, expenses and payroll.",icon:Wallet,items:["Income","Expenses","Payments","Salary","Reports"]},
 technology:{title:"Technology",description:"Technology and development operations.",icon:Cpu,items:["Software","Development","Bugs","Deployments","Infrastructure"]},
 hr:{title:"HR",description:"Attendance, leave, holidays, profiles and income.",icon:GraduationCap,items:["Attendance","Work Calendar","Leave Requests","Leave Calendar","Employee Profile","Monthly Income"]},
 ideas:{title:"Ideas",description:"Company ideas and innovation workspace.",icon:Lightbulb,items:["New Ideas","Review","Approved Ideas"]},
 announcements:{title:"Announcements",description:"Company-wide communication and updates.",icon:Megaphone,items:["Company News","HR Updates","Project Updates","Holiday Notices"]},
 reports:{title:"Reports",description:"Central reporting and business intelligence.",icon:FileBarChart,items:["CRM Reports","Project Reports","HR Reports","Finance Reports","Performance Reports"]},
 notifications:{title:"Notifications",description:"Your company activity and alerts.",icon:Bell,items:["New Leads","Follow-ups","Tasks","Leave Updates","Announcements"]},
 "ai-assistant":{title:"AI Assistant",description:"Ask questions about your CRM and company operations.",icon:Bot,items:["CRM Insights","Task Summary","Project Risks","HR Summary","Business Reports"]},
 settings:{title:"Settings",description:"Company configuration, permissions and security.",icon:Settings,items:["Company Settings","Roles & Permissions","Departments","Notifications","Security","Audit Logs"]},
};

function TechnologyOrgChart(){
 const [team,setTeam]=useState<TeamMember[]>([]);
 const [loading,setLoading]=useState(true);
 const [open,setOpen]=useState<Record<string,boolean>>({});
 useEffect(()=>{fetchTeam().then(setTeam).catch(e=>toast({title:"Team data could not load",description:e.message,variant:"destructive"})).finally(()=>setLoading(false))},[]);
 const active=team.filter(t=>t.status!=="inactive");
 const role=(p:string)=>{
   const x=(p||"").toLowerCase();
   if(x.includes("founder")||x.includes("ceo")||x.includes("owner")) return "Founder";
   if(x.includes("cto")) return "CTO";
   if(x.includes("manager")) return "Manager";
   if(x.includes("team leader")||x.includes("team lead")||x.includes("lead")) return "Team Leader";
   if(x.includes("developer")||x.includes("engineer")||x.includes("tech")) return "Developer";
   if(x.includes("account")) return "Accountant";
   if(x.includes("executive")) return "Executive";
   if(x.includes("intern")) return "Intern";
   return "Employee";
 };
 const groups=[
   {key:"Founder",label:"Founder",icon:Crown},
   {key:"Manager",label:"Managers",icon:UserRound},
   {key:"CTO",label:"CTO",icon:BadgeCheck},
   {key:"Team Leader",label:"Team Leaders",icon:UsersRound},
   {key:"Developer",label:"Developers",icon:Code2},
   {key:"Accountant",label:"Accountants",icon:Calculator},
   {key:"Executive",label:"Executives",icon:Users2},
   {key:"Intern",label:"Interns",icon:UserRound},
   {key:"Employee",label:"Other Employees",icon:UsersRound},
 ];
 const count=(key:string)=>active.filter(t=>role(t.position)===key).length;
 const founder=active.find(t=>role(t.position)==="Founder");
 const founderReports=active.filter(t=>t.id!==founder?.id);
 if(loading)return <GlassCard className="p-6"><p className="text-sm text-muted-foreground">Loading Technology organization…</p></GlassCard>;
 return <div className="space-y-5">
   <GlassCard className="p-6">
     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
       <div><div className="flex items-center gap-2"><Cpu className="text-primary" size={22}/><span className="text-xs font-bold uppercase tracking-wider text-primary">Technology Organization</span></div><h2 className="text-2xl font-black mt-1">Company Technology Hierarchy</h2><p className="text-sm text-muted-foreground mt-1">Founder → Managers → Team Leaders → Developers and other employees. Counts are live from CRM Team Members.</p></div>
       <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-center"><p className="text-2xl font-black">{active.length}</p><p className="text-[11px] text-muted-foreground">Active Employees</p></div>
     </div>
   </GlassCard>

   <GlassCard className="p-5">
     <div className="flex justify-center">
       <div className="w-full max-w-xl rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-violet-500/10 to-cyan-500/10 p-5 text-center shadow-sm">
         <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center"><Crown size={24}/></div>
         <p className="text-xs font-bold uppercase tracking-wider text-primary">Founder</p>
         <p className="text-xl font-black mt-1">{founder?.name || "Founder / CEO"}</p>
         <p className="text-xs text-muted-foreground">{founder?.position || "Company Leadership"}</p>
         <div className="mt-3 inline-flex rounded-full bg-background/70 border px-3 py-1 text-xs font-semibold">{founderReports.length} employees below Founder</div>
       </div>
     </div>
     <div className="mx-auto h-7 w-px bg-border"/>
     <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
       {groups.filter(g=>g.key!=="Founder").map(g=>{const Icon=g.icon;const members=active.filter(t=>role(t.position)===g.key);const isOpen=open[g.key]!==false;return <div key={g.key} className="rounded-2xl border bg-background/70 overflow-hidden">
         <button type="button" onClick={()=>setOpen(v=>({...v,[g.key]:!isOpen}))} className="w-full p-4 text-left hover:bg-muted/40 transition">
           <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Icon size={18}/></div><div><p className="font-black">{g.label}</p><p className="text-xs text-muted-foreground">{members.length} employee{members.length===1?"":"s"}</p></div></div><ChevronDown size={16} className={isOpen?"rotate-180 transition":"transition"}/></div>
         </button>
         {isOpen&&<div className="border-t px-3 py-2 space-y-2">{members.length===0?<p className="py-2 text-xs text-muted-foreground">No employees in this role yet.</p>:members.map(m=><div key={m.id} className="flex items-center gap-3 rounded-xl border p-3">
           {m.photo_url?<img src={m.photo_url} alt="" className="h-9 w-9 rounded-full object-cover"/>:<div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{m.name.slice(0,2).toUpperCase()}</div>}
           <div className="min-w-0"><p className="font-semibold truncate">{m.name}</p><p className="text-[11px] text-muted-foreground truncate">{m.position}</p></div>
         </div>)}</div>}
       </div>})}
     </div>
   </GlassCard>

   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
     {groups.map(g=><GlassCard key={g.key} className="p-4"><p className="text-xs text-muted-foreground">{g.label}</p><p className="text-2xl font-black mt-1">{count(g.key)}</p><p className="text-[11px] text-muted-foreground mt-1">employees</p></GlassCard>)}
   </div>
   <GlassCard className="p-5">
     <p className="font-black text-lg">Technology Functions</p><p className="text-xs text-muted-foreground mb-4">Use these workspaces for technology operations.</p>
     <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{["Software","Development","Bugs","Deployments","Infrastructure"].map(x=><Link key={x} to={`/admin/crm/technology?view=${x.toLowerCase()}`} className="rounded-2xl border p-4 hover:border-primary/30 hover:bg-muted/30 transition"><p className="font-bold">{x}</p><p className="text-xs text-muted-foreground mt-1">Open function <ArrowRight size={12} className="inline"/></p></Link>)}</div>
   </GlassCard>
 </div>;
}

export default function CrmModulePage(){
 const {module="crm"}=useParams(); const data=modules[module]||modules.crm; const Icon=data.icon;
 const isDataModule=["projects","tasks","finance","technology","announcements","notifications","ideas"].includes(module);
 const [items,setItems]=useState<Item[]>([]); const [loading,setLoading]=useState(isDataModule); const [title,setTitle]=useState(""); const [description,setDescription]=useState(""); const [status,setStatus]=useState("open"); const [priority,setPriority]=useState("medium"); const [dueDate,setDueDate]=useState(""); const [amount,setAmount]=useState(""); const [busy,setBusy]=useState(false);

 const load=async()=>{if(!isDataModule)return;setLoading(true);const {data,error}=await supabase.from("crm_workspace_items").select("id,module,title,description,status,priority,due_date,amount,created_at").eq("module",module).order("created_at",{ascending:false});if(error)toast({title:"Could not load module",description:error.message,variant:"destructive"});else setItems((data||[]) as Item[]);setLoading(false)};
 useEffect(()=>{void load()},[module]);
 const counts=useMemo(()=>({open:items.filter(x=>!["completed","done","closed"].includes(x.status)).length,done:items.filter(x=>["completed","done","closed"].includes(x.status)).length}),[items]);
 const add=async()=>{if(!title.trim())return toast({title:"Title required",description:"Enter a title first.",variant:"destructive"});setBusy(true);const {data:u}=await supabase.auth.getUser();if(!u.user){toast({title:"Login required",variant:"destructive"});setBusy(false);return}const {data:row,error}=await supabase.from("crm_workspace_items").insert({module,title:title.trim(),description:description.trim()||null,status,priority,due_date:dueDate||null,amount:amount?Number(amount):null,created_by:u.user.id}).select("id,module,title,description,status,priority,due_date,amount,created_at").single();if(error)toast({title:"Could not create",description:error.message,variant:"destructive"});else{setItems(v=>[row as Item,...v]);setTitle("");setDescription("");setDueDate("");setAmount("");toast({title:"Saved",description:`${data.title} added.`})}setBusy(false)};
 const toggle=async(x:Item)=>{const next=["completed","done","closed"].includes(x.status)?"open":"completed";const {error}=await supabase.from("crm_workspace_items").update({status:next,updated_at:new Date().toISOString()}).eq("id",x.id);if(error)toast({title:"Update failed",description:error.message,variant:"destructive"});else setItems(v=>v.map(i=>i.id===x.id?{...i,status:next}:i))};
 const remove=async(x:Item)=>{const {error}=await supabase.from("crm_workspace_items").delete().eq("id",x.id);if(error)toast({title:"Delete failed",description:error.message,variant:"destructive"});else setItems(v=>v.filter(i=>i.id!==x.id))};

 return <div className="space-y-5">
   <GlassCard className="p-6"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div className="flex items-start gap-4"><div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Icon size={24}/></div><div><h2 className="text-2xl font-black">{data.title}</h2><p className="text-sm text-muted-foreground mt-1">{data.description}</p></div></div>{isDataModule&&<Button variant="outline" className="rounded-2xl" onClick={load}><RefreshCw size={14} className="mr-2"/>Refresh</Button>}</div></GlassCard>

   {module==="technology"&&<TechnologyOrgChart />}

   {module==="employees"&&<CrmTeam />}
   {module==="crm"&&<GlassCard className="p-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{data.items.map((item,i)=><Link key={item} to={i===0?"/admin/crm/leads":i===2?"/admin/crm/pipeline":"/admin/crm/calendar"} className="rounded-2xl border p-4 hover:border-primary/30 hover:bg-muted/30 transition"><p className="font-bold">{item}</p><p className="text-xs text-muted-foreground mt-1">Open workspace <ArrowRight size={12} className="inline"/></p></Link>)}</div></GlassCard>}
   {module==="hr"&&<GlassCard className="p-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.items.map(item=><Link key={item} to="/admin/crm" className="rounded-2xl border p-4 hover:border-primary/30 transition"><p className="font-bold">{item}</p><p className="text-xs text-muted-foreground mt-1">Open HR workspace <ArrowRight size={12} className="inline"/></p></Link>)}</div></GlassCard>}

   {isDataModule&&<>{module==="announcements"?<><GlassCard className="p-5"><div className="flex items-center justify-between mb-4"><div><div className="flex items-center gap-2"><Megaphone size={18} className="text-primary"/><p className="font-black text-lg">Post Announcement</p></div><p className="text-xs text-muted-foreground mt-1">Create company-wide updates, HR notices, project updates and holiday notices.</p></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-primary/10 px-2 py-1">{items.length} posted</span></div></div><div className="grid gap-3"><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Announcement title *" className="rounded-2xl"/><Textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Write your announcement..." className="rounded-2xl min-h-32"/><div className="grid gap-3 md:grid-cols-2"><Select value={status} onValueChange={setStatus}><SelectTrigger className="rounded-2xl"><SelectValue placeholder="Publication status"/></SelectTrigger><SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem></SelectContent></Select><Input value={dueDate} onChange={e=>setDueDate(e.target.value)} type="date" className="rounded-2xl"/></div></div><Button onClick={add} disabled={busy} className="mt-3 rounded-2xl"><Plus size={15} className="mr-2"/>{busy?"Posting…":"Post Announcement"}</Button></GlassCard><GlassCard className="p-5"><div className="flex items-center justify-between mb-4"><div><p className="font-black text-lg">Announcements</p><p className="text-xs text-muted-foreground">{items.length} total posts</p></div><Button variant="outline" size="sm" className="rounded-xl" onClick={load}><RefreshCw size={13} className="mr-1"/>Refresh</Button></div>{loading?<p className="text-sm text-muted-foreground">Loading announcements…</p>:items.length===0?<p className="text-sm text-muted-foreground">No announcements yet. Post the first company update above.</p>:<div className="space-y-3">{items.map(x=><div key={x.id} className="rounded-2xl border p-4"><div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-black">{x.title}</p><span className="text-[10px] rounded-full bg-primary/10 px-2 py-1">{x.status}</span><span className="text-[10px] rounded-full bg-muted px-2 py-1">{x.priority}</span></div>{x.description&&<p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{x.description}</p>}<div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-3">{x.due_date&&<span>{x.status==="scheduled"?"Scheduled":"Date"}: {x.due_date}</span>}<span>{new Date(x.created_at).toLocaleString("en-IN")}</span></div></div><div className="flex gap-2 shrink-0"><Button size="sm" variant="outline" className="rounded-xl" onClick={()=>toggle(x)}><CheckCircle2 size={14} className="mr-1"/>{["completed","done","closed"].includes(x.status)?"Reopen":"Complete"}</Button><Button size="sm" variant="ghost" className="rounded-xl text-destructive" onClick={()=>remove(x)}><Trash2 size={14}/></Button></div></div></div>)}</div>}</GlassCard></>:<><GlassCard className="p-5"><div className="flex items-center justify-between mb-4"><div><p className="font-black">Create {data.title.slice(0,-1)||data.title}</p><p className="text-xs text-muted-foreground">Saved directly to your CRM workspace.</p></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-primary/10 px-2 py-1">{counts.open} open</span><span className="rounded-full bg-emerald-500/10 text-emerald-700 px-2 py-1">{counts.done} completed</span></div></div><div className="grid gap-3 md:grid-cols-2"><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title *" className="rounded-2xl"/><Input value={dueDate} onChange={e=>setDueDate(e.target.value)} type="date" className="rounded-2xl"/><Textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description / notes" className="rounded-2xl md:col-span-2"/><Select value={status} onValueChange={setStatus}><SelectTrigger className="rounded-2xl"><SelectValue placeholder="Status"/></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select><Select value={priority} onValueChange={setPriority}><SelectTrigger className="rounded-2xl"><SelectValue placeholder="Priority"/></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select>{module==="finance"&&<Input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="Amount ₹" className="rounded-2xl"/>}</div><Button onClick={add} disabled={busy} className="mt-3 rounded-2xl"><Plus size={15} className="mr-2"/>{busy?"Saving…":"Add"}</Button></GlassCard><GlassCard className="p-5"><div className="flex items-center justify-between mb-4"><div><p className="font-black">Workspace items</p><p className="text-xs text-muted-foreground">{items.length} total records</p></div></div>{loading?<p className="text-sm text-muted-foreground">Loading…</p>:items.length===0?<p className="text-sm text-muted-foreground">No records yet. Create the first one above.</p>:<div className="space-y-2">{items.map(x=><div key={x.id} className="flex flex-col md:flex-row md:items-center gap-3 rounded-2xl border p-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className={`font-bold truncate ${["completed","done","closed"].includes(x.status)?"line-through text-muted-foreground":""}`}>{x.title}</p><span className="text-[10px] rounded-full bg-muted px-2 py-1">{x.priority}</span></div>{x.description&&<p className="text-xs text-muted-foreground mt-1">{x.description}</p>}<div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-2">{x.due_date&&<span>Due: {x.due_date}</span>}{x.amount!==null&&<span>₹{Number(x.amount).toLocaleString("en-IN")}</span>}<span>{x.status}</span></div></div><div className="flex gap-2"><Button size="sm" variant="outline" className="rounded-xl" onClick={()=>toggle(x)}><CheckCircle2 size={14} className="mr-1"/>{["completed","done","closed"].includes(x.status)?"Reopen":"Complete"}</Button><Button size="sm" variant="ghost" className="rounded-xl text-destructive" onClick={()=>remove(x)}><Trash2 size={14}/></Button></div></div>)}</div>}</GlassCard></>}</>}
   {(module==="reports"||module==="ai-assistant"||module==="settings"||module==="ideas"||module==="announcements"||module==="notifications")&&!isDataModule&&<GlassCard className="p-5"><p className="font-black text-lg">{data.title} tools</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">{data.items.map(item=><div key={item} className="rounded-2xl border p-4"><p className="font-semibold">{item}</p><p className="text-xs text-muted-foreground mt-1">Workspace ready for configuration and live data.</p></div>)}</div></GlassCard>}
 </div>;
}