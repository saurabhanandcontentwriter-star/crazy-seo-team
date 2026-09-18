import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Card,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import {ArrowLeft,UserPlus,UserCheck,Users,FileText,Activity,HelpCircle,Save,ExternalLink,Loader2,UserCircle2} from "lucide-react";

type Profile={user_id:string;display_name:string;bio:string|null;avatar_url:string|null;cover_url:string|null;location:string|null;website_url:string|null;linkedin_url:string|null;github_url:string|null;instagram_url:string|null;twitter_url:string|null};
type Post={id:string;user_id:string;display_name:string|null;profile_image_url:string|null;title:string;content:string;post_type:string;visibility:string;subject:string;image_url:string|null;created_at:string;status:string};

export default function IdeasProfile(){
 const {userId}=useParams(); const nav=useNavigate();
 const [me,setMe]=useState<string|null>(null),[p,setP]=useState<Profile|null>(null),[posts,setPosts]=useState<Post[]>([]),[tab,setTab]=useState("posts"),[following,setFollowing]=useState(false),[friendStatus,setFriendStatus]=useState<string|null>(null),[edit,setEdit]=useState(false),[saving,setSaving]=useState(false),[loading,setLoading]=useState(true),[form,setForm]=useState<Partial<Profile>>({}),[avatarFile,setAvatarFile]=useState<File|null>(null),[coverFile,setCoverFile]=useState<File|null>(null),[requesters,setRequesters]=useState<Profile[]>([]);
 const load=async()=>{setLoading(true);const {data:{user}}=await supabase.auth.getUser();setMe(user?.id||null);const id=userId||user?.id;if(!id){setLoading(false);return}
 let {data:profile}=await supabase.from("idea_profiles").select("*").eq("user_id",id).maybeSingle();
 if(!profile&&user?.id===id){const fallback={user_id:id,display_name:user.user_metadata?.full_name||user.email?.split("@")[0]||"Member"};await supabase.from("idea_profiles").upsert(fallback);profile=fallback as any}
 setP(profile as Profile|null);setForm(profile||{});
 const {data:ps}=await supabase.from("idea_posts").select("*").eq("user_id",id).eq("status","approved").order("created_at",{ascending:false});setPosts((ps as Post[])||[]);
 if(user&&id===user.id){const {data:incoming}=await supabase.from("idea_friendships").select("requester_id").eq("addressee_id",user.id).eq("status","pending");const ids=(incoming||[]).map(x=>x.requester_id);if(ids.length){const {data:rp}=await supabase.from("idea_profiles").select("*").in("user_id",ids);setRequesters((rp as Profile[])||[])}} if(user&&id!==user.id){const f=await supabase.from("idea_follows").select("follower_id").eq("follower_id",user.id).eq("following_id",id).maybeSingle();setFollowing(!!f.data);
 const fr=await supabase.from("idea_friendships").select("requester_id,addressee_id,status").or("and(requester_id.eq."+user.id+",addressee_id.eq."+id+"),and(requester_id.eq."+id+",addressee_id.eq."+user.id+")").maybeSingle();setFriendStatus(fr.data?.status||null)}
 setLoading(false)};
 useEffect(()=>{load()},[userId]);
 const toggleFollow=async()=>{if(!me||!p)return toast.error("Please sign in first.");if(following){await supabase.from("idea_follows").delete().eq("follower_id",me).eq("following_id",p.user_id);setFollowing(false)}else{const {error}=await supabase.from("idea_follows").insert({follower_id:me,following_id:p.user_id});if(error)toast.error(error.message);else setFollowing(true)}};
 const respondFriend=async(requester:string,status:"accepted"|"rejected")=>{if(!me)return;const {error}=await supabase.from("idea_friendships").update({status,updated_at:new Date().toISOString()}).eq("requester_id",requester).eq("addressee_id",me);if(error)toast.error(error.message);else{setRequesters(x=>x.filter(y=>y.user_id!==requester));toast.success(status==="accepted"?"Friend request accepted.":"Friend request rejected.");}}; const friend=async()=>{if(!me||!p)return;if(friendStatus==="accepted")return;const {error}=await supabase.from("idea_friendships").insert({requester_id:me,addressee_id:p.user_id});if(error)toast.error(error.message);else{setFriendStatus("pending");toast.success("Friend request sent.")}};
 const uploadImage=async(file:File,kind:"avatar"|"cover")=>{if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)throw new Error("Use JPG, PNG or WEBP up to 5 MB.");const ext=file.name.split(".").pop()||"jpg";const path=me+"/"+kind+"-"+crypto.randomUUID()+"."+ext;const up=await supabase.storage.from("idea-images").upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw up.error;return supabase.storage.from("idea-images").getPublicUrl(path).data.publicUrl}; const save=async()=>{if(!me)return;setSaving(true);try{let avatar=form.avatar_url,cover=form.cover_url;if(avatarFile)avatar=await uploadImage(avatarFile,"avatar");if(coverFile)cover=await uploadImage(coverFile,"cover");const payload={...form,user_id:me,display_name:String(form.display_name||"").trim()||"Member",updated_at:new Date().toISOString()};const {data,error}=await supabase.from("idea_profiles").upsert({...payload,avatar_url:avatar,cover_url:cover}).select().single();if(error)toast.error(error.message);else{setP(data);setForm(data);setEdit(false);setAvatarFile(null);setCoverFile(null);toast.success("Profile updated.")}}catch(e:any){toast.error(e?.message||"Could not update profile")}setSaving(false)};
 const social=[["Website",p?.website_url],["LinkedIn",p?.linkedin_url],["GitHub",p?.github_url],["Instagram",p?.instagram_url],["X / Twitter",p?.twitter_url]].filter(x=>x[1]);
 if(loading)return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;
 if(!p)return <div className="container mx-auto max-w-3xl px-4 py-12"><Card><CardContent className="p-10 text-center">Profile not found.</CardContent></Card></div>;
 return (
  <div className="min-h-screen bg-background">
   <div className="container mx-auto max-w-5xl px-4 py-6 md:py-10">
    <Button variant="ghost" onClick={()=>nav("/ideas")}><ArrowLeft className="mr-2 size-4"/>Ideas</Button>
    <Card className="mt-4 overflow-hidden rounded-[28px]">
     <div className="h-44 bg-gradient-to-r from-blue-600/80 via-violet-600/80 to-fuchsia-600/70">
      {p.cover_url&&<img src={p.cover_url} className="size-full object-cover"/>}
     </div>
     <CardContent className="relative p-6">
      <div className="-mt-20 flex flex-col gap-4 md:flex-row md:items-end">
       <div className="size-28 overflow-hidden rounded-3xl border-4 border-background bg-muted">
        {p.avatar_url?<img src={p.avatar_url} className="size-full object-cover"/>:<UserCircle2 className="size-full p-5 text-muted-foreground"/>}
       </div>
       <div className="flex-1">
        <h1 className="text-3xl font-black">{p.display_name}</h1>
        <p className="text-sm text-muted-foreground">{p.location||"Ideas Community member"}</p>
       </div>
       {me===p.user_id ? (
        <Button onClick={()=>setEdit(!edit)}>{edit?"Cancel":"Edit Profile"}</Button>
       ) : (
        <div className="flex gap-2">
         <Button onClick={toggleFollow} variant={following?"outline":"default"}>
          {following?<UserCheck className="mr-2 size-4"/>:<UserPlus className="mr-2 size-4"/>}
          {following?"Following":"Follow"}
         </Button>
         <Button variant="outline" onClick={friend}>
          {friendStatus==="accepted"?<UserCheck className="mr-2 size-4"/>:<Users className="mr-2 size-4"/>}
          {friendStatus==="accepted"?"Friends":friendStatus==="pending"?"Request Sent":"Add Friend"}
         </Button>
        </div>
       )}
      </div>
      {p.bio&&<p className="mt-4 text-muted-foreground">{p.bio}</p>}
      {social.length>0&&<div className="mt-4 flex flex-wrap gap-2">{social.map(([n,u])=><a key={n} href={String(u)} target="_blank" rel="noreferrer"><Badge variant="secondary" className="gap-1"><ExternalLink size={12}/>{n}</Badge></a>)}</div>}
      {edit&&me===p.user_id&&(
       <div className="mt-6 grid gap-4 rounded-2xl border bg-muted/20 p-5 md:grid-cols-2">
        <Input placeholder="Name" value={String(form.display_name||"")} onChange={e=>setForm({...form,display_name:e.target.value})}/>
        <Input placeholder="Location" value={String(form.location||"")} onChange={e=>setForm({...form,location:e.target.value})}/>
        <Textarea className="md:col-span-2" placeholder="Bio" value={String(form.bio||"")} onChange={e=>setForm({...form,bio:e.target.value})}/>
        {["avatar_url","cover_url","website_url","linkedin_url","github_url","instagram_url","twitter_url"].map(k=><Input key={k} placeholder={k.replace("_url","").replace("_"," ")} value={String((form as any)[k]||"")} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}
        <Button className="md:col-span-2" onClick={save} disabled={saving}>{saving?<Loader2 className="mr-2 size-4 animate-spin"/>:<Save className="mr-2 size-4"/>}Save Profile</Button>
       </div>
      )}
     </CardContent>
    </Card>
    <div className="mt-6 flex flex-wrap gap-2">
     {[["posts","Posts",FileText],["activity","Activity",Activity],["friends","Friends",Users],["followers","Followers",Users],["following","Following",UserPlus],["questions","Questions",HelpCircle]].map(([k,n,I]:any)=><Button key={k} variant={tab===k?"default":"outline"} onClick={()=>setTab(k)}><I className="mr-2 size-4"/>{n}</Button>)}
    </div>
    <div className="mt-5 space-y-4">
     {tab==="posts"&&posts.filter(x=>x.post_type==="post").map(x=><PostCard key={x.id} x={x}/>)}
     {tab==="questions"&&posts.filter(x=>x.post_type==="question").map(x=><PostCard key={x.id} x={x}/>)}
     {tab==="activity"&&(
      <Card><CardContent className="space-y-4 p-6">
       {posts.slice(0,20).map(x=>(
        <div key={x.id} className="flex gap-3 border-b pb-3">
         <Activity className="mt-1 size-4 text-primary"/>
         <div><b>{x.post_type==="question"?"Asked a question":"Published a post"}</b><p className="text-sm text-muted-foreground">{x.title} • {new Date(x.created_at).toLocaleDateString()}</p></div>
        </div>
       ))}
      </CardContent></Card>
     )}
     {(tab==="friends"||tab==="following"||tab==="followers")&&<RelationshipList userId={p.user_id} mode={tab as "friends"|"following"|"followers"}/>}
     {me===p.user_id&&requesters.length>0&&(
      <Card><CardContent className="p-6">
       <h3 className="mb-4 text-lg font-bold">Friend Requests</h3>
       {requesters.map(r=>(
        <div key={r.user_id} className="flex items-center gap-3 border-b py-3">
         <div className="size-10 overflow-hidden rounded-full bg-muted">{r.avatar_url?<img src={r.avatar_url} className="size-full object-cover"/>:<UserCircle2 className="size-full p-2"/>}</div>
         <div className="flex-1"><p className="font-bold">{r.display_name}</p><p className="text-xs text-muted-foreground">{r.location||"Ideas Community"}</p></div>
         <Button size="sm" onClick={()=>respondFriend(r.user_id,"accepted")}>Accept</Button>
         <Button size="sm" variant="outline" onClick={()=>respondFriend(r.user_id,"rejected")}>Reject</Button>
        </div>
       ))}
      </CardContent></Card>
     )}
    </div>
   </div>
  </div>
 );
}

