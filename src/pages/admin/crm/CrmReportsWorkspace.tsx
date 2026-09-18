import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, IndianRupee, RefreshCw, Target, Users, BriefcaseBusiness, ListTodo } from "lucide-react";
import { GlassCard, Kpi } from "@/components/crm/CrmUI";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Lead = { id:string; status:string; deal_value:number|null };
type Item = { id:string; module:string; status:string; amount:number|null; created_at:string };

export default function CrmReportsWorkspace(){
  const [leads,setLeads]=useState<Lead[]>([]);
  const [team,setTeam]=useState<number>(0);
  const [items,setItems]=useState<Item[]>([]);
  const [loading,setLoading]=useState(true);

  const load=async()=>{
    setLoading(true);
    try{
      const [lr,tr,ir]=await Promise.all([
        supabase.from("leads").select("id,status,deal_value"),
        supabase.from("crm_team_members").select("id",{count:"exact",head:true}),
        supabase.from("crm_workspace_items").select("id,module,status,amount,created_at").order("created_at",{ascending:false})
      ]);
      if(lr.error) throw lr.error;
      if(tr.error) throw tr.error;
      if(ir.error) throw ir.error;
      setLeads((lr.data||[]) as Lead[]);
      setTeam(tr.count||0);
      setItems((ir.data||[]) as Item[]);
    }catch(e:any){
      toast({title:"Reports could not load",description:e.message||"Please try again.",variant:"destructive"});
    }finally{setLoading(false);}
  };
  useEffect(()=>{void load()},[]);

  const stats=useMemo(()=>{
    const won=leads.filter(x=>x.status==="won").length;
    const lost=leads.filter(x=>x.status==="lost").length;
    const open=leads.length-won-lost;
    const pipeline=leads.filter(x=>!["won","lost"].includes(x.status)).reduce((n,x)=>n+(Number(x.deal_value)||0),0);
    const revenue=leads.filter(x=>x.status==="won").reduce((n,x)=>n+(Number(x.deal_value)||0),0);
    const tasks=items.filter(x=>x.module==="tasks");
    const projects=items.filter(x=>x.module==="projects");
    const finance=items.filter(x=>x.module==="finance");
    const completedTasks=tasks.filter(x=>["completed","done","closed"].includes(x.status)).length;
    return {won,lost,open,pipeline,revenue,tasks:tasks.length,completedTasks,projects:projects.length,finance:finance.reduce((n,x)=>n+(Number(x.amount)||0),0)};
  },[leads,items]);

  const stageData=[
    ["New",leads.filter(x=>x.status==="new").length],
    ["Contacted",leads.filter(x=>x.status==="contacted").length],
    ["Qualified",leads.filter(x=>x.status==="qualified").length],
    ["Proposal",leads.filter(x=>x.status==="proposal_sent").length],
    ["Negotiation",leads.filter(x=>x.status==="negotiation").length],
    ["Won",stats.won],
    ["Lost",stats.lost],
  ];
  const maxStage=Math.max(1,...stageData.map(([,n])=>Number(n)));

  if(loading) return <div className="p-6"><GlassCard className="p-8"><p className="text-sm text-muted-foreground">Loading Reports Dashboard…</p></GlassCard></div>;

  return <div className="space-y-5">
    <GlassCard className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><BarChart3 size={24}/></div>
          <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Business Intelligence</p><h1 className="text-2xl md:text-3xl font-black mt-1">Reports Dashboard</h1><p className="text-sm text-muted-foreground mt-1">Live CRM, projects, tasks, finance and team performance overview.</p></div>
        </div>
        <Button variant="outline" className="rounded-2xl" onClick={()=>void load()}><RefreshCw size={14} className="mr-2"/>Refresh</Button>
      </div>
    </GlassCard>

    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
      <Kpi label="Total Leads" value={leads.length} icon={Target}/>
      <Kpi label="Won Deals" value={stats.won} icon={CheckCircle2} tone="from-emerald-500 to-teal-400"/>
      <Kpi label="Open Pipeline" value={stats.pipeline} prefix="₹" icon={IndianRupee} tone="from-indigo-500 to-blue-400"/>
      <Kpi label="Won Revenue" value={stats.revenue} prefix="₹" icon={IndianRupee} tone="from-violet-500 to-purple-400"/>
      <Kpi label="Open Leads" value={stats.open} icon={Clock3} tone="from-amber-500 to-orange-400"/>
      <Kpi label="Team Members" value={team} icon={Users} tone="from-sky-500 to-cyan-400"/>
      <Kpi label="Tasks" value={stats.tasks} icon={ListTodo}/>
      <Kpi label="Projects" value={stats.projects} icon={BriefcaseBusiness}/>
    </div>

    <div className="grid gap-4 xl:grid-cols-3">
      <GlassCard className="xl:col-span-2 p-5">
        <div className="flex items-center justify-between mb-5"><div><p className="font-black text-lg">CRM Pipeline Report</p><p className="text-xs text-muted-foreground">Live lead distribution by stage</p></div><Target size={20} className="text-primary"/></div>
        <div className="space-y-4">{stageData.map(([label,n])=><div key={String(label)}><div className="flex justify-between text-xs mb-1"><span className="font-semibold">{label}</span><b>{n}</b></div><div className="h-3 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500" style={{width:`${(Number(n)/maxStage)*100}%`}}/></div></div>)}</div>
      </GlassCard>
      <GlassCard className="p-5">
        <p className="font-black text-lg">Operations Report</p><p className="text-xs text-muted-foreground mb-5">Current workspace activity</p>
        <div className="space-y-3">
          <div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Completed Tasks</p><p className="text-2xl font-black mt-1">{stats.completedTasks} / {stats.tasks}</p></div>
          <div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Finance Recorded</p><p className="text-2xl font-black mt-1">₹{stats.finance.toLocaleString("en-IN")}</p></div>
          <div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Lost Deals</p><p className="text-2xl font-black mt-1">{stats.lost}</p></div>
        </div>
      </GlassCard>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        ["CRM Reports","Leads, pipeline, conversion and revenue.",stats.open],
        ["Project Reports","Active and completed project records.",stats.projects],
        ["HR Reports","Team members and operational activity.",team],
        ["Finance Reports","Recorded finance workspace amount.",stats.finance]
      ].map(([title,desc,value])=><GlassCard key={String(title)} className="p-5"><p className="font-black">{title}</p><p className="text-xs text-muted-foreground mt-1">{desc}</p><p className="text-2xl font-black mt-4">{typeof value==="number"&&String(title).includes("Finance")?"₹"+value.toLocaleString("en-IN"):value}</p><p className="text-[11px] text-muted-foreground mt-1">live records</p></GlassCard>)}
    </div>
  </div>;
}
