import {useEffect,useMemo,useState} from "react";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import {MessageCircle,Send,Search,UserCircle2,Clock3,Circle,ArrowLeft} from "lucide-react";

type MsgProfile={user_id:string;display_name:string;avatar_url:string|null;public_id?:string|null};
type Msg={id:string;sender_id:string;receiver_id:string;message:string;created_at:string;read_at?:string|null};
type InboxItem=MsgProfile&{last_message:string;last_message_at:string;unread:number};

const onlineCutoff=90*1000;

function isOnline(lastSeen:string|null|undefined){return !!lastSeen&&Date.now()-new Date(lastSeen).getTime()<onlineCutoff;}
function formatLastSeen(value:string|null|undefined){
 if(!value)return "Never seen";
 const diff=Math.max(0,Date.now()-new Date(value).getTime());
 if(diff<60_000)return "Last seen just now";
 if(diff<3_600_000)return "Last seen "+Math.floor(diff/60_000)+" min ago";
 if(diff<86_400_000)return "Last seen "+Math.floor(diff/3_600_000)+" hr ago";
 return "Last seen "+new Date(value).toLocaleString();
}

export default function IdeasMessages({me,initialTarget}:{me:string;initialTarget?:MsgProfile|null}){
 const [target,setTarget]=useState<MsgProfile|null>(initialTarget||null);
 const [search,setSearch]=useState("");
 const [results,setResults]=useState<MsgProfile[]>([]);
 const [inbox,setInbox]=useState<InboxItem[]>([]);
 const [messages,setMessages]=useState<Msg[]>([]);
 const [text,setText]=useState("");
 const [loading,setLoading]=useState(false);
 const [sending,setSending]=useState(false);
 const [presence,setPresence]=useState<{online:boolean;last_seen_at:string}|null>(null);
 const [inboxLoading,setInboxLoading]=useState(true);

 useEffect(()=>{setTarget(initialTarget||null)},[initialTarget?.user_id]);

 const loadInbox=async()=>{
  if(!me)return;
  setInboxLoading(true);
  const {data,error}=await supabase.from("idea_messages").select("id,sender_id,receiver_id,message,created_at,read_at").or("sender_id.eq."+me+",receiver_id.eq."+me).order("created_at",{ascending:false}).limit(300);
  if(error){console.error(error);setInbox([]);setInboxLoading(false);return;}
  const rows=(data||[]) as Msg[];
  const latest=new Map<string,InboxItem>();
  rows.forEach(m=>{
   const other=m.sender_id===me?m.sender_id===m.receiver_id?null:m.receiver_id:m.sender_id;
   if(!other||latest.has(other))return;
   latest.set(other,{user_id:other,display_name:"Ideas Member",avatar_url:null,public_id:null,last_message:m.message,last_message_at:m.created_at,unread:m.receiver_id===me&&!m.read_at?1:0});
  });
  const ids=[...latest.keys()];
  if(ids.length){
   const {data:profiles}=await supabase.from("idea_profiles").select("user_id,display_name,avatar_url,public_id").in("user_id",ids);
   (profiles||[]).forEach((p:any)=>{const x=latest.get(p.user_id);if(x)Object.assign(x,{display_name:p.display_name||"Ideas Member",avatar_url:p.avatar_url||null,public_id:p.public_id||null})});
   for(const id of ids){
    const item=latest.get(id);if(!item)continue;
    item.unread=rows.filter(m=>m.sender_id===id&&m.receiver_id===me&&!m.read_at).length;
   }
  }
  setInbox([...latest.values()].sort((a,b)=>new Date(b.last_message_at).getTime()-new Date(a.last_message_at).getTime()));
  setInboxLoading(false);
 };

 useEffect(()=>{
  void loadInbox();
  const heartbeat=async()=>{
   const now=new Date().toISOString();
   await supabase.from("idea_presence").upsert({user_id:me,online:true,last_seen_at:now,updated_at:now});
  };
  void heartbeat();
  const timer=window.setInterval(()=>{void heartbeat();void loadInbox()},30_000);
  const setOffline=()=>{void supabase.from("idea_presence").update({online:false,last_seen_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("user_id",me)};
  const onVisibility=()=>{if(document.visibilityState==="visible")void heartbeat();else setOffline()};
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
    supabase.from("idea_messages").select("id,sender_id,receiver_id,message,created_at,read_at").or("and(sender_id.eq."+me+",receiver_id.eq."+target.user_id+"),and(sender_id.eq."+target.user_id+",receiver_id.eq."+me+")").order("created_at",{ascending:true}),
    supabase.from("idea_presence").select("online,last_seen_at").eq("user_id",target.user_id).maybeSingle()
   ]);
   if(!cancelled){
    setMessages((m.data as Msg[])||[]);
    setPresence(p.data as any||null);
    setLoading(false);
    const unread=(m.data||[]).filter((x:any)=>x.receiver_id===me&&!x.read_at).map((x:any)=>x.id);
    if(unread.length)await supabase.from("idea_messages").update({read_at:new Date().toISOString()}).in("id",unread);
    void loadInbox();
   }
  };
  void load();
  const channel=supabase.channel("ideas-chat-"+[me,target.user_id].sort().join("-"))
   .on("postgres_changes",{event:"*",schema:"public",table:"idea_messages"},()=>{void load()})
   .on("postgres_changes",{event:"*",schema:"public",table:"idea_presence",filter:"user_id=eq."+target.user_id},(payload:any)=>{setPresence(payload.new as any)})
   .subscribe();
  const refresh=window.setInterval(()=>void load(),30_000);
  return()=>{cancelled=true;window.clearInterval(refresh);void supabase.removeChannel(channel)};
 },[me,target?.user_id]);

 useEffect(()=>{
  const q=search.trim();
  if(!q){setResults([]);return}
  let cancelled=false;
  const t=window.setTimeout(async()=>{
   const {data,error}=await supabase.rpc("search_ideas_directory",{p_query:q});
   if(!cancelled){
    if(error){console.error("Ideas directory search failed:",error);setResults([])}
    else setResults(((data||[]) as any[]).filter(r=>r.user_id!==me).map(r=>({user_id:r.user_id,display_name:r.display_name||"Ideas Member",avatar_url:r.avatar_url||null,public_id:r.public_id||null})));
   }
  },250);
  return()=>{cancelled=true;window.clearTimeout(t)}
 },[search,me]);

 const selectTarget=(r:MsgProfile)=>{setTarget(r);setSearch("");setResults([])};

 const send=async()=>{
  if(!target||target.user_id===me)return;
  const body=text.trim();if(!body)return;
  setSending(true);
  const {data,error}=await supabase.from("idea_messages").insert({sender_id:me,receiver_id:target.user_id,message:body}).select("id,sender_id,receiver_id,message,created_at,read_at").single();
  if(error)toast.error(error.message);
  else{setMessages(v=>[...v,data as Msg]);setText("");void loadInbox();}
  setSending(false);
 };

 const online=isOnline(presence?.last_seen_at);
 const unreadTotal=useMemo(()=>inbox.reduce((n,x)=>n+x.unread,0),[inbox]);

 return <Card className="mt-4 overflow-hidden">
  <CardContent className="p-3 sm:p-4 md:p-5">
   <div className="flex flex-wrap items-center gap-3">
    <div className="rounded-xl bg-primary/10 p-2"><MessageCircle className="text-primary"/></div>
    <div className="min-w-0 flex-1"><h3 className="font-black text-lg">Messages {unreadTotal>0&&<Badge className="ml-2">{unreadTotal}</Badge>}</h3><p className="text-xs text-muted-foreground">Direct inbox • Search by name or Public ID</p></div>
    {target&&<Button size="sm" variant="outline" onClick={()=>setTarget(null)}><ArrowLeft className="mr-1 size-4"/>Inbox</Button>}
   </div>

   {!target&&<div className="mt-4">
    <div className="relative">
     <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><Input className="pl-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or Public ID (CST-...)"/></div>
     {results.length>0&&<div className="absolute z-20 mt-1 w-full rounded-xl border bg-background p-2 shadow-xl">{results.map(r=><button key={r.user_id} onClick={()=>selectTarget(r)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted">
      <div className="size-9 shrink-0 overflow-hidden rounded-full bg-muted">{r.avatar_url?<img src={r.avatar_url} className="size-full object-cover" alt={r.display_name}/>:<UserCircle2 className="size-full p-1.5 text-muted-foreground"/>}</div>
      <div className="min-w-0"><p className="truncate font-semibold">{r.display_name}</p><p className="text-xs text-muted-foreground">{r.public_id||"No Public ID"}</p></div>
     </button>)}</div>}
    </div>
    <div className="mt-4 space-y-2">
     {inboxLoading&&<p className="py-6 text-center text-sm text-muted-foreground">Loading inbox…</p>}
     {!inboxLoading&&inbox.length===0&&<div className="rounded-2xl border p-8 text-center"><MessageCircle className="mx-auto size-9 text-muted-foreground"/><p className="mt-2 font-semibold">Your inbox is empty</p><p className="text-sm text-muted-foreground">Search a Public ID or profile name to start a direct chat.</p></div>}
     {inbox.map(x=><button key={x.user_id} onClick={()=>selectTarget({user_id:x.user_id,display_name:x.display_name,avatar_url:x.avatar_url,public_id:x.public_id})} className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition hover:bg-muted/50">
      <div className="size-11 shrink-0 overflow-hidden rounded-full bg-muted">{x.avatar_url?<img src={x.avatar_url} className="size-full object-cover" alt={x.display_name}/>:<UserCircle2 className="size-full p-2 text-muted-foreground"/>}</div>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate font-bold">{x.display_name}</p>{x.public_id&&<span className="text-xs text-muted-foreground">{x.public_id}</span>}</div><p className="truncate text-sm text-muted-foreground">{x.last_message}</p></div>
      <div className="shrink-0 text-right"><p className="text-[10px] text-muted-foreground">{new Date(x.last_message_at).toLocaleString()}</p>{x.unread>0&&<Badge className="mt-1">{x.unread}</Badge>}</div>
     </button>)}
    </div>
   </div>}

   {target&&target.user_id!==me&&<div className="mt-4 overflow-hidden rounded-2xl border">
    <div className="flex items-center gap-3 border-b p-3 sm:p-4">
     <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">{target.avatar_url?<img src={target.avatar_url} className="size-full object-cover" alt={target.display_name}/>:<UserCircle2 className="size-full p-2 text-muted-foreground"/>}<span className={"absolute bottom-0 right-0 size-3 rounded-full border-2 border-background "+(online?"bg-green-500":"bg-muted-foreground")}/></div>
     <div className="min-w-0 flex-1"><p className="truncate font-bold">{target.display_name}</p><p className="text-xs text-muted-foreground">{target.public_id||"No Public ID"} • {online?<span className="text-green-600">Active now</span>:formatLastSeen(presence?.last_seen_at)}</p></div>
     <Badge variant={online?"default":"outline"}>{online?"Online":"Offline"}</Badge>
    </div>
    <div className="max-h-[55vh] min-h-56 space-y-2 overflow-y-auto p-3 sm:p-4">
     {loading&&<p className="text-sm text-muted-foreground">Loading conversation…</p>}
     {!loading&&messages.length===0&&<p className="py-12 text-center text-sm text-muted-foreground">No messages yet. Say hello 👋</p>}
     {messages.map(m=><div key={m.id} className={"flex "+(m.sender_id===me?"justify-end":"justify-start")}><div className={"max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[75%] "+(m.sender_id===me?"bg-primary text-primary-foreground":"bg-muted")}><p className="whitespace-pre-wrap break-words">{m.message}</p><p className={"mt-1 text-[10px] "+(m.sender_id===me?"opacity-75":"text-muted-foreground")}>{new Date(m.created_at).toLocaleString()}</p></div></div>)}
    </div>
    <div className="flex gap-2 border-t p-2 sm:p-3"><Input className="min-w-0" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send()}}} placeholder={"Message "+target.display_name+"…"} maxLength={5000}/><Button onClick={()=>void send()} disabled={sending||!text.trim()}><Send className="mr-2 size-4"/>Send</Button></div>
   </div>}
  </CardContent>
 </Card>;
}
