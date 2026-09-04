import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, CalendarDays, KanbanSquare, LayoutDashboard, Users2, UsersRound } from "lucide-react";

const TABS = [
  { to: "/admin/crm", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/crm/leads", label: "Leads", icon: Users2 },
  { to: "/admin/crm/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/admin/crm/calendar", label: "Follow-ups", icon: CalendarDays },
  { to: "/admin/crm/team", label: "Team", icon: UsersRound },
  { to: "/admin/crm/analytics", label: "Analytics", icon: BarChart3 },
];

export default function CrmShell() {
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

        <div className="overflow-x-auto -mx-1 px-1">
          <nav className="inline-flex gap-1 rounded-2xl border border-white/60 bg-white/70 dark:bg-card/70 backdrop-blur-xl p-1 shadow-sm">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`
                }
              >
                <t.icon size={16} />
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
