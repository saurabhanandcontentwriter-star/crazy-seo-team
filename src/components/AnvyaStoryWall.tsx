import {useEffect,useMemo,useState} from "react";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import {Plus,ChevronLeft,ChevronRight,Eye,ImagePlus,X,Camera,Loader2,UserCircle2} from "lucide-react";

type Story={id:string;user_id:string;media_type:"image"|"text";media_url:string|null;text_content:string|null;created_at:string;expires_at:string};
type Profile={user_id:string;display_name:string|null;avatar_url:string|null;public_id:string|null};

export default function AnvyaStoryWall(){
 const [stories,setStories]=useState<Story[]>([]);
 const [profiles,setProfiles]=useState<Record<string,Profile>>({});
 const [viewer,setViewer]=useState<{userId:string;index:number}|null>(null);
 const [me,setMe]=useState<string|null>(null);
 const [loading,setLoading]=useState(true);
 const [viewCounts,setViewCounts]=useState<Record<string,number>>({});
 const [composer,setComposer]=useState(false);
 const [mode,setMode]=useState<"image"|"text">("image");
 const [file,setFile]=useState<File|null>(null);
 const [preview,setPreview]=useState("");
 const [storyText,setStoryText]=useState("");
 const [busy,setBusy]=useState(false);

 const load=async()=>{
  const {data:{user}}=await supabase.auth.getUser();setMe(user?.id||null);
  const {data,error}=await supabase.from("idea_stories").select("id,user_id,media_type,media_url,text_content,created_at,expires_at").gt("expires_at",new Date().toISOString()).eq("visibility","public").order("created_at",{ascending:true});
  if(error){console.error("Story wall load failed",error);toast.error("Stories could not be loaded.");setLoading(false);return}
  const rows=(data||[]) as Story[];setStories(rows);
  const ids=[...new Set(rows.map(s=>s.user_id))];
  if(rows.length){
   const {data:v}=await (supabase as any).from("idea_story_views").select("story_id").in("story_id",rows.map(s=>s.id));
   const counts:Record<string,number>={};(v||[]).forEach((x:any)=>{counts[x.story_id]=(counts[x.story_id]||0)+1});setViewCounts(counts);
  }else setViewCounts({});
  if(ids.length){const {data:p}=await supabase.from("idea_profiles").select("user_id,display_name,avatar_url,public_id").in("user_id",ids);setProfiles(Object.fromEntries(((p||[]) as Profile[]).map(x=>[x.user_id,x])))}
  else setProfiles({});
  setLoading(false);
 };
 useEffect(()=>{void load()},[]);
 const grouped=useMemo(()=>Object.entries(stories.reduce((acc,s)=>{(acc[s.user_id]??=[]).push(s);return acc},{ } as Record<string,Story[]>)),[stories]);
 const myStories=stories.filter(s=>s.user_id===me);
 const currentGroup=viewer?grouped.find(([id])=>id===viewer.userId)?.[1]||[]:[];
 const current=currentGroup[viewer?.index??0]||null;
 const recordView=async(story:Story)=>{if(!me||story.user_id===me)return;await (supabase as any).from("idea_story_views").upsert({story_id:story.id,viewer_id:me,viewed_at:new Date().toISOString()},{onConflict:"story_id,viewer_id"});setViewCounts(v=>({...v,[story.id]:Math.max(v[story.id]||0,1)}));};
 const open=(userId:string)=>{const list=grouped.find(([id])=>id===userId)?.[1]||[];if(!list.length)return;setViewer({userId,index:0});void recordView(list[0])};
 const move=(d:number)=>setViewer(v=>{if(!v)return v;const list=grouped.find(([id])=>id===v.userId)?.[1]||[];const next=Math.max(0,Math.min(list.length-1,v.index+d));if(list[next])void recordView(list[next]);return {...v,index:next}});
 const closeComposer=()=>{setComposer(false);setFile(null);setPreview("");setStoryText("")};
 const publish=async()=>{
  if(!me){toast.info("Sign in to share a story.");return}
  if(mode==="image"&&!file){toast.error("Choose a photo first.");return}
  if(mode==="text"&&!storyText.trim()){toast.error("Write something for your story.");return}
  setBusy(true);
  try{
   let mediaUrl:string|null=null;
   if(mode==="image"){
    if(!["image/jpeg","image/png","image/webp"].includes(file!.type)||file!.size>10*1024*1024)throw new Error("Use JPG, PNG or WEBP up to 10 MB.");
    const ext=file!.name.split(".").pop()?.toLowerCase()||"jpg";
    const path=me+"/stories/"+crypto.randomUUID()+"."+ext;
    const uploaded=await supabase.storage.from("idea-images").upload(path,file!,{contentType:file!.type,upsert:false});
    if(uploaded.error)throw uploaded.error;
    mediaUrl=supabase.storage.from("idea-images").getPublicUrl(path).data.publicUrl;
   }
   const {error}=await supabase.from("idea_stories").insert({user_id:me,media_type:mode,media_url:mediaUrl,text_content:mode==="text"?storyText.trim():null,visibility:"public",expires_at:new Date(Date.now()+24*60*60*1000).toISOString()});
   if(error)throw error;
   toast.success("Your story is live for 24 hours.");closeComposer();setLoading(true);await load();
  }catch(e:any){toast.error(e?.message||"Could not publish story.")}finally{setBusy(false)}
 };
 if(loading)return <div className="rounded-2xl border bg-card/60 p-4"><div className="h-24 animate-pulse rounded-xl bg-muted"/></div>;
 return <section className="rounded-2xl border bg-card/70 p-4 md:p-5">
  <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-black text-lg">Stories</h2><p className="text-xs text-muted-foreground">Share a moment • stories disappear after 24 hours</p></div><Button size="sm" onClick={()=>me?setComposer(true):toast.info("Sign in to share a story.")}><Plus className="mr-1 size-4"/>Add Story</Button></div>
  <div className="flex gap-4 overflow-x-auto pb-2">
   <button type="button" onClick={()=>me?(myStories.length?open(me):setComposer(true)):toast.info("Sign in to share a story.")} className="w-20 shrink-0 text-center">
    <div className="relative mx-auto size-20 rounded-full border-2 border-dashed border-primary/70 p-1"><div className="size-full overflow-hidden rounded-full bg-muted">{profiles[me||""]?.avatar_url?<img src={profiles[me||""]!.avatar_url!} className="size-full object-cover" alt="Your profile"/>:<UserCircle2 className="size-full p-4 text-muted-foreground"/>}</div><span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground"><Plus className="size-4"/></span></div><p className="mt-1 truncate text-xs font-semibold">Your Story</p>
   </button>
   {grouped.filter(([id])=>id!==me).map(([userId,group])=>{const s=group[group.length-1];const p=profiles[userId];return <button key={userId} type="button" onClick={()=>open(userId)} className="w-20 shrink-0 text-center"><div className="mx-auto size-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]"><div className="size-full overflow-hidden rounded-full border-2 border-background bg-muted">{p?.avatar_url?<img src={p.avatar_url} className="size-full object-cover" alt=""/>:s.media_type==="image"&&s.media_url?<img src={s.media_url} className="size-full object-cover" alt=""/>:<div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/40 to-fuchsia-500/40 p-2 text-[10px] font-bold">{s.text_content}</div>}</div></div><p className="mt-1 truncate text-xs font-semibold">{p?.display_name||"ANVYA User"}</p></button>})}
   {!grouped.length&&<p className="self-center py-4 text-sm text-muted-foreground">No stories yet. Be the first to share a moment.</p>}
  </div>
  {current&&viewer&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-3" onClick={()=>setViewer(null)}>
   <div className="relative flex h-[88vh] w-full max-w-md items-center justify-center" onClick={e=>e.stopPropagation()}>
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
     <div className="absolute inset-x-3 top-3 z-20 flex gap-1">{currentGroup.map((s,i)=><div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/35"><div className={"h-full rounded-full bg-white "+(i<=viewer.index?"w-full":"w-0")}/></div>)}</div>
     {current.media_type==="image"&&current.media_url?<img src={current.media_url} className="size-full object-contain" alt="Story"/>:<div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-10 text-center text-2xl font-black text-white">{current.text_content}</div>}
     <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-7 text-white"><div className="flex items-center gap-2"><div className="size-9 overflow-hidden rounded-full bg-white/20">{profiles[current.user_id]?.avatar_url?<img src={profiles[current.user_id].avatar_url!} className="size-full object-cover" alt=""/>:<UserCircle2 className="size-full p-1"/>}</div><div><p className="font-bold">{profiles[current.user_id]?.display_name||"ANVYA User"}</p><p className="text-xs opacity-80">{new Date(current.created_at).toLocaleString()}</p></div></div><Button variant="ghost" size="icon" className="text-white" onClick={()=>setViewer(null)}><X/></Button></div>
     <div className="absolute inset-x-0 top-16 bottom-16 flex"><button aria-label="Previous story" className="w-1/3" onClick={()=>move(-1)}/><button aria-label="Next story" className="w-2/3" onClick={()=>move(1)}/></div>
     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs text-white"><Eye className="size-4"/>{viewCounts[current.id]||0} views</div>
    </div>
    {viewer.index>0&&<Button variant="ghost" size="icon" className="absolute -left-2 z-30 text-white hover:bg-white/10" onClick={()=>move(-1)}><ChevronLeft/></Button>}
    {viewer.index<currentGroup.length-1&&<Button variant="ghost" size="icon" className="absolute -right-2 z-30 text-white hover:bg-white/10" onClick={()=>move(1)}><ChevronRight/></Button>}
   </div>
  </div>}
  {composer&&<div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-4" onClick={closeComposer}><div className="w-full max-w-lg rounded-3xl border bg-background p-5 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><div><h3 className="text-xl font-black">Create your story</h3><p className="text-xs text-muted-foreground">Visible to everyone for 24 hours</p></div><Button variant="ghost" size="icon" onClick={closeComposer}><X/></Button></div><div className="mt-4 flex gap-2"><Button variant={mode==="image"?"default":"outline"} onClick={()=>setMode("image")}><Camera className="mr-2 size-4"/>Photo</Button><Button variant={mode==="text"?"default":"outline"} onClick={()=>setMode("text")}>Text</Button></div>{mode==="image"?<div className="mt-4 space-y-3"><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-sm text-muted-foreground"><ImagePlus className="mb-2 size-7"/>Choose a photo<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>{const f=e.target.files?.[0]||null;setFile(f);if(preview)URL.revokeObjectURL(preview);setPreview(f?URL.createObjectURL(f):"")}}/></label>{preview&&<img src={preview} className="mx-auto max-h-64 rounded-2xl object-contain" alt="Story preview"/>}<p className="text-xs text-muted-foreground">JPG, PNG or WEBP • up to 10 MB</p></div>:<Textarea value={storyText} onChange={e=>setStoryText(e.target.value)} maxLength={1000} rows={7} className="mt-4" placeholder="What's happening?"/>}<Button className="mt-5 w-full" onClick={publish} disabled={busy}>{busy?<><Loader2 className="mr-2 size-4 animate-spin"/>Publishing…</>:"Share to Story"}</Button></div></div>}
 </section>;
}
