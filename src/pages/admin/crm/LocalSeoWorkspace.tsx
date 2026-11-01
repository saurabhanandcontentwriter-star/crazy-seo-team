import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, ClipboardCheck, Star, Globe2, Plus, Trash2, Save, ExternalLink } from "lucide-react";

type Task = { id:string; group:string; label:string; done:boolean };
type Keyword = { id:string; term:string; area:string; rank:string };
const groups = [
  { name:"Google Business Profile", items:["Business name, address and phone verified","Primary and secondary categories checked","Services, products and business description updated","Opening hours and special hours verified","Recent genuine photos and updates added","Website and appointment links checked"] },
  { name:"NAP & Citations", items:["Website NAP matches Google Business Profile","Bing Places listing checked","Apple Business Connect listing checked","Important industry directories checked","Duplicate or outdated listings reviewed"] },
  { name:"Reviews & Reputation", items:["Review request process documented","New reviews monitored","Owner responses added to recent reviews","Negative feedback follow-up assigned"] },
  { name:"Local Website SEO", items:["Dedicated location/service pages reviewed","LocalBusiness schema validated","Title tags and headings include relevant location intent","Embedded map and clear contact details checked","Local internal links and location content reviewed"] },
];
const key = "cst_local_seo_workspace_v1";
const makeTasks = ():Task[] => groups.flatMap(g=>g.items.map((label,i)=>({id:g.name+"-"+i,group:g.name,label,done:false})));
export default function LocalSeoWorkspace(){
 const [business,setBusiness]=useState("");
 const [location,setLocation]=useState("");
 const [website,setWebsite]=useState("");
 const [gbp,setGbp]=useState("");
 const [tasks,setTasks]=useState<Task[]>(makeTasks);
 const [keywords,setKeywords]=useState<Keyword[]>([]);
 const [term,setTerm]=useState("");
 const [area,setArea]=useState("");
 const [rank,setRank]=useState("");
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw){const d=JSON.parse(raw);setBusiness(d.business||"");setLocation(d.location||"");setWebsite(d.website||"");setGbp(d.gbp||"");setTasks(Array.isArray(d.tasks)?d.tasks:makeTasks());setKeywords(Array.isArray(d.keywords)?d.keywords:[]);}}catch{}setLoaded(true);},[]);
 const save=()=>{localStorage.setItem(key,JSON.stringify({business,location,website,gbp,tasks,keywords}));};
 const done=tasks.filter(t=>t.done).length;
 const percent=Math.round(done/Math.max(1,tasks.length)*100);
 const addKeyword=()=>{if(!term.trim())return;setKeywords(v=>[...v,{id:crypto.randomUUID(),term:term.trim(),area:area.trim()||location,rank:rank.trim()}]);setTerm("");setArea("");setRank("");};
 const removeKeyword=(id:string)=>setKeywords(v=>v.filter(k=>k.id!==id));
 const openSearch=(q:string)=>window.open("https://www.google.com/search?q="+encodeURIComponent(q)," _blank","noopener,noreferrer");
 return <div className="space-y-5">
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
   <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600"><MapPin size={15}/> Local visibility workspace</div><h2 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">Local SEO & Maps SEO</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Manage local search projects, GBP checks, citations, reviews and location-based keyword observations.</p></div><button onClick={save} disabled={!loaded} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save size={15}/> Save workspace</button></div>
   <div className="mt-6 grid gap-3 md:grid-cols-2">
    <label className="text-xs font-bold text-slate-600">Business / Client name<input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="e.g. ABC Dental Clinic" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500"/></label>
    <label className="text-xs font-bold text-slate-600">Target city / service area<input value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Gaya, Bihar" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500"/></label>
    <label className="text-xs font-bold text-slate-600">Website URL<input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://example.com" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500"/></label>
    <label className="text-xs font-bold text-slate-600">Google Business Profile URL<input value={gbp} onChange={e=>setGbp(e.target.value)} placeholder="Paste Google Maps / Business Profile URL" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-blue-500"/></label>
   </div>
   <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Audit checks</p><p className="mt-1 text-2xl font-black text-slate-900">{done}/{tasks.length}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Audit completion</p><p className="mt-1 text-2xl font-black text-slate-900">{percent}%</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Tracked keywords</p><p className="mt-1 text-2xl font-black text-slate-900">{keywords.length}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Target location</p><p className="mt-1 truncate text-lg font-black text-slate-900">{location||"Not set"}</p></div></div>
   <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all" style={{width:percent+"%"}}/></div>
  </section>
  <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
   <div className="rounded-3xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-2"><ClipboardCheck className="text-blue-600"/><div><h3 className="font-black text-slate-900">Local SEO audit checklist</h3><p className="text-xs text-slate-500">Tick items as your team completes them.</p></div></div>
    <div className="mt-5 space-y-5">{groups.map(g=><div key={g.name}><h4 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">{g.name}</h4><div className="space-y-2">{tasks.filter(t=>t.group===g.name).map(t=><label key={t.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-3 text-sm text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={t.done} onChange={e=>setTasks(v=>v.map(x=>x.id===t.id?{...x,done:e.target.checked}:x))} className="mt-0.5 size-4 accent-blue-600"/><span className={t.done?"text-slate-400 line-through":""}>{t.label}</span></label>)}</div></div>)}</div>
   </div>
   <div className="space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
     <div className="flex items-center gap-2"><Search className="text-blue-600"/><div><h3 className="font-black text-slate-900">Local keyword & Maps observations</h3><p className="text-xs text-slate-500">Record rankings checked by your team.</p></div></div>
     <div className="mt-4 space-y-2"><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Keyword e.g. dentist in Gaya" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/><input value={area} onChange={e=>setArea(e.target.value)} placeholder="Grid point / neighbourhood" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/><input value={rank} onChange={e=>setRank(e.target.value)} placeholder="Observed Maps position (e.g. 4 or Not found)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/><button onClick={addKeyword} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white"><Plus size={15}/> Add observation</button></div>
     <div className="mt-4 space-y-2">{keywords.length===0?<p className="rounded-xl border border-dashed p-4 text-center text-xs text-slate-400">No keyword observations added yet.</p>:keywords.map(k=><div key={k.id} className="flex items-center gap-3 rounded-xl border p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{k.term}</p><p className="text-[11px] text-slate-500">{k.area||"Area not set"} · Position: {k.rank||"Not recorded"}</p></div><button onClick={()=>removeKeyword(k.id)} aria-label="Remove keyword" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15}/></button></div>)}</div>
     <p className="mt-3 text-[11px] leading-5 text-amber-700">Manual observations only. This workspace does not fetch live Google Maps positions.</p>
    </div>
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
     <div className="flex items-center gap-2"><Globe2 className="text-blue-600"/><h3 className="font-black text-slate-900">Quick research links</h3></div>
     <div className="mt-3 space-y-2"><button onClick={()=>openSearch((business||"business")+" "+(location||"")+" Google Maps")} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-left text-sm font-semibold">Search business on Google Maps <ExternalLink size={14}/></button><button onClick={()=>openSearch((business||"business")+" "+(location||"")+" competitors")} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-left text-sm font-semibold">Research local competitors <ExternalLink size={14}/></button><button onClick={()=>openSearch((business||"business")+" "+(location||"")+" business listings citations")} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-left text-sm font-semibold">Find citation opportunities <ExternalLink size={14}/></button>{gbp&&<a href={gbp} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700">Open saved Business Profile <ExternalLink size={14}/></a>}{website&&<a href={website.startsWith("http")?website:"https://"+website} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700">Open client website <ExternalLink size={14}/></a>}</div>
    </div>
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800"><Star size={15} className="mb-1"/> Google profile edits, review replies, citation submissions and live rank scans are not automatically executed here. Connect approved Google and rank-tracking APIs before enabling those actions.</div>
   </div>
  </section>
 </div>;
}
