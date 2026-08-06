import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Newspaper, Users, Mail, BarChart3, FileBarChart,
  LogOut, Menu, X, Search, ExternalLink, Bell, Sparkles, Radio, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/live", label: "Live Traffic", icon: Radio },
  { to: "/admin/blog", label: "Blog CMS", icon: FileText },
  { to: "/admin/news", label: "Live News", icon: Newspaper },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/subscribers", label: "Newsletter", icon: Mail },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/operations", label: "AI Operations", icon: Activity },
];


export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-") || k.startsWith("admin"))
        .forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    navigate("/admin/login", { replace: true });
  };


  const NavItems = () => (
    <nav className="space-y-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border/60 bg-card/70 backdrop-blur-xl p-4">
        <Link to="/admin" className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
            <Sparkles size={18} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Crazy SEO Team</p>
            <p className="text-[11px] text-muted-foreground">Super Admin 3.0</p>
          </div>
        </Link>
        <div className="mt-4 flex-1"><NavItems /></div>
        <Button variant="outline" size="sm" onClick={signOut} className="rounded-2xl">
          <LogOut size={14} className="mr-2" /> Sign out
        </Button>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-card p-4 border-r border-border animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold">Super Admin</p>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X size={18} /></Button>
            </div>
            <NavItems />
            <Button variant="outline" size="sm" onClick={signOut} className="mt-4 w-full rounded-2xl">
              <LogOut size={14} className="mr-2" /> Sign out
            </Button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </Button>
            <button
              onClick={() => setCmdOpen(true)}
              className="flex-1 max-w-md flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition"
            >
              <Search size={15} /> Search admin…
              <kbd className="ml-auto text-[10px] rounded bg-background px-1.5 py-0.5 border border-border">⌘K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/" target="_blank">
                <Button variant="outline" size="sm" className="rounded-2xl hidden sm:inline-flex">
                  <ExternalLink size={14} className="mr-1" /> View site
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-2xl"><Bell size={17} /></Button>
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs font-semibold">Super Admin</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Jump to…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {NAV.map((item) => (
              <CommandItem
                key={item.to}
                onSelect={() => { setCmdOpen(false); navigate(item.to); }}
              >
                <item.icon size={15} className="mr-2" /> {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
