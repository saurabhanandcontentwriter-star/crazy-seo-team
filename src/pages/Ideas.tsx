import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ImagePlus, Lightbulb, Loader2, MapPin, Monitor, Search, Smartphone } from "lucide-react";

type Idea = { id:string; profile_id:string; location:string|null; mobile:string|null; show_mobile:boolean; subject:"Tech"|"AI"|"SEO"; title:string; content:string; image_url:string|null; device_type:string; created_at:string; };

const blockedPatterns = [
  /\b(sex|sexual|porn|xxx|nude|naked|rape|pornography)\b/i,
  /\b(kill|murder|bomb|terror|suicide|self[- ]?harm|weapon)\b/i,
  /\b(vote|election|politic|political|party|candidate|government campaign)\b/i,
  /\b(buy now|sale|discount|offer|promo|promotion|advertise|advertisement|affiliate|paid service|hire me|contact me for)\b/i,
];
const autoReject = (title:string, content:string) => blockedPatterns.some(p => p.test(title + " " + content));

export default function IdeasPage() {
  const [ideas,setIdeas]=useState<Idea[]>([]), [loading,setLoading]=useState(true), [posting,setPosting]=useState(false), [q,setQ]=useState("");
  const [subject,setSubject]=useState<"Tech"|"AI"|"SEO">("AI"), [title,setTitle]=useState(""), [content,setContent]=useState("");
  const [location,setLocation]=useState(""), [mobile,setMobile]=useState(""), [showMobile,setShowMobile]=useState(false), [image,setImage]=useState<File|null>(null);

  const load=async()=>{ setLoading(true); const {data,error}=await supabase.from("idea_posts").select("*").eq("status","approved").order("created_at",{ascending:false}).limit(100); if(error) toast.error(error.message); else setIdeas((data as Idea[])||[]); setLoading(false); };
  useEffect(()=>{load();},[]);
  const filtered=useMemo(()=>ideas.filter(i=>!q || `${i.title} ${i.content} ${i.subject} ${i.profile_id}`.toLowerCase().includes(q.toLowerCase())),[ideas,q]);

  const submit=async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){toast.error("Please login first to share an idea.");return;}
    if(!title.trim()||content.trim().length<20){toast.error("Add a title and at least 20 characters.");return;}
    if(autoReject(title,content)){toast.error("Post rejected automatically. Sexual, harmful, political or promotional content is not accepted.");return;}
    if(image && image.size>5*1024*1024){toast.error("Image must be 5MB or smaller.");return;}
    if(image && !["image/jpeg","image/png","image/webp"].includes(image.type)){toast.error("Only JPG, PNG or WEBP images are allowed.");return;}
    setPosting(true);
    try{
      let imageUrl:string|null=null;
      if(image){const ext=image.name.split(".").pop()?.toLowerCase()||"jpg"; const path=`${user.id}/${crypto.randomUUID()}.${ext}`; const up=await supabase.storage.from("idea-images").upload(path,image,{contentType:image.type,upsert:false}); if(up.error) throw up.error; imageUrl=supabase.storage.from("idea-images").getPublicUrl(path).data.publicUrl;}
      const profileId=`IDEA-${user.id.slice(0,8).toUpperCase()}`;
      const device=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)?"Mobile":"Laptop/Desktop";
      const {error}=await supabase.from("idea_posts").insert({user_id:user.id,profile_id:profileId,location:location.trim()||null,mobile:mobile.trim()||null,show_mobile:showMobile,subject,title:title.trim(),content:content.trim(),image_url:imageUrl,device_type:device,status:"pending"});
      if(error) throw error;
      toast.success("Idea submitted for moderation."); setTitle("");setContent("");setLocation("");setMobile("");setShowMobile(false);setImage(null);
    }catch(e:any){toast.error(e?.message||"Could not submit idea.");} finally{setPosting(false);}
  };

  return <div className="min-h-screen bg-background"><div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
    <div className="rounded-[28px] border border-border/60 bg-card/70 p-6 md:p-8">
      <div className="flex items-center gap-3"><span className="rounded-2xl bg-primary/10 p-3 text-primary"><Lightbulb/></span><div><h1 className="text-3xl font-black">Ideas Community</h1><p className="text-muted-foreground">Share useful ideas about Technology, AI and SEO.</p></div></div>
      <div className="mt-5 flex flex-wrap gap-2">{(["Tech","AI","SEO"] as const).map(s=><Button key={s} variant={subject===s?"default":"outline"} onClick={()=>setSubject(s)}>{s}</Button>)}</div>
    </div>
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="rounded-[24px]"><CardHeader><CardTitle>Share your idea</CardTitle></CardHeader><CardContent className="space-y-3">
        <Input placeholder="Idea title" value={title} onChange={e=>setTitle(e.target.value)}/><Textarea placeholder="Write your technology, AI or SEO idea..." value={content} onChange={e=>setContent(e.target.value)} rows={7}/>
        <Input placeholder="Location (optional)" value={location} onChange={e=>setLocation(e.target.value)}/><Input placeholder="Mobile (optional)" value={mobile} onChange={e=>setMobile(e.target.value)}/>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showMobile} onChange={e=>setShowMobile(e.target.checked)}/> Show mobile publicly</label>
        <label className="flex items-center gap-2 rounded-xl border border-dashed p-3 cursor-pointer"><ImagePlus size={18}/><span className="text-sm">{image?image.name:"Add photo (JPG/PNG/WEBP, max 5MB)"}</span><input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setImage(e.target.files?.[0]||null)}/></label>
        <p className="text-xs text-muted-foreground">No sexual, harmful, political, spam or promotional posts. Text is automatically screened.</p>
        <Button className="w-full rounded-2xl" onClick={submit} disabled={posting}>{posting?<Loader2 className="mr-2 animate-spin"/>:<Lightbulb className="mr-2"/>}Submit Idea</Button>
      </CardContent></Card>
      <section className="space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/><Input className="pl-9 rounded-2xl" placeholder="Search approved ideas..." value={q} onChange={e=>setQ(e.target.value)}/></div>
        {loading?<div className="flex justify-center py-16"><Loader2 className="animate-spin"/></div>:filtered.length===0?<Card className="rounded-[24px]"><CardContent className="py-16 text-center text-muted-foreground">No approved ideas yet.</CardContent></Card>:filtered.map(i=><Card key={i.id} className="rounded-[24px] overflow-hidden">
          {i.image_url&&<img src={i.image_url} alt={i.title} className="w-full max-h-[360px] object-cover"/>}<CardContent className="p-5 space-y-3"><div className="flex items-center justify-between gap-3"><Badge>{i.subject}</Badge><span className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</span></div>
          <h2 className="text-xl font-bold">{i.title}</h2><p className="whitespace-pre-wrap text-muted-foreground">{i.content}</p><div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span>Profile ID: <b>{i.profile_id}</b></span>{i.location&&<span className="inline-flex items-center gap-1"><MapPin size={13}/>{i.location}</span>}<span className="inline-flex items-center gap-1">{i.device_type==="Mobile"?<Smartphone size={13}/>:<Monitor size={13}/>} {i.device_type}</span>{i.show_mobile&&i.mobile&&<span>Mobile: {i.mobile}</span>}</div></CardContent>
        </Card>)}
      </section>
    </div>
  </div></div>;
}