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
function formatMessageTime(value:string){return new Date(value).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});}
function formatDayLabel(value:string){const d=new Date(value);const today=new Date();const yesterday=new Date();yesterday.setDate(today.getDate()-1);if(d.toDateString()===today.toDateString())return "Today";if(d.toDateString()===yesterday.toDateString())return "Yesterday";return d.toLocaleDateString([], {day:"numeric",month:"short",year:"numeric"});}
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

 return <Card className="mt-4 overflow-hidden rounded-3xl border bg-background shadow-sm">
  <CardContent className="p-0">
   <div className="grid min-h-[620px] md:grid-cols-[320px_1fr]">
    <aside className={`border-b md:border-b-0 md:border-r ${target ? "hidden md:block" : "block"}`}>
     <div className="sticky top-0 bg-background/95 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
       <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-blue-500 text-white"><MessageCircle className="size-5"/></div>
       <div className="min-w-0 flex-1"><h3 className="font-black">Messages</h3><p className="text-[11px] text-muted-foreground">Direct conversations</p></div>
       {unreadTotal>0&&<Badge className="rounded-full">{unreadTotal}</Badge>}
      </div>
      <div className="relative mt-4"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input className="h-9 rounded-full border-0 bg-muted pl-9 text-sm" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search"/></div>
      {results.length>0&&<div className="absolute z-30 mt-1 w-[calc(100%-2rem)] max-w-[288px] rounded-2xl border bg-background p-2 shadow-xl">{results.map(r=><button key={r.user_id} onClick={()=>selectTarget(r)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-muted">
       <div className="size-10 shrink-0 overflow-hidden rounded-full bg-muted">{r.avatar_url?<img src={r.avatar_url} className="size-full object-cover" alt={r.display_name}/>:<UserCircle2 className="size-full p-2 text-muted-foreground"/>}</div>
       <div className="min-w-0"><p className="truncate text-sm font-semibold">{r.display_name}</p><p className="text-[11px] text-muted-foreground">{r.public_id||"ANVYA member"}</p></div>
      </button>)}</div>}
     </div>
     <div className="max-h-[540px] overflow-y-auto px-2 pb-3">
      {inboxLoading&&<p className="py-8 text-center text-xs text-muted-foreground">Loading chats…</p>}
      {!inboxLoading&&inbox.length===0&&<div className="px-5 py-12 text-center"><MessageCircle className="mx-auto size-8 text-muted-foreground"/><p className="mt-3 text-sm font-semibold">No messages yet</p><p className="mt-1 text-xs text-muted-foreground">Search a member to start chatting.</p></div>}
      {inbox.map(x=><button key={x.user_id} onClick={()=>selectTarget({user_id:x.user_id,display_name:x.display_name,avatar_url:x.avatar_url,public_id:x.public_id})} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${target?.user_id===x.user_id?"bg-muted":"hover:bg-muted/70"}`}>
       <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">{x.avatar_url?<img src={x.avatar_url} className="size-full object-cover" alt={x.display_name}/>:<UserCircle2 className="size-full p-2 text-muted-foreground"/>}<span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-muted-foreground"/></div>
       <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-bold">{x.display_name}</p>{x.unread>0&&<span className="size-2 rounded-full bg-blue-600"/>}</div><p className={`truncate text-xs ${x.unread>0?"font-semibold text-foreground":"text-muted-foreground"}`}>{x.last_message}</p></div>
       <div className="shrink-0 text-[10px] text-muted-foreground">{new Date(x.last_message_at).toLocaleDateString([], {day:"numeric",month:"short"})}</div>
      </button>)}
     </div>
    </aside>

    <section className={target ? "flex min-h-[620px] flex-col" : "hidden md:flex md:items-center md:justify-center"}>
     {!target?<div className="max-w-sm px-8 text-center"><div className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-violet-600/15 to-blue-600/15"><MessageCircle className="size-9 text-primary"/></div><h3 className="mt-5 text-xl font-black">Your messages</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Select a conversation or search for an ANVYA member to send a direct message.</p></div>:
      <><div className="flex items-center gap-3 border-b px-4 py-3">
       <Button size="icon" variant="ghost" className="md:hidden" onClick={()=>setTarget(null)}><ArrowLeft className="size-5"/></Button>
       <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">{target.avatar_url?<img src={target.avatar_url} className="size-full object-cover" alt={target.display_name}/>:<UserCircle2 className="size-full p-2 text-muted-foreground"/>}<span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-background ${online?"bg-green-500":"bg-muted-foreground"}`}/></div>
       <div className="min-w-0 flex-1"><p className="truncate font-bold">{target.display_name}</p><p className="text-[11px] text-muted-foreground">{target.public_id||"ANVYA member"} · {online?"Active now":formatLastSeen(presence?.last_seen_at)}</p></div>
       <Badge variant="outline" className="hidden rounded-full sm:inline-flex">{online?"Active":"Offline"}</Badge>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20 px-4 py-5 sm:px-7">
       {loading&&<p className="text-xs text-muted-foreground">Loading conversation…</p>}
       {!loading&&messages.length===0&&<div className="py-20 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-muted"><MessageCircle className="size-7 text-muted-foreground"/></div><p className="mt-3 text-sm font-semibold">Say hello 👋</p><p className="text-xs text-muted-foreground">Start the conversation with {target.display_name}.</p></div>}
       {messages.map((m,i)=>{const showDay=i===0||formatDayLabel(messages[i-1].created_at)!==formatDayLabel(m.created_at);return <div key={m.id}>{showDay&&<div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-border"/><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{formatDayLabel(m.created_at)}</span><div className="h-px flex-1 bg-border"/></div>}<div className={`mb-1 flex items-end gap-2 ${m.sender_id===me?"justify-end":"justify-start"}`}>{m.sender_id!==me&&<div className="size-7 shrink-0 overflow-hidden rounded-full bg-muted"><UserCircle2 className="size-full p-1 text-muted-foreground"/></div>}<div className={`max-w-[78%] px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[65%] ${m.sender_id===me?"rounded-[22px] rounded-br-md bg-gradient-to-r from-violet-600 to-blue-600 text-white":"rounded-[22px] rounded-bl-md border bg-background"}`}><p className="whitespace-pre-wrap break-words leading-5">{m.message}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${m.sender_id===me?"text-white/70":"text-muted-foreground"}`}><span>{formatMessageTime(m.created_at)}</span>{m.sender_id===me&&<span>{m.read_at?"✓✓":"✓"}</span>}</div></div></div></div>})}
      </div>
      <div className="border-t bg-background p-3 sm:p-4"><div className="flex items-center gap-2 rounded-full border bg-muted/40 p-1.5"><Input className="h-9 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send()}}} placeholder={`Message ${target.display_name}…`} maxLength={5000}/><Button size="icon" className="size-9 shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-blue-600" onClick={()=>void send()} disabled={sending||!text.trim()}><Send className="size-4"/></Button></div><p className="mt-1 px-3 text-[10px] text-muted-foreground">Press Enter to send</p></div>
      </>}
    </section>
   </div>
  </CardContent>
 </Card>;