import {useEffect,useMemo,useState} from "react";
import {supabase} from "@/integrations/supabase/client";
import {toast} from "sonner";
import {Camera,ChevronLeft,ChevronRight,Eye,ImagePlus,Lock,Plus,Trash2,Users,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

type Story={id:string;user_id:string;media_type:"image"|"text";media_url:string|null;text_content:string|null;visibility:"public"|"followers"|"private";created_at:string;expires_at:string};
type Highlight={id:string;user_id:string;name:string;cover_url:string|null;created_at:string};
type HighlightItem={id:string;highlight_id:string;story_id:string|null;media_type:"image"|"text"|null;media_url:string|null;text_content:string|null;created_at:string};

export default function IdeasStoryHighlights({profileUserId,avatarUrl,displayName,isOwner}:{profileUserId:string;avatarUrl?:string|null;displayName:string;isOwner:boolean}){
 const [stories,setStories]=useState<Story[]>([]),[highlights,setHighlights]=useState<Highlight[]>([]),[highlightItems,setHighlightItems]=useState<Record<string,HighlightItem[]>>({});
 const [viewer,setViewer]=useState<{items:any[];index:number;title:string;storyId?:string}|null>(null);
 const [creator,setCreator]=useState(false),[storyMode,setStoryMode]=useState<"image"|"text">("image"),[storyFile,setStoryFile]=useState<File|null>(null),[storyPreview,setStoryPreview]=useState(""),[storyText,setStoryText]=useState(""),[visibility,setVisibility]=useState<Story["visibility"]>("public"),[busy,setBusy]=useState(false);

 const load=async()=>{
  const now=new Date().toISOString();
  const {data:s}=await supabase.from("idea_stories").select("id,user_id,media_type,media_url,text_content,visibility,created_at,expires_at").eq("user_id",profileUserId).gt("expires_at",now).order("created_at",{ascending:true});
  setStories((s as Story[])||[]);
  const {data:h}=await supabase.from("idea_story_highlights").select("id,user_id,name,cover_url,created_at").eq("user_id",profileUserId).order("created_at",{ascending:true});
  const hs=(h as Highlight[])||[];setHighlights(hs);
  if(hs.length){const {data:items}=await supabase.from("idea_story_highlight_items").select("id,highlight_id,story_id,media_type,media_url,text_content,created_at").in("highlight_id",hs.map(x=>x.id)).order("created_at",{ascending:true});const grouped:Record<string,HighlightItem[]>={};for(const x of (items||[]) as HighlightItem[])(grouped[x.highlight_id]??=[]).push(x);setHighlightItems(grouped)}else setHighlightItems({});
 };
 useEffect(()=>{load()},[profileUserId]);

 const activeStory=stories.length>0;
 const createStory=async()=>{
  if(!isOwner)return;
  if(storyMode==="image"&&!storyFile)return toast.error("Choose a photo first.");
  if(storyMode==="text"&&!storyText.trim())return toast.error("Write something for your story.");
  setBusy(true);
  try{
   let mediaUrl:string|null=null;
   if(storyMode==="image"){
    if(!["image/jpeg","image/png","image/webp"].includes(storyFile!.type)||storyFile!.size>10*1024*1024)throw new Error("Use JPG, PNG or WEBP up to 10 MB.");
    const ext=storyFile!.name.split(".").pop()?.toLowerCase()||"jpg",path=profileUserId+"/stories/"+crypto.randomUUID()+"."+ext;
    const up=await supabase.storage.from("idea-images").upload(path,storyFile!,{contentType:storyFile!.type,upsert:false});if(up.error)throw up.error;
    mediaUrl=supabase.storage.from("idea-images").getPublicUrl(path).data.publicUrl;
   }
   const {error}=await supabase.from("idea_stories").insert({user_id:profileUserId,media_type:storyMode,media_url:mediaUrl,text_content:storyMode==="text"?storyText.trim():null,visibility,expires_at:new Date(Date.now()+24*60*60*1000).toISOString()});
   if(error)throw error;
   toast.success("Story added. It will stay for 24 hours.");setCreator(false);setStoryFile(null);setStoryPreview("");setStoryText("");setVisibility("public");await load();
  }catch(e:any){toast.error(e?.message||"Could not create story.")}finally{setBusy(false)}
 };

 const createHighlight=async()=>{
  if(!isOwner)return;
  const name=window.prompt("Highlight name (e.g. Work, Travel, Ideas)")?.trim();if(!name)return;
  const {data,error}=await supabase.from("idea_story_highlights").insert({user_id:profileUserId,name}).select("id,user_id,name,cover_url,created_at").single();
  if(error){toast.error(error.message);return}setHighlights(v=>[...v,data as Highlight]);toast.success("Highlight created.");
 };
 const addToHighlight=async(item:any)=>{
  if(!isOwner)return;
  const current=highlights.length?window.prompt("Enter an existing highlight name, or type a new name.")?.trim():"";
  if(!current)return;
  let h=highlights.find(x=>x.name.toLowerCase()===current.toLowerCase());
  if(!h){const {data,error}=await supabase.from("idea_story_highlights").insert({user_id:profileUserId,name:current,cover_url:item.media_url||null}).select("id,user_id,name,cover_url,created_at").single();if(error){toast.error(error.message);return}h=data as Highlight;setHighlights(v=>[...v,h!])}
  const {error}=await supabase.from("idea_story_highlight_items").insert({highlight_id:h.id,story_id:item.id||null,user_id:profileUserId,media_type:item.media_type,media_url:item.media_url||null,text_content:item.text_content||null});
  if(error&&!String(error.message).toLowerCase().includes("duplicate"))toast.error(error.message);else{toast.success("Added to "+h.name);await load()}
 };
 const deleteStory=async(id:string)=>{if(!isOwner)return;const {error}=await supabase.from("idea_stories").delete().eq("id",id).eq("user_id",profileUserId);if(error)toast.error(error.message);else{toast.success("Story deleted.");setViewer(null);await load()}};
 const openStories=()=>{if(stories.length)setViewer({items:stories,index:0,title:displayName})};
 const openHighlight=(h:Highlight)=>{const items=highlightItems[h.id]||[];if(items.length)setViewer({items,index:0,title:h.name})};

 return <div className="mt-5 rounded-2xl border bg-muted/10 p-4">
  <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-black">Stories & Highlights</h3><p className="text-xs text-muted-foreground">Instagram-style circles • stories expire after 24 hours</p></div>{isOwner&&<div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>setCreator(true)}><Plus className="mr-1 size-4"/>Story</Button><Button size="sm" variant="outline" onClick={createHighlight}><Plus className="mr-1 size-4"/>Highlight</Button></div>}</div>
  <div className="flex gap-4 overflow-x-auto pb-2">
   {isOwner&&<button type="button" onClick={()=>setCreator(true)} className="shrink-0 text-center"><div className="relative mx-auto size-20 rounded-full border-2 border-dashed border-primary/60 p-1"><div className="size-full overflow-hidden rounded-full bg-muted">{avatarUrl?<img src={avatarUrl} className="size-full object-cover" alt=""/>:<ImagePlus className="mx-auto mt-5 text-muted-foreground"/>}</div><span className="absolute -bottom-1 -right-1 rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">+</span></div><p className="mt-1 max-w-20 truncate text-xs font-medium">Your Story</p></button>}
   {activeStory&&<button type="button" onClick={openStories} className="shrink-0 text-center"><div className="mx-auto size-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]"><div className="size-full overflow-hidden rounded-full border-2 border-background bg-muted">{stories[0].media_type==="image"&&stories[0].media_url?<img src={stories[0].media_url} className="size-full object-cover" alt=""/>:<div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/30 to-fuchsia-500/30 p-2 text-[10px] font-bold">{stories[0].text_content}</div>}</div></div><p className="mt-1 max-w-20 truncate text-xs font-medium">{displayName}</p></button>}
   {highlights.map(h=><button key={h.id} type="button" onClick={()=>openHighlight(h)} className="shrink-0 text-center"><div className="mx-auto size-20 rounded-full border-2 border-muted-foreground/30 p-1"><div className="size-full overflow-hidden rounded-full bg-muted">{h.cover_url?<img src={h.cover_url} className="size-full object-cover" alt=""/>:<div className="flex size-full items-center justify-center p-2 text-center text-xs font-bold">{h.name}</div>}</div></div><p className="mt-1 max-w-20 truncate text-xs font-medium">{h.name}</p></button>)}
   {!isOwner&&!activeStory&&!highlights.length&&<p className="py-6 text-sm text-muted-foreground">No stories or highlights yet.</p>}
  </div>

  {creator&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={()=>setCreator(false)}><div className="w-full max-w-lg rounded-3xl bg-background p-5 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="text-xl font-black">Create Story</h3><Button variant="ghost" size="icon" onClick={()=>setCreator(false)}><X/></Button></div><div className="mt-4 flex gap-2"><Button variant={storyMode==="image"?"default":"outline"} onClick={()=>setStoryMode("image")}><Camera className="mr-2 size-4"/>Photo</Button><Button variant={storyMode==="text"?"default":"outline"} onClick={()=>setStoryMode("text")}>Text Only</Button></div>{storyMode==="image"?<div className="mt-4 space-y-3"><label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed p-8 text-sm"><ImagePlus className="mr-2"/>Choose photo<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>{const f=e.target.files?.[0]||null;setStoryFile(f);if(f)setStoryPreview(URL.createObjectURL(f))}}/></label>{storyPreview&&<img src={storyPreview} className="mx-auto max-h-72 rounded-2xl object-contain" alt="Preview"/>}</div>:<Textarea value={storyText} onChange={e=>setStoryText(e.target.value)} maxLength={1000} rows={8} className="mt-4" placeholder="Write your story..."/>}<div className="mt-4"><p className="mb-2 text-sm font-semibold">Privacy</p><div className="grid grid-cols-3 gap-2"><Button type="button" size="sm" variant={visibility==="public"?"default":"outline"} onClick={()=>setVisibility("public")}><Eye className="mr-1 size-3"/>Public</Button><Button type="button" size="sm" variant={visibility==="followers"?"default":"outline"} onClick={()=>setVisibility("followers")}><Users className="mr-1 size-3"/>Followers</Button><Button type="button" size="sm" variant={visibility==="private"?"default":"outline"} onClick={()=>setVisibility("private")}><Lock className="mr-1 size-3"/>Only me</Button></div></div><Button className="mt-5 w-full" onClick={createStory} disabled={busy}>{busy?"Publishing...":"Publish Story"}</Button></div></div>}

  {viewer&&<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-3" onClick={()=>setViewer(null)}><div className="relative flex h-[88vh] w-full max-w-md items-center justify-center" onClick={e=>e.stopPropagation()}>{viewer.items.length>1&&<Button variant="ghost" size="icon" className="absolute left-0 z-10 text-white hover:bg-white/10" onClick={()=>setViewer(v=>v&&{...v,index:Math.max(0,v.index-1)})}><ChevronLeft/></Button>}<div className="relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">{(()=>{const x=viewer.items[viewer.index];return x.media_type==="image"&&x.media_url?<img src={x.media_url} className="size-full object-contain" alt="Story"/>:<div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-500/80 via-fuchsia-500/70 to-orange-400/80 p-10 text-center text-2xl font-black text-white">{x.text_content}</div>})()}<div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4 text-white"><div><p className="font-bold">{viewer.title}</p><p className="text-xs opacity-80">{new Date(viewer.items[viewer.index].created_at).toLocaleString()}</p></div><Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={()=>setViewer(null)}><X/></Button></div>{isOwner&&viewer.items[viewer.index]?.id&&viewer.title===displayName&&<div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-4"><Button size="sm" variant="secondary" onClick={()=>addToHighlight(viewer.items[viewer.index])}>Add to Highlight</Button><Button size="sm" variant="destructive" onClick={()=>deleteStory(viewer.items[viewer.index].id)}><Trash2 className="mr-1 size-4"/>Delete</Button></div>}</div>{viewer.items.length>1&&<Button variant="ghost" size="icon" className="absolute right-0 z-10 text-white hover:bg-white/10" onClick={()=>setViewer(v=>v&&{...v,index:Math.min(v.items.length-1,v.index+1)})}><ChevronRight/></Button>}</div></div>}
 </div>;
}
