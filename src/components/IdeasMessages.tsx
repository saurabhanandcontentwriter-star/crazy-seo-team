import {useEffect,useMemo,useState} from "react";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import {MessageCircle,Send,Search,UserCircle2,Clock3,Circle} from "lucide-react";

type MsgProfile={user_id:string;display_name:string;avatar_url:string|null;public_id?:string|null};
type Msg={id:string;sender_id:string;receiver_id:string;message:string;created_at:string};

const onlineCutoff=90*1000;

function isOnline(lastSeen:string|null|undefined){
  return !!lastSeen && Date.now()-new Date(lastSeen).getTime()<onlineCutoff;
}

function formatLastSeen(value:string|null|undefined){
  if(!value)return "Never seen";
  const d=new Date(value);
  const diff=Math.max(0,Date.now()-d.getTime());
  if(diff<60_000)return "Last seen just now";
  if(diff<3_600_000)return "Last seen "+Math.floor(diff/60_000)+" min ago";
  if(diff<86_400_000)return "Last seen "+Math.floor(diff/3_600_000)+" hr ago";
  return "Last seen "+d.toLocaleString();
}

export default function IdeasMessages({me,initialTarget}:{me:string;initialTarget?:MsgProfile|null}){
 const [target,setTarget]=useState<MsgProfile|null>(initialTarget||null);
 const [search,setSearch]=useState("");
 const [results,setResults]=useState<MsgProfile[]>([]);
 const [messages,setMessages]=useState<Msg[]>([]);
 const [text,setText]=useState("");
 const [loading,setLoading]=useState(false);
 const [sending,setSending]=useState(false);
 const [presence,setPresence]=useState<{online:boolean;last_seen_at:string}|null>(null);

 useEffect(()=>{if(initialTarget)setTarget(initialTarget)},[initialTarget?.user_id]);

 useEffect(()=>{
  let active=true;
  const heartbeat=async()=>{
   const now=new Date().toISOString();
   await supabase.from("idea_presence").upsert({user_id:me,online:true,last_seen_at:now,updated_at:now});
  };
  heartbeat();
  const timer=window.setInterval(heartbeat,30_000);
  const setOffline=()=>{void supabase.from("idea_presence").update({online:false,last_seen_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("user_id",me)};
  const setOnline=()=>{void heartbeat()};
  const onVisibility=()=>{if(document.visibilityState==="visible")setOnline();else setOffline()};
  window.addEventListener("beforeunload",setOffline);
  document.addEventListener("visibilitychange",onVisibility);
  return()=>{window.clearInterval(timer);window.removeEventListener("beforeunload",setOffline);document.removeEventListener("visibilitychange",onVisibility);setOffline()};
 },[me]);

 useEffect(()=>{
  if(!target?.user_id||target.user_id===me){setMessages([]);setPresence(null);return}
  let cancelled=false;
  const load=async()=>{
   setLoading(true);
   const [m,p]=await Promise.all([
    supabase.from("idea_messages").select("id,sender_id,receiver_id,message,created_at").or("and(sender_id.eq."+me+",receiver_id.eq."+target.user_id+"),and(sender_id.eq."+target.user_id+",receiver_id.eq."+me+")").order("created_at",{ascending:true}),
    supabase.from("idea_presence").select("online,last_seen_at").eq("user_id",target.user_id).maybeSingle()
   ]);
   if(!cancelled){setMessages((m.data as Msg[])||[]);setPresence(p.data as any||null);setLoading(false)}
  };
  load();
  const channel=supabase.channel("ideas-chat-"+[me,target.user_id].sort().join("-"))
    .on("postgres_changes",{event:"*",schema:"public",table:"idea_messages"},()=>{void load()})
    .on("postgres_changes",{event:"*",schema:"public",table:"idea_presence",filter:"user_id=eq."+target.user_id},(payload:any)=>{setPresence(payload.new as any)})
    .subscribe();
  const refresh=window.setInterval(()=>{void load()},30_000);
  return()=>{cancelled=true;window.clearInterval(refresh);void supabase.removeChannel(channel)};
 },[me,target?.user_id]);

 useEffect(()=>{
  const q=search.trim();
  if(!q){setResults([]);return}
  let cancelled=false;
  const t=window.setTimeout(async()=>{
   const {data}=await supabase.from("idea_profiles").select("user_id,display_name,avatar_url,public_id").neq("user_id",me).or("display_name.ilike.%"+q+"%,public_id.ilike.%"+q+"%").limit(8);
   if(!cancelled)setResults((data as MsgProfile[])||[]);
  },250);
  return()=>{cancelled=true;window.clearTimeout(t)};
 },[search,me]);

 const send=async()=>{
  if(!target||target.user_id===me)return;
  const body=text.trim();
  if(!body)return;
  setSending(true);
  const {data,error}=await supabase.from("idea_messages").insert({sender_id:me,receiver_id:target.user_id,message:body}).select("id,sender_id,receiver_id,message,created_at").single();
  if(error)toast.error(error.message);
  else{setMessages(v=>[...v,data as Msg]);setText("")}
  setSending(false);
 };

 const online=isOnline(presence?.last_seen_at);

 return <Card className="mt-4 overflow-hidden"><CardContent className="p-4 md:p-5">
  <div className="flex flex-wrap items-center gap-3">
   <div className="rounded-xl bg-primary/10 p-2"><MessageCircle className="text-primary"/></div>
   <div><h3 className="font-black text-lg">Messages</h3><p className="text-xs text-muted-foreground">Chat with another Ideas profile by Public ID or name.</p></div>
  </div>
  <div className="mt-4 relative">
   <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><Input className="pl-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or Public ID (CST-...)"/></div></div>
   {results.length>0&&<div className="absolute z-20 mt-1 w-full rounded-xl border bg-background p-2 shadow-xl">{results.map(r=><button key={r.user_id} onClick={()=>{setTarget(r);setSearch("");setResults([])}} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted"><div className="size-9 overflow-hidden rounded-full bg-muted">{r.avatar_url?<img src={r.avatar_url} className="size-full object-cover" alt={r.display_name}/>:<UserCircle2 className="size-full p-1.5 text-muted-foreground"/>}</div><div><p className="font-semibold">{r.display_name}</p><p className="text-xs text-muted-foreground">{r.public_id||r.user_id.slice(0,8)}</p></div></button>)}</div>}
  </div>
  {target&&target.user_id!==me&&<div className="mt-4 rounded-2xl border">
   <div className="flex items-center gap-3 border-b p-4"><div className="relative size-11 overflow-hidden rounded-full bg-muted">{target.avatar_url?<img src={target.avatar_url} className="size-full object-cover" alt={target.display_name}/>:<UserCircle2 className="size-full p-2 text-muted-foreground"/>}<span className={"absolute bottom-0 right-0 size-3 rounded-full border-2 border-background "+(online?"bg-green-500":"bg-muted-foreground")}/></div><div className="flex-1"><p className="font-bold">{target.display_name}</p><div className="flex items-center gap-2 text-xs text-muted-foreground">{online?<><Circle className="size-2 fill-green-500 text-green-500"/>Online</>:<><Clock3 className="size-3"/>{formatLastSeen(presence?.last_seen_at)}</>}</div></div><Badge variant={online?"default":"outline"}>{online?"Online":"Offline"}</Badge></div>
   <div className="max-h-80 space-y-2 overflow-y-auto p-4">{loading&&<p className="text-sm text-muted-foreground">Loading conversation…</p>}{!loading&&messages.length===0&&<p className="py-8 text-center text-sm text-muted-foreground">No messages yet. Say hello 👋</p>}{messages.map(m=><div key={m.id} className={"flex "+(m.sender_id===me?"justify-end":"justify-start")}><div className={"max-w-[80%] rounded-2xl px-3 py-2 text-sm "+(m.sender_id===me?"bg-primary text-primary-foreground":"bg-muted")}><p className="whitespace-pre-wrap break-words">{m.message}</p><p className={"mt-1 text-[10px] "+(m.sender_id===me?"opacity-75":"text-muted-foreground")}>{new Date(m.created_at).toLocaleString()}</p></div></div>)}</div>
   <div className="flex gap-2 border-t p-3"><Input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send()}}} placeholder={"Message "+target.display_name+"…"} maxLength={5000}/><Button onClick={()=>void send()} disabled={sending||!text.trim()}><Send className="mr-2 size-4"/>Send</Button></div>
  </div>}
 </CardContent></Card>;
}
