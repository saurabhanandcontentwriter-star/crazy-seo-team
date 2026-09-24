import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, Heart, MessageCircle, Repeat2, CalendarDays } from "lucide-react";

export default function IdeasNotifications(){
 const [items,setItems]=useState<any[]>([]),[loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{setLoading(true);const {data:{user}}=await supabase.auth.getUser();if(!user){setLoading(false);return}
  const {data:posts}=await supabase.from("idea_posts").select("id,title,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100);
  const ids=(posts||[]).map(p=>p.id);
  if(!ids.length){setLoading(false);return}
  const [r,c,s,e]=await Promise.all([
   supabase.from("idea_post_reactions").select("post_id,user_id,reaction,created_at").in("post_id",ids).neq("user_id",user.id).order("created_at",{ascending:false}),
   supabase.from("idea_post_comments").select("id,post_id,user_id,content,created_at").in("post_id",ids).neq("user_id",user.id).order("created_at",{ascending:false}),
   supabase.from("idea_post_reshares").select("post_id,user_id,created_at").in("post_id",ids).neq("user_id",user.id).order("created_at",{ascending:false}),
   supabase.from("idea_event_rsvps").select("post_id,user_id,status,created_at").in("post_id",ids).neq("user_id",user.id).order("created_at",{ascending:false})
  ]);
  const map=new Map((posts||[]).map(p=>[p.id,p]));
  const rows:any[]=[];
  (r.data||[]).forEach(x=>rows.push({...x,type:x.reaction==="like"?"like":"dislike",post:map.get(x.post_id)}));
  (c.data||[]).forEach(x=>rows.push({...x,type:"comment",post:map.get(x.post_id)}));
  (s.data||[]).forEach(x=>rows.push({...x,type:"share",post:map.get(x.post_id)}));
  (e.data||[]).forEach(x=>rows.push({...x,type:"event",post:map.get(x.post_id)}));
  rows.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  const actorIds=[...new Set(rows.map(x=>x.user_id).filter(Boolean))];
  let profiles:any[]=[];if(actorIds.length){const {data}=await supabase.from("idea_profiles").select("user_id,display_name,avatar_url,public_id").in("user_id",actorIds);profiles=data||[]}
  const byId=new Map(profiles.map(p=>[p.user_id,p]));setItems(rows.slice(0,100).map(x=>({...x,actor:byId.get(x.user_id)})));setLoading(false);
 })()},[]);
 const text=(x:any)=>x.type==="like"?"liked your post":x.type==="dislike"?"reacted negatively to your post":x.type==="comment"?"commented on your post":x.type==="share"?"reshared your post":"responded to your event";
 const Icon=({type}:{type:string})=>type==="like"?<Heart className="size-4"/>:type==="comment"?<MessageCircle className="size-4"/>:type==="share"?<Repeat2 className="size-4"/>:type==="event"?<CalendarDays className="size-4"/>:<Bell className="size-4"/>;
 return <div className="min-h-screen bg-[#f8f9fc] dark:bg-background"><div className="mx-auto max-w-4xl px-4 py-8"><Card className="rounded-3xl"><CardContent className="p-5 md:p-7"><div className="flex items-center gap-3 border-b pb-5"><div className="rounded-2xl bg-primary/10 p-3 text-primary"><Bell/></div><div><h1 className="text-2xl font-black">Notifications</h1><p className="text-sm text-muted-foreground">Likes, comments, reshares and event activity on your posts.</p></div></div>{loading?<div className="flex justify-center py-14"><Loader2 className="animate-spin"/></div>:!items.length?<div className="py-14 text-center text-muted-foreground">No new activity yet. When people like, comment, reshare or respond to your posts, it will appear here.</div>:<div className="divide-y">{items.map((x:any)=><div key={x.type+"-"+x.post_id+"-"+x.created_at+"-"+x.user_id} className="flex gap-3 py-4"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">{x.actor?.avatar_url?<img src={x.actor.avatar_url} className="size-full rounded-full object-cover" alt=""/>:<Icon type={x.type}/>}</div><div className="min-w-0 flex-1"><p className="text-sm"><b>{x.actor?.display_name||"Someone"}</b> {text(x)}</p>{x.type==="comment"&&<p className="mt-1 line-clamp-2 rounded-xl bg-muted/50 p-2 text-xs text-muted-foreground">{x.content}</p>}<Link to={"/anvya/profile/"+x.post?.user_id+"?post="+x.post_id} className="mt-1 block truncate text-xs font-semibold text-primary hover:underline">{x.post?.title||"View post"}</Link><p className="mt-1 text-[11px] text-muted-foreground">{new Date(x.created_at).toLocaleString()}</p></div><Badge variant="outline" className="h-fit capitalize">{x.type}</Badge></div>)}</div>}</CardContent></Card></div></div>;
}