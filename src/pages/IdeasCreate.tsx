import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CREATOR_TYPES } from "@/components/CreatorProfilePanel";
import { ArrowLeft, ImagePlus, CalendarDays, Lightbulb, Loader2, Sparkles, ShieldCheck, Bold, Italic, Link2, List, ListOrdered, Heading1, Heading2, Heading3, Unlink } from "lucide-react";

export default function IdeasCreate() {
 const navigate=useNavigate();
 const [subject,setSubject]=useState<string>("Tech");
 const [creatorType,setCreatorType]=useState<string>(""); const [postType,setPostType]=useState<"post"|"question"|"event">("post"); const [visibility,setVisibility]=useState<"public"|"friends">("public");
 const [title,setTitle]=useState(""); const [content,setContent]=useState("");
 const [location,setLocation]=useState(""); const [device,setDevice]=useState("Unknown"); const [scheduleMode,setScheduleMode]=useState<"now"|"scheduled">("now"); const [scheduledFor,setScheduledFor]=useState("");
 const editorRef=useRef<HTMLDivElement|null>(null); const [coverFile,setCoverFile]=useState<File|null>(null); const [imageAlt,setImageAlt]=useState(""); const [eventStart,setEventStart]=useState(""); const [eventEnd,setEventEnd]=useState(""); const [eventLocation,setEventLocation]=useState(""); const [eventUrl,setEventUrl]=useState(""); const [eventMaxAttendees,setEventMaxAttendees]=useState(""); const [saving,setSaving]=useState(false);
 useEffect(()=>{const ua=navigator.userAgent.toLowerCase();setDevice(/android|iphone|ipad|ipod|mobile/.test(ua)?"Mobile":/tablet/.test(ua)?"Mobile":/mac|win|linux/.test(ua)?"Desktop":"Unknown")},[]);

 const sanitizeRichHtml=(html:string)=>{const doc=new DOMParser().parseFromString(html,"text/html");doc.querySelectorAll("script,style,iframe,object,embed").forEach(n=>n.remove());doc.querySelectorAll("*").forEach((el)=>{Array.from(el.attributes).forEach((a)=>{if(a.name.toLowerCase().startsWith("on"))el.removeAttribute(a.name);if(a.name.toLowerCase()==="href"&&!/^https:\/\//i.test(a.value))el.removeAttribute(a.name)})});return doc.body.innerHTML};
 const format=(command:string,value?:string)=>{document.execCommand(command,false,value);if(editorRef.current)setContent(editorRef.current.innerHTML)};
 const addLink=()=>{const url=window.prompt("Enter HTTPS link");if(url&&/^https:\/\//i.test(url)){format("createLink",url)}else if(url){toast.error("Only HTTPS links are allowed.")}};
 const validateImage=(file:File)=>["image/jpeg","image/png","image/webp"].includes(file.type)&&file.size<=5*1024*1024;

 const uploadImage=async(userId:string,file:File,kind:"cover")=>{
   if(!validateImage(file)) throw new Error("Use JPG, PNG or WEBP up to 5 MB.");
   const ext=file.name.split(".").pop()||"jpg"; const path=`${userId}/${kind}-${crypto.randomUUID()}.${ext}`;
   const upload=await supabase.storage.from("idea-images").upload(path,file,{contentType:file.type,upsert:false});
   if(upload.error) throw upload.error;
   return supabase.storage.from("idea-images").getPublicUrl(path).data.publicUrl;
 };

 const submit=async()=>{
   const plainContent=editorRef.current?.innerText?.trim()||""; const richContent=sanitizeRichHtml(editorRef.current?.innerHTML||content);
   if(!title.trim()||!plainContent){toast.error("Title and idea content are required.");return}
   if(title.length>180||plainContent.length>5000){toast.error("Title/content is too long.");return}
   if(coverFile&&!imageAlt.trim()){toast.error("Add descriptive alt text for the cover image.");return}
   setSaving(true);
   try{
     const{data:{user}}=await supabase.auth.getUser();
     if(!user){toast.error("Create your Ideas ID and complete your profile before posting.");navigate("/ideas/account");return}
     const profile=await supabase.from("idea_profiles").select("user_id,first_name,middle_name,last_name,state,country,account_status,banned_until,is_creator,creator_types").eq("user_id",user.id).maybeSingle();
     if(profile.error) throw profile.error;
     const p=profile.data;
     if(!p || !p.first_name?.trim() || !p.last_name?.trim() || !p.state?.trim() || !p.country?.trim() || !user.email?.trim()){
       toast.error("Complete your full Ideas profile before posting.");
       navigate("/ideas/profile/me");
       return;
     }
     const publicName=[p.first_name,p.middle_name,p.last_name].filter(Boolean).join(" ");
     if(p.is_creator && !creatorType){toast.error("Select your Creator Subject before posting.");return}
     if(p.is_creator && creatorType && !(p.creator_types||[]).includes(creatorType)){toast.error("Select a Creator Subject from the subjects on your creator profile.");return}
     const scheduledAt=scheduleMode==="scheduled"&&scheduledFor?new Date(scheduledFor).toISOString():null;
     if(scheduleMode==="scheduled"&&(!scheduledAt||new Date(scheduledAt).getTime()<=Date.now())){toast.error("Choose a future date and time.");return}
     const imageUrl=coverFile?await uploadImage(user.id,coverFile,"cover"):null; const eventStartAt=postType==="event"&&eventStart?new Date(eventStart).toISOString():null; const eventEndAt=postType==="event"&&eventEnd?new Date(eventEnd).toISOString():null; if(postType==="event"&&(!eventStartAt||new Date(eventStartAt).getTime()<=Date.now())){toast.error("Choose a future event date and time.");return} if(postType==="event"&&eventEndAt&&new Date(eventEndAt).getTime()<=new Date(eventStartAt!).getTime()){toast.error("Event end time must be after the start time.");return}
     const{data:guard,error:guardError}=await supabase.functions.invoke("idea-content-guard",{body:{
       name:publicName,subject,creatorType:creatorType||null,title:title.trim(),content:richContent,location:location.trim(),deviceType:device,postType,visibility,
       scheduledFor:scheduledAt,imageUrl,imageAlt:imageAlt.trim()||title.trim(),eventStart:eventStartAt,eventEnd:eventEndAt,eventLocation,eventUrl,eventMaxAttendees
     }});
     if(guardError) throw guardError;
     if(!guard?.accepted){toast.error(guard?.error||"AI-like content detected. Please rewrite it in your own words.");return}
     if(guard?.status==="pending"){toast.success("Content detector check completed. Your post is now pending admin approval.");navigate("/ideas/profile/me");}else{toast.success("Post submitted for review.");navigate("/ideas/profile/me");}
   }catch(e:any){toast.error(e?.message||"Could not submit idea.")}finally{setSaving(false)}
 };

 return (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/40">
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link to="/ideas" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Back to Ideas</Link>
      <div className="mb-7 flex items-start gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 p-3 text-white shadow-lg"><Lightbulb /></div>
        <div><p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-violet-600">Community • Ideas</p><h1 className="text-3xl font-black tracking-tight md:text-4xl">Share something worth building.</h1><p className="mt-2 max-w-2xl text-muted-foreground">Share ideas, questions and experiences across Tech, AI, SEO, Travel and more. Every submission is reviewed before it becomes public.</p></div>
      </div>
      <Card className="overflow-hidden rounded-[30px] border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur">
        <CardContent className="p-5 md:p-8">
          <div className="mb-7 rounded-2xl border border-violet-100 bg-violet-50/70 p-4"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 text-violet-600" /><div><p className="font-bold">Keep it useful & original</p><p className="mt-1 text-sm text-muted-foreground">Choose one topic, explain the idea clearly, and add an image when it helps people understand it.</p></div></div></div>
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="grid gap-2"><Label>Type</Label><Select value={postType} onValueChange={v => setPostType(v as any)}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="post">Create Post</SelectItem><SelectItem value="question">Start a Discussion</SelectItem><SelectItem value="event">Create Event</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Visibility</Label><Select value={visibility} onValueChange={v => setVisibility(v as any)}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="friends">Friends only</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Subject</Label><Select value={subject} onValueChange={v => setSubject(v)}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Tech">Tech</SelectItem><SelectItem value="AI">AI</SelectItem><SelectItem value="SEO">SEO</SelectItem><SelectItem value="Travel">Travel</SelectItem><SelectItem value="Science">Science</SelectItem><SelectItem value="Economics">Economics</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div><div className="grid gap-2 md:col-span-3"><Label>Creator Subject <span className="font-normal text-muted-foreground">(for creator posts)</span></Label><Select value={creatorType} onValueChange={v=>setCreatorType(v)}><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select creator subject" /></SelectTrigger><SelectContent>{CREATOR_TYPES.map(t=><SelectItem key={t.key} value={t.key}>{t.icon} {t.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-2"><Label>Title *</Label><Input className="h-12 rounded-xl text-base" maxLength={180} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. A smarter way to monitor AI search visibility" /></div>
            <div className="grid gap-2"><div className="flex items-center justify-between gap-3"><Label>Content *</Label><span className="text-xs text-muted-foreground">{(editorRef.current?.innerText||"").length}/5000</span></div><div className="overflow-hidden rounded-2xl border bg-background shadow-sm"><div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2"><Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={()=>format("formatBlock","h1")} title="Heading 1"><Heading1 className="size-4"/></Button><Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={()=>format("formatBlock","h2")} title="Heading 2"><Heading2 className="size-4"/></Button><Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={()=>format("formatBlock","h3")} title="Heading 3"><Heading3 className="size-4"/></Button><span className="mx-1 h-6 w-px bg-border"/><Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={()=>format("bold")} title="Bold"><Bold className="size-4"/></Button><Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={()=>format("italic")} title="Italic"><Italic className="size-4"/></Button><Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={()=>format("insertUnorderedList")} title="Bulleted list"><List className="size-4"/></Button><Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={()=>format("insertOrderedList")} title="Numbered list"><ListOrdered className="size-4"/></Button><Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={addLink} title="Add link"><Link2 className="size-4"/></Button><Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={()=>format("unlink")} title="Remove link"><Unlink className="size-4"/></Button></div><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={e=>setContent(e.currentTarget.innerHTML)} data-placeholder="Write your idea with headings, links, lists and emphasis..." className="min-h-52 max-w-none p-5 text-base leading-7 outline-none [&:empty]:before:pointer-events-none [&:empty]:before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)] [&_h1]:my-4 [&_h1]:text-3xl [&_h1]:font-black [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:my-2 [&_h3]:text-xl [&_h3]:font-bold [&_a]:text-primary [&_a]:underline [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6"></div></div><p className="text-xs text-muted-foreground">Use H1/H2/H3 for structure, add links, and keep headings descriptive for better readability and SEO.</p></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2"><Label>Location <span className="font-normal text-muted-foreground">(optional)</span></Label><Input className="h-12 rounded-xl" value={location} onChange={e => setLocation(e.target.value)} placeholder="City / Country" /></div>
              <div className="grid gap-2"><Label>Posted from</Label><Input className="h-12 rounded-xl" value={device} readOnly aria-label="Automatically detected device" /></div>
            </div>
            {postType === "event" && <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 space-y-4">
              <div className="flex items-center gap-2 font-bold"><CalendarDays size={18}/> Event details</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label htmlFor="event-start">Start *</Label><Input id="event-start" type="datetime-local" className="mt-2 h-12 rounded-xl" value={eventStart} onChange={e=>setEventStart(e.target.value)} min={new Date(Date.now()+60000).toISOString().slice(0,16)}/></div>
                <div><Label htmlFor="event-end">End</Label><Input id="event-end" type="datetime-local" className="mt-2 h-12 rounded-xl" value={eventEnd} onChange={e=>setEventEnd(e.target.value)}/></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Event location</Label><Input className="mt-2 h-12 rounded-xl" value={eventLocation} onChange={e=>setEventLocation(e.target.value)} placeholder="Venue / Online"/></div>
                <div><Label>Event link</Label><Input className="mt-2 h-12 rounded-xl" value={eventUrl} onChange={e=>setEventUrl(e.target.value)} placeholder="https://..."/></div>
              </div>
              <div><Label>Maximum attendees</Label><Input type="number" min="1" className="mt-2 h-12 rounded-xl" value={eventMaxAttendees} onChange={e=>setEventMaxAttendees(e.target.value)} placeholder="Optional"/></div>
            </div>}
            <div className="grid gap-2">
              <Label>Publishing</Label>
              <Select value={scheduleMode} onValueChange={v => setScheduleMode(v as "now" | "scheduled")}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="now">Post Now</SelectItem><SelectItem value="scheduled">Schedule Post</SelectItem></SelectContent>
              </Select>
              {scheduleMode === "scheduled" && <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4"><Label htmlFor="scheduled-for">Schedule date & time</Label><Input id="scheduled-for" type="datetime-local" className="mt-2 h-12 rounded-xl" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} /><p className="mt-2 text-xs text-muted-foreground">The post will stay hidden until this time and will appear automatically after approval.</p></div>}
            </div>
            <div className="grid gap-2">
              <Label>Cover image <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <label className="flex min-h-28 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center text-sm text-muted-foreground transition hover:border-violet-300 hover:bg-violet-50/50">
                <ImagePlus size={22} />
                <span>{coverFile ? coverFile.name : "Add JPG, PNG or WEBP • maximum 5 MB"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
              </label>
              {coverFile && <div className="grid gap-2">
                <Label>Image alt text *</Label>
                <Input maxLength={180} className="h-12 rounded-xl" value={imageAlt} onChange={e => setImageAlt(e.target.value)} placeholder="Describe what the image shows" />
                <p className="text-xs text-muted-foreground">Used for accessibility and image SEO.</p>
              </div>}
            </div>
          </div>
          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={15} /> Reviewed before public publishing</div>
            <div className="flex gap-3"><Button variant="outline" className="rounded-xl" onClick={() => navigate("/ideas")}>Cancel</Button><Button className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6" onClick={submit} disabled={saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}Submit Idea</Button></div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
 );
}
