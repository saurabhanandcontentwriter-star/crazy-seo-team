import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImagePlus, Loader2, X, Send } from "lucide-react";

export default function IdeasInlinePostComposer({profile,onCreated,onClose}:{profile:any;onCreated:(post:any)=>void;onClose:()=>void}){
 const [title,setTitle]=useState(""); const [content,setContent]=useState(""); const [visibility,setVisibility]=useState("public"); const [busy,setBusy]=useState(false);
 const submit=async()=>{
  if(!title.trim()||!content.trim())return toast.error("Title and content are required.");
  const {data:{user}}=await supabase.auth.getUser();
  if(!user||user.id!==profile.user_id)return toast.error("Please sign in to your own profile first.");
  setBusy(true);
  try{
   const payload={user_id:user.id,profile_id:profile.public_id||user.id,display_name:profile.display_name||"ANVYA Member",location:profile.location||null,mobile:null,show_mobile:false,subject:"Tech",title:title.trim(),content:content.trim(),image_url:null,device_type:/Mobi|Android/i.test(navigator.userAgent)?"Mobile":"Laptop/Desktop",status:"pending",visibility,post_type:"post"};
   const {data,error}=await supabase.from("idea_posts").insert(payload).select("id,user_id,display_name,profile_image_url,title,content,post_type,visibility,subject,image_url,created_at,status").single();
   if(error)throw error;
   toast.success("Post submitted. It will appear after review.");
   onCreated(data); setTitle(""); setContent(""); onClose();
  }catch(e:any){toast.error(e?.message||"Could not publish the post.");}
  finally{setBusy(false)}
 };
 return <Card className="rounded-3xl border-primary/20 shadow-sm"><CardContent className="p-5">
  <div className="flex items-center justify-between gap-3"><div><p className="text-lg font-black">Create Post</p><p className="text-xs text-muted-foreground">Write your post here — no page navigation.</p></div><Button size="icon" variant="ghost" onClick={onClose} aria-label="Close"><X className="size-4"/></Button></div>
  <div className="mt-4 space-y-3"><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Post title"/><Textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Share something with your network..." className="min-h-36"/><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Badge variant="outline">Tech</Badge><select className="rounded-lg border bg-background px-3 py-2 text-sm" value={visibility} onChange={e=>setVisibility(e.target.value)}><option value="public">Public</option><option value="friends">Friends only</option></select></div><Button onClick={submit} disabled={busy}>{busy?<Loader2 className="mr-2 size-4 animate-spin"/>:<Send className="mr-2 size-4"/>}{busy?"Publishing…":"Publish Post"}</Button></div></div>
 </CardContent></Card>
}
