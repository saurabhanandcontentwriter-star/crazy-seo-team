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
  let {data,error}=await supabase.from("idea_posts").select(selectFields).eq("slug",requestedSlug).eq("status","approved").eq("visibility","public").maybeSingle();
  if((error||!data)&&requestedSlug){
   const rpc=await supabase.rpc("get_anvya_post_by_slug",{requested_slug:requestedSlug});
   if(!rpc.error&&Array.isArray(rpc.data)&&rpc.data.length&&rpc.data[0]?.slug===requestedSlug){data=rpc.data[0];error=null;}
  }
  if(error||!data){if(active)setLoading(false);return}
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
