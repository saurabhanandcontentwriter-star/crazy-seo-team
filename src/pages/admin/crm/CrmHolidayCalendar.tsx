import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, PartyPopper } from "lucide-react";
import { GlassCard } from "@/components/crm/CrmUI";

export type CompanyHoliday = { date: string; name: string };

export const COMPANY_HOLIDAYS_2026: CompanyHoliday[] = [
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-04", name: "Holi" },
  { date: "2026-03-21", name: "Eid-ul-Fitr" },
  { date: "2026-03-26", name: "Ram Navami" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-05-01", name: "Buddha Purnima / Labour Day" },
  { date: "2026-05-28", name: "Bakrid" },
  { date: "2026-06-26", name: "Muharram" },
  { date: "2026-08-15", name: "Independence Day" },
  { date: "2026-08-26", name: "Milad-un-Nabi" },
  { date: "2026-09-04", name: "Janmashtami" },
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-10-20", name: "Dussehra" },
  { date: "2026-11-08", name: "Diwali" },
  { date: "2026-11-15", name: "Chhath Puja" },
  { date: "2026-11-24", name: "Guru Nanak Jayanti" },
  { date: "2026-12-25", name: "Christmas" },
];

export const isWorkingDay = (date = new Date()) => {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  return !COMPANY_HOLIDAYS_2026.some(h => h.date === key);
};

export default function CrmHolidayCalendar() {
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const days = useMemo(() => new Date(year, monthIndex + 1, 0).getDate(), [year, monthIndex]);
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const cells = Array.from({ length: firstDay + days }, (_, i) => i < firstDay ? null : i - firstDay + 1);
  const holidayMap = new Map(COMPANY_HOLIDAYS_2026.map(h => [h.date, h.name]));
  const keyForDay = (day: number) => {
    const d = new Date(year, monthIndex, day);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  };
  const monthHolidays = COMPANY_HOLIDAYS_2026.filter(h => h.date.startsWith(year + "-" + String(monthIndex + 1).padStart(2, "0")));
  return <GlassCard className="p-5">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div><div className="flex items-center gap-2"><CalendarDays size={19} className="text-primary" /><p className="font-black text-lg">Work Calendar & Holidays</p></div><p className="text-xs text-muted-foreground mt-1">Working days: Monday–Friday · Working hours: 10:00 AM–7:00 PM · Saturday & Sunday off</p></div>
      <div className="flex items-center gap-2"><button className="h-9 w-9 rounded-xl border grid place-items-center hover:bg-muted" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}><ChevronLeft size={16}/></button><span className="min-w-[140px] text-center text-sm font-black">{month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span><button className="h-9 w-9 rounded-xl border grid place-items-center hover:bg-muted" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}><ChevronRight size={16}/></button></div>
    </div>
    <div className="mt-5 grid grid-cols-7 gap-1.5 text-center">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="py-2 text-[10px] font-bold uppercase text-muted-foreground">{d}</div>)}{cells.map((day, i) => { if (!day) return <div key={"blank-"+i}/>; const key=keyForDay(day); const holiday=holidayMap.get(key); const dow=new Date(year,monthIndex,day).getDay(); const weekend=dow===0||dow===6; return <div key={key} title={holiday || (weekend ? "Weekend" : "Working day")} className={"min-h-14 rounded-xl border p-2 text-left "+(holiday ? "border-rose-500/30 bg-rose-500/10" : weekend ? "bg-muted/50 text-muted-foreground" : "bg-background")}><div className="flex items-center justify-between"><span className="text-xs font-bold">{day}</span>{holiday ? <PartyPopper size={12} className="text-rose-500"/> : weekend ? <span className="text-[9px]">OFF</span> : <span className="text-[9px] text-emerald-600">WORK</span>}</div>{holiday && <p className="mt-1 line-clamp-2 text-[9px] font-semibold text-rose-600">{holiday}</p>}</div>})}</div>
    <div className="mt-5 grid gap-2 md:grid-cols-2">{monthHolidays.length ? monthHolidays.map(h=><div key={h.date} className="flex items-center gap-2 rounded-xl border bg-rose-500/5 px-3 py-2"><PartyPopper size={14} className="text-rose-500"/><span className="text-xs font-semibold">{new Date(h.date+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short"})} — {h.name}</span></div>) : <p className="text-xs text-muted-foreground">No company holiday in this month.</p>}</div>
  </GlassCard>;
}
