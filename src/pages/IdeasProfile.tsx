import {useEffect,useRef,useState} from "react";
import {Link,useNavigate,useParams} from "react-router-dom";
import {supabase} from "@/integrations/supabase/client";
import { firebaseAuth } from "@/integrations/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Card,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import IdeasMessages from "@/components/IdeasMessages";
import IdeasInlinePostComposer from "@/components/IdeasInlinePostComposer";
import CreatorProfilePanel from "@/components/CreatorProfilePanel";
import {ArrowLeft,LogIn,LogOut,UserPlus,UserCheck,Users,FileText,Activity,HelpCircle,Save,ExternalLink,Loader2,UserCircle2,Camera,ShieldCheck,Upload,Clock3,Bookmark,FileEdit,BarChart3,Moon,Sun,Languages,Globe2,Settings2,MessageCircle,Quote,Facebook,Linkedin,Instagram,Twitter,Mail,Send,Home,Compass,Bell,Plus,Crown,Calendar,Link2,PawPrint,Trash2} from "lucide-react";

type Profile={experience?:any[];education_details?:any[];projects?:any[];certificates?:any[];medium_url?:string|null;user_id:string;display_name:string;working?:string|null;company?:string|null;education?:string|null;date_of_birth?:string|null;first_name?:string|null;middle_name?:string|null;last_name?:string|null;state?:string|null;country?:string|null;bio:string|null;avatar_url:string|null;cover_url:string|null;location:string|null;website_url:string|null;linkedin_url:string|null;github_url:string|null;instagram_url:string|null;twitter_url:string|null;medium_url?:string|null;public_id?:string|null;reputation_points?:number;level?:number;verified?:boolean;profile_slug?:string|null;is_creator?:boolean;creator_types?:string[]|null;creator_since?:string|null;creator_rules_accepted_at?:string|null};
type Post={id:string;user_id:string;display_name:string|null;profile_image_url:string|null;title:string;content:string;post_type:string;visibility:string;subject:string;image_url:string|null;created_at:string;status:string;tags?:string[]};

