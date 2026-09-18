import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import CrmFlashNotice from "@/pages/admin/crm/CrmFlashNotice";
import { BarChart3, CalendarDays, KanbanSquare, LayoutDashboard, Users2, UsersRound, BriefcaseBusiness, CheckSquare, Wallet, Cpu, GraduationCap, Lightbulb, Megaphone, FileBarChart, Bell, Bot, Settings, ChevronDown, Building2 } from "lucide-react";

const TABS = [
  { to: "/admin/crm", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/crm/employees", label: "Employees", icon: Users2 },
  { to: "/admin/crm/crm", label: "CRM", icon: BriefcaseBusiness },
  { to: "/admin/crm/projects", label: "Projects", icon: BriefcaseBusiness },
  { to: "/admin/crm/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/admin/crm/finance", label: "Finance", icon: Wallet },
  { to: "/admin/crm/technology", label: "Technology", icon: Cpu },
  { to: "/admin/crm/hr", label: "HR", icon: GraduationCap },
  { to: "/admin/crm/ideas", label: "Ideas", icon: Lightbulb },
    { to: "/admin/crm/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/crm/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/crm/ai-assistant", label: "AI Assistant", icon: Bot },
  { to: "/admin/crm/settings", label: "Settings", icon: Settings },
  { to: "/admin/crm/leads", label: "Leads", icon: Users2 },
  { to: "/admin/crm/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/admin/crm/calendar", label: "Follow-ups", icon: CalendarDays },
  { to: "/admin/crm/team", label: "Team", icon: UsersRound },
  { to: "/admin/crm/analytics", label: "Analytics", icon: BarChart3 },
];

export default function CrmShell() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }).then(({ data: ok }) => setIsAdmin(ok === true));
    });
  }, []);
  const tabs = TABS.filter((t) => isAdmin || t.label !== "Team");
  const groups = [
    { label: "WORKSPACE", items: ["Dashboard","Employees","CRM","Projects","Tasks"] },
    { label: "OPERATIONS", items: ["Finance","Technology","HR","Ideas"] },
    { label: "INSIGHTS", items: ["Reports","Notifications","AI Assistant"] },
    { label: "SYSTEM", items: ["Settings","Leads","Pipeline","Follow-ups","Analytics",...(isAdmin ? ["Team"] : [])] },
  ];
  const [collapsed,setCollapsed]=useState<Record<string,boolean>>({});
  return (
    <div className="relative">
      {/* soft light-first background glow */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              AI CRM
            </h1>
            <p className="text-sm text-muted-foreground">Leads, pipeline, follow-ups and AI sales intelligence.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-5 items-start">
          <aside className="lg:sticky lg:top-4 rounded-3xl border border-white/60 bg-white/80 dark:bg-card/80 backdrop-blur-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-3 mb-1"><Building2 size={18} className="text-primary"/><div><p className="font-black text-sm">Company CRM</p><p className="text-[10px] text-muted-foreground">Workspace</p></div></div>
            <div className="space-y-2">
              {groups.map(g => { const isOpen=collapsed[g.label]!==true; const groupItems=tabs.filter(t=>g.items.includes(t.label)); return <div key={g.label}>
                <button type="button" onClick={()=>setCollapsed(v=>({...v,[g.label]:isOpen}))} className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black tracking-widest text-muted-foreground hover:text-foreground"><span>{g.label}</span><ChevronDown size={13} className={isOpen?"rotate-180 transition":"transition"}/></button>
                {isOpen && <div className="space-y-0.5">{groupItems.map(t=><NavLink key={t.to} to={t.to} end={t.end} className={({isActive})=>`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive?"bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md":"text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}><t.icon size={16}/><span>{t.label}</span></NavLink>)}</div>}
              </div>})}
            </div>
          </aside>
          <main className="min-w-0 space-y-4"><CrmFlashNotice /><Outlet /></main>
        </div>
      </div>
    </div>
  );
}
