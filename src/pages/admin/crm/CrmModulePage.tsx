import { Link, useParams } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CheckSquare, Wallet, Cpu, GraduationCap, Lightbulb, Megaphone, FileBarChart, Bell, Bot, Settings, Users2 } from "lucide-react";
import { GlassCard } from "@/components/crm/CrmUI";

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

export default function CrmModulePage(){
 const {module="crm"}=useParams();
 const data=modules[module]||modules.crm;
 const Icon=data.icon;
 return <div className="space-y-5">
   <GlassCard className="p-6">
     <div className="flex items-start gap-4">
       <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Icon size={24}/></div>
       <div><h2 className="text-2xl font-black">{data.title}</h2><p className="text-sm text-muted-foreground mt-1">{data.description}</p></div>
     </div>
   </GlassCard>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {data.items.map((item)=><GlassCard key={item} className="p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between gap-3"><div><p className="font-bold">{item}</p><p className="text-xs text-muted-foreground mt-1">Open {item.toLowerCase()} workspace</p></div><ArrowRight size={16} className="text-primary"/></div>
    </GlassCard>)}
   </div>
   {module==="crm" && <div className="flex flex-wrap gap-2"><Link to="/admin/crm/leads" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Leads</Link><Link to="/admin/crm/pipeline" className="rounded-xl border px-4 py-2 text-sm font-semibold">Deals / Pipeline</Link><Link to="/admin/crm/calendar" className="rounded-xl border px-4 py-2 text-sm font-semibold">Follow-ups & Meetings</Link></div>}
   {module==="employees" && <Link to="/admin/crm/team" className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open Team Directory</Link>}
   {module==="hr" && <Link to="/admin/crm" className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open HR Workspace</Link>}
 </div>;
}