function sanitizeRichHtml(input:string){
 const cleanedInput=input.replace(/\\\\n/g,"<br>");
 const parser=new DOMParser();
 const doc=parser.parseFromString(cleanedInput,"text/html");
 doc.querySelectorAll("script,style,iframe,object,embed,form").forEach(el=>el.remove());
 doc.querySelectorAll("*").forEach(el=>{
  Array.from(el.attributes).forEach(a=>{
   if(a.name.toLowerCase().startsWith("on")||["style","class","id"].includes(a.name.toLowerCase()))el.removeAttribute(a.name);
  });
  if(el.tagName.toLowerCase()==="a"){
   const href=el.getAttribute("href")||"";
   if(!/^https:\/\//i.test(href))el.removeAttribute("href");
   else{el.setAttribute("target","_blank");el.setAttribute("rel","noopener noreferrer")}
  }
 });
 return doc.body.innerHTML;
}
export default function IdeasProfile(){
 // Keep profile UI clean: no literal newline escape should ever be rendered as JSX text.
 const {userId}=useParams(); const nav=useNavigate();
 const [me,setMe]=useState<string|null>(null),[p,setP]=useState<Profile|null>(null),[verification,setVerification]=useState<any>(null),[posts,setPosts]=useState<Post[]>([]),[followerCount,setFollowerCount]=useState(0),[followingCount,setFollowingCount]=useState(0),[tab,setTab]=useState("posts"),[reshares,setReshares]=useState<Post[]>([]),[following,setFollowing]=useState(false),[friendStatus,setFriendStatus]=useState<string|null>(null),[edit,setEdit]=useState(false),[saving,setSaving]=useState(false),[loading,setLoading]=useState(true),[form,setForm]=useState<Partial<Profile>>({}),[avatarFile,setAvatarFile]=useState<File|null>(null),[coverFile,setCoverFile]=useState<File|null>(null),[requesters,setRequesters]=useState<Profile[]>([]);
 const [section,setSection]=useState("content"),[darkMode,setDarkMode]=useState(false),[language,setLanguage]=useState("English"),[region,setRegion]=useState("Global"),[draftCount,setDraftCount]=useState(0),[profileOnline,setProfileOnline]=useState(false),[profileLastSeen,setProfileLastSeen]=useState<string|null>(null),[pinnedPostId,setPinnedPostId]=useState<string|null>(null),[showPostComposer,setShowPostComposer]=useState(false),[notificationCount,setNotificationCount]=useState(0);
 useEffect(()=>{const syncDraft=()=>setDraftCount(Number(localStorage.getItem("ideas-draft-count")||0));syncDraft();window.addEventListener("anvya-draft-changed",syncDraft);return()=>window.removeEventListener("anvya-draft-changed",syncDraft)},[]);
 useEffect(()=>{
  const widgetStyleId="anvya-omnidimension-no-logo";
  const hideOmniLogo=()=>{
   const roots:any[]=[document];
   const collect=(root:any)=>{
    root.querySelectorAll("*").forEach((el:any)=>{if(el.shadowRoot&&!roots.includes(el.shadowRoot)){roots.push(el.shadowRoot);collect(el.shadowRoot)}});
   };
   collect(document);
   roots.forEach((root:any)=>{
    if(root.getElementById?.(widgetStyleId)||root.querySelector?.("#"+widgetStyleId))return;
    const style=document.createElement("style");
    style.id=widgetStyleId;
    style.textContent="[id*=\"omnidimension\"] img,[class*=\"omnidimension\"] img,[id*=\"omnidim\"] img,[class*=\"omnidim\"] img{display:none!important;width:0!important;height:0!important;margin:0!important;padding:0!important;}";
    root.appendChild(style);
   });
  };
  const existing=document.getElementById("omnidimension-web-widget");
  if(!existing){const script=document.createElement("script");script.id="omnidimension-web-widget";script.async=true;script.src="https://omnidim.io/web_widget.js?secret_key=8995be432b1a7ccacbb2a148e040417a";document.body.appendChild(script);}
  hideOmniLogo();
  const observer=new MutationObserver(()=>hideOmniLogo());
  observer.observe(document.documentElement,{subtree:true,childList:true});
  return()=>{observer.disconnect();document.getElementById("omnidimension-web-widget")?.remove();document.querySelectorAll('[id^="omnidimension"]').forEach(el=>el.remove());document.querySelectorAll("#"+widgetStyleId).forEach(el=>el.remove())};
 },[]);
 useEffect(()=>{let cancelled=false;let channel:any=null;(async()=>{if(!me)return;const {data:myPosts}=await supabase.from("idea_posts").select("id").eq("user_id",me);const ids=(myPosts||[]).map(x=>x.id);if(!ids.length){if(!cancelled)setNotificationCount(0);return}const [comments,reshares]=await Promise.all([supabase.from("idea_post_comments").select("id").in("post_id",ids).neq("user_id",me),supabase.from("idea_post_reshares").select("post_id,user_id,created_at").in("post_id",ids).neq("user_id",me)]);if(!cancelled)setNotificationCount((comments.data||[]).length+(reshares.data||[]).length);channel=supabase.channel("anvya-notification-count-"+me).on("postgres_changes",{event:"INSERT",schema:"public",table:"idea_post_comments"},payload=>{const row:any=payload.new;if(row?.user_id!==me&&ids.includes(row?.post_id))setNotificationCount(v=>v+1)}).on("postgres_changes",{event:"INSERT",schema:"public",table:"idea_post_reshares"},payload=>{const row:any=payload.new;if(row?.user_id!==me&&ids.includes(row?.post_id))setNotificationCount(v=>v+1)}).subscribe()})();return()=>{cancelled=true;if(channel)supabase.removeChannel(channel)}},[me]);
 const applyTheme=(mode:"light"|"dark"|"system")=>{
  const isDark=mode==="dark"||(mode==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark",isDark);
  document.documentElement.style.colorScheme=isDark?"dark":"light";
  setDarkMode(isDark);
 };
 const saveTheme=(mode:"light"|"dark"|"system")=>{localStorage.setItem("ideas-theme",mode);applyTheme(mode);};
 const load=async()=>{setLoading(true);
 const directRaw=sessionStorage.getItem("ideas_direct_profile");
 if((!userId||userId==="me")&&directRaw){
  try{
   const d=JSON.parse(directRaw);
   if(d?.public_id){
    let {data:{user:directUser}}=await supabase.auth.getUser();
    let storedProfile:any=null;
    if(d.email){
      const {data:existingProfile}=await supabase.from("idea_profiles").select("*").eq("email",d.email).maybeSingle();
      storedProfile=existingProfile;
    }
    const directId=storedProfile?.user_id||d.user_id||directUser?.id||crypto.randomUUID();
    if(directUser&&d.email) void supabase.from("idea_account_registry").update({user_id:directId,last_seen_at:new Date().toISOString()}).eq("email",d.email);
    const directProfile={...(storedProfile||{}),user_id:directId,display_name:storedProfile?.display_name||d.display_name||"Ideas Member",first_name:storedProfile?.first_name||d.first_name||null,middle_name:storedProfile?.middle_name||d.middle_name||null,last_name:storedProfile?.last_name||d.last_name||null,state:storedProfile?.state||d.state||null,country:storedProfile?.country||d.country||null,bio:storedProfile?.bio||null,avatar_url:storedProfile?.avatar_url||null,cover_url:storedProfile?.cover_url||null,location:storedProfile?.location||d.location||[d.state,d.country].filter(Boolean).join(", "),website_url:storedProfile?.website_url||null,linkedin_url:storedProfile?.linkedin_url||null,github_url:storedProfile?.github_url||null,instagram_url:storedProfile?.instagram_url||null,twitter_url:storedProfile?.twitter_url||null,medium_url:storedProfile?.medium_url||null,experience:storedProfile?.experience||[],education_details:storedProfile?.education_details||[],projects:storedProfile?.projects||[],certificates:storedProfile?.certificates||[],public_id:storedProfile?.public_id||d.public_id,reputation_points:storedProfile?.reputation_points||0,level:storedProfile?.level||1,verified:storedProfile?.verified||false};
    setMe(directId);setP(directProfile as Profile);setForm(directProfile as Profile);setPosts([]);setReshares([]);setRequesters([]);setVerification(null);setLoading(false);return;
   }
  }catch{sessionStorage.removeItem("ideas_direct_profile")}
 }
 const {data:{user}}=await supabase.auth.getUser();
 setMe(user?.id||null);
 let id:string|undefined=!userId||userId==="me"?user?.id:userId;
 if(userId&&userId!=="me"&&!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(userId)){
  const slug=decodeURIComponent(userId).trim().toLowerCase();
  const {data:slugProfile}=await supabase.from("idea_profiles").select("user_id,display_name,first_name,middle_name,last_name,state,country,bio,avatar_url,cover_url,location,website_url,linkedin_url,github_url,instagram_url,twitter_url,profile_slug,date_of_birth,working,company,education,public_id,reputation_points,level,verified,account_status,banned_until,email,is_creator,creator_types,creator_since,creator_rules_accepted_at").or(`profile_slug.ilike.${slug},public_id.eq.${slug.toUpperCase()},email.ilike.${slug}@gmail.com`).maybeSingle();
  if(slugProfile?.user_id) id=slugProfile.user_id;
 }
 if(!id){setLoading(false);nav("/anvya/login",{replace:true});return}
 const {data:profile,error:profileError}=await supabase.from("idea_profiles").select("user_id,display_name,first_name,middle_name,last_name,state,country,bio,avatar_url,cover_url,location,website_url,linkedin_url,github_url,instagram_url,twitter_url,date_of_birth,working,company,education,public_id,reputation_points,level,verified,account_status,banned_until,is_creator,creator_types,creator_since,creator_rules_accepted_at").eq("user_id",id).maybeSingle();
 if(profileError){console.error("ANVYA profile lookup failed",profileError);setLoading(false);return;}
 if(!profile&&user?.id===id){
  const fallback={user_id:user.id,display_name:user.user_metadata?.full_name||user.email?.split("@")[0]||"Member"};
  const {data:created,error:createError}=await supabase.from("idea_profiles").insert(fallback).select("user_id,display_name").single();
  if(createError){
   console.warn("ANVYA profile auto-create skipped:",createError.message);
   setP(fallback as Profile);setForm(fallback as Profile);
  }else{
   setP((created||fallback) as Profile);setForm((created||fallback) as Profile);
  }
 }else{setP(profile as Profile|null);setForm((profile||{}) as Profile)}
 if(profile?.user_id){
  const {data:professionalSections}=await supabase.from("idea_profiles").select("experience,education_details,projects,certificates,medium_url").eq("user_id",profile.user_id).maybeSingle();
  if(professionalSections){
   const merged={...(profile as any),...(professionalSections as any)};
   setP(merged as Profile);setForm(merged as Profile);
  }
 }
 if(userId==="me"&&user?.id===id&&profile?.public_id){nav("/anvya/profile/"+profile.public_id,{replace:true});return}
 if(!profile&&user?.id!==id){setLoading(false);return}
 setLoading(false);
 const [verificationResult,postsResult,resharesResult,incomingResult]=await Promise.all([
  user&&id===user.id?supabase.from("idea_verification_requests").select("id,status,rejection_reason,created_at").eq("user_id",id).maybeSingle():Promise.resolve({data:null}),
  supabase.from("idea_posts").select("id,user_id,display_name,profile_image_url,title,content,post_type,visibility,subject,tags,image_url,created_at,status").eq("user_id",id).eq("status","approved").order("created_at",{ascending:false}),
  supabase.from("idea_post_reshares").select("post_id").eq("user_id",id).order("created_at",{ascending:false}),
  user&&id===user.id?supabase.from("idea_friendships").select("requester_id").eq("addressee_id",user.id).eq("status","pending"):Promise.resolve({data:[]})
 ]);
 setVerification(verificationResult.data||null);
 setPosts((postsResult.data as Post[])||[]);
 const [{count:followers},{count:followingCountValue}]=await Promise.all([supabase.from("idea_follows").select("follower_id",{count:"exact",head:true}).eq("following_id",id),supabase.from("idea_follows").select("following_id",{count:"exact",head:true}).eq("follower_id",id)]);setFollowerCount(followers||0);setFollowingCount(followingCountValue||0);
 const shareIds=(resharesResult.data||[]).map((x:any)=>x.post_id);
 if(shareIds.length){
  const {data:rp}=await supabase.from("idea_posts").select("id,user_id,display_name,profile_image_url,title,content,post_type,visibility,subject,tags,image_url,created_at,status").in("id",shareIds).eq("status","approved");
  setReshares(shareIds.map((sid:string)=>(rp||[]).find((x:any)=>x.id===sid)).filter(Boolean) as Post[]);
 }else setReshares([]);
 const incomingIds=(incomingResult.data||[]).map((x:any)=>x.requester_id);
 if(incomingIds.length){
  const {data:rp}=await supabase.from("idea_profiles").select("user_id,display_name,avatar_url,location,state,country,verified,level,reputation_points").in("user_id",incomingIds);
  setRequesters((rp as Profile[])||[]);
 }else setRequesters([]);
 if(user&&id!==user.id){
  const [f,fr]=await Promise.all([
   supabase.from("idea_follows").select("follower_id").eq("follower_id",user.id).eq("following_id",id).maybeSingle(),
   supabase.from("idea_friendships").select("requester_id,addressee_id,status").or("and(requester_id.eq."+user.id+",addressee_id.eq."+id+"),and(requester_id.eq."+id+",addressee_id.eq."+user.id+")").maybeSingle()
  ]);
  setFollowing(!!f.data);setFriendStatus(fr.data?.status||null);
 }
 if(profile?.user_id===id&&!profile.public_id){
  const publicId="CST-"+id.replace(/-/g,"").slice(0,10).toUpperCase();
  setP(prev=>prev?{...prev,public_id:publicId}:prev);
  void supabase.from("idea_profiles").update({public_id:publicId}).eq("user_id",id);
 }
};
 useEffect(()=>{
  if(!p?.user_id) return;
  const raw=sessionStorage.getItem("ideas_message_target");
  const openMessages=sessionStorage.getItem("ideas_open_messages")==="1";
  if(raw){try{JSON.parse(raw);setTab("messages");}catch{} sessionStorage.removeItem("ideas_message_target");sessionStorage.removeItem("ideas_open_messages")}
  else if(openMessages){setTab("messages");sessionStorage.removeItem("ideas_open_messages")}
  else setTab("posts");
 },[p?.user_id,me,userId]);
 useEffect(()=>{
  if(!p?.user_id) return;
  let cancelled=false;
  let channel:any=null;
  const refreshPresence=async()=>{
   const {data}=await supabase.from("idea_presence").select("last_seen_at").eq("user_id",p.user_id).maybeSingle();
   if(cancelled)return;
   const lastSeen=data?.last_seen_at?new Date(data.last_seen_at).getTime():0;
   setProfileLastSeen(data?.last_seen_at||null);
   setProfileOnline(!!lastSeen && Date.now()-lastSeen<=90000);
  };
  void refreshPresence();
  channel=supabase.channel("profile-presence-"+p.user_id).on("postgres_changes",{event:"*",schema:"public",table:"idea_presence",filter:"user_id=eq."+p.user_id},()=>{void refreshPresence()}).subscribe();
  const timer=window.setInterval(()=>{void refreshPresence()},30000);
  return()=>{cancelled=true;window.clearInterval(timer);if(channel)supabase.removeChannel(channel)};
 },[p?.user_id]);
 useEffect(()=>{
  if(!me) return;
  let cancelled=false;
  const heartbeat=async()=>{
   if(document.visibilityState!=="visible")return;
   const now=new Date().toISOString();
   const {error}=await supabase.from("idea_presence").upsert({user_id:me,last_seen_at:now},{onConflict:"user_id"});
   if(!error&&!cancelled&&p?.user_id===me){setProfileLastSeen(now);setProfileOnline(true)}
  };
  void heartbeat();
  const timer=window.setInterval(()=>{void heartbeat()},30000);
  const onVisible=()=>{if(document.visibilityState==="visible")void heartbeat()};
  document.addEventListener("visibilitychange",onVisible);
  return()=>{cancelled=true;window.clearInterval(timer);document.removeEventListener("visibilitychange",onVisible)};
 },[me,p?.user_id]);
 useEffect(()=>{
  const saved=localStorage.getItem("ideas-draft-count");setDraftCount(saved?Number(saved)||0:0);
  setLanguage(localStorage.getItem("ideas-language")||"English");setRegion(localStorage.getItem("ideas-region")||"Global");
  const savedTheme=(localStorage.getItem("ideas-theme")||"system") as "light"|"dark"|"system";
  applyTheme(savedTheme);
  const media=window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange=()=>{if((localStorage.getItem("ideas-theme")||"system")==="system")applyTheme("system");};
  media.addEventListener?.("change",onSystemChange);
  load();
  return()=>{media.removeEventListener?.("change",onSystemChange);};
 },[userId]);
 const handleAuth=async()=>{if(me){const profileId=p?.user_id;sessionStorage.removeItem("ideas_direct_profile");sessionStorage.removeItem("ideas_congratulations");const {error}=await supabase.auth.signOut();if(error){toast.error(error.message);return}await firebaseSignOut(firebaseAuth).catch(()=>{});setMe(null);toast.success("Logged out successfully.");nav("/anvya/login",{replace:true});}else{nav("/anvya/login");}};
 const toggleFollow=async()=>{if(!me||!p)return toast.error("Please sign in first.");if(following){const {error}=await supabase.from("idea_follows").delete().eq("follower_id",me).eq("following_id",p.user_id);if(error)toast.error(error.message);else{setFollowing(false);toast.success("Unfollowed.")}}else{const {error}=await supabase.from("idea_follows").insert({follower_id:me,following_id:p.user_id});if(error)toast.error(error.message);else{setFollowing(true);toast.success("Following.")}}};
 const respondFriend=async(requester:string,status:"accepted"|"rejected")=>{if(!me)return;const {error}=await supabase.from("idea_friendships").update({status,updated_at:new Date().toISOString()}).eq("requester_id",requester).eq("addressee_id",me);if(error)toast.error(error.message);else{setRequesters(x=>x.filter(y=>y.user_id!==requester));toast.success(status==="accepted"?"Friend request accepted.":"Friend request rejected.");}};
 const friend=async()=>{if(!me||!p)return toast.error("Please sign in first.");if(friendStatus==="accepted"||friendStatus==="pending")return;const {error}=await supabase.from("idea_friendships").insert({requester_id:me,addressee_id:p.user_id});if(error)toast.error(error.message);else{setFriendStatus("pending");toast.success("Friend request sent.")}};
 const uploadImage=async(file:File,kind:"avatar"|"cover")=>{if(!me)throw new Error("Please sign in again.");if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)throw new Error("Use JPG, PNG or WEBP up to 5 MB.");const ext=(file.name.split(".").pop()||"jpg").toLowerCase();const path=`${me}/${kind}-${crypto.randomUUID()}.${ext}`;const storage=supabase.storage.from("idea-images");const up=await storage.upload(path,file,{contentType:file.type,cacheControl:"3600",upsert:false});if(up.error){console.error("ANVYA image upload failed",up.error);throw new Error(up.error.message||"Image upload failed. Please try again.");}const url=storage.getPublicUrl(path).data.publicUrl;if(!url)throw new Error("Image URL could not be created.");return url};
 const save=async()=>{if(!me)return;setSaving(true);try{let avatar=form.avatar_url,cover=form.cover_url;if(avatarFile)avatar=await uploadImage(avatarFile,"avatar");if(coverFile)cover=await uploadImage(coverFile,"cover");const payload={...form,user_id:me,display_name:[form.first_name,form.middle_name,form.last_name].filter(Boolean).join(" ").trim()||String(form.display_name||"").trim()||"Member",updated_at:new Date().toISOString()};const {data,error}=await supabase.from("idea_profiles").upsert({...payload,avatar_url:avatar,cover_url:cover}).select().single();if(error)toast.error(error.message);else{setP(data);setForm(data);setEdit(false);setAvatarFile(null);setCoverFile(null);toast.success("Profile updated.")}}catch(e:any){toast.error(e?.message||"Could not update profile")}setSaving(false)};
 const social=[["Website",p?.website_url],["LinkedIn",p?.linkedin_url],["GitHub",p?.github_url],["Instagram",p?.instagram_url],["X",p?.twitter_url]].filter(x=>x[1]);
 const togglePinnedPost=(postId:string)=>{if(!p)return;const key="anvya-pinned-post-"+p.user_id;const next=pinnedPostId===postId?null:postId;if(next)localStorage.setItem(key,next);else localStorage.removeItem(key);setPinnedPostId(next);toast.success(next?"Post pinned to profile.":"Post unpinned.")};
 const pinnedPost=pinnedPostId?posts.find(x=>x.id===pinnedPostId)||null:null;
 if(loading)return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;
 if(!p)return <div className="container mx-auto max-w-3xl px-4 py-12"><Card><CardContent className="p-10 text-center">Profile not found.</CardContent></Card></div>;
 return (
  <div className="min-h-screen bg-[#f8f9fc] dark:bg-background">
   <div className="mx-auto flex min-h-screen max-w-[1500px]">
    <aside className="sticky top-0 hidden h-screen w-[215px] shrink-0 flex-col border-r bg-background px-3 py-5 lg:flex">
      <button onClick={()=>nav("/anvya")} className="flex items-center gap-3 px-3 pb-7 text-left">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-md"><svg viewBox="0 0 64 64" className="size-7" aria-label="ANVYA Ideas"><path d="M32 7c-11.6 0-21 8.7-21 19.5 0 7.1 3.8 12.5 9.2 15.8V48c0 2.2 1.8 4 4 4h15.6c2.2 0 4-1.8 4-4v-5.7C49.2 39 53 33.6 53 26.5 53 15.7 43.6 7 32 7Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M25 58h14M27 42h10M27 32c2.2 2 3.9 3 5 3s2.8-1 5-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <span className="text-2xl font-black tracking-tight">ANVYA</span>
      </button>
      <nav className="space-y-1.5">
        {[
          ["Home",Home,"/anvya"],
          ["Explore",Compass,"/anvya/explore"],
          ["Notifications",Bell,"/anvya/notifications"],
          ["Messages",MessageCircle,"messages"],
          ["Profile",UserCircle2,"profile"],
          ["Saved",Bookmark,"/anvya/saved"],
          ["Communities",Users,"/anvya/communities"],
          ["Events",Calendar,"/anvya/events"],
          ["Premium",Crown,"/anvya/premium"],
          ["Analytics",BarChart3,"/anvya/analytics"],
          ["Settings",Settings2,"/anvya/settings"],
          ["Help Centre",HelpCircle,"/anvya/help"]
        ].map(([label,Icon,target]:any)=>{
          const active=target==="profile"?tab!=="messages"&&location.pathname.startsWith("/anvya/profile"):target==="messages"?tab==="messages":location.pathname===target;
          return <button key={label} onClick={()=>target==="messages"?(sessionStorage.setItem("ideas_open_messages","1"),nav("/anvya/profile/"+(me||userId||"me"))):target==="profile"?nav("/anvya/profile/"+(me||userId||"me")):nav(target)} className={"group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all "+(active?"border-violet-200 bg-violet-50 text-violet-700 shadow-sm dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300":"border-transparent text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground")}>
            <span className={"flex size-9 shrink-0 items-center justify-center rounded-xl transition "+(active?"bg-violet-600 text-white shadow-sm":"bg-muted/70 text-muted-foreground group-hover:bg-background group-hover:text-foreground")}>
              <Icon className="size-[18px]"/>
            </span>
            <span className="truncate">{label}</span>
            {label==="Notifications"&&notificationCount>0&&<span className="ml-auto flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">{notificationCount>99?"99+":notificationCount}</span>}
            {label==="Saved"&&<span className="ml-auto hidden text-[10px] font-medium text-muted-foreground sm:block">Posts</span>}
          </button>
        })}
      </nav>
      <Button onClick={()=>{setTab("posts");setShowPostComposer(true)}} className="mt-4 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-bold shadow-lg"><Plus className="mr-2 size-5"/>Create Post <span className="ml-1 text-[10px] font-medium opacity-80">in Profile</span></Button>
      <div className="mt-5 rounded-2xl border bg-background p-3 shadow-sm">
        <div className="mb-2 flex flex-wrap gap-1">
          <Badge className="rounded-full bg-blue-600 text-white">🌍 ANVYA GLOBAL</Badge>
          <Badge variant="outline" className="rounded-full text-[10px]">Professional + Social Network</Badge>
        </div>
        <h3 className="text-base font-black leading-5">Connect, create and grow worldwide.</h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Discover people, communities, events and conversations from one public ANVYA identity.</p>
        <div className="mt-3 space-y-1">
          <button onClick={()=>nav("/anvya/explore")} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"><Globe2 className="size-4 text-blue-600"/>Explore</button>
          <button onClick={()=>nav("/anvya/communities")} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"><Users className="size-4 text-violet-600"/>Communities</button>
          <button onClick={()=>{setTab("posts");setShowPostComposer(true)}} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"><Plus className="size-4 text-orange-500"/>Publish in Profile</button>
          <button onClick={()=>setTab("followers")} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"><UserPlus className="size-4 text-amber-500"/>Network</button>
          <button onClick={()=>setTab("messages")} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"><MessageCircle className="size-4 text-violet-600"/>Messages</button>
        </div>
      </div>
    </aside>
    <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 md:px-7 md:py-7">
      <div className="mx-auto max-w-[1180px]">
       <div className="sticky top-0 z-40 mb-3 lg:hidden overflow-x-auto rounded-2xl border bg-background/98 p-2 shadow-lg backdrop-blur">
        <div className="flex min-w-max gap-1">
         {[["Home",Home,"/anvya"],["Explore",Compass,"/anvya/explore"],["Notifications",Bell,"/anvya/notifications"],["Messages",MessageCircle,"messages"],["Profile",UserCircle2,"profile"],["Saved",Bookmark,"/anvya/saved"],["Communities",Users,"/anvya/communities"],["Events",Calendar,"/anvya/events"],["Premium",Crown,"/anvya/premium"],["Analytics",BarChart3,"/anvya/analytics"],["Settings",Settings2,"/anvya/settings"],["Help",HelpCircle,"/anvya/help"]].map(([label,Icon,target]:any)=><button key={label} onClick={()=>target==="messages"?(sessionStorage.setItem("ideas_open_messages","1"),nav("/anvya/profile/"+(me||userId||"me"))):target==="profile"?nav("/anvya/profile/"+(me||userId||"me")):nav(target)} className={"inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition "+(((target==="profile"&&tab!=="messages")||(target==="messages"&&tab==="messages"))?"bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300":"text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="size-4"/>{label}</button>)}
        </div>
       </div>
       <Button variant="ghost" onClick={()=>nav("/anvya")}><ArrowLeft className="mr-2 size-4"/>ANVYA</Button>
       <div className="mt-2 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Card className="overflow-hidden rounded-[30px] border bg-background shadow-xl">
        <div className="relative h-56 sm:h-64 md:h-72">
          {p.cover_url?<img src={p.cover_url} className="size-full object-cover" alt="Profile cover"/>:<div className="size-full bg-gradient-to-br from-slate-950 via-blue-900 to-violet-700"/>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"/>
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <Badge className="rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md">ANVYA</Badge>
            {p.is_creator&&<Badge className="rounded-full border-0 bg-amber-500 text-white">★ Creator</Badge>}
          </div>
          {me===p.user_id&&tab==="posts"&&<label className="absolute right-4 top-4 z-20 cursor-pointer rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-slate-900 shadow-lg hover:bg-white"><Camera className="mr-2 inline size-4"/>Edit Cover<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>setCoverFile(e.target.files?.[0]||null)}/></label>}
        </div>

        <CardContent className="px-4 pb-0 pt-0 sm:px-6">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative z-10 -mt-20 size-32 shrink-0 rounded-full border-[6px] border-background bg-muted shadow-2xl sm:size-40">
              {p.avatar_url?<img src={p.avatar_url} className="size-full rounded-full object-cover" alt={p.display_name} loading="eager"/>:<div className="grid size-full place-items-center bg-gradient-to-br from-primary via-primary/80 to-violet-500 text-primary-foreground" aria-label="ANVYA logo"><svg viewBox="0 0 64 64" className="size-20" aria-hidden="true"><path d="M32 7c-11.6 0-21 8.7-21 19.5 0 7.1 3.8 12.5 9.2 15.8V48c0 2.2 1.8 4 4 4h15.6c2.2 0 4-1.8 4-4v-5.7C49.2 39 53 33.6 53 26.5 53 15.7 43.6 7 32 7Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M25 58h14M27 42h10M27 32c2.2 2 3.9 3 5 3s2.8-1 5-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg></div>}
              <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 size-3 rounded-full border-2 border-background shadow-sm ${profileOnline?"bg-emerald-500":"bg-red-500"}`} title={profileOnline?"Active now":"Offline"}/>
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-black tracking-tight md:text-3xl">{p.display_name}</h1>
                {p.verified&&<Badge className="rounded-full bg-blue-600 text-white">✓ Verified</Badge>}
                {p.is_creator&&<Badge variant="outline" className="rounded-full border-amber-400/50 text-amber-600">★ Creator</Badge>}
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground">@{p.profile_slug||p.public_id||"anvya-member"}</p>
              <p className="mt-2 text-sm font-semibold">{[p.working,p.company].filter(Boolean).join("  |  ")||"ANVYA member"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>📍 {[p.location,p.state,p.country].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(", ")||"ANVYA Community"}</span>
                {p.website_url&&<a href={String(p.website_url)} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">🔗 {String(p.website_url).replace(/^https?:\/\//,"").replace(/\/$/,"")}</a>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:pb-1">
              {me!==p.user_id&&<>
                <Button className="rounded-full px-5" onClick={toggleFollow}>{following?<UserCheck className="mr-2 size-4"/>:<UserPlus className="mr-2 size-4"/>}{following?"Following":"Follow"}</Button>
                <Button variant="outline" className="rounded-full" onClick={()=>{sessionStorage.setItem("ideas_message_target",JSON.stringify({user_id:p.user_id,display_name:p.display_name,avatar_url:p.avatar_url||null,public_id:p.public_id||null}));setTab("messages")}}><MessageCircle className="mr-2 size-4"/>Message</Button>
              </>}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 border-y sm:grid-cols-4">
            <button onClick={()=>setTab("posts")} className="border-r py-4 text-center hover:bg-muted/40"><span className="block text-xl font-black">{posts.length}</span><span className="text-xs text-muted-foreground">Posts</span></button>
            <button onClick={()=>setTab("followers")} className="border-b py-4 text-center hover:bg-muted/40 sm:border-b-0 sm:border-r"><span className="block text-xl font-black">{followerCount}</span><span className="text-xs text-muted-foreground">Followers</span></button>
            <button onClick={()=>setTab("following")} className="border-r py-4 text-center hover:bg-muted/40"><span className="block text-xl font-black">{followingCount}</span><span className="text-xs text-muted-foreground">Following</span></button>
            <div className="py-4 text-center"><span className="block text-xl font-black">{p.reputation_points||0}</span><span className="text-xs text-muted-foreground">Reputation</span></div>
          </div>

          <div className="mt-5">
            {p.bio&&<p className="text-sm leading-7 text-foreground">{p.bio}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {[p.working,p.company,p.education].filter(Boolean).map((v,i)=><Badge key={i} variant="secondary" className="rounded-full px-3 py-1">{i===0?"💼 ":""}{v}</Badge>)}
              {p.verified&&<Badge variant="secondary" className="rounded-full px-3 py-1">✓ Verified profile</Badge>}
              {p.is_creator&&<Badge variant="secondary" className="rounded-full px-3 py-1">★ Creator</Badge>}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl bg-muted/30 px-4 py-3">
            {p.linkedin_url&&<a href={String(p.linkedin_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><Linkedin className="size-5 text-blue-600"/>LinkedIn</a>}
            {p.instagram_url&&<a href={String(p.instagram_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><Instagram className="size-5 text-pink-500"/>Instagram</a>}
            {p.twitter_url&&<a href={String(p.twitter_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><Twitter className="size-5"/>X</a>}
            {p.github_url&&<a href={String(p.github_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><ExternalLink className="size-5"/>GitHub</a>}
            {p.website_url&&<a href={String(p.website_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><Globe2 className="size-5 text-blue-600"/>Website</a>}{p.medium_url&&<a href={String(p.medium_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><FileText className="size-5"/>Medium</a>}
          </div>

          <div className="mt-5"><PetProfileSection userId={p.user_id} isOwner={me===p.user_id} defaultLocation={p.location}/></div>

          <div className="mt-5 border-b">
            <div className="flex gap-1 overflow-x-auto">
              {[["posts","Posts",FileText],["activity","Activity",Activity],["friends","Friends",Users],["followers","Followers",Users],["following","Following",UserPlus],["messages","Messages",MessageCircle]].map(([key,label,Icon]:any)=><button key={key} onClick={()=>setTab(key)} className={"flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition "+(tab===key?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground")}><Icon className="size-4"/>{label}</button>)}
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="hidden space-y-5 xl:block">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between"><h3 className="font-black">Professional Highlights</h3><Badge variant="outline">ANVYA</Badge></div>
            <div className="mt-4 space-y-4">
              {p.company&&<div className="flex gap-3"><div className="rounded-full bg-blue-500/10 p-2">💼</div><div><p className="font-semibold">Company</p><p className="text-sm text-muted-foreground">{p.company}</p></div></div>}
              {p.working&&<div className="flex gap-3"><div className="rounded-full bg-violet-500/10 p-2">🎤</div><div><p className="font-semibold">Professional role</p><p className="text-sm text-muted-foreground">{p.working}</p></div></div>}
              {p.education&&<div className="flex gap-3"><div className="rounded-full bg-emerald-500/10 p-2">🎓</div><div><p className="font-semibold">Education</p><p className="text-sm text-muted-foreground">{p.education}</p></div></div>}
              {p.location&&<div className="flex gap-3"><div className="rounded-full bg-amber-500/10 p-2">📍</div><div><p className="font-semibold">Location</p><p className="text-sm text-muted-foreground">{p.location}</p></div></div>}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between"><h3 className="font-black">About Me</h3>{me===p.user_id&&<button className="text-sm font-semibold text-primary hover:underline" onClick={()=>setEdit(true)}>Edit</button>}</div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{p.bio||"Add a short professional introduction from Edit Profile."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.working&&<Badge variant="secondary">💼 {p.working}</Badge>}
              {p.company&&<Badge variant="secondary">🏢 {p.company}</Badge>}
              {p.education&&<Badge variant="secondary">🎓 {p.education}</Badge>}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-black">Profile Snapshot</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Posts</span><b>{posts.length}</b></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Followers</span><b>{followerCount}</b></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Following</span><b>{followingCount}</b></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Level</span><b>{p.level||1}</b></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    {me===p.user_id&&edit&&<div className="mt-5 rounded-[28px] border bg-background shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div><h2 className="text-lg font-black">Edit Profile</h2><p className="text-xs text-muted-foreground">Professional profile + social identity, like LinkedIn and Instagram.</p></div>
        <Button variant="ghost" onClick={()=>setEdit(false)}>Close</Button>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div className="rounded-2xl border p-4">
            <h3 className="font-bold">Basic information</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Input placeholder="First name" value={String(form.first_name||"")} onChange={e=>setForm(f=>({...f,first_name:e.target.value}))}/>
              <Input placeholder="Middle name" value={String(form.middle_name||"")} onChange={e=>setForm(f=>({...f,middle_name:e.target.value}))}/>
              <Input placeholder="Last name" value={String(form.last_name||"")} onChange={e=>setForm(f=>({...f,last_name:e.target.value}))}/>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input placeholder="Username / profile slug" value={String(form.profile_slug||"")} onChange={e=>setForm(f=>({...f,profile_slug:e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")}))}/>
              <Input placeholder="Location e.g. Ranchi, India" value={String(form.location||"")} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/>
            </div>
            <Textarea className="mt-3 min-h-28" placeholder="About you" value={String(form.bio||"")} onChange={e=>setForm(f=>({...f,bio:e.target.value}))}/>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-bold">Professional information</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input placeholder="Working as — SEO Specialist" value={String(form.working||"")} onChange={e=>setForm(f=>({...f,working:e.target.value}))}/>
              <Input placeholder="Company — Crazy SEO Team" value={String(form.company||"")} onChange={e=>setForm(f=>({...f,company:e.target.value}))}/>
            </div>
            <Input className="mt-3" placeholder="Education — BCA / College" value={String(form.education||"")} onChange={e=>setForm(f=>({...f,education:e.target.value}))}/>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-bold">Experience</h3>
            <p className="mt-1 text-xs text-muted-foreground">Add roles from your first job to your current role. Mark the current role so the end date stays open.</p>
            <ProfileArrayEditor type="experience" value={(form.experience as any[])||[]} onChange={v=>setForm(f=>({...f,experience:v}))}/>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-bold">Education</h3>
            <ProfileArrayEditor type="education" value={(form.education_details as any[])||[]} onChange={v=>setForm(f=>({...f,education_details:v}))}/>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-bold">Projects</h3>
            <ProfileArrayEditor type="projects" value={(form.projects as any[])||[]} onChange={v=>setForm(f=>({...f,projects:v}))}/>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-bold">Certificates</h3>
            <ProfileArrayEditor type="certificates" value={(form.certificates as any[])||[]} onChange={v=>setForm(f=>({...f,certificates:v}))}/>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-bold">Social links</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input placeholder="Website URL" value={String(form.website_url||"")} onChange={e=>setForm(f=>({...f,website_url:e.target.value}))}/>
              <Input placeholder="LinkedIn URL" value={String(form.linkedin_url||"")} onChange={e=>setForm(f=>({...f,linkedin_url:e.target.value}))}/>
              <Input placeholder="Instagram URL" value={String(form.instagram_url||"")} onChange={e=>setForm(f=>({...f,instagram_url:e.target.value}))}/>
              <Input placeholder="GitHub URL" value={String(form.github_url||"")} onChange={e=>setForm(f=>({...f,github_url:e.target.value}))}/>
              <Input placeholder="X / Twitter URL" value={String(form.twitter_url||"")} onChange={e=>setForm(f=>({...f,twitter_url:e.target.value}))}/><Input placeholder="Medium profile URL" value={String(form.medium_url||"")} onChange={e=>setForm(f=>({...f,medium_url:e.target.value}))}/>
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <ProfileInfoSection title="Experience" icon="💼" items={(p.experience||[]).map((x:any)=>({title:x.title,subtitle:[x.company,x.location].filter(Boolean).join(" • "),meta:[x.start_date,x.current?"Present":x.end_date].filter(Boolean).join(" – "),description:x.description}))}/>
            <ProfileInfoSection title="Education" icon="🎓" items={(p.education_details||[]).map((x:any)=>({title:x.school,subtitle:[x.degree,x.field].filter(Boolean).join(" • "),meta:[x.start_year,x.end_year].filter(Boolean).join(" – "),description:x.description}))}/>
            <ProfileInfoSection title="Projects" icon="🚀" items={(p.projects||[]).map((x:any)=>({title:x.name,subtitle:x.url,meta:x.skills,description:x.description}))}/>
            <ProfileInfoSection title="Certificates" icon="🏅" items={(p.certificates||[]).map((x:any)=>({title:x.name,subtitle:x.issuer,meta:x.issue_date,description:x.credential_url}))}/>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-5 rounded-2xl bg-muted/30 px-4 py-3">
            <Button variant="outline" onClick={()=>{setForm(p);setEdit(false);setAvatarFile(null);setCoverFile(null)}}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving?<Loader2 className="mr-2 size-4 animate-spin"/>:<Save className="mr-2 size-4"/>}Save changes</Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-muted/20 p-4">
          <h3 className="font-bold">Profile media</h3>
          <label className="mt-4 block cursor-pointer rounded-2xl border bg-background p-3">
            <p className="mb-2 text-sm font-semibold"><Camera className="mr-2 inline size-4"/>Profile photo</p>
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted">{form.avatar_url?<img src={String(form.avatar_url)} className="size-full object-cover" alt="Current profile"/>:<UserCircle2 className="size-full p-10 text-muted-foreground"/>}</div>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>setAvatarFile(e.target.files?.[0]||null)}/>
            <p className="mt-2 text-xs text-muted-foreground">{avatarFile?.name||"Choose new profile photo"}</p>
          </label>
          <label className="mt-4 block cursor-pointer rounded-2xl border bg-background p-3">
            <p className="mb-2 text-sm font-semibold"><Camera className="mr-2 inline size-4"/>Cover photo</p>
            <div className="aspect-[16/8] overflow-hidden rounded-2xl bg-muted">{form.cover_url?<img src={String(form.cover_url)} className="size-full object-cover" alt="Current cover"/>:<div className="size-full bg-gradient-to-br from-sky-600 via-violet-600 to-fuchsia-600"/>}</div>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>setCoverFile(e.target.files?.[0]||null)}/>
            <p className="mt-2 text-xs text-muted-foreground">{coverFile?.name||"Choose new cover photo"}</p>
          </label>
        </div>
      </div>
    </div>}
    {me===p.user_id&&pinnedPost&&<div className="mt-5"><div className="mb-2 flex items-center gap-2 px-1"><Badge variant="secondary">📌 Pinned Post</Badge><span className="text-xs text-muted-foreground">Featured at the top of your profile</span></div><PostCard x={pinnedPost} pinnedByProfile onTogglePin={()=>togglePinnedPost(pinnedPost.id)}/></div>}
    {me===p.user_id&&requesters.length>0&&<Card className="mt-5"><CardContent className="p-6"><h3 className="mb-4 text-lg font-bold">Friend Requests</h3>{requesters.map(r=><div key={r.user_id} className="flex items-center gap-3 border-b py-3"><div className="size-10 overflow-hidden rounded-full bg-muted">{r.avatar_url?<img src={r.avatar_url} className="size-full object-cover" alt={r.display_name}/>:<UserCircle2 className="size-full p-2"/>}</div><div className="flex-1"><p className="font-bold">{r.display_name}</p><p className="text-xs text-muted-foreground">{r.location||"ANVYA Community"}</p></div><Button size="sm" onClick={()=>respondFriend(r.user_id,"accepted")}><UserCheck className="mr-1 size-4"/>Accept</Button><Button size="sm" variant="outline" onClick={()=>respondFriend(r.user_id,"rejected")}>Reject</Button></div>)}</CardContent></Card>}
    {me===p.user_id&&<VerificationCard profile={p} request={verification} onSubmitted={v=>setVerification(v)}/>}
    <ProfileProgress userId={p.user_id} posts={posts.length} level={p.level||1} points={p.reputation_points||0}/><ProfileSection section={section} setSection={setSection} posts={posts} draftCount={draftCount} me={me} profile={p} darkMode={darkMode} setDarkMode={setDarkMode} language={language} setLanguage={v=>{setLanguage(v);localStorage.setItem("ideas-language",v)}} region={region} setRegion={v=>{setRegion(v);localStorage.setItem("ideas-region",v)}} saveTheme={saveTheme}/><div className="mt-6 flex flex-wrap items-center gap-2"><Button variant={tab==="posts"?"default":"outline"} onClick={()=>setTab("posts")}><FileText className="mr-2 size-4"/>Posts</Button>{me===p.user_id&&<Button onClick={()=>{setTab("posts");setShowPostComposer(true)}}><Plus className="mr-2 size-4"/>Create Post from Profile</Button>}<Button variant={tab==="messages"?"default":"outline"} onClick={()=>setTab("messages")}><MessageCircle className="mr-2 size-4"/>Messages</Button><Button variant={tab==="reshares"?"default":"outline"} onClick={()=>setTab("reshares")}><Activity className="mr-2 size-4"/>Reshares</Button><Button variant={tab==="activity"?"default":"outline"} onClick={()=>setTab("activity")}><Activity className="mr-2 size-4"/>Activity</Button><Button variant={tab==="friends"?"default":"outline"} onClick={()=>setTab("friends")}><Users className="mr-2 size-4"/>Friends</Button><Button variant={tab==="followers"?"default":"outline"} onClick={()=>setTab("followers")}><Users className="mr-2 size-4"/>Followers</Button><Button variant={tab==="following"?"default":"outline"} onClick={()=>setTab("following")}><UserPlus className="mr-2 size-4"/>Following</Button><Button variant={tab==="questions"?"default":"outline"} onClick={()=>setTab("questions")}><HelpCircle className="mr-2 size-4"/>Questions</Button></div>
    <div className="mt-5 space-y-4">
     {tab==="posts"&&me===p.user_id&&!showPostComposer&&<div className="rounded-2xl border bg-muted/20 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">Post from your profile</p><p className="text-xs text-muted-foreground">Write and publish here — no separate page or navigation.</p></div><Button onClick={()=>setShowPostComposer(true)}><Plus className="mr-2 size-4"/>Write a Post</Button></div></div>}
     {tab==="posts"&&me===p.user_id&&showPostComposer&&<IdeasInlinePostComposer profile={p} onClose={()=>setShowPostComposer(false)} onCreated={(post)=>setPosts(v=>[post,...v])}/>} 
     {tab === "messages" && me ? (
      <IdeasMessages
       me={me}
       initialTarget={p.user_id !== me ? { user_id: p.user_id, display_name: p.display_name, avatar_url: p.avatar_url, public_id: p.public_id } : null}
      />
     ) : null} 
     {tab==="posts"&&posts.filter(x=>String(x.post_type||"").toLowerCase()==="post"&&x.id!==pinnedPostId).map(x=><PostCard key={x.id} x={x} pinnedByProfile={pinnedPostId===x.id} onTogglePin={()=>togglePinnedPost(x.id)}/>)}
     {tab==="reshares"&&reshares.map(x=><PostCard key={x.id} x={x} resharedByProfile/>)}
     {tab==="questions"&&posts.filter(x=>x.post_type==="question").map(x=><PostCard key={x.id} x={x}/>)}
     {tab==="activity"&&<Card><CardContent className="p-6"><h3 className="text-lg font-black">Timeline</h3><div className="relative mt-5 space-y-5 pl-5 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-border">{posts.slice(0,20).map(x=><div key={x.id} className="relative"><span className="absolute -left-[17px] top-1.5 size-3 rounded-full border-2 border-background bg-primary"/><div className="rounded-2xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><b>{x.post_type==="question"?"Asked a question":"Published a post"}</b><span className="text-xs text-muted-foreground">{new Date(x.created_at).toLocaleString()}</span></div><p className="mt-1 text-sm text-muted-foreground">{x.title}</p></div></div>)}</div></CardContent></Card>}
     {(tab==="friends"||tab==="following"||tab==="followers")&&<RelationshipList userId={p.user_id} mode={tab as "friends"|"following"|"followers"}/>}
       </div>
      </div>
    </main>
   </div>
  </div>
 );
}

function ProfileSection({section,setSection,posts,draftCount,me,profile,darkMode,setDarkMode,language,setLanguage,region,setRegion,saveTheme}:{section:string;setSection:(v:string)=>void;posts:Post[];draftCount:number;me:string|null;profile:Profile;darkMode:boolean;setDarkMode:(v:boolean)=>void;language:string;setLanguage:(v:string)=>void;region:string;setRegion:(v:string)=>void;saveTheme:(mode:"light"|"dark"|"system")=>void}){
 const items=[["content","Your Content & Stats",FileText],["messages","Messages",MessageCircle],["quotes","Quotes",Quote],["drafts","Drafts",FileEdit],["bookmarks","Bookmarks",Bookmark],["settings","Settings",Settings2],["rules","Points & Badges",ShieldCheck]] as const;
 return <Card className="mt-5 overflow-hidden"><CardContent className="p-3 md:p-4"><div className="flex flex-wrap gap-2">{items.map(([k,n,I])=><Button key={k} size="sm" variant={section===k?"default":"outline"} onClick={()=>setSection(k)}><I className="mr-2 size-4"/>{n}</Button>)}</div>{section==="messages"&&me?<IdeasMessages me={me} initialTarget={profile.user_id!==me?{user_id:profile.user_id,display_name:profile.display_name,avatar_url:profile.avatar_url,public_id:profile.public_id}:null}/>:section==="messages"&&<div className="mt-4 rounded-xl border p-5">Please sign in to use Messages.</div>}{section==="quotes"&&<div className="mt-4 rounded-xl border p-5"><div className="flex items-center gap-3"><Quote className="text-primary"/><div><p className="font-bold">Quotes</p><p className="text-sm text-muted-foreground">Save your favourite thoughts and quotes for quick access.</p></div></div><div className="mt-4 rounded-xl bg-muted/40 p-4 text-sm italic">“Ideas become powerful when you share them.”</div></div>}{section==="content"&&<div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-xl border p-4"><p className="text-2xl font-black">{posts.length}</p><p className="text-xs text-muted-foreground">Published</p></div><div className="rounded-xl border p-4"><p className="text-2xl font-black">{posts.filter(x=>x.post_type==="question").length}</p><p className="text-xs text-muted-foreground">Questions</p></div><div className="rounded-xl border p-4"><p className="text-2xl font-black">{posts.filter(x=>x.post_type==="post").length}</p><p className="text-xs text-muted-foreground">Posts</p></div><div className="rounded-xl border p-4"><p className="text-2xl font-black">{posts.reduce((n,x)=>n+(x.content?.length||0),0)}</p><p className="text-xs text-muted-foreground">Content chars</p></div></div>}{section==="drafts"&&<div className="mt-4 rounded-xl border p-5"><div className="flex items-center gap-3"><FileEdit className="text-primary"/><div><p className="font-bold">Drafts</p><p className="text-sm text-muted-foreground">{draftCount} saved local draft{draftCount===1?"":"s"}. Drafts are kept on this device.</p></div></div></div>}{section==="bookmarks"&&<div className="mt-4 rounded-xl border p-5"><div className="flex items-center gap-3"><Bookmark className="text-primary"/><div><p className="font-bold">Bookmarks</p><p className="text-sm text-muted-foreground">Your saved posts are available from the Bookmark button on posts.</p></div></div></div>}{section==="rules"&&<div className="mt-4 grid gap-4 md:grid-cols-2"><div className="rounded-xl border p-5"><h3 className="font-bold">⭐ Points Rules</h3><div className="mt-3 space-y-2 text-sm"><p>Approved Post <b>+10</b></p><p>Approved Question <b>+5</b></p><p>Approved Event <b>+10</b></p><p>First Post bonus <b>+25</b></p><p>5 approved posts bonus <b>+25</b></p><p>10 approved posts bonus <b>+50</b></p><p>Removed content <b>-10</b></p><p>Rule violation <b>-20</b></p><p>🚫 Promotional links / spam links are not allowed.</p><p>🔁 Repeated violations may lead to account restriction.</p><p>⛔ Repeated or severe violations may result in permanent account deletion.</p></div><p className="mt-3 text-xs text-muted-foreground">Only approved content earns contribution points. Promotional or spam links are prohibited.</p></div><div className="rounded-xl border p-5"><h3 className="font-bold">🏅 Badge Rules</h3><div className="mt-3 space-y-2 text-sm"><p>🌱 New Contributor — first approved post</p><p>💡 Idea Explorer — 5 approved posts</p><p>🚀 Idea Builder — 10 approved posts</p><p>🔥 Active Contributor — 25 approved posts</p><p>🏆 Community Contributor — 50 approved posts</p><p>🔬 Science Explorer — Science contributions</p><p>📊 Economics Explorer — Economics contributions</p><p>✓ Verified Member — profile verification</p></div></div></div>}{section==="settings"&&<div className="mt-4 space-y-5"><div className="rounded-2xl border bg-muted/20 p-4"><div className="flex items-center gap-2"><Settings2 className="text-primary" size={19}/><div><p className="font-black text-base">Profile Settings</p><p className="text-xs text-muted-foreground">Manage your ANVYA profile, account and profile editing options from here.</p></div></div><div className="mt-4 grid gap-3 md:grid-cols-3">
<Link to="/anvya/settings" className="block w-full rounded-xl border bg-background p-4 text-left hover:bg-muted/50 active:scale-[.99] transition"><div className="flex items-center gap-2 font-bold"><UserCircle2 size={17}/>Account</div><p className="mt-1 text-xs text-muted-foreground">Account, privacy, security and profile URL settings.</p><span className="mt-3 inline-flex text-xs font-bold text-primary">Open Account Settings →</span></Link>
<button type="button" onClick={()=>setEdit(true)} className="block w-full rounded-xl border bg-background p-4 text-left hover:bg-muted/50 active:scale-[.99] transition"><div className="flex items-center gap-2 font-bold"><FileEdit size={17}/>Profile Editing</div><p className="mt-1 text-xs text-muted-foreground">Edit name, bio, profile photo, cover photo, work, education and social links.</p><span className="mt-3 inline-flex text-xs font-bold text-primary">Edit Profile →</span></button>
<Link to="/anvya/settings#settings-profile" className="block w-full rounded-xl border bg-background p-4 text-left hover:bg-muted/50 active:scale-[.99] transition"><div className="flex items-center gap-2 font-bold"><Link2 size={17}/>Profile URL</div><p className="mt-1 text-xs text-muted-foreground">Change your public ANVYA username URL like LinkedIn or Instagram.</p><span className="mt-3 inline-flex text-xs font-bold text-primary">Edit URL →</span></Link>
</div></div><div className="grid gap-3 md:grid-cols-3"><button onClick={()=>saveTheme(darkMode?"light":"dark")} className="rounded-xl border p-4 text-left hover:bg-muted/50"><div className="flex items-center gap-2 font-bold">{darkMode?<Sun size={17}/>:<Moon size={17}/>}Dark mode</div><p className="mt-1 text-xs text-muted-foreground">{darkMode?"On":"Off"}</p><p className="mt-2 text-[11px] text-muted-foreground">Click to switch Light / Dark</p></button><button onClick={()=>saveTheme("system")} className="rounded-xl border p-4 text-left hover:bg-muted/50"><div className="flex items-center gap-2 font-bold"><Settings2 size={17}/>System theme</div><p className="mt-1 text-xs text-muted-foreground">Use device/browser preference</p></button><label className="rounded-xl border p-4"><div className="flex items-center gap-2 font-bold"><Languages size={17}/>Language</div><select className="mt-2 w-full rounded-lg border bg-background p-2 text-sm" value={language} onChange={e=>setLanguage(e.target.value)}><option>English</option><option>Hindi</option><option>Hinglish</option><option>Bengali</option><option>Urdu</option></select></label><label className="rounded-xl border p-4"><div className="flex items-center gap-2 font-bold"><Globe2 size={17}/>Region</div><select className="mt-2 w-full rounded-lg border bg-background p-2 text-sm" value={region} onChange={e=>setRegion(e.target.value)}><option>Global</option><option>India</option><option>Asia</option><option>Europe</option><option>North America</option><option>Middle East</option><option>Africa</option><option>Oceania</option></select></label></div></div>}</CardContent></Card>;
}

function PostCard({x,resharedByProfile=false,pinnedByProfile=false,onTogglePin}:{x:Post;resharedByProfile?:boolean;pinnedByProfile?:boolean;onTogglePin?:()=>void}){
 const [me,setMe]=useState<string|null>(null),[authorPoints,setAuthorPoints]=useState(0),[authorBadge,setAuthorBadge]=useState("🌱 New Contributor"),[reaction,setReaction]=useState<string|null>(null),[likes,setLikes]=useState(0),[dislikes,setDislikes]=useState(0),[comments,setComments]=useState<any[]>([]),[text,setText]=useState(""),[reshared,setReshared]=useState(false),[bookmarked,setBookmarked]=useState(false),[editingPost,setEditingPost]=useState(false),[editTitle,setEditTitle]=useState(x.title),[editContent,setEditContent]=useState(x.content),[savingPost,setSavingPost]=useState(false);
 const load=async()=>{const {data:{user}}=await supabase.auth.getUser();setMe(user?.id||null);const [profileInfo,r,c,s]=await Promise.all([supabase.from("idea_profiles").select("reputation_points").eq("user_id",x.user_id).maybeSingle(),supabase.from("idea_post_reactions").select("user_id,reaction").eq("post_id",x.id),supabase.from("idea_post_comments").select("*").eq("post_id",x.id).order("created_at",{ascending:true}),supabase.from("idea_post_reshares").select("user_id").eq("post_id",x.id)]);const pts=profileInfo.data?.reputation_points||0;setAuthorPoints(pts);setAuthorBadge(pts>=50?"🏆 Community Contributor":pts>=25?"🔥 Active Contributor":pts>=10?"🚀 Idea Builder":pts>=5?"💡 Idea Explorer":"🌱 New Contributor");const rs=r.data||[];setLikes(rs.filter(v=>v.reaction==="like").length);setDislikes(rs.filter(v=>v.reaction==="dislike").length);setReaction(user?.id?rs.find(v=>v.user_id===user.id)?.reaction||null:null);setComments(c.data||[]);setReshared(!!user?.id&&(s.data||[]).some(v=>v.user_id===user.id))};
 useEffect(()=>{load();const b=JSON.parse(localStorage.getItem("ideas-bookmarks")||"[]");setBookmarked(b.includes(x.id));setEditTitle(x.title);setEditContent(x.content)},[x.id,x.title,x.content]);
 const react=async(kind:"like"|"dislike")=>{if(!me)return toast.error("Please sign in first.");if(reaction===kind){const {error}=await supabase.from("idea_post_reactions").delete().eq("post_id",x.id).eq("user_id",me);if(error)toast.error(error.message);else{setReaction(null);kind==="like"?setLikes(v=>Math.max(0,v-1)):setDislikes(v=>Math.max(0,v-1))}}else{if(reaction){await supabase.from("idea_post_reactions").delete().eq("post_id",x.id).eq("user_id",me)}const {error}=await supabase.from("idea_post_reactions").insert({post_id:x.id,user_id:me,reaction:kind});if(error)toast.error(error.message);else{if(reaction==="like")setLikes(v=>Math.max(0,v-1));if(reaction==="dislike")setDislikes(v=>Math.max(0,v-1));kind==="like"?setLikes(v=>v+1):setDislikes(v=>v+1);setReaction(kind)}}};
 const sharePost=async()=>{const url=window.location.origin+"/anvya/profile/"+x.user_id+"?post="+x.id;try{if(navigator.share)await navigator.share({title:x.title,text:x.title,url});else{await navigator.clipboard.writeText(url);toast.success("Post link copied.");}}catch{}}; const bookmark=()=>{const b=JSON.parse(localStorage.getItem("ideas-bookmarks")||"[]");const next=bookmarked?b.filter((id:string)=>id!==x.id):[...b,x.id];localStorage.setItem("ideas-bookmarks",JSON.stringify(next));setBookmarked(!bookmarked);toast.success(bookmarked?"Removed from bookmarks":"Saved to bookmarks.")};
 const comment=async()=>{if(!me)return toast.error("Please sign in first.");if(!text.trim())return;const {data,error}=await supabase.from("idea_post_comments").insert({post_id:x.id,user_id:me,content:text.trim()}).select().single();if(error)toast.error(error.message);else{setComments(v=>[...v,data]);setText("")}};
 const reshare=async()=>{if(!me)return toast.error("Please sign in first.");if(reshared){const {error}=await supabase.from("idea_post_reshares").delete().eq("post_id",x.id).eq("user_id",me);if(error)toast.error(error.message);else setReshared(false)}else{const {error}=await supabase.from("idea_post_reshares").insert({post_id:x.id,user_id:me});if(error)toast.error(error.message);else setReshared(true)}};
 const savePost=async()=>{if(!me||me!==x.user_id)return toast.error("You can only edit your own post.");if(!editTitle.trim()||!editContent.trim())return toast.error("Title and content are required.");setSavingPost(true);const {data,error}=await supabase.from("idea_posts").update({title:editTitle.trim(),content:editContent.trim(),status:"pending",moderation_decision:null,moderation_reason:null,moderation_checked_at:null,ai_detection_score:null,moderation_score:null,moderation_links:null}).eq("id",x.id).eq("user_id",me).select("id,user_id,display_name,profile_image_url,title,content,post_type,visibility,subject,tags,image_url,created_at,status").single();if(error){toast.error(error.message)}else{toast.success("Post updated and sent for content detector review.");setEditingPost(false);x=Object.assign(x,data);setEditTitle(data.title);setEditContent(data.content);window.location.reload()}setSavingPost(false)};
 return <Card><CardContent className="p-5">{resharedByProfile&&<div className="mb-3 text-sm font-semibold text-primary">🔁 Reshared by this profile</div>}<div className="mb-2 flex flex-wrap items-center gap-2">{pinnedByProfile&&<Badge className="bg-primary/10 text-primary">📌 Pinned</Badge>}<Badge>{x.post_type==="question"?"Ask Discussion":x.post_type==="blog"?"Blog":x.subject}</Badge><Badge variant="outline">{x.visibility==="friends"?"👥 Friends Only":"🌍 Public"}</Badge><Badge variant="secondary">{authorBadge}</Badge>{x.tags?.map((tag:string)=><Badge key={tag} variant="outline" className="rounded-full">#{tag}</Badge>)}<Badge variant="outline">⭐ {authorPoints} Points</Badge></div><div className="flex items-start justify-between gap-3"><h2 className="text-xl font-bold">{x.title}</h2>{me===x.user_id&&!resharedByProfile&&<div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>onTogglePin?.()}>{pinnedByProfile?"Unpin":"Pin"}</Button><Button size="sm" variant="outline" onClick={()=>{setEditingPost(v=>!v);setEditTitle(x.title);setEditContent(x.content)}}><FileEdit className="mr-1 size-4"/>{editingPost?"Cancel":"Edit Post"}</Button></div>}</div>{editingPost&&me===x.user_id&&!resharedByProfile?<div className="mt-4 space-y-3 rounded-2xl border bg-muted/20 p-4"><Input value={editTitle} onChange={e=>setEditTitle(e.target.value)} placeholder="Post title"/><Textarea value={editContent} onChange={e=>setEditContent(e.target.value)} className="min-h-56 font-mono text-sm" placeholder="Post content / SEO HTML"/><p className="text-xs text-muted-foreground">Editing a post sends it back to <b>Pending</b> so the content detector/admin can review the changes.</p><Button onClick={savePost} disabled={savingPost}>{savingPost?<Loader2 className="mr-2 size-4 animate-spin"/>:<Save className="mr-2 size-4"/>}Save & Send for Review</Button></div>:<div className="prose prose-neutral dark:prose-invert max-w-none mt-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:leading-tight [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{__html:sanitizeRichHtml(x.content)}} />}{x.image_url&&<img src={x.image_url} className="mt-4 max-h-96 rounded-2xl object-cover" alt={x.title}/>}<div className="mt-5 flex flex-wrap gap-2 border-y py-3"><Button size="sm" variant={reaction==="like"?"default":"outline"} onClick={()=>react("like")}>👍 Like {likes}</Button><Button size="sm" variant={reaction==="dislike"?"default":"outline"} onClick={()=>react("dislike")}>👎 Dislike {dislikes}</Button><Button size="sm" variant={reshared?"default":"outline"} onClick={reshare}>🔁 {reshared?"Reshared":"Reshare"}</Button><Button size="sm" variant="outline" onClick={sharePost}>↗️ Share</Button><Button size="sm" variant={bookmarked?"default":"outline"} onClick={bookmark}><Bookmark className="mr-1 size-4"/>{bookmarked?"Saved":"Save Post"}</Button></div><div className="mt-4"><div className="flex gap-2"><Input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment..." maxLength={2000}/><Button onClick={comment}>Comment</Button></div><div className="mt-3 space-y-2">{comments.map(c=><div key={c.id} className="rounded-xl bg-muted/50 p-3 text-sm"><p>{c.content}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p></div>)}</div></div></CardContent></Card>;
}

function RelationshipList({userId,mode}:{userId:string;mode:"friends"|"following"|"followers"}){
 const [items,setItems]=useState<any[]>([]),[presence,setPresence]=useState<Record<string,{online:boolean;last_seen_at:string|null}>>({});
 useEffect(()=>{let cancelled=false;(async()=>{let ids:string[]=[];if(mode==="following"){const {data}=await supabase.from("idea_follows").select("following_id").eq("follower_id",userId);ids=(data||[]).map(x=>x.following_id)}else if(mode==="followers"){const {data}=await supabase.from("idea_follows").select("follower_id").eq("following_id",userId);ids=(data||[]).map(x=>x.follower_id)}else{const {data}=await supabase.from("idea_friendships").select("requester_id,addressee_id").eq("status","accepted").or("requester_id.eq."+userId+",addressee_id.eq."+userId);ids=(data||[]).map(x=>x.requester_id===userId?x.addressee_id:x.requester_id)}if(cancelled)return;if(ids.length){const {data}=await supabase.from("idea_profiles").select("*").in("user_id",ids);setItems(data||[]);const {data:ps}=await supabase.from("idea_presence").select("user_id,last_seen_at").in("user_id",ids);const now=Date.now();setPresence(Object.fromEntries((ps||[]).map(x=>[x.user_id,{online:now-new Date(x.last_seen_at).getTime()<=90000,last_seen_at:x.last_seen_at}])))}else setItems([])})();return()=>{cancelled=true}},[userId,mode]);
 useEffect(()=>{if(!items.length)return;const ch=supabase.channel("relationship-presence-"+mode+"-"+userId).on("postgres_changes",{event:"*",schema:"public",table:"idea_presence"},payload=>{const x:any=payload.new||payload.old;if(!x?.user_id||!items.some(i=>i.user_id===x.user_id))return;const online=payload.eventType!=="DELETE"&&!!x.last_seen_at&&(Date.now()-new Date(x.last_seen_at).getTime()<=90000);setPresence(v=>({...v,[x.user_id]:{online,last_seen_at:x.last_seen_at||null}}))}).subscribe();return()=>{supabase.removeChannel(ch)}},[items,mode,userId]);
 const openMessage=(x:any)=>{sessionStorage.setItem("ideas_message_target",JSON.stringify({user_id:x.user_id,display_name:x.display_name,avatar_url:x.avatar_url||null,public_id:x.public_id||null}));location.href="/anvya/profile/"+userId};
 const lastSeen=(v:string|null)=>{if(!v)return "Offline";const d=Date.now()-new Date(v).getTime();if(d<60000)return "Active now";if(d<3600000)return Math.floor(d/60000)+"m ago";if(d<86400000)return Math.floor(d/3600000)+"h ago";return new Date(v).toLocaleDateString()};
 return <Card><CardContent className="p-6">{items.length===0?<p className="text-muted-foreground">No {mode} yet.</p>:items.map(x=>{const ps=presence[x.user_id];return <div key={x.user_id} className="flex w-full items-center gap-3 border-b py-3"><button onClick={()=>location.href="/anvya/profile/"+x.user_id} className="flex min-w-0 flex-1 items-center gap-3 text-left hover:bg-muted/40"><div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">{x.avatar_url?<img src={x.avatar_url} className="size-full object-cover" alt={x.display_name}/>:<UserCircle2 className="size-full p-2"/>}{ps?.online&&<span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-green-500"/>}</div><div className="min-w-0"><p className="font-bold truncate">{x.display_name}</p><p className="text-xs text-muted-foreground">{ps?.online?"Active now":lastSeen(ps?.last_seen_at||null)}</p></div></button><Button size="sm" variant="outline" onClick={()=>openMessage(x)}><MessageCircle className="mr-1 size-4"/>Message</Button></div>})}</CardContent></Card>;
}


function ProfileProgress({userId,posts,level,points}:{userId:string;posts:number;level:number;points:number}){
 const [badges,setBadges]=useState<any[]>([]),[achievements,setAchievements]=useState<any[]>([]),[communities,setCommunities]=useState<any[]>([]);
 useEffect(()=>{(async()=>{const b=await supabase.from("idea_badges").select("*").eq("user_id",userId).order("created_at",{ascending:false});setBadges(b.data||[]);const a=await supabase.from("idea_post_achievements").select("*").eq("user_id",userId).order("created_at",{ascending:false}).limit(50);setAchievements(a.data||[]);const c=await supabase.from("idea_community_members").select("community_id,role").eq("user_id",userId);const ids=(c.data||[]).map(x=>x.community_id);if(ids.length){const q=await supabase.from("idea_communities").select("id,name,slug,visibility").in("id",ids);setCommunities((q.data||[]).map(x=>({...x,role:(c.data||[]).find(m=>m.community_id===x.id)?.role})))}})()},[userId]);
 return <div className="mt-5 grid gap-4 md:grid-cols-3">
  <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Community Level</p><p className="mt-1 text-2xl font-black">Level {level}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{width:Math.min(100,((points%100)/100)*100)+"%"}}/></div><p className="mt-2 text-xs text-muted-foreground">{points} reputation points • keep contributing to unlock stages</p></CardContent></Card>
  <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Badges & Leadership</p><div className="mt-3 flex flex-wrap gap-2">{badges.length?badges.map(b=><Badge key={b.id}>🏅 {b.badge_name}</Badge>):<Badge variant="outline">🌱 Community Starter</Badge>}</div><p className="mt-3 text-xs text-muted-foreground">Stages: Starter → Contributor → Leader → Community Builder</p><div className="mt-4 rounded-xl border bg-muted/20 p-3"><p className="text-xs font-bold uppercase text-muted-foreground">Post Achievements</p>{achievements.length?<div className="mt-2 space-y-2">{achievements.slice(0,8).map(a=><div key={a.id} className="flex items-center justify-between rounded-lg border bg-background p-2"><span className="text-sm">🏅 {a.achievement_name}</span><Badge variant="outline">+{a.points_awarded} pts</Badge></div>)}</div>:<p className="mt-2 text-xs text-muted-foreground">Publish approved posts to earn achievements and points.</p>}</div></CardContent></Card>
  <Card><CardContent className="p-5"><p className="text-xs uppercase text-muted-foreground">Communities</p>{communities.length?<div className="mt-2 space-y-2">{communities.slice(0,4).map(c=><div key={c.id} className="flex items-center justify-between rounded-lg border p-2"><span className="font-medium">{c.name}</span><Badge variant="outline">{c.role}</Badge></div>)}</div>:<p className="mt-3 text-sm text-muted-foreground">No communities joined yet.</p>}<Button size="sm" className="mt-3" onClick={()=>location.href="/anvya/communities"}><Users className="mr-2 size-4"/>Explore Communities</Button></CardContent></Card>
 </div>;
}

function VerificationCard({profile,request,onSubmitted}:{profile:Profile;request:any;onSubmitted:(v:any)=>void}){
 const [file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[cameraOpen,setCameraOpen]=useState(false),[cameraError,setCameraError]=useState(""),[stream,setStream]=useState<MediaStream|null>(null);
 const videoRef=useRef<HTMLVideoElement|null>(null);
 useEffect(()=>()=>{stream?.getTracks().forEach(t=>t.stop())},[stream]);
 const openCamera=async()=>{setCameraError("");try{if(!navigator.mediaDevices?.getUserMedia)throw new Error("Camera is not supported in this browser.");const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});setStream(s);setCameraOpen(true);setTimeout(()=>{if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play().catch(()=>{})}},50)}catch(e:any){setCameraError(e?.message||"Camera permission was denied.")}};
 const closeCamera=()=>{stream?.getTracks().forEach(t=>t.stop());setStream(null);setCameraOpen(false)};
 const capture=async()=>{const video=videoRef.current;if(!video||!video.videoWidth)return toast.error("Camera is not ready yet.");const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext("2d")?.drawImage(video,0,0,canvas.width,canvas.height);canvas.toBlob(blob=>{if(blob){setFile(new File([blob],"selfie-camera.jpg",{type:"image/jpeg"}));closeCamera();toast.success("Selfie captured. You can submit it now.")}else toast.error("Could not capture selfie.")},"image/jpeg",0.92)};
 const submit=async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user)return toast.error("Please sign in first.");if(!file)return toast.error("Take or upload a clear selfie first.");if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)return toast.error("Use JPG, PNG or WEBP up to 5 MB.");setBusy(true);try{const path=user.id+"/selfie-"+crypto.randomUUID()+"."+((file.name.split(".").pop()||"jpg").toLowerCase());const up=await supabase.storage.from("idea-verification").upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw up.error;const {data,error}=await supabase.from("idea_verification_requests").upsert({user_id:user.id,selfie_path:path,status:"pending",rejection_reason:null,reviewed_by:null,reviewed_at:null},{onConflict:"user_id"}).select("id,status,rejection_reason,created_at").single();if(error)throw error;await supabase.from("idea_profiles").update({verification_status:"pending"}).eq("user_id",user.id);onSubmitted(data);setFile(null);toast.success("Verification request submitted.");}catch(e:any){toast.error(e?.message||"Verification request failed.");}finally{setBusy(false)}};
 const status=request?.status||"not_submitted";
 return <Card className="mt-5 overflow-hidden border-primary/20"><CardContent className="p-5"><div className="flex items-start gap-3"><div className="rounded-2xl bg-primary/10 p-3"><ShieldCheck className="text-primary"/></div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-lg">Profile Verification</h3><Badge variant={status==="verified"?"default":"outline"}>{status==="verified"?"✓ Verified":status==="pending"?"Pending Review":status==="rejected"?"Rejected":"Not Submitted"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">Submit one clear selfie for manual review. Your selfie is stored privately and is not shown publicly.</p>{status==="rejected"&&request?.rejection_reason&&<p className="mt-2 text-sm text-destructive">Reason: {request.rejection_reason}</p>}{status!=="verified"&&<div className="mt-4 space-y-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-dashed p-3 text-sm"><Upload size={16}/><span className="truncate">{file?.name||"Choose selfie from device"}</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><Button type="button" variant="outline" onClick={openCamera} disabled={busy||status==="pending"}><Camera className="mr-2 size-4"/>Open Camera</Button><Button onClick={submit} disabled={busy||status==="pending"||!file}>{busy?<Loader2 className="mr-2 size-4 animate-spin"/>:<ShieldCheck className="mr-2 size-4"/>}{status==="pending"?"Under Review":"Submit for Verification"}</Button></div>{cameraError&&<p className="text-sm text-destructive">{cameraError}</p>}{cameraOpen&&<div className="rounded-2xl border bg-black/5 p-3"><video ref={videoRef} autoPlay playsInline muted className="mx-auto aspect-video w-full max-w-md rounded-xl bg-black object-cover"/><div className="mt-3 flex justify-center gap-2"><Button type="button" onClick={capture}><Camera className="mr-2 size-4"/>Capture Selfie</Button><Button type="button" variant="outline" onClick={closeCamera}>Cancel</Button></div></div>}{file&&<p className="text-xs text-muted-foreground">Selected selfie: {file.name} • max 5 MB</p>}</div>}{status==="pending"&&<p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 size={14}/>An admin will review the selfie manually.</p>}</div></div></CardContent></Card>;
}

function ProfileArrayEditor({type,value,onChange}:{type:"experience"|"education"|"projects"|"certificates";value:any[];onChange:(v:any[])=>void}){
 const add=()=>onChange([...value,type==="experience"?{title:"",company:"",location:"",start_date:"",end_date:"",current:false,description:""}:type==="education"?{school:"",degree:"",field:"",start_year:"",end_year:"",description:""}:type==="projects"?{name:"",url:"",skills:"",description:""}:{name:"",issuer:"",issue_date:"",credential_url:""}]);
 const update=(i:number,k:string,v:any)=>onChange(value.map((x,j)=>j===i?{...x,[k]:v}:x));
 return <div className="mt-3 space-y-4">{value.map((x,i)=><div key={i} className="rounded-xl border bg-muted/10 p-3"><div className="grid gap-3 sm:grid-cols-2">
 {type==="experience"&&<><Input placeholder="Job title / role" value={x.title||""} onChange={e=>update(i,"title",e.target.value)}/><Input placeholder="Company" value={x.company||""} onChange={e=>update(i,"company",e.target.value)}/><Input placeholder="Location" value={x.location||""} onChange={e=>update(i,"location",e.target.value)}/><Input type="month" value={x.start_date||""} onChange={e=>update(i,"start_date",e.target.value)}/><Input type="month" disabled={!!x.current} value={x.end_date||""} onChange={e=>update(i,"end_date",e.target.value)}/><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!x.current} onChange={e=>update(i,"current",e.target.checked)}/> Currently working here</label><Textarea className="sm:col-span-2" placeholder="Description, achievements, responsibilities" value={x.description||""} onChange={e=>update(i,"description",e.target.value)}/></>}
 {type==="education"&&<><Input placeholder="School / College / University" value={x.school||""} onChange={e=>update(i,"school",e.target.value)}/><Input placeholder="Degree" value={x.degree||""} onChange={e=>update(i,"degree",e.target.value)}/><Input placeholder="Field of study" value={x.field||""} onChange={e=>update(i,"field",e.target.value)}/><Input placeholder="Start year" value={x.start_year||""} onChange={e=>update(i,"start_year",e.target.value)}/><Input placeholder="End year" value={x.end_year||""} onChange={e=>update(i,"end_year",e.target.value)}/><Textarea className="sm:col-span-2" placeholder="Description / activities" value={x.description||""} onChange={e=>update(i,"description",e.target.value)}/></>}
 {type==="projects"&&<><Input placeholder="Project name" value={x.name||""} onChange={e=>update(i,"name",e.target.value)}/><Input placeholder="Project URL" value={x.url||""} onChange={e=>update(i,"url",e.target.value)}/><Input className="sm:col-span-2" placeholder="Skills / technologies" value={x.skills||""} onChange={e=>update(i,"skills",e.target.value)}/><Textarea className="sm:col-span-2" placeholder="Project description" value={x.description||""} onChange={e=>update(i,"description",e.target.value)}/></>}
 {type==="certificates"&&<><Input placeholder="Certificate name" value={x.name||""} onChange={e=>update(i,"name",e.target.value)}/><Input placeholder="Issuing organization" value={x.issuer||""} onChange={e=>update(i,"issuer",e.target.value)}/><Input type="month" value={x.issue_date||""} onChange={e=>update(i,"issue_date",e.target.value)}/><Input placeholder="Credential URL" value={x.credential_url||""} onChange={e=>update(i,"credential_url",e.target.value)}/></>}
 </div><Button type="button" variant="ghost" className="mt-2 text-destructive" onClick={()=>onChange(value.filter((_,j)=>j!==i))}>Remove</Button></div>)}<Button type="button" variant="outline" onClick={add}>+ Add {type==="experience"?"Experience":type==="education"?"Education":type==="projects"?"Project":"Certificate"}</Button></div>
}


function PetProfileSection({userId,isOwner,defaultLocation}:{userId:string;isOwner:boolean;defaultLocation?:string|null}){
 const [pets,setPets]=useState<any[]>([]);
 const [open,setOpen]=useState(false);
 const [editingId,setEditingId]=useState<string|null>(null);
 const [saving,setSaving]=useState(false);
 const [imageFile,setImageFile]=useState<File|null>(null);
 const empty={name:"",pet_type:"Dog",breed:"",gender:"",birth_date:"",bio:"",location:defaultLocation||"",image_url:"",is_public:true};
 const [form,setForm]=useState<any>(empty);
 const loadPets=async()=>{const {data,error}=await supabase.from("idea_pet_profiles").select("*").eq("user_id",userId).order("created_at",{ascending:false});if(error){console.warn("ANVYA pet profiles lookup failed:",error.message);setPets([]);return}setPets(data||[])};
 useEffect(()=>{void loadPets()},[userId]);
 const reset=()=>{setForm({...empty,location:defaultLocation||""});setEditingId(null);setImageFile(null);setOpen(false)};
 const uploadPetImage=async(file:File)=>{if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)throw new Error("Use JPG, PNG or WEBP up to 5 MB.");const ext=(file.name.split(".").pop()||"jpg").toLowerCase();const path=userId+"/pet-"+crypto.randomUUID()+"."+ext;const storage=supabase.storage.from("idea-images");const up=await storage.upload(path,file,{contentType:file.type,cacheControl:"3600",upsert:false});if(up.error)throw new Error(up.error.message||"Pet image upload failed.");return storage.getPublicUrl(path).data.publicUrl};
 const editPet=(pet:any)=>{setEditingId(pet.id);setForm({...empty,...pet,birth_date:pet.birth_date||""});setImageFile(null);setOpen(true)};
 const savePet=async()=>{if(!form.name.trim())return toast.error("Add your pet's name.");setSaving(true);try{let imageUrl=form.image_url||null;if(imageFile)imageUrl=await uploadPetImage(imageFile);const payload={user_id:userId,name:form.name.trim(),pet_type:form.pet_type||"Other",breed:form.breed.trim()||null,gender:form.gender||null,birth_date:form.birth_date||null,bio:form.bio.trim()||null,location:form.location.trim()||null,image_url:imageUrl,is_public:!!form.is_public};if(editingId){const {error}=await supabase.from("idea_pet_profiles").update(payload).eq("id",editingId).eq("user_id",userId);if(error)throw error;toast.success("Pet profile updated.")}else{const {error}=await supabase.from("idea_pet_profiles").insert(payload);if(error)throw error;toast.success("Pet profile added.")}await loadPets();reset()}catch(e:any){toast.error(e?.message||"Could not save pet profile.")}finally{setSaving(false)}};
 const removePet=async(id:string)=>{if(!window.confirm("Remove this pet profile?"))return;const {error}=await supabase.from("idea_pet_profiles").delete().eq("id",id).eq("user_id",userId);if(error)toast.error(error.message);else{setPets(v=>v.filter(x=>x.id!==id));toast.success("Pet profile removed.")}};
 return <Card className="rounded-2xl border shadow-sm"><CardContent className="p-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-500/10 p-3"><PawPrint className="size-5 text-amber-600"/></div><div><h3 className="font-black">Pet Profile</h3><p className="text-xs text-muted-foreground">Show the pets that are part of your life.</p></div></div>{isOwner&&<Button size="sm" onClick={()=>{setForm({...empty,location:defaultLocation||""});setEditingId(null);setImageFile(null);setOpen(v=>!v)}}><Plus className="mr-1 size-4"/>{open?"Close":"Add Pet"}</Button>}</div>
  {open&&isOwner&&<div className="mt-4 rounded-2xl border bg-muted/20 p-4"><div className="grid gap-3 sm:grid-cols-2"><Input placeholder="Pet name" value={form.name} onChange={e=>setForm((v:any)=>({...v,name:e.target.value}))}/><select className="h-10 rounded-xl border bg-background px-3 text-sm" value={form.pet_type} onChange={e=>setForm((v:any)=>({...v,pet_type:e.target.value}))}><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Fish</option><option>Other</option></select><Input placeholder="Breed" value={form.breed} onChange={e=>setForm((v:any)=>({...v,breed:e.target.value}))}/><select className="h-10 rounded-xl border bg-background px-3 text-sm" value={form.gender} onChange={e=>setForm((v:any)=>({...v,gender:e.target.value}))}><option value="">Gender</option><option>Male</option><option>Female</option><option>Unknown</option></select><Input type="date" value={form.birth_date} onChange={e=>setForm((v:any)=>({...v,birth_date:e.target.value}))}/><Input placeholder="Pet location" value={form.location} onChange={e=>setForm((v:any)=>({...v,location:e.target.value}))}/></div><Textarea className="mt-3" placeholder="Tell people about your pet..." maxLength={500} value={form.bio} onChange={e=>setForm((v:any)=>({...v,bio:e.target.value}))}/><div className="mt-3 flex flex-wrap items-center gap-3"><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-sm"><Camera className="size-4"/><span className="max-w-48 truncate">{imageFile?.name||"Pet photo"}</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>setImageFile(e.target.files?.[0]||null)}/></label><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={!!form.is_public} onChange={e=>setForm((v:any)=>({...v,is_public:e.target.checked}))}/> Public on profile</label><div className="ml-auto flex gap-2"><Button variant="outline" onClick={reset}>Cancel</Button><Button onClick={savePet} disabled={saving}>{saving?<Loader2 className="mr-2 size-4 animate-spin"/>:<Save className="mr-2 size-4"/>}{editingId?"Save Pet":"Add Pet"}</Button></div></div></div>}
  {pets.length===0?<div className="mt-4 rounded-xl border border-dashed p-5 text-center"><PawPrint className="mx-auto size-7 text-muted-foreground"/><p className="mt-2 text-sm font-semibold">No pet profile added yet.</p>{isOwner&&<p className="mt-1 text-xs text-muted-foreground">Add your dog, cat or any companion to your ANVYA profile.</p>}</div>:<div className="mt-4 grid gap-3 sm:grid-cols-2">{pets.map((pet:any)=><div key={pet.id} className="overflow-hidden rounded-2xl border bg-background">{pet.image_url?<img src={pet.image_url} alt={pet.name} className="h-44 w-full object-cover"/>:<div className="flex h-28 items-center justify-center bg-muted/40"><PawPrint className="size-10 text-muted-foreground"/></div>}<div className="p-4"><div className="flex items-start justify-between gap-2"><div><h4 className="font-black">{pet.name}</h4><p className="text-xs text-muted-foreground">{[pet.pet_type,pet.breed].filter(Boolean).join(" • ")}</p></div>{isOwner&&<Badge variant="outline">{pet.is_public?"Public":"Private"}</Badge>}</div><div className="mt-2 flex flex-wrap gap-1.5">{pet.gender&&<Badge variant="secondary">{pet.gender}</Badge>}{pet.birth_date&&<Badge variant="secondary">🎂 {new Date(pet.birth_date).toLocaleDateString()}</Badge>}{pet.location&&<Badge variant="secondary">📍 {pet.location}</Badge>}</div>{pet.bio&&<p className="mt-3 text-sm leading-6 text-muted-foreground">{pet.bio}</p>}{isOwner&&<div className="mt-3 flex gap-2 border-t pt-3"><Button size="sm" variant="outline" onClick={()=>editPet(pet)}>Edit</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={()=>removePet(pet.id)}><Trash2 className="mr-1 size-4"/>Remove</Button></div>}</div></div>)}</div>}
 </CardContent></Card>;
}

function ProfileInfoSection({title,icon,items}:{title:string;icon:string;items:any[]}){
 if(!items.length)return null;
 return <Card className="rounded-2xl border shadow-sm"><CardContent className="p-5"><h3 className="font-black">{icon} {title}</h3><div className="mt-4 space-y-4">{items.map((x,i)=><div key={i} className="border-b pb-4 last:border-0 last:pb-0"><p className="font-bold">{x.title||"Untitled"}</p>{x.subtitle&&<p className="text-sm text-muted-foreground">{x.subtitle}</p>}{x.meta&&<p className="text-xs text-muted-foreground">{x.meta}</p>}{x.description&&<p className="mt-2 text-sm leading-6 text-muted-foreground">{x.description}</p>}</div>)}</div></CardContent></Card>;
}