import {useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardContent} from "@/components/ui/card";
import {Dialog,DialogContent,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {ChevronDown,ChevronUp,Sparkles,ShieldCheck} from "lucide-react";
import {supabase} from "@/integrations/supabase/client";
import {toast} from "sonner";

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
 const [saving,setSaving]=useState(false),[formOpen,setFormOpen]=useState(false),[name,setName]=useState(""),[email,setEmail]=useState(""),[bio,setBio]=useState(""),[website,setWebsite]=useState("");
 const submitApplication=async()=>{
  if(!name.trim()||!email.trim())return toast.error("Name and email are required.");
  setSaving(true);
  const {data:{user}}=await supabase.auth.getUser();
  const {error}=await supabase.from("creator_applications").insert({user_id:user?.id||null,name:name.trim(),email:email.trim(),creator_types:[],bio:bio.trim()||null,website_url:website.trim()||null,status:"pending"});
  if(error)toast.error(error.message); else {setFormOpen(false);toast.success("Creator application sent to CRM Admin for review.");}
  setSaving(false);
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
      <p className="mt-1 text-sm text-muted-foreground">{profile.is_creator?"Share your knowledge, ideas and original work with the Crazy SEO Team community.":"Turn your Ideas profile into a creator profile and submit your creator application."}</p>
     </div>
    </div>
    {profile.is_creator?<Button variant="outline" onClick={()=>setOpen(v=>!v)}>{open?<ChevronUp className="mr-2 size-4"/>:<ChevronDown className="mr-2 size-4"/>}{open?"Hide Creator Setup":"Manage Creator Profile"}</Button>:<Button onClick={()=>setFormOpen(true)}>Become a Creator</Button>}
   </div>
   {profile.is_creator&&<div className="mt-4 flex flex-wrap gap-2">{creatorStatusBadges().map(x=><Badge key={x} variant="secondary">{x}</Badge>)}</div>}
   {!profile.is_creator&&<div className="mt-5 rounded-2xl border bg-muted/20 p-4"><p className="text-sm font-bold">Creator application</p><p className="mt-1 text-xs text-muted-foreground">Submit your creator profile. Your application will go directly to the CRM Admin review queue.</p></div>}
   {open&&<div className="mt-5">
    <div className="rounded-2xl border bg-muted/20 p-4">
     <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary"/><h3 className="font-black">Creator Rules</h3></div>
     <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
      <p>✓ Post original ideas, knowledge or work.</p><p>✓ Do not post spam or duplicate content.</p><p>✓ Do not publish intentionally misleading information.</p><p>✓ Respect copyright and intellectual property.</p><p>✓ No harassment, hate, threats or abusive content.</p><p>✓ Do not use fake followers, fake engagement or manipulation.</p><p>✓ Clearly disclose paid promotions, sponsorships or affiliations.</p><p>✓ Follow community, moderation and platform rules.</p>
     </div>
     <p className="mt-3 text-xs text-muted-foreground">Creator badges are subject to community activity and verification. Repeated or serious rule violations may lead to badge removal, creator restrictions or account action.</p>
    </div>
   </div>}
  </CardContent>
  <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Become a Creator</DialogTitle></DialogHeader><div className="space-y-4"><p className="text-sm text-muted-foreground">Complete this creator application. It will be sent to the CRM Admin for review.</p><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"/><Input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="Website / portfolio URL (optional)"/><Textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell us about your creator work..." className="min-h-28"/><div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">By submitting, you agree to the Creator Rules shown on your profile. Admin review is required before creator status is activated.</div><Button className="w-full" onClick={submitApplication} disabled={saving}>{saving?"Sending to CRM Admin...":"Submit Creator Application"}</Button></div></DialogContent></Dialog>
 </Card>;
}
