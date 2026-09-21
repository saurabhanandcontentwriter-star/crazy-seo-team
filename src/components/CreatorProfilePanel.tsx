import {useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Check,ChevronDown,ChevronUp,Sparkles,ShieldCheck} from "lucide-react";
import {supabase} from "@/integrations/supabase/client";
import {toast} from "sonner";

export const CREATOR_TYPES=[
  {key:"tech",label:"Tech Creator",icon:"💻"},
  {key:"ai",label:"AI Creator",icon:"🤖"},
  {key:"seo",label:"SEO Creator",icon:"🔍"},
  {key:"marketing",label:"Marketing Creator",icon:"📈"},
  {key:"design",label:"Design Creator",icon:"🎨"},
  {key:"developer",label:"Developer Creator",icon:"🧑‍💻"},
  {key:"content",label:"Content Creator",icon:"📝"},
  {key:"video",label:"Video Creator",icon:"🎥"},
  {key:"education",label:"Education Creator",icon:"📚"},
  {key:"business",label:"Business Creator",icon:"💼"},
  {key:"digital",label:"Digital Creator",icon:"🌐"},
  {key:"productivity",label:"Productivity Creator",icon:"⚡"},
  {key:"saas",label:"SaaS Creator",icon:"🛠️"},
  {key:"data",label:"Data Creator",icon:"📊"},
  {key:"knowledge",label:"Knowledge Creator",icon:"🧠"},
] as const;

const creatorBadges=[
  ["creator","👑 Creator"],
  ["rising","🚀 Rising Creator"],
  ["top","🔥 Top Creator"],
  ["pro","💎 Pro Creator"],
  ["featured","🏆 Featured Creator"],
  ["verified","✨ Verified Creator"],
] as const;

type ProfileLike={user_id:string;is_creator?:boolean;creator_types?:string[]|null;creator_since?:string|null;creator_rules_accepted_at?:string|null;verified?:boolean|null};

export default function CreatorProfilePanel({profile,onUpdated}:{profile:ProfileLike;onUpdated:(next:ProfileLike)=>void}){
 const [open,setOpen]=useState(Boolean(profile.is_creator));
 const [types,setTypes]=useState<string[]>(profile.creator_types||[]);
 const [saving,setSaving]=useState(false);
 const becomeCreator=async()=>{
  const {data:{user}}=await supabase.auth.getUser();
  if(!user||user.id!==profile.user_id)return toast.error("Please sign in to become a creator.");
  setSaving(true);
  const nextTypes=types.length?types:["tech"];
  const {data,error}=await supabase.from("idea_profiles").update({
   is_creator:true,
   creator_types:nextTypes,
   creator_since:new Date().toISOString().slice(0,10),
   creator_rules_accepted_at:new Date().toISOString()
  }).eq("user_id",user.id).select("*").single();
  if(error)toast.error(error.message);
  else{setTypes(nextTypes);onUpdated(data);setOpen(true);toast.success("Creator Profile activated.");}
  setSaving(false);
 };
 const toggleType=async(key:string)=>{
  if(!profile.is_creator)return;
  const next=types.includes(key)?types.filter(x=>x!==key):[...types,key];
  if(!next.length)return toast.error("Select at least one creator type.");
  setTypes(next);
  const {data,error}=await supabase.from("idea_profiles").update({creator_types:next}).eq("user_id",profile.user_id).select("*").single();
  if(error){setTypes(types);toast.error(error.message);return}
  onUpdated(data);
 };
 const creatorStatusBadges=()=>{
  const points=(profile as any).reputation_points||0;
  const out=[creatorBadges[0][1]];
  if(profile.verified)out.push(creatorBadges[5][1]);
  if(points>=100)out.push(creatorBadges[2][1]);
  else if(points>=25)out.push(creatorBadges[1][1]);
  if(points>=250)out.push(creatorBadges[3][1]);
  return out;
 };
 return <Card className="mt-5 overflow-hidden border-primary/20">
  <CardContent className="p-5">
   <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
    <div className="flex gap-3">
     <div className="rounded-2xl bg-primary/10 p-3"><Sparkles className="text-primary"/></div>
     <div>
      <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black">{profile.is_creator?"Creator Profile":"Become a Creator"}</h2>{profile.is_creator&&<Badge>👑 Creator</Badge>}</div>
      <p className="mt-1 text-sm text-muted-foreground">{profile.is_creator?"Share your knowledge, ideas and original work with the Crazy SEO Team community.":"Turn your Ideas profile into a creator profile and choose the subjects you create about."}</p>
     </div>
    </div>
    {profile.is_creator?<Button variant="outline" onClick={()=>setOpen(v=>!v)}>{open?<ChevronUp className="mr-2 size-4"/>:<ChevronDown className="mr-2 size-4"/>}{open?"Hide Creator Setup":"Manage Creator Profile"}</Button>:<Button onClick={becomeCreator} disabled={saving}>{saving?"Activating...":"Become a Creator"}</Button>}
   </div>
   {profile.is_creator&&<div className="mt-4 flex flex-wrap gap-2">{creatorStatusBadges().map(x=><Badge key={x} variant="secondary">{x}</Badge>)}{types.map(k=>{const t=CREATOR_TYPES.find(x=>x.key===k);return t?<Badge key={k} variant="outline">{t.icon} {t.label}</Badge>:null})}</div>}
   {open&&<div className="mt-5 space-y-5">
    {profile.is_creator&&<div><p className="mb-3 font-bold">Creator Subjects</p><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{CREATOR_TYPES.map(t=>{const selected=types.includes(t.key);return <button type="button" key={t.key} onClick={()=>toggleType(t.key)} className={"flex items-center justify-between rounded-xl border p-3 text-left transition hover:bg-muted/50 "+(selected?"border-primary bg-primary/5":"")}><span>{t.icon} {t.label}</span>{selected&&<Check className="size-4 text-primary"/>}</button>})}</div><p className="mt-2 text-xs text-muted-foreground">You can select multiple creator subjects. These badges appear publicly on your profile.</p></div>}
    <div className="rounded-2xl border bg-muted/20 p-4">
     <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary"/><h3 className="font-black">Creator Rules</h3></div>
     <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
      <p>✓ Post original ideas, knowledge or work.</p><p>✓ Do not post spam or duplicate content.</p><p>✓ Do not publish intentionally misleading information.</p><p>✓ Respect copyright and intellectual property.</p><p>✓ No harassment, hate, threats or abusive content.</p><p>✓ Do not use fake followers, fake engagement or manipulation.</p><p>✓ Clearly disclose paid promotions, sponsorships or affiliations.</p><p>✓ Follow community, moderation and platform rules.</p>
     </div>
     <p className="mt-3 text-xs text-muted-foreground">Creator badges are subject to community activity and verification. Repeated or serious rule violations may lead to badge removal, creator restrictions or account action.</p>
    </div>
   </div>}
  </CardContent>
 </Card>;
}
