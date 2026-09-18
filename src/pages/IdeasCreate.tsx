import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Lightbulb, Loader2 } from "lucide-react";

export default function IdeasCreate() {
  const navigate = useNavigate();
  const [subject,setSubject]=useState<"Tech"|"AI"|"SEO">("Tech");
  const [title,setTitle]=useState(""); const [content,setContent]=useState("");
  const [profileId,setProfileId]=useState(""); const [location,setLocation]=useState("");
  const [mobile,setMobile]=useState(""); const [showMobile,setShowMobile]=useState(false);
  const [device,setDevice]=useState("Unknown"); const [file,setFile]=useState<File|null>(null); const [saving,setSaving]=useState(false);

  const submit=async()=>{
    if(!title.trim()||!content.trim()||!profileId.trim()){toast.error("Profile ID, title and idea content are required.");return;}
    if(title.length>180||content.length>5000){toast.error("Title/content is too long.");return;}
    setSaving(true);
    try {
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){toast.error("Please sign in before posting an idea.");return;}
      let imageUrl:string|null=null;
      if(file){
        if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){toast.error("Use JPG, PNG or WEBP up to 5 MB.");return;}
        const ext=file.name.split(".").pop()||"jpg"; const path=`${user.id}/${crypto.randomUUID()}.${ext}`;
        const upload=await supabase.storage.from("idea-images").upload(path,file,{contentType:file.type,upsert:false});
        if(upload.error) throw upload.error;
        imageUrl=supabase.storage.from("idea-images").getPublicUrl(path).data.publicUrl;
      }
      const {error}=await supabase.from("idea_posts").insert({
        user_id:user.id, profile_id:profileId.trim(), location:location.trim()||null,
        mobile:mobile.trim()||null, show_mobile:showMobile, subject, title:title.trim(),
        content:content.trim(), image_url:imageUrl, device_type:device, status:"pending"
      });
      if(error) throw error;
      toast.success("Idea submitted for moderation.");
      navigate("/ideas");
    } catch(e:any){toast.error(e?.message||"Could not submit idea.");}
    finally{setSaving(false);}
  };

  return <div className="min-h-screen bg-background"><div className="container mx-auto max-w-3xl px-4 py-8">
    <Link to="/ideas" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/>Back to Ideas</Link>
    <Card className="rounded-[28px]"><CardHeader><div className="flex items-center gap-3"><span className="rounded-2xl bg-primary/10 p-3 text-primary"><Lightbulb/></span><div><CardTitle className="text-2xl">Share an Idea</CardTitle><p className="mt-1 text-sm text-muted-foreground">Post a Tech, AI or SEO idea for community review.</p></div></div></CardHeader>
    <CardContent className="space-y-5">
      <div className="grid gap-2"><Label>Subject</Label><Select value={subject} onValueChange={(v)=>setSubject(v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Tech">Tech</SelectItem><SelectItem value="AI">AI</SelectItem><SelectItem value="SEO">SEO</SelectItem></SelectContent></Select></div>
      <div className="grid gap-2"><Label>Profile ID *</Label><Input value={profileId} onChange={e=>setProfileId(e.target.value)} placeholder="Your public profile ID"/></div>
      <div className="grid gap-2"><Label>Title *</Label><Input maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give your idea a clear title"/></div>
      <div className="grid gap-2"><Label>Idea *</Label><Textarea maxLength={5000} rows={8} value={content} onChange={e=>setContent(e.target.value)} placeholder="Share your useful idea..."/></div>
      <div className="grid gap-2"><Label>Location</Label><Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="City / Country"/></div>
      <div className="grid gap-2"><Label>Device</Label><Select value={device} onValueChange={setDevice}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Mobile">Mobile</SelectItem><SelectItem value="Laptop">Laptop</SelectItem><SelectItem value="Desktop">Desktop</SelectItem><SelectItem value="Unknown">Unknown</SelectItem></SelectContent></Select></div>
      <div className="grid gap-2"><Label>Mobile (optional)</Label><Input value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="Mobile number"/><label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={showMobile} onChange={e=>setShowMobile(e.target.checked)}/>Show my mobile publicly</label></div>
      <div className="grid gap-2"><Label>Photo (optional)</Label><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground hover:bg-muted/50"><ImagePlus size={18}/><span>{file?file.name:"Choose JPG, PNG or WEBP (max 5 MB)"}</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/></label></div>
      <div className="flex gap-3"><Button variant="outline" onClick={()=>navigate("/ideas")}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving&&<Loader2 className="mr-2 size-4 animate-spin"/>}Submit Idea</Button></div>
    </CardContent></Card>
  </div></div>;
}
