import { useEffect, useMemo, useState } from "react";
import { Bot, BrainCircuit, Sparkles, Users2, Target, CheckCircle2, Clock3, RefreshCw, ArrowRight, Lightbulb, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/crm/CrmUI";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
type Stats={leads:number;team:number;tasks:number;openTasks:number;ideas:number};
export default function CrmAiAssistant(){
 const [stats,setStats]=useState<Stats>({leads:0,team:0,tasks:0,openTasks:0,ideas:0}); const [loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);try{
  const [leads,team,tasks,ideas]=await Promise.all([
   supabase.from("leads").select("id",{count:"exact",head:true}),
   supabase.from("crm_team_members").select("id",{count:"exact",head:true}).eq("status","active"),
   supabase.from("crm_workspace_items").select("id,status",{count:"exact"}).eq("module","tasks"),
   supabase.from("idea_posts").select("id",{count:"exact",head:true}).eq("status","approved")
  ]);
  setStats({leads:leads.count||0,team:team.count||0,tasks:tasks.count||0,openTasks:(tasks.data||[]).filter((x:any)=>!["completed","done","closed"].includes(x.status)).length,ideas:ideas.count||0});
 }finally{setLoading(false)}};
 useEffect(()=>{void load()},[]);
 const insights=useMemo(()=>[
  {icon:Target,title:"Sales intelligence",text:stats.leads+" lead records are available for CRM analysis.",link:"/admin/crm/leads",action:"Open Leads"},
  {icon:CheckCircle2,title:"Task intelligence",text:stats.openTasks+" tasks are currently open.",link:"/admin/crm/tasks",action:"Open Tasks"},
  {icon:Users2,title:"Team intelligence",text:stats.team+" active team members are available in the workspace.",link:"/admin/crm/team",action:"View Team"},
  {icon:Lightbulb,title:"Ideas intelligence",text:stats.ideas+" approved community ideas are available for review.",link:"/admin/crm/ideas",action:"Open Ideas"},
 ],[stats]);
 if(loading)return <GlassCard className="p-6"><p className="text-sm text-muted-foreground">Loading AI workspace intelligence…</p></GlassCard>;
 return <div className="space-y-5">
  <GlassCard className="p-6 overflow-hidden"><div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
   <div><div className="flex items-center gap-2 text-primary"><Bot size={22}/><span className="text-xs font-black uppercase tracking-widest">AI Operations Center</span></div><h2 className="text-3xl font-black mt-2">AI Assistant Workspace</h2><p className="text-sm text-muted-foreground mt-2 max-w-2xl">One workspace for CRM intelligence, task monitoring, team insights and operational recommendations.</p></div>
   <Button variant="outline" className="rounded-2xl" onClick={load}><RefreshCw size={14} className="mr-2"/>Refresh Intelligence</Button>
  </div></GlassCard>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[
   ["Leads",stats.leads,Target],["Active Team",stats.team,Users2],["Tasks",stats.tasks,CheckCircle2],["Open Tasks",stats.openTasks,Clock3],["Approved Ideas",stats.ideas,Lightbulb]
  ].map(([label,value,Icon]:any)=><GlassCard key={label as string} className="p-5"><Icon size={18} className="text-primary"/><p className="text-2xl font-black mt-2">{value}</p><p className="text-xs text-muted-foreground">{label}</p></GlassCard>)}</div>
  <div className="grid gap-4 lg:grid-cols-2">{insights.map(x=>{const Icon=x.icon;return <GlassCard key={x.title} className="p-5"><div className="flex items-start gap-3"><div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary grid place-items-center"><Icon size={19}/></div><div className="flex-1"><p className="font-black">{x.title}</p><p className="text-sm text-muted-foreground mt-1">{x.text}</p><Link to={x.link} className="inline-flex items-center mt-3 text-xs font-bold text-primary">{x.action}<ArrowRight size={13} className="ml-1"/></Link></div></div></GlassCard>})}</div>
  <div className="grid gap-4 lg:grid-cols-3">
   <GlassCard className="p-5"><div className="flex items-center gap-2"><BrainCircuit size={18} className="text-primary"/><p className="font-black">AI Insights</p></div><p className="text-xs text-muted-foreground mt-2">Live workspace metrics are used to surface operational signals.</p><div className="mt-4 space-y-2 text-xs"><div className="rounded-xl border p-3">Review open tasks and overdue work regularly.</div><div className="rounded-xl border p-3">Follow up with active leads from the CRM pipeline.</div></div></GlassCard>
   <GlassCard className="p-5"><div className="flex items-center gap-2"><Sparkles size={18} className="text-primary"/><p className="font-black">AI Tools</p></div><div className="mt-4 grid gap-2"><Link to="/admin/crm/leads" className="rounded-xl border p-3 text-sm font-semibold hover:bg-muted/40">Lead Intelligence</Link><Link to="/admin/crm/analytics" className="rounded-xl border p-3 text-sm font-semibold hover:bg-muted/40">Analytics Summary</Link><Link to="/admin/crm/reports" className="rounded-xl border p-3 text-sm font-semibold hover:bg-muted/40">Business Reports</Link></div></GlassCard>
   <GlassCard className="p-5"><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-primary"/><p className="font-black">AI Safety</p></div><p className="text-xs text-muted-foreground mt-2">AI workspace shows CRM data available to the signed-in CRM account. Sensitive actions remain controlled by existing permissions.</p></GlassCard>
  </div>
 </div>;
}