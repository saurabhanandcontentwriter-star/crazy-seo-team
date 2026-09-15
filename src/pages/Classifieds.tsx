import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, Heart, ShieldCheck, Car, Home, Smartphone, BriefcaseBusiness, Factory, Wrench, Sofa, Shirt, GraduationCap, Wheat, PawPrint, HardHat, Package, Plus, MessageCircle, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  ["Cars & Vehicles", "cars", Car], ["Real Estate", "real-estate", Home], ["Mobiles & Electronics", "mobiles", Smartphone], ["Jobs", "jobs", BriefcaseBusiness], ["Business & Industrial", "business", Factory], ["Services", "services", Wrench], ["Furniture & Home", "furniture", Sofa], ["Fashion", "fashion", Shirt], ["Education", "education", GraduationCap], ["Agriculture", "agriculture", Wheat], ["Animals & Pets", "pets", PawPrint], ["Construction", "construction", HardHat], ["Other", "other", Package],
] as const;

const listings = [
  { id: 1, title: "2022 Maruti Suzuki Swift VXi", price: "₹5.25 Lakh", city: "Muzaffarpur, Bihar", category: "Cars & Vehicles", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80", verified: true },
  { id: 2, title: "2 BHK Ready to Move Flat", price: "₹32 Lakh", city: "Muzaffarpur, Bihar", category: "Real Estate", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80", verified: true },
  { id: 3, title: "iPhone 15 128GB — Excellent Condition", price: "₹48,000", city: "Patna, Bihar", category: "Mobiles & Electronics", image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=80", verified: false },
  { id: 4, title: "Digital Marketing Executive", price: "₹25,000 / month", city: "Remote / Bihar", category: "Jobs", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80", verified: true },
  { id: 5, title: "Commercial Shop for Rent", price: "₹18,000 / month", city: "Darbhanga, Bihar", category: "Real Estate", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80", verified: false },
  { id: 6, title: "Premium Sofa Set", price: "₹22,000", city: "Patna, Bihar", category: "Furniture & Home", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80", verified: true },
];

export default function Classifieds() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [location, setLocation] = useState(params.get("location") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [saved, setSaved] = useState<number[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = useMemo(() => listings.filter((item) => {
    const text = `${item.title} ${item.city} ${item.category}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (!location || item.city.toLowerCase().includes(location.toLowerCase())) && (category === "All" || item.category === category) && (!verifiedOnly || item.verified);
  }), [query, location, category, verifiedOnly]);

  const runSearch = () => setParams({ ...(query ? { q: query } : {}), ...(location ? { location } : {}), ...(category !== "All" ? { category } : {}) });

  return <div className="min-h-screen bg-slate-50 pt-32 pb-16">
    <section className="bg-gradient-to-br from-blue-50 via-white to-violet-50 border-b border-slate-200">
      <div className="container mx-auto px-4 py-12 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><span className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Crazy Marketplace</span><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Find what you need. Sell what you have.</h1><p className="mt-3 max-w-2xl text-slate-600">A fast, verified classifieds marketplace for vehicles, property, jobs, businesses, services and more.</p></div>
          <Button asChild className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600"><Link to="/post-ad"><Plus size={17}/> Post Free Ad</Link></Button>
        </div>
        <div className="mt-8 grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg md:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div className="flex items-center gap-2 px-3"><Search size={18} className="text-slate-400"/><Input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runSearch()} placeholder="What are you looking for?" className="border-0 shadow-none focus-visible:ring-0"/></div>
          <div className="flex items-center gap-2 px-3"><MapPin size={18} className="text-slate-400"/><Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, state or area" className="border-0 shadow-none focus-visible:ring-0"/></div>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="h-10 rounded-lg border-0 bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none"><option>All</option>{categories.map(([name])=><option key={name}>{name}</option>)}</select>
          <Button onClick={runSearch} className="rounded-xl">Search</Button>
        </div>
      </div>
    </section>

    <div className="container mx-auto px-4 py-10 lg:px-6">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold">Categories</h2><SlidersHorizontal size={16}/></div><div className="mt-3 space-y-1"><button onClick={()=>setCategory("All")} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${category==='All'?'bg-blue-50 text-blue-700 font-semibold':'text-slate-600 hover:bg-slate-50'}`}>All Classifieds</button>{categories.map(([name,slug,Icon])=><Link key={slug} to={`/classifieds?category=${slug}`} onClick={()=>setCategory(name)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${category===name?'bg-blue-50 text-blue-700 font-semibold':'text-slate-600 hover:bg-slate-50'}`}><Icon size={16}/>{name}</Link>)}</div><div className="mt-6 border-t pt-4"><label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600"><input type="checkbox" checked={verifiedOnly} onChange={e=>setVerifiedOnly(e.target.checked)}/> Verified sellers only</label></div></div></aside>
        <main><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black text-slate-900">{category==='All'?'Latest Listings':category}</h2><p className="text-sm text-slate-500">{filtered.length} listings matching your search</p></div><div className="flex gap-2"><Button variant="outline" asChild className="rounded-xl"><Link to="/classifieds">Reset</Link></Button><Button variant="outline" className="rounded-xl" onClick={()=>setVerifiedOnly(!verifiedOnly)}><ShieldCheck size={16}/> {verifiedOnly?'All sellers':'Verified'}</Button></div></div>
          {filtered.length===0?<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Search className="mx-auto text-slate-300" size={36}/><h3 className="mt-3 font-bold">No listings found</h3><p className="mt-1 text-sm text-slate-500">Try another keyword, location or category.</p></div>:<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(item=><article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><Link to={`/listing/${item.id}`}><div className="relative aspect-[4/3] overflow-hidden bg-slate-100"><img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>{item.verified&&<span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow"><ShieldCheck size={13}/> Verified</span>}</div></Link><div className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-black text-slate-950">{item.price}</p><Link to={`/listing/${item.id}`} className="mt-1 block font-semibold text-slate-800 hover:text-blue-600">{item.title}</Link></div><button aria-label="Save listing" onClick={()=>setSaved(s=>s.includes(item.id)?s.filter(x=>x!==item.id):[...s,item.id])} className={`rounded-full p-2 ${saved.includes(item.id)?'bg-rose-50 text-rose-600':'bg-slate-50 text-slate-400'}`}><Heart size={17} fill={saved.includes(item.id)?'currentColor':'none'}/></button></div><div className="mt-3 flex items-center gap-1 text-xs text-slate-500"><MapPin size={13}/>{item.city}</div><div className="mt-4 flex gap-2 border-t pt-3"><Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild><Link to={`/listing/${item.id}`}><MessageCircle size={14}/> Chat</Link></Button><Button size="sm" className="rounded-lg" asChild><Link to={`/listing/${item.id}`}><ChevronRight size={15}/></Link></Button></div></div></article>)}</div>}
        </main>
      </div>
    </div>
  </div>;
}