function PostCard({x}:{x:Post}){
 return (
  <Card>
   <CardContent className="p-5">
    <div className="mb-2 flex gap-2">
     <Badge>{x.post_type==="question"?"Question":x.subject}</Badge>
     <Badge variant="outline">{x.visibility==="friends"?"Friends":"Public"}</Badge>
    </div>
    <h2 className="text-xl font-bold">{x.title}</h2>
    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{x.content}</p>
    {x.image_url&&<img src={x.image_url} className="mt-4 max-h-96 rounded-2xl object-cover"/>}
   </CardContent>
  </Card>
 );
}

function RelationshipList({userId,mode}:{userId:string;mode:"friends"|"following"|"followers"}){
 const [items,setItems]=useState<any[]>([]);
 useEffect(()=>{
  (async()=>{
   let ids:string[]=[];
   if(mode==="following"){
    const {data}=await supabase.from("idea_follows").select("following_id").eq("follower_id",userId);
    ids=(data||[]).map(x=>x.following_id);
   }else if(mode==="followers"){
    const {data}=await supabase.from("idea_follows").select("follower_id").eq("following_id",userId);
    ids=(data||[]).map(x=>x.follower_id);
   }else{
    const {data}=await supabase.from("idea_friendships").select("requester_id,addressee_id").eq("status","accepted").or("requester_id.eq."+userId+",addressee_id.eq."+userId);
    ids=(data||[]).map(x=>x.requester_id===userId?x.addressee_id:x.requester_id);
   }
   if(ids.length){
    const {data}=await supabase.from("idea_profiles").select("*").in("user_id",ids);
    setItems(data||[]);
   }else setItems([]);
  })();
 },[userId,mode]);
 return (
  <Card>
   <CardContent className="p-6">
    {items.length===0 ? (
     <p className="text-muted-foreground">No {mode} yet.</p>
    ) : (
     items.map(x=>(
      <div key={x.user_id} className="flex items-center gap-3 border-b py-3">
       <div className="size-10 overflow-hidden rounded-full bg-muted">
        {x.avatar_url?<img src={x.avatar_url} className="size-full object-cover"/>:<UserCircle2 className="size-full p-2"/>}
       </div>
       <p className="font-bold">{x.display_name}</p>
      </div>
     ))
    )}
   </CardContent>
  </Card>
 );
}
