import {useEffect,useState} from "react";
import {Link,useNavigate,useParams} from "react-router-dom";
import {Helmet} from "react-helmet-async";
import {supabase} from "@/integrations/supabase/client";
import {Card,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ArrowLeft,Loader2} from "lucide-react";
import {toast} from "sonner";

function PostShareAudit({post}:{post:any}){
 const[me,setMe]=useState<string|null>(null),[shares,setShares]=useState<any[]>([]);
 useEffect(()=>{(async()=>{const{data:{user}}=await supabase.auth.getUser();setMe(user?.id||null);if(!post?.id||String(post.id).startsWith("anvya-"))return;const{data}=await supabase.from("idea_post_shares").select("id,user_id,created_at,channel").eq("post_id",post.id).order("created_at",{ascending:false});const rows=data||[];if(!rows.length){setShares([]);return}const ids=[...new Set(rows.map(x=>x.user_id))];const{data:profiles}=await supabase.from("idea_profiles").select("user_id,display_name,public_id,first_name,middle_name,last_name,avatar_url").in("user_id",ids);const byId=new Map((profiles||[]).map(p=>[p.user_id,p]));setShares(rows.map(x=>({...x,profile:byId.get(x.user_id)})))})()},[post?.id]);
 const share=async()=>{if(!me)return toast.error("Please sign in first so ANVYA can record who shared this post.");if(String(post.id).startsWith("anvya-"))return toast.error("This fallback article has no database Post ID yet.");const{error}=await supabase.from("idea_post_shares").upsert({post_id:post.id,user_id:me,channel:"web"},{onConflict:"post_id,user_id"});if(error){toast.error(error.message);return}const url=new URL("/anvya/"+encodeURIComponent(String(post.slug||"")),window.location.origin).href;try{if(navigator.share)await navigator.share({title:post.title,text:post.title,url});else await navigator.clipboard.writeText(url);toast.success("Post shared — original Post ID: "+post.id)}catch{}const{data:p}=await supabase.from("idea_profiles").select("user_id,display_name,public_id,first_name,middle_name,last_name,avatar_url").eq("user_id",me).maybeSingle();setShares(v=>{const exists=v.some(x=>x.user_id===me);return exists?v:[{id:"local-"+me,user_id:me,created_at:new Date().toISOString(),channel:"web",profile:p},...v]})};
 return <div className="mt-4 rounded-2xl border bg-muted/20 p-4"><div className="mt-3 flex flex-wrap items-center gap-2"><Button size="sm" variant="outline" onClick={share}>↗️ Share {shares.length?shares.length:""}</Button>{shares.length>0&&<details className="basis-full rounded-xl border bg-background/70 p-2"><summary className="cursor-pointer text-xs font-medium">Shared by {shares.length} {shares.length===1?"person":"people"}</summary><div className="mt-2 flex flex-wrap gap-2">{shares.map(s=><Link key={s.id} to={"/anvya/profile/"+s.user_id} className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs hover:bg-muted"><span className="size-5 overflow-hidden rounded-full bg-muted">{s.profile?.avatar_url?<img src={s.profile.avatar_url} alt="" className="size-full object-cover"/>:null}</span><span>{s.profile?.display_name||[s.profile?.first_name,s.profile?.middle_name,s.profile?.last_name].filter(Boolean).join(" ")||s.profile?.public_id||"User"}</span><span className="font-mono text-[10px] text-muted-foreground">{post.id}</span></Link>)}</div></details>}</div></div>
}

function requestedSlugForSeo(slug:string,post:any){
 const normalized=String(slug||post?.slug||"").toLowerCase();
 if(normalized==="google-september-2026-spam-update"){
  return "Google September 2026 Spam Update explained: SEO impact, content quality checks, technical fixes, and practical steps to protect search visibility.";
 }
 return String(post?.content||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,155);
}
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
  if(requestedSlug==="google-september-2026-spam-update-what-seo-professionals-need-to-know-689dfd0b"){nav("/anvya/google-september-2026-spam-update",{replace:true});return;}
  const selectFields="id,user_id,profile_id,display_name,profile_image_url,title,content,post_type,visibility,subject,image_url,created_at,status,slug";
  // Canonical public lookup first. This resolves the real database post by
  // slug and never manufactures article content or a synthetic Post ID.
  let {data,error}=await supabase.rpc("get_anvya_post_by_slug",{requested_slug:requestedSlug});
  if(!error && Array.isArray(data) && data.length){data=data[0];}
  else {data=null;}
  if((error||!data)&&requestedSlug==="google-september-2026-spam-update"){
   const googlePosts=await supabase.from("idea_posts").select(selectFields).or("slug.ilike.%google-september-2026-spam-update%,title.ilike.Google September 2026 Spam Update:%").eq("status","approved").eq("visibility","public").order("created_at",{ascending:false}).limit(1);
   if(!googlePosts.error&&googlePosts.data?.length){data=googlePosts.data[0];error=null;}
  }
  if((error||!data)&&requestedSlug){
   const rpc=await supabase.rpc("get_anvya_post_by_slug",{requested_slug:requestedSlug});
   if(!rpc.error&&Array.isArray(rpc.data)&&rpc.data.length){
    const candidate=rpc.data[0];
    const canonicalGoogle=requestedSlug==="google-september-2026-spam-update" && String(candidate.title||"").trim()==="Google September 2026 Spam Update: What SEO Professionals Need to Know";
    if(candidate.slug===requestedSlug||canonicalGoogle){data=candidate;error=null;}
   }
  }

  // For the canonical shared Google URL, ask the service-role profile endpoint for the real stored post.
  // This reads the database row only; it never creates a fallback post or invents a Post ID.
  if((error||!data)&&requestedSlug==="google-september-2026-spam-update"){
   try{
    const {data:ownerPosts,error:ownerPostsError}=await supabase.functions.invoke("crm-ideas-users",{
     body:{action:"profile_posts",public_id:"CST-76A57C84E0"}
    });
    if(!ownerPostsError){
     const candidate=(ownerPosts?.posts||[]).find((row:any)=>String(row.slug||"").toLowerCase()==="google-september-2026-spam-update");
     if(candidate){data=candidate;error=null;}
    }
   }catch{}
  }

  // Last-resort public-feed lookup: if the article is approved/public but its
  // legacy slug/profile mapping is inconsistent, the public ANVYA feed can
  // still identify it without depending on author-specific RLS.
  if((error||!data)&&requestedSlug){
   const feed=await supabase.from("idea_posts")
    .select(selectFields)
    .eq("status","approved")
    .eq("visibility","public")
    .order("created_at",{ascending:false})
    .limit(100);
   if(!feed.error){
    const target=requestedSlug.toLowerCase();
    const normalizedTarget=target.replace(/[^a-z0-9]+/g," ").trim();
    const candidate=(feed.data||[]).find((row:any)=>{
      const rowSlug=String(row.slug||"").toLowerCase();
      const rowTitle=String(row.title||"").toLowerCase();
      const normalizedTitle=rowTitle.replace(/[^a-z0-9]+/g," ").trim();
      return rowSlug===target
        || rowSlug.startsWith(target+"-")
        || rowSlug.includes(target)
        || normalizedTitle===normalizedTarget
        || (target==="google-september-2026-spam-update" &&
            normalizedTitle==="google september 2026 spam update what seo professionals need to know");
    });
    if(candidate){data=candidate;error=null;}
   }
  }
    if(error||!data){if(active)setLoading(false);return}
  const owner=data.user_id===viewerId;
  if(data.status!=="approved"&&!owner){if(active)setLoading(false);return}
  if(!active)return;
  setIsOwner(owner);
  setPost(data);
  const {data:p}=await supabase.from("idea_profiles").select("user_id,display_name,avatar_url,profile_slug,public_id,bio").eq("user_id",data.user_id).maybeSingle();
  if(active)setProfile(p||(
    data.profile_id
      ? {public_id:data.profile_id,display_name:data.display_name,avatar_url:data.profile_image_url||null}
      : null
  ));
  setLoading(false);
 })();return()=>{active=false}},[slug,nav]);
 if(loading)return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary"/></div>;
 if(!post)return <div className="min-h-screen bg-background p-6"><div className="mx-auto max-w-2xl py-20 text-center"><h1 className="text-2xl font-black">Post not found</h1><p className="mt-2 text-muted-foreground">This ANVYA post may still be under review or the URL is no longer available.</p><Button className="mt-5" onClick={()=>nav("/anvya")}>Back to ANVYA</Button></div></div>;
 const title=post.title||"ANVYA Post"; const canonical=`https://crazyseoteam.in/anvya/${post.slug}`;
 return <div className="min-h-screen bg-background">
  <Helmet><title>{title} | ANVYA</title><meta name="description" content={requestedSlugForSeo(requestedSlug,post)}/><link rel="canonical" href={canonical}/><meta property="og:title" content={title}/><meta property="og:description" content={requestedSlugForSeo(requestedSlug,post)}/><meta property="og:url" content={canonical}/><meta property="og:type" content="article"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content={title}/><meta name="twitter:description" content={requestedSlugForSeo(requestedSlug,post)}/></Helmet>
  <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
   <Link to={profile?.public_id?"/anvya/profile/"+profile.public_id:"/anvya"} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4"/>Back to profile</Link>
   <Card className="mt-6 overflow-hidden rounded-3xl">
    {post.image_url&&<img src={post.image_url} alt={title} className="max-h-[520px] w-full object-cover"/>}
    <CardContent className="p-6 md:p-10">
     <div className="flex flex-wrap gap-2"><Badge>{post.post_type||"post"}</Badge>{post.subject&&<Badge variant="outline">{post.subject}</Badge>}{post.status==="pending"&&isOwner&&<Badge variant="outline">Pending review</Badge>}</div>
     <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">{title}</h1>
     <div className="mt-4 flex items-center gap-3">
      {profile?.avatar_url||post.profile_image_url?<img src={profile?.avatar_url||post.profile_image_url} alt="" className="size-10 rounded-full object-cover"/>:null}
      <div>
       {profile?.public_id
         ? <Link to={"/anvya/profile/"+profile.public_id} className="font-bold hover:text-primary hover:underline">{profile?.display_name||post.display_name||"ANVYA Member"}</Link>
         : <p className="font-bold">{profile?.display_name||post.display_name||"ANVYA Member"}</p>}
       <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>
      </div>
     </div>
     <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{__html:sanitizeRichHtml(post.content)}}/>
     
    </CardContent>
   </Card>
  </main>
 </div>;
}
