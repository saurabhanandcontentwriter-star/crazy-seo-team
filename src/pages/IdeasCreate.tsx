import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Lightbulb, Loader2, Sparkles, ShieldCheck, UserCircle2 } from "lucide-react";

export default function IdeasCreate() {
 const navigate=useNavigate();
 const [subject,setSubject]=useState<"Tech"|"AI"|"SEO">("Tech");
 const [title,setTitle]=useState(""); const [content,setContent]=useState("");
 const [name,setName]=useState(""); const [location,setLocation]=useState(""); const [device,setDevice]=useState("Unknown");
 const [profileFile,setProfileFile]=useState<File|null>(null); const [coverFile,setCoverFile]=useState<File|null>(null); const [saving,setSaving]=useState(false);

 const validateImage=(file:File)=>["image/jpeg","image/png","image/webp"].includes(file.type)&&file.size<=5*1024*1024;
 const uploadImage=async(userId:string,file:File,kind:"profile"|"cover")=>{
   if(!validateImage(file)) throw new Error("Use JPG, PNG or WEBP up to 5 MB.");
   const ext=file.name.split(".").pop()||"jpg"; const path=`${userId}/${kind}-${crypto.randomUUID()}.${ext}`;
   const upload=await supabase.storage.from("idea-images").upload(path,file,{contentType:file.type,upsert:false});
   if(upload.error) throw upload.error;
   return supabase.storage.from("idea-images").getPublicUrl(path).data.publicUrl;
 };

 const submit=async()=>{
   if(!name.trim()||!title.trim()||!content.trim()){toast.error("Name, title and idea content are required.");return}
   if(title.length>180||content.length>5000){toast.error("Title/content is too long.");return}
   setSaving(true);
   try{
     const{data:{user}}=await supabase.auth.getUser(); if(!user){toast.error("Please sign in before posting an idea.");return}
     let profileImageUrl:string|null=null, imageUrl:string|null=null;
     if(profileFile) profileImageUrl=await uploadImage(user.id,profileFile,"profile");
     if(coverFile) imageUrl=await uploadImage(user.id,coverFile,"cover");
     const{error}=await supabase.from("idea_posts").insert({
       user_id:user.id, profile_id:name.trim(), display_name:name.trim(), profile_image_url:profileImageUrl,
       location:location.trim()||null, subject, title:title.trim(), content:content.trim(),
       image_url:imageUrl, device_type:device, status:"pending"
     });
     if(error) throw error;
     toast.success("Idea submitted for moderation."); navigate("/ideas");
   }catch(e:any){toast.error(e?.message||"Could not submit idea.")}finally{setSaving(false)}
 };

 return <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/40"><div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
  <Link to="/ideas" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/>Back to Ideas</Link>
  <div className="mb-7 flex items-start gap-4"><div className="rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 p-3 text-white shadow-lg"><Lightbulb/></div><div><p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-violet-600">Community • Ideas</p><h1 className="text-3xl font-black tracking-tight md:text-4xl">Share something worth building.</h1><p className="mt-2 max-w-2xl text-muted-foreground">Publish a thoughtful Tech, AI or SEO idea. Every submission is reviewed before it becomes public.</p></div></div>
  <Card className="overflow-hidden rounded-[30px] border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur"><CardContent className="p-5 md:p-8">
   <div className="mb-7 rounded-2xl border border-violet-100 bg-violet-50/70 p-4"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 text-violet-600"/><div><p className="font-bold">Keep it useful & original</p><p className="mt-1 text-sm text-muted-foreground">Choose one topic, explain the idea clearly, and add an image when it helps people understand it.</p></div></div></div>
   <div className="grid gap-6">
    <div className="grid gap-2"><Label>Subject</Label><Select value={subject} onValueChange={v=>setSubject(v as any)}><SelectTrigger className="h-12 rounded-xl"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Tech">Tech</SelectItem><SelectItem value="AI">AI</SelectItem><SelectItem value="SEO">SEO</SelectItem></SelectContent></Select></div>
    <div className="grid gap-2"><Label>Name *</Label><Input className="h-12 rounded-xl" value={name} onChange={e=>setName(e.target.value)} placeholder="Your public name"/></div>
    <div className="grid gap-2"><Label>Profile Image <span className="font-normal text-muted-foreground">(optional)</span></Label><label className="flex min-h-28 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center text-sm text-muted-foreground transition hover:border-violet-300 hover:bg-violet-50/50">{profileFile?<img src={URL.createObjectURL(profileFile)} alt="Profile preview" className="size-16 rounded-full object-cover ring-2 ring-violet-200"/>:<UserCircle2 size={30}/>}<span>{profileFile?profileFile.name:"Add a profile photo • JPG, PNG or WEBP • max 5 MB"}</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>setProfileFile(e.target.files?.[0]||null)}/></label></div>
    <div className="grid gap-2"><Label>Title *</Label><Input className="h-12 rounded-xl text-base" maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. A smarter way to monitor AI search visibility"/></div>
    <div className="grid gap-2"><Label>Idea *</Label><Textarea className="min-h-44 rounded-2xl text-base" maxLength={5000} value={content} onChange={e=>setContent(e.target.value)} placeholder="Explain your idea, problem, solution and why it matters..."/></div>
    <div className="grid gap-6 md:grid-cols-2"><div className="grid gap-2"><Label>Location <span className="font-normal text-muted-foreground">(optional)</span></Label><Input className="h-12 rounded-xl" value={location} onChange={e=>setLocation(e.target.value)} placeholder="City / Country"/></div><div className="grid gap-2"><Label>Posted from</Label><Select value={device} onValueChange={setDevice}><SelectTrigger className="h-12 rounded-xl"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Mobile">Mobile</SelectItem><SelectItem value="Laptop">Laptop</SelectItem><SelectItem value="Desktop">Desktop</SelectItem><SelectItem value="Unknown">Unknown</SelectItem></SelectContent></Select></div></div>
    <div className="grid gap-2"><Label>Cover image <span className="font-normal text-muted-foreground">(optional)</span></Label><label className="flex min-h-28 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center text-sm text-muted-foreground transition hover:border-violet-300 hover:bg-violet-50/50"><ImagePlus size={22}/><span>{coverFile?coverFile.name:"Add JPG, PNG or WEBP • maximum 5 MB"}</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>setCoverFile(e.target.files?.[0]||null)}/></label></div>
   </div>
   <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between"><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={15}/>Reviewed before public publishing</div><div className="flex gap-3"><Button variant="outline" className="rounded-xl" onClick={()=>navigate("/ideas")}>Cancel</Button><Button className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6" onClick={submit} disabled={saving}>{saving&&<Loader2 className="mr-2 size-4 animate-spin"/>}Submit Idea</Button></div></div>
  </CardContent></Card>
 </div></div>
}