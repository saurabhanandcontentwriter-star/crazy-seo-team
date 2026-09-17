import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, RefreshCw, Search, Clock3, Users, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatClock, formatDuration, indiaDate } from "@/lib/attendance";

type Row={id:string;user_id:string;email:string;work_date:string;punch_in:string|null;punch_out:string|null;total_seconds:number;status:"punched_in"|"punched_out"};
const isoDate=(d:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
const startOfMonth=()=>{const d=new Date();d.setDate(1);return isoDate(d)};
const csvEscape=(v:unknown)=>`"${String(v??"").replaceAll('"','""')}"`;

// Convert the stored login identifier into a human-readable employee name.
// Known Google admin accounts get their proper names; other accounts fall
// back to a cleaned-up local-part instead of displaying the full email.
const employeeName=(email:string)=>{
 const e=email.trim().toLowerCase();
 const known:Record<string,string>={"sauravanand499@gmail.com":"Saurav Anand","crazyseoteam@gmail.com":"Crazy SEO Team"};
 if(known[e]) return known[e];
 const local=e.split("@")[0].replace(/[._-]+/g," ").replace(/\d+/g," ").trim();
 return local.split(/\s+/).filter(Boolean).map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join(" ") || "Employee";
};

export default function Attendance(){
 const [rows,setRows]=useState<Row[]>([]); const [loading,setLoading]=useState(true); const [from,setFrom]=useState(startOfMonth()); const [to,setTo]=useState(indiaDate()); const [q,setQ]=useState(""); const [status,setStatus]=useState("all");
 const load=useCallback(async()=>{setLoading(true);try{const {data,error}=await (supabase as any).from("crm_attendance").select("*").gte("work_date",from).lte("work_date",to).order("work_date",{ascending:false}).order("email",{ascending:true});if(error)throw error;setRows((data||[]) as Row[])}catch(e:any){setRows([]);toast.error(e?.message||"Could not load attendance")}finally{setLoading(false)}},[from,to]);
 useEffect(()=>{load()},[load]);
 const filtered=useMemo(()=>rows.filter(r=>(status==="all"||r.status===status)&&(!q||`${employeeName(r.email)} ${r.email}`.toLowerCase().includes(q.toLowerCase()))),[rows,status,q]);
 const stats=useMemo(()=>{const present=new Set(rows.map(r=>r.user_id)).size;const inNow=rows.filter(r=>r.status==="punched_in").length;const completed=rows.filter(r=>r.status==="punched_out").length;const seconds=rows.reduce((n,r)=>n+Number(r.total_seconds||0),0);return {present,inNow,completed,seconds}},[rows]);
 const exportCsv=()=>{const lines=[["Date","Employee","Punch In","Punch Out","Hours","Status"],...filtered.map(r=>[r.work_date,employeeName(r.email),formatClock(r.punch_in),formatClock(r.punch_out),formatDuration(r.total_seconds),r.status])].map(x=>x.map(csvEscape).join(","));const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`attendance-${from}-to-${to}.csv`;a.click();URL.revokeObjectURL(url);toast.success("Attendance CSV exported")};
 return <div className="space-y-6">
  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><Badge className="mb-2">Admin · HR</Badge><h1 className="text-2xl font-black">Attendance Management</h1><p className="text-sm text-muted-foreground">Punch records are saved in CRM and displayed here as attendance data.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={load} disabled={loading}><RefreshCw size={14} className={loading?"mr-2 animate-spin":"mr-2"}/>Refresh</Button><Button onClick={exportCsv} disabled={!filtered.length}><Download size={14} className="mr-2"/>Export CSV</Button></div></div>
  <div className="grid gap-3 grid-cols-2 xl:grid-cols-4"><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Employees recorded</p><p className="mt-1 text-2xl font-black">{stats.present}</p><Users className="mt-2 h-4 w-4 text-muted-foreground"/></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Currently punched in</p><p className="mt-1 text-2xl font-black">{stats.inNow}</p><UserCheck className="mt-2 h-4 w-4 text-emerald-600"/></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Completed shifts</p><p className="mt-1 text-2xl font-black">{stats.completed}</p><UserX className="mt-2 h-4 w-4 text-muted-foreground"/></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Recorded work time</p><p className="mt-1 text-2xl font-black">{formatDuration(stats.seconds)}</p><Clock3 className="mt-2 h-4 w-4 text-muted-foreground"/></CardContent></Card></div>
  <Card><CardContent className="p-4"><div className="grid gap-3 md:grid-cols-[150px_150px_1fr_180px]"><div><label className="mb-1 block text-xs font-semibold">From</label><Input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div><div><label className="mb-1 block text-xs font-semibold">To</label><Input type="date" value={to} onChange={e=>setTo(e.target.value)}/></div><div className="relative"><label className="mb-1 block text-xs font-semibold">Search employee</label><Search className="absolute left-3 top-9 h-4 w-4 text-muted-foreground"/><Input className="pl-9" placeholder="Search by employee name" value={q} onChange={e=>setQ(e.target.value)}/></div><div><label className="mb-1 block text-xs font-semibold">Status</label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="punched_in">Punched in</SelectItem><SelectItem value="punched_out">Completed</SelectItem></SelectContent></Select></div></div></CardContent></Card>
  <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays size={18}/> Attendance records <span className="text-sm font-normal text-muted-foreground">({filtered.length})</span></CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="p-4">Date</th><th className="p-4">Employee</th><th className="p-4">Punch in</th><th className="p-4">Punch out</th><th className="p-4">Work time</th><th className="p-4">Status</th></tr></thead><tbody>{loading?<tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Loading attendance…</td></tr>:filtered.length?filtered.map(r=><tr key={r.id} className="border-b last:border-0 hover:bg-muted/30"><td className="p-4 font-medium">{r.work_date}</td><td className="p-4"><div className="font-semibold">{employeeName(r.email)}</div></td><td className="p-4">{formatClock(r.punch_in)}</td><td className="p-4">{formatClock(r.punch_out)}</td><td className="p-4 font-mono text-xs">{formatDuration(r.total_seconds)}</td><td className="p-4"><Badge variant={r.status==="punched_in"?"default":"outline"}>{r.status==="punched_in"?"Punched in":"Completed"}</Badge></td></tr>):<tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No attendance records for this filter.</td></tr>}</tbody></table></div></CardContent></Card>
 </div>
}
