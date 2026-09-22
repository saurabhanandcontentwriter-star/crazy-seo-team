import {useEffect,useState} from "react";
import {supabase} from "@/integrations/supabase/client";
import {Link} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Plus,ChevronLeft,ChevronRight,Eye,ImagePlus,X} from "lucide-react";

type Story={id:string;user_id:string;media_type:"image"|"text";media_url:string|null;text_content:string|null;created_at:string;expires_at:string};
type Profile={user_id:string;display_name:string|null;avatar_url:string|null;public_id:string|null};

export default function AnvyaStoryWall(){
 const [stories,setStories]=useState<Story[]>([]);
 const [profiles,setProfiles]=useState<Record<string,Profile>>({});
 const [viewer,setViewer]=useState<number|null>(null);
 const [me,setMe]=useState<string|null>(null);
 const [loading,setLoading]=useState(true);
 const [viewCounts,setViewCounts]=useState<Record<string,number>>({});
 const load=async()=>{
  const {data:{user}}=await supabase.auth.getUser(); setMe(user?.id||null);
  const now=new Date().toISOString();
  const {data,error}=await supabase.from("idea_stories").select("id,user_id,media_type,media_url,text_content,created_at,expires_at").gt("expires_at",now).eq("visibility","public").order("created_at",{ascending:true});
  if(error){console.error("Story wall load failed",error);setLoading(false);return}
  const rows=(data||[]) as Story[]; setStories(rows);
  const ids=[...new Set(rows.map(s=>s.user_id))];
  if(rows.length){
   const {data:v}=await (supabase as any).from("idea_story_views").select("story_id").in("story_id",rows.map(s=>s.id));
   const counts:Record<string,number>={}; (v||[]).forEach((x:any)=>{counts[x.story_id]=(counts[x.story_id]||0)+1}); setViewCounts(counts);
  } else setViewCounts({});
  if(ids.length){
   const {data:p}=await supabase.from("idea_profiles").select("user_id,display_name,avatar_url,public_id").in("user_id",ids);
   setProfiles(Object.fromEntries(((p||[]) as Profile[]).map(x=>[x.user_id,x])));
  } else setProfiles({});
  setLoading(false);
 };
 useEffect(()=>{void load()},[]);
 const grouped=Object.values(stories.reduce((acc,s)=>{(acc[s.user_id]??=[]).push(s);return acc},{ } as Record<string,Story[]>));
 const current=viewer===null?null:stories[viewer];
 const recordView=async(story:Story)=>{if(!me||story.user_id===me)return; await (supabase as any).from("idea_story_views").upsert({story_id:story.id,viewer_id:me,viewed_at:new Date().toISOString()},{onConflict:"story_id,viewer_id"});};
 const open=(story:Story)=>{const i=stories.findIndex(x=>x.id===story.id);if(i>=0)void recordView(story);setViewer(i<0?null:i)};
 const move=(d:number)=>setViewer(v=>v===null?null:Math.max(0,Math.min(stories.length-1,v+d)));
 if(loading)return <div className="rounded-2xl border bg-card/60 p-4"><div className="h-24 animate-pulse rounded-xl bg-muted"/></div>;
 return <section className="rounded-2xl border bg-card/70 p-4 md:p-5">
  <div className="mb-3 flex items-center justify-between gap-3">
   <div><h2 className="font-black text-lg">Stories</h2><p className="text-xs text-muted-foreground">Fresh ANVYA stories • disappear after 24 hours</p></div>
   {me&&<Link to={"/anvya/profile/"+me}><Button size="sm" variant="outline"><Plus className="mr-1 size-4"/>Your Story</Button></Link>}
  </div>
  {grouped.length?<div className="flex gap-4 overflow-x-auto pb-2">
   {grouped.map(group=>{const s=group[group.length-1];const p=profiles[s.user_id];return <button key={s.user_id} type="button" onClick={()=>open(s)} className="w-20 shrink-0 text-center">
    <div className="mx-auto size-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]"><div className="size-full overflow-hidden rounded-full border-2 border-background bg-muted">{s.media_type==="image"&&s.media_url?<img src={s.media_url} className="size-full object-cover" alt=""/>:<div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/40 to-fuchsia-500/40 p-2 text-[10px] font-bold">{s.text_content}</div>}</div></div>
    <p className="mt-1 truncate text-xs font-semibold">{p?.display_name||"ANVYA User"}</p>
   </button>})}
  </div>:<div className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground"><ImagePlus className="size-5"/><span>No public stories yet. Open your profile to add the first story.</span>{me&&<Link to={"/anvya/profile/"+me} className="ml-auto text-primary font-semibold">Add story</Link>}</div>}
  {current&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-3" onClick={()=>setViewer(null)}>
   <div className="relative flex h-[88vh] w-full max-w-md items-center justify-center" onClick={e=>e.stopPropagation()}>
    {stories.length>1&&<Button variant="ghost" size="icon" className="absolute left-0 z-10 text-white hover:bg-white/10" onClick={()=>move(-1)}><ChevronLeft/></Button>}
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
     {current.media_type==="image"&&current.media_url?<img src={current.media_url} className="size-full object-contain" alt="Story"/>:<div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-10 text-center text-2xl font-black text-white">{current.text_content}</div>}
     <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4 text-white"><div><p className="font-bold">{profiles[current.user_id]?.display_name||"ANVYA User"}</p><p className="text-xs opacity-80">{new Date(current.created_at).toLocaleString()}</p></div><Button variant="ghost" size="icon" className="text-white" onClick={()=>setViewer(null)}><X/></Button></div>
     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs text-white"><Eye className="size-4"/>{viewCounts[current.id]||0} views</div>
    </div>
    {stories.length>1&&<Button variant="ghost" size="icon" className="absolute right-0 z-10 text-white hover:bg-white/10" onClick={()=>move(1)}><ChevronRight/></Button>}
   </div>
  </div>}
 </section>;
}
