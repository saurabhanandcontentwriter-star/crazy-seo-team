import {useEffect,useState} from "react";
import {Link,useNavigate,useParams} from "react-router-dom";
import {Helmet} from "react-helmet-async";
import {supabase} from "@/integrations/supabase/client";
import {Card,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowLeft,Loader2} from "lucide-react";

function sanitizeRichHtml(input:string){
 const doc=new DOMParser().parseFromString(input||"","text/html");
 doc.querySelectorAll("script,style,iframe,object,embed,form").forEach(el=>el.remove());
 doc.querySelectorAll("*").forEach(el=>{
  Array.from(el.attributes).forEach(a=>{
   const n=a.name.toLowerCase();
   if(n.startsWith("on")||["style","class","id"].includes(n))el.removeAttribute(a.name);
  });
  if(el.tagName.toLowerCase()==="img"){
   const src=el.getAttribute("src")||"";
   if(!/^https:\/\//i.test(src))el.remove();
   else{el.setAttribute("alt",el.getAttribute("alt")||"Article image");el.setAttribute("loading","lazy");}
  }
  if(el.tagName.toLowerCase()==="a"){
   const href=el.getAttribute("href")||"";
   if(!/^https:\/\//i.test(href))el.removeAttribute("href");
   else{el.setAttribute("target","_blank");el.setAttribute("rel","noopener noreferrer");}
  }
 });
 return doc.body.innerHTML;
}

export default function IdeasPost(){
 const {slug}=useParams(); const nav=useNavigate();
 const [post,setPost]=useState<any>(null); const [profile,setProfile]=useState<any>(null); const [loading,setLoading]=useState(true); const [isOwner,setIsOwner]=useState(false);
 useEffect(()=>{let active=true;(async()=>{
  if(!slug){nav("/anvya",{replace:true});return}
  const {data:userData}=await supabase.auth.getUser();
  const viewerId=userData.user?.id||null;
  const requestedSlug=decodeURIComponent(slug).trim();
  const selectFields="id,user_id,display_name,profile_image_url,title,content,post_type,visibility,subject,image_url,created_at,status,slug";
  let {data,error}=await supabase.rpc("get_anvya_post_by_slug",{requested_slug:requestedSlug});
  if(!error&&Array.isArray(data)&&data.length){data=data[0];}
  else if(!error&&!data){data=null;}

  // Resolve short/legacy ANVYA URLs even when the stored slug has a unique suffix.
  if((error||!data) && requestedSlug){
   const slugFallback=await supabase.from("idea_posts").select(selectFields)
     .ilike("slug",requestedSlug+"%")
     .order("created_at",{ascending:false})
     .limit(1)
     .maybeSingle();
   if(!slugFallback.error&&slugFallback.data){
    data=slugFallback.data;error=null;
   }else{
    const legacyTitle=requestedSlug.replace(/[-_]+/g," ").replace(/\s+/g," ").trim();
    if(legacyTitle){
     const titleFallback=await supabase.from("idea_posts").select(selectFields)
       .ilike("title",legacyTitle+"%")
       .order("created_at",{ascending:false})
       .limit(1)
       .maybeSingle();
     if(!titleFallback.error&&titleFallback.data){data=titleFallback.data;error=null;}
    }
   }
  }

  if(error||!data){
   if(requestedSlug==="google-september-2026-spam-update"||requestedSlug.startsWith("google-september-2026-spam-update-")){
    data={id:"anvya-google-september-2026-spam-update",user_id:"",display_name:"ANVYA",profile_image_url:null,title:"Google September 2026 Spam Update: What SEO Professionals Need to Know",content:"<img src=\"/blog/seo-tools-2026.jpg\" alt=\"Google September 2026 Spam Update SEO guide\"/><p>Google's September 2026 Spam Update is a reminder that sustainable SEO depends on helpful, original and trustworthy content rather than shortcuts designed to manipulate search visibility. SEO professionals should review content quality, technical signals and search intent before making large-scale changes.</p><h2>Google September 2026 Spam Update: What SEO Professionals Need to Know</h2><p>The September 2026 spam update makes spam-policy compliance and useful content important considerations for websites competing in Google Search. Review pages that rely heavily on scaled or repetitive content, aggressive keyword targeting, doorway-style pages, misleading redirects, hidden content or other tactics intended primarily to influence rankings.</p><h2>What Is the Google September 2026 Spam Update?</h2><p>Evaluate the update through the quality and intent of affected pages. Compare organic visibility, indexed URLs, queries and landing pages across the update period rather than reacting to one day of ranking movement.</p><h2>SEO Spam Signals to Review After the September 2026 Update</h2><p>Audit scaled content, duplicate or thin pages, keyword stuffing, manipulative internal linking, deceptive redirects, cloaking, hidden text and pages created primarily for search engines. Check whether each important URL provides a clear purpose and useful information for visitors.</p><h2>How to Recover From a Google Spam Update</h2><p>Start with Google Search Console and analytics. Identify URLs and query groups that changed, review crawlability and indexation, improve weak content, strengthen internal links where useful, validate canonical tags and structured data, and remove or consolidate genuinely redundant pages.</p><h2>Google Spam Update and AI-Generated Content</h2><p>Using AI does not by itself replace the need for originality, accuracy, usefulness and editorial review. AI-assisted content should add real value and should not be mass-produced merely to manipulate search visibility.</p><h2>Technical SEO Checklist for September 2026</h2><p>Check robots directives, canonical signals, redirects, status codes, sitemap coverage, indexability, structured data, page experience and internal linking. Keep a dated record of changes so traffic and ranking movements can be compared with actual site updates.</p><h2>Final Takeaway for SEO Professionals</h2><p>Focus on useful original content, clear search intent, technically accessible pages and transparent SEO practices. Monitor Search Console and analytics over time and document every significant change.</p>",post_type:"blog",visibility:"public",subject:"SEO",image_url:"/blog/seo-tools-2026.jpg",created_at:new Date().toISOString(),status:"approved",slug:requestedSlug};
    error=null;
   }else{if(active)setLoading(false);return}
  }
  const owner=data.user_id===viewerId;
  if(data.status!=="approved"&&!owner){if(active)setLoading(false);return}
  if(!active)return;
  setIsOwner(owner);
  setPost(data);
  const {data:p}=await supabase.from("idea_profiles").select("user_id,display_name,avatar_url,profile_slug,public_id,bio").eq("user_id",data.user_id).maybeSingle();
  if(active)setProfile(p);
  setLoading(false);
 })();return()=>{active=false}},[slug,nav]);
 if(loading)return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary"/></div>;
 if(!post)return <div className="min-h-screen bg-background p-6"><div className="mx-auto max-w-2xl py-20 text-center"><h1 className="text-2xl font-black">Post not found</h1><p className="mt-2 text-muted-foreground">This ANVYA post may still be under review or the URL is no longer available.</p><Button className="mt-5" onClick={()=>nav("/anvya")}>Back to ANVYA</Button></div></div>;
 const title=post.title||"ANVYA Post"; const canonical=`https://crazyseoteam.in/anvya/${post.slug}`;
 return <div className="min-h-screen bg-background">
  <Helmet><title>{title} | ANVYA</title><meta name="description" content={String(post.content||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,155)}/><link rel="canonical" href={canonical}/></Helmet>
  <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
   <Link to={profile?.public_id?"/anvya/profile/"+profile.public_id:"/anvya"} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4"/>Back to profile</Link>
   <Card className="mt-6 overflow-hidden rounded-3xl">
    {post.image_url&&<img src={post.image_url} alt={title} className="max-h-[520px] w-full object-cover"/>}
    <CardContent className="p-6 md:p-10">
     <div className="flex flex-wrap gap-2"><Badge>{post.post_type||"post"}</Badge>{post.subject&&<Badge variant="outline">{post.subject}</Badge>}{post.status==="pending"&&isOwner&&<Badge variant="outline">Pending review</Badge>}</div>
     <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">{title}</h1>
     <div className="mt-4 flex items-center gap-3">
      {profile?.avatar_url||post.profile_image_url?<img src={profile?.avatar_url||post.profile_image_url} alt="" className="size-10 rounded-full object-cover"/>:null}
      <div><p className="font-bold">{profile?.display_name||post.display_name||"ANVYA Member"}</p><p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p></div>
     </div>
     <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{__html:sanitizeRichHtml(post.content)}}/>
    </CardContent>
   </Card>
  </main>
 </div>;
}
