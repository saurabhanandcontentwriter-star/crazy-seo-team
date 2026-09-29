import {useEffect,useMemo,useRef,useState} from "react";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import {MessageCircle,Send,Search,UserCircle2,ArrowLeft,MoreHorizontal,Phone,Video,FileEdit,UserPlus,Inbox,Bell} from "lucide-react";

type MsgProfile={user_id:string;display_name:string;avatar_url:string|null;public_id?:string|null};
type Msg={id:string;sender_id:string;receiver_id:string;message:string;created_at:string;read_at?:string|null}; type CallLog={kind:"audio"|"video";status:"missed"|"rejected"|"outgoing_missed"|"completed";caller_id:string;receiver_id:string;duration?:number}; const CALL_PREFIX="__ANVYA_CALL__";
type InboxItem=MsgProfile&{last_message:string;last_message_at:string;unread:number;last_seen_at:string|null};

const onlineCutoff=90*1000;
function isOnline(lastSeen:string|null|undefined){return !!lastSeen&&Date.now()-new Date(lastSeen).getTime()<onlineCutoff;}
function formatMessageTime(value:string){return new Date(value).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});}
function formatDayLabel(value:string){const d=new Date(value),today=new Date(),yesterday=new Date();yesterday.setDate(today.getDate()-1);if(d.toDateString()===today.toDateString())return"Today";if(d.toDateString()===yesterday.toDateString())return"Yesterday";return d.toLocaleDateString([],{day:"numeric",month:"short",year:"numeric"});}
function formatLastSeen(value:string|null|undefined){if(!value)return"Never seen";const diff=Math.max(0,Date.now()-new Date(value).getTime());if(diff<60_000)return"Last seen just now";if(diff<3_600_000)return"Last seen "+Math.floor(diff/60_000)+" min ago";if(diff<86_400_000)return"Last seen "+Math.floor(diff/3_600_000)+" hr ago";return"Last seen "+new Date(value).toLocaleString();}

function CallMessage({log,me,onReturn}:{log:CallLog;me:string;onReturn:(kind:"audio"|"video")=>void}){
 const title=log.status==="missed"?"Missed call":log.status==="outgoing_missed"?"No answer":log.status==="rejected"?"Call declined":"Call";
 const label=log.kind==="video"?"Video call":"Voice call";
 return <div className="flex min-w-[230px] items-center gap-3 rounded-2xl bg-black/10 p-2"><div className="text-xl">{log.kind==="video"?"📹":"📞"}</div><div className="min-w-0 flex-1"><p className="font-bold">{title}</p><p className="text-[11px] opacity-75">{label}{log.duration?" · "+Math.floor(log.duration/60)+":"+String(log.duration%60).padStart(2,"0"):""}</p></div>{log.status!=="completed"&&<button type="button" className="rounded-full bg-background px-3 py-1.5 text-xs font-bold text-foreground" onClick={()=>onReturn(log.kind)}>↩ Return call</button>}</div>;
}

export default function IdeasMessages({me,initialTarget}:{me:string;initialTarget?:MsgProfile|null}){
 const[target,setTarget]=useState<MsgProfile|null>(initialTarget||null);
 const[myName,setMyName]=useState("ANVYA Member"); const[myPresence,setMyPresence]=useState<string|null>(null);
 const[search,setSearch]=useState("");const[results,setResults]=useState<MsgProfile[]>([]);const[inbox,setInbox]=useState<InboxItem[]>([]);
 const[messages,setMessages]=useState<Msg[]>([]);const[text,setText]=useState("");const[editingId,setEditingId]=useState<string|null>(null);const[loading,setLoading]=useState(false);const[sending,setSending]=useState(false);
 const[presence,setPresence]=useState<{online:boolean;last_seen_at:string}|null>(null);const[inboxLoading,setInboxLoading]=useState(true);const[messageView,setMessageView]=useState<"all"|"unread"|"drafts"|"requests">("all");const[requestCount,setRequestCount]=useState(0);const[draftCount,setDraftCount]=useState(0); const[callType,setCallType]=useState<"audio"|"video"|null>(null);const[callState,setCallState]=useState<"idle"|"calling"|"incoming"|"connected">("idle");const[callerName,setCallerName]=useState("");const[callerType,setCallerType]=useState<"audio"|"video">("audio"); const[callError,setCallError]=useState(""); const[ringing,setRinging]=useState(false); const[notificationReady,setNotificationReady]=useState(typeof Notification!=="undefined"&&Notification.permission==="granted"); const[ringAudio,setRingAudio]=useState(false); const localVideoRef=useRef<HTMLVideoElement|null>(null),remoteVideoRef=useRef<HTMLVideoElement|null>(null),pcRef=useRef<RTCPeerConnection|null>(null),streamRef=useRef<MediaStream|null>(null),callChannelRef=useRef<any>(null),userCallChannelRef=useRef<any>(null),outgoingNotifyChannelRef=useRef<any>(null),ringTimerRef=useRef<any>(null),callStateRef=useRef<"idle"|"calling"|"incoming"|"connected">("idle"),pendingOfferRef=useRef<any>(null),pendingIceRef=useRef<any[]>([]),callStartedAtRef=useRef<number|null>(null),callLogSentRef=useRef(false),incomingTimerRef=useRef<any>(null);
 useEffect(()=>{setTarget(initialTarget||null)},[initialTarget?.user_id]);

 const enableCallNotifications=async()=>{
  if(typeof Notification==="undefined"){toast.error("This browser does not support call notifications.");return false;}
  if(Notification.permission==="granted"){setNotificationReady(true);return true;}
  if(Notification.permission==="denied"){toast.error("Call notifications are blocked. Allow notifications in your browser site settings.");return false;}
  const permission=await Notification.requestPermission();
  const ok=permission==="granted";setNotificationReady(ok);
  if(ok)toast.success("Call notifications enabled.");
  return ok;
 };
 const showCallNotification=(payload:any)=>{
  if(typeof Notification==="undefined"||Notification.permission!=="granted")return;
  const kind=payload?.kind==="video"?"📹 Video call":"📞 Incoming call";
  const n=new Notification(kind+" · "+(payload?.name||"ANVYA Member"),{
   body:"Tap to open the incoming call.",
   tag:"anvya-incoming-call-"+payload?.from,
   renotify:true,
   requireInteraction:true,
   silent:false
  });
  n.onclick=()=>{window.focus();n.close();};
  window.setTimeout(()=>{try{n.close()}catch{}},30000);
 };



 useEffect(()=>{
  if(!me)return;
  const channel=supabase.channel("anvya-user-calls-"+me);
  userCallChannelRef.current=channel;
  channel.on("broadcast",{event:"call_offer"},({payload}:any)=>{
   if(payload?.to!==me||payload?.from===me)return;
   pendingOfferRef.current=payload;
   setTarget({user_id:payload.from,display_name:payload.name||"ANVYA Member",avatar_url:payload.avatar_url||null,public_id:payload.public_id||null});
   setCallerName(payload.name||"ANVYA Member");setCallerType(payload.kind==="video"?"video":"audio");setCallType(payload.kind==="video"?"video":"audio");callLogSentRef.current=false;callStartedAtRef.current=null;callStateRef.current="incoming";setCallState("incoming");setRinging(true);setRingAudio(true);playRingtone();
   if(incomingTimerRef.current)clearTimeout(incomingTimerRef.current);
   incomingTimerRef.current=window.setTimeout(async()=>{if(callStateRef.current==="incoming"&&pendingOfferRef.current?.from===payload.from){await sendCallLog(payload.from,{kind:payload.kind==="video"?"video":"audio",status:"missed",caller_id:payload.from,receiver_id:me});await userCallChannelRef.current?.send({type:"broadcast",event:"call_missed",payload:{from:me,to:payload.from,name:myName,kind:payload.kind}});
     await userCallChannelRef.current?.send({type:"broadcast",event:"call_end",payload:{from:me,to:payload.from,reason:"missed"}});
     pendingOfferRef.current=null;void closeCall(false);}},25000);
   showCallNotification(payload);
  }).on("broadcast",{event:"call_end"},({payload}:any)=>{
   if(payload?.to===me){setRinging(false);void closeCall(false);}
  }).subscribe();
  return()=>{if(userCallChannelRef.current===channel)userCallChannelRef.current=null;void supabase.removeChannel(channel);};
 },[me]);



 const playRingtone=()=>{
  try{
   const AudioCtx=(window.AudioContext||((window as any).webkitAudioContext));
   if(!AudioCtx)return;
   const ctx=new AudioCtx();const gain=ctx.createGain();gain.connect(ctx.destination);
   gain.gain.value=0.0001;const osc=ctx.createOscillator();osc.type="sine";osc.frequency.value=880;osc.connect(gain);osc.start();
   const started=Date.now();const timer=window.setInterval(()=>{
    const elapsed=Date.now()-started;
    if(elapsed>25000){clearInterval(timer);osc.stop();void ctx.close();return;}
    const on=((elapsed%1800)<450);
    gain.gain.setTargetAtTime(on?0.12:0.0001,ctx.currentTime,0.03);
   },100);
   ringTimerRef.current=timer;
  }catch{}
 };
 const stopRingtone=()=>{
  if(ringTimerRef.current){clearInterval(ringTimerRef.current);ringTimerRef.current=null;}
  setRinging(false);setRingAudio(false);
 };
 const sendCallLog=async(targetId:string,log:CallLog)=>{if(!targetId)return;await supabase.from("idea_messages").insert({sender_id:me,receiver_id:targetId,message:CALL_PREFIX+JSON.stringify(log)});void loadInbox();};
 const callDuration=()=>callStartedAtRef.current?Math.max(1,Math.round((Date.now()-callStartedAtRef.current)/1000)):0;
 const closeCall=async(notify=true)=>{
  if(incomingTimerRef.current){clearTimeout(incomingTimerRef.current);incomingTimerRef.current=null;}
  if(notify&&target){await outgoingNotifyChannelRef.current?.send({type:"broadcast",event:"call_end",payload:{from:me,to:target.user_id,reason:callStateRef.current==="incoming"?"rejected":"ended"}});await callChannelRef.current?.send({type:"broadcast",event:"call_end",payload:{from:me,to:target.user_id,reason:callStateRef.current==="incoming"?"rejected":"ended"}});}
  if(notify&&target&&callStateRef.current==="connected"&&!callLogSentRef.current){await sendCallLog(target.user_id,{kind:callType||"audio",status:"completed",caller_id:me,receiver_id:target.user_id,duration:callDuration()});callLogSentRef.current=true;}
  streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;
  pcRef.current?.close();pcRef.current=null;pendingOfferRef.current=null;pendingIceRef.current=[];
  if(localVideoRef.current)localVideoRef.current.srcObject=null;if(remoteVideoRef.current)remoteVideoRef.current.srcObject=null;
  setCallType(null);callStateRef.current="idle";setCallState("idle");setCallerName("");setCallError("");stopRingtone();
 };

 const setupPeer=async(kind:"audio"|"video")=>{
  const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:kind==="video"});
  streamRef.current=stream;
  if(localVideoRef.current){localVideoRef.current.srcObject=stream;void localVideoRef.current.play().catch(()=>{});}
  const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
  pcRef.current=pc;
  stream.getTracks().forEach(t=>pc.addTrack(t,stream));
  pc.ontrack=e=>{if(remoteVideoRef.current){remoteVideoRef.current.srcObject=e.streams[0];void remoteVideoRef.current.play().catch(()=>{});}};
  pc.onicecandidate=e=>{if(e.candidate&&callChannelRef.current&&target)void callChannelRef.current.send({type:"broadcast",event:"call_ice",payload:{from:me,to:target.user_id,candidate:e.candidate}});};
  return pc;
 };

 useEffect(()=>{
  if(!me||!target||target.user_id===me)return;
  const room="anvya-call-"+[me,target.user_id].sort().join("-");
  const channel=supabase.channel(room);
  callChannelRef.current=channel;
  channel.on("broadcast",{event:"call_offer"},async({payload}:any)=>{
   if(payload?.to!==me)return;
   pendingOfferRef.current=payload;
   setCallerName(payload.name||target.display_name);setCallerType(payload.kind==="video"?"video":"audio");setCallState("incoming");
  }).on("broadcast",{event:"call_answer"},async({payload}:any)=>{
   if(payload?.to!==me||!pcRef.current)return;
   await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
   callStateRef.current="connected";stopRingtone();setCallState("connected");
  }).on("broadcast",{event:"call_ice"},async({payload}:any)=>{
   if(payload?.to!==me||!payload?.candidate)return;
   if(pcRef.current?.remoteDescription)await pcRef.current.addIceCandidate(payload.candidate).catch(()=>{});
   else pendingIceRef.current.push(payload.candidate);
  }).on("broadcast",{event:"call_end"},async({payload}:any)=>{
   if(payload?.to!==me)return;
   if(callStateRef.current==="calling"&&target){await sendCallLog(target.user_id,{kind:callType||"audio",status:payload?.reason==="rejected"?"rejected":"outgoing_missed",caller_id:me,receiver_id:target.user_id});}
   void closeCall(false);
  }).on("broadcast",{event:"call_missed"},({payload}:any)=>{if(payload?.to===me)toast.info("Missed call from "+(payload.name||"ANVYA Member"));}).subscribe();
  return()=>{if(callChannelRef.current===channel)callChannelRef.current=null;void supabase.removeChannel(channel);};
 },[me,target?.user_id]);

 const startCall=async(kind:"audio"|"video")=>{
  if(!target||target.user_id===me)return;
  if(!navigator.mediaDevices?.getUserMedia){toast.error("Calling is not supported by this browser.");return;}
  try{
   setCallError("");setCallType(kind);callStateRef.current="calling";callLogSentRef.current=false;callStartedAtRef.current=null;setCallState("calling");setRinging(true);
   const pc=await setupPeer(kind);
   const offer=await pc.createOffer();await pc.setLocalDescription(offer);
   const sendOffer=()=>void userCallChannelRef.current?.send({type:"broadcast",event:"call_offer",payload:{from:me,to:target.user_id,name:myName,avatar_url:null,public_id:null,kind,offer}});
   await sendOffer();
   if(ringTimerRef.current)clearInterval(ringTimerRef.current);
   ringTimerRef.current=window.setInterval(()=>{if(callStateRef.current==="calling")void sendOffer();},1800);
  }catch(e:any){setCallError(e?.message||"Camera/microphone permission is required.");setCallState("idle");streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;pcRef.current?.close();pcRef.current=null;}
 };

 const acceptCall=async()=>{
  const pending=pendingOfferRef.current;if(!pending||!target)return;
  try{
   setCallError("");setCallType(pending.kind==="video"?"video":"audio");callStateRef.current="connected";callStartedAtRef.current=Date.now();callLogSentRef.current=false;stopRingtone();if(incomingTimerRef.current)clearTimeout(incomingTimerRef.current);setCallState("connected");
   const pc=await setupPeer(pending.kind==="video"?"video":"audio");
   await pc.setRemoteDescription(new RTCSessionDescription(pending.offer));
   for(const candidate of pendingIceRef.current.splice(0))await pc.addIceCandidate(candidate).catch(()=>{});
   const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
   await callChannelRef.current?.send({type:"broadcast",event:"call_answer",payload:{from:me,to:target.user_id,answer}});
   pendingOfferRef.current=null;
  }catch(e:any){setCallError(e?.message||"Could not accept the call.");void closeCall(false);}
 };

 const rejectCall=async()=>{if(target&&callStateRef.current==="incoming"){await sendCallLog(target.user_id,{kind:callType||"audio",status:"rejected",caller_id:target.user_id,receiver_id:me});}await closeCall(true)};
 useEffect(()=>{(async()=>{const{data}=await supabase.from("idea_profiles").select("display_name").eq("user_id",me).maybeSingle();if(data?.display_name)setMyName(data.display_name);const{data:p}=await supabase.from("idea_presence").select("last_seen_at").eq("user_id",me).maybeSingle();if(p?.last_seen_at)setMyPresence(p.last_seen_at)})()},[me]);

 const loadInbox=async()=>{if(!me)return;setInboxLoading(true);const{data,error}=await supabase.from("idea_messages").select("id,sender_id,receiver_id,message,created_at,read_at").or("sender_id.eq."+me+",receiver_id.eq."+me).order("created_at",{ascending:false}).limit(300);if(error){console.error(error);setInbox([]);setInboxLoading(false);return;}const rows=(data||[])as Msg[],latest=new Map<string,InboxItem>();rows.forEach(m=>{const other=m.sender_id===me?m.receiver_id:m.sender_id;if(!other||latest.has(other))return;latest.set(other,{user_id:other,display_name:"Ideas Member",avatar_url:null,public_id:null,last_message:m.message,last_message_at:m.created_at,unread:0,last_seen_at:null});});const ids=[...latest.keys()];if(ids.length){const{data:profiles}=await supabase.from("idea_profiles").select("user_id,display_name,avatar_url,public_id").in("user_id",ids);(profiles||[]).forEach((p:any)=>{const x=latest.get(p.user_id);if(x)Object.assign(x,{display_name:p.display_name||"Ideas Member",avatar_url:p.avatar_url||null,public_id:p.public_id||null})});const{data:presenceRows}=await supabase.from("idea_presence").select("user_id,last_seen_at,online").in("user_id",ids);(presenceRows||[]).forEach((p:any)=>{const x=latest.get(p.user_id);if(x)x.last_seen_at=p.last_seen_at||null});for(const id of ids){const x=latest.get(id);if(x)x.unread=rows.filter(m=>m.sender_id===id&&m.receiver_id===me&&!m.read_at).length;}}setInbox([...latest.values()].sort((a,b)=>new Date(b.last_message_at).getTime()-new Date(a.last_message_at).getTime()));setInboxLoading(false);};

 useEffect(()=>{void loadInbox();const loadDashboardCounts=async()=>{const{count}=await supabase.from("idea_friendships").select("*",{count:"exact",head:true}).eq("addressee_id",me).eq("status","pending");setRequestCount(count||0);try{const raw=localStorage.getItem("anvya-message-drafts-"+me);setDraftCount(raw?JSON.parse(raw).length:0)}catch{setDraftCount(0)}};void loadDashboardCounts();const heartbeat=async()=>{const now=new Date().toISOString();await supabase.from("idea_presence").upsert({user_id:me,online:true,last_seen_at:now,updated_at:now});};void heartbeat();const timer=window.setInterval(()=>{void heartbeat();void loadInbox();void loadDashboardCounts()},30_000);const offline=()=>{void supabase.from("idea_presence").update({online:false,last_seen_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("user_id",me)};const vis=()=>{if(document.visibilityState==="visible")void heartbeat();else offline()};window.addEventListener("beforeunload",offline);document.addEventListener("visibilitychange",vis);return()=>{window.clearInterval(timer);window.removeEventListener("beforeunload",offline);document.removeEventListener("visibilitychange",vis);offline();}},[me]);

 useEffect(()=>{if(!target?.user_id||target.user_id===me){setMessages([]);setPresence(null);return;}let cancelled=false;const load=async()=>{setLoading(true);const[m,p]=await Promise.all([supabase.from("idea_messages").select("id,sender_id,receiver_id,message,created_at,read_at").or("and(sender_id.eq."+me+",receiver_id.eq."+target.user_id+"),and(sender_id.eq."+target.user_id+",receiver_id.eq."+me+")").order("created_at",{ascending:true}),supabase.from("idea_presence").select("online,last_seen_at").eq("user_id",target.user_id).maybeSingle()]);if(!cancelled){setMessages((m.data||[])as Msg[]);setPresence((p.data as any)||null);setLoading(false);const unread=(m.data||[]).filter((x:any)=>x.receiver_id===me&&!x.read_at).map((x:any)=>x.id);if(unread.length)await supabase.from("idea_messages").update({read_at:new Date().toISOString()}).in("id",unread);void loadInbox();}};void load();const channel=supabase.channel("ideas-chat-"+[me,target.user_id].sort().join("-")).on("postgres_changes",{event:"*",schema:"public",table:"idea_messages"},()=>{void load()}).on("postgres_changes",{event:"*",schema:"public",table:"idea_presence",filter:"user_id=eq."+target.user_id},(payload:any)=>setPresence(payload.new as any)).subscribe();const refresh=window.setInterval(()=>void load(),30_000);return()=>{cancelled=true;window.clearInterval(refresh);void supabase.removeChannel(channel)};},[me,target?.user_id]);

 useEffect(()=>{const q=search.trim();if(!q){setResults([]);return;}let cancelled=false;const t=window.setTimeout(async()=>{const{data,error}=await supabase.rpc("search_ideas_directory",{p_query:q});if(!cancelled){if(error){console.error("Ideas directory search failed:",error);setResults([]);}else setResults(((data||[])as any[]).filter(r=>r.user_id!==me).map(r=>({user_id:r.user_id,display_name:r.display_name||"Ideas Member",avatar_url:r.avatar_url||null,public_id:r.public_id||null})));}},250);return()=>{cancelled=true;window.clearTimeout(t)};},[search,me]);
 const selectTarget=(r:MsgProfile)=>{setTarget(r);setSearch("");setResults([])};
 const send=async()=>{
  if(!target||target.user_id===me)return;const body=text.trim();if(!body)return;setSending(true);
  if(editingId){
   const{error}=await supabase.from("idea_messages").update({message:body}).eq("id",editingId).eq("sender_id",me);
   if(error)toast.error(error.message);else{setMessages(v=>v.map(x=>x.id===editingId?{...x,message:body}:x));setText("");setEditingId(null);toast.success("Message edited.");}
  }else{
   const{data,error}=await supabase.from("idea_messages").insert({sender_id:me,receiver_id:target.user_id,message:body}).select("id,sender_id,receiver_id,message,created_at,read_at").single();
   if(error)toast.error(error.message);else{setMessages(v=>[...v,data as Msg]);setText("");void loadInbox();}
  }
  setSending(false);
 };
 const parseCallLog=(message:string):CallLog|null=>{if(!message.startsWith(CALL_PREFIX))return null;try{return JSON.parse(message.slice(CALL_PREFIX.length)) as CallLog}catch{return null;}}; const editMessage=(m:Msg)=>{if(m.sender_id!==me||m.message==="[This message was unsent]"||parseCallLog(m.message))return;setEditingId(m.id);setText(m.message);};
 const unsendMessage=async(m:Msg)=>{
  if(m.sender_id!==me||m.message==="[This message was unsent]")return;
  const{error}=await supabase.from("idea_messages").update({message:"[This message was unsent]"}).eq("id",m.id).eq("sender_id",me);
  if(error)toast.error(error.message);else{setMessages(v=>v.map(x=>x.id===m.id?{...x,message:"[This message was unsent]"}:x));toast.success("Message unsent.");}
 };
 const online=isOnline(presence?.last_seen_at),unreadTotal=useMemo(()=>inbox.reduce((n,x)=>n+x.unread,0),[inbox]);

 return <Card className="mt-4 overflow-hidden rounded-[28px] border bg-background shadow-lg"><CardContent className="p-0"><div className="grid min-h-[680px] md:grid-cols-[340px_1fr]">
  <aside className={`border-b md:border-b-0 md:border-r ${target?"hidden md:block":"block"}`}><div className="sticky top-0 bg-background/95 p-4 backdrop-blur"><div className="flex items-center gap-3"><div className="relative grid size-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-blue-500 text-white"><MessageCircle className="size-5"/><span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-background ${isOnline(myPresence)?"bg-green-500":"bg-muted-foreground"}`}/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h3 className="font-black">Messages</h3><span className={`size-2 rounded-full ${isOnline(myPresence)?"bg-green-500":"bg-muted-foreground"}`}/></div><p className="text-[11px] font-semibold text-foreground truncate">{myName}</p><p className="text-[10px] text-muted-foreground">{isOnline(myPresence)?"Active now":"Not active"} · Direct conversations</p></div>{unreadTotal>0&&<Badge className="rounded-full">{unreadTotal}</Badge>}<Button size="icon" variant="ghost" className="rounded-full" title={notificationReady?"Call notifications enabled":"Enable call notifications"} onClick={()=>void enableCallNotifications()}><Bell className={`size-4 ${notificationReady?"text-emerald-500":"text-muted-foreground"}`}/></Button></div>
   <div className="relative mt-4"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground"/><Input className="h-9 rounded-full border-0 bg-muted pl-9 text-sm" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search"/></div>
   {results.length>0&&<div className="absolute z-30 mt-1 w-[calc(100%-2rem)] max-w-[288px] rounded-2xl border bg-background p-2 shadow-xl">{results.map(r=><button key={r.user_id} onClick={()=>selectTarget(r)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-muted"><div className="size-10 shrink-0 overflow-hidden rounded-full bg-muted">{r.avatar_url?<img src={r.avatar_url} className="size-full object-cover" alt={r.display_name}/>:<UserCircle2 className="size-full p-2 text-muted-foreground"/>}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{r.display_name}</p><p className="text-[11px] text-muted-foreground">{r.public_id||"ANVYA member"}</p></div></button>)}</div>}</div>
   <div className="border-b px-3 py-2"><div className="grid grid-cols-4 gap-1"><button onClick={()=>setMessageView("all")} className={`rounded-xl px-2 py-2 text-[11px] font-bold ${messageView==="all"?"bg-primary text-primary-foreground":"hover:bg-muted"}`}><Inbox className="mx-auto mb-1 size-4"/><span>All</span></button><button onClick={()=>setMessageView("unread")} className={`rounded-xl px-2 py-2 text-[11px] font-bold ${messageView==="unread"?"bg-primary text-primary-foreground":"hover:bg-muted"}`}><MessageCircle className="mx-auto mb-1 size-4"/><span>Unread{unreadTotal>0?" ("+unreadTotal+")":""}</span></button><button onClick={()=>setMessageView("drafts")} className={`rounded-xl px-2 py-2 text-[11px] font-bold ${messageView==="drafts"?"bg-primary text-primary-foreground":"hover:bg-muted"}`}><FileEdit className="mx-auto mb-1 size-4"/><span>Drafts{draftCount>0?" ("+draftCount+")":""}</span></button><button onClick={()=>setMessageView("requests")} className={`rounded-xl px-2 py-2 text-[11px] font-bold ${messageView==="requests"?"bg-primary text-primary-foreground":"hover:bg-muted"}`}><UserPlus className="mx-auto mb-1 size-4"/><span>Requests{requestCount>0?" ("+requestCount+")":""}</span></button></div></div><div className="max-h-[500px] overflow-y-auto px-2 pb-3">{inboxLoading&&<p className="py-8 text-center text-xs text-muted-foreground">Loading chats…</p>}{!inboxLoading&&inbox.filter(x=>messageView==="unread"?x.unread>0:true).length===0&&<div className="px-5 py-12 text-center"><MessageCircle className="mx-auto size-8 text-muted-foreground"/><p className="mt-3 text-sm font-semibold">{messageView==="unread"?"No unread messages":"No messages yet"}</p><p className="mt-1 text-xs text-muted-foreground">Search a member to start chatting.</p></div>}{inbox.filter(x=>messageView==="unread"?x.unread>0:true).map(x=><button key={x.user_id} onClick={()=>selectTarget({user_id:x.user_id,display_name:x.display_name,avatar_url:x.avatar_url,public_id:x.public_id})} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${target?.user_id===x.user_id?"bg-muted":"hover:bg-muted/70"}`}><div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">{x.avatar_url?<img src={x.avatar_url} className="size-full object-cover" alt={x.display_name}/>:<UserCircle2 className="size-full p-2 text-muted-foreground"/>}<span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-background ${isOnline(x.last_seen_at)?"bg-green-500":"bg-muted-foreground"}`}/></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-bold">{x.display_name}</p>{x.unread>0&&<span className="size-2 rounded-full bg-blue-600"/>}</div><div className="flex items-center gap-2 text-[11px]"><span className={isOnline(x.last_seen_at)?"font-semibold text-green-600":"text-muted-foreground"}>{isOnline(x.last_seen_at)?"Active now":"Not active"}</span><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{formatMessageTime(x.last_message_at)}</span></div></div><div className="shrink-0 text-[10px] text-muted-foreground">{formatDayLabel(x.last_message_at)}</div></button>)}</div>
  </aside>
  <section className={target?"flex min-h-[620px] flex-col":"hidden md:flex md:items-center md:justify-center"}>{!target?<div className="max-w-sm px-8 text-center"><div className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-violet-600/15 to-blue-600/15"><MessageCircle className="size-9 text-primary"/></div><h3 className="mt-5 text-xl font-black">Your messages</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Select a conversation or search for an ANVYA member to send a direct message.</p></div>:
   <><div className="flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur"><Button size="icon" variant="ghost" className="md:hidden rounded-full" onClick={()=>setTarget(null)}><ArrowLeft className="size-5"/></Button><div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">{target.avatar_url?<img src={target.avatar_url} className="size-full object-cover" alt={target.display_name}/>:<UserCircle2 className="size-full p-2 text-muted-foreground"/>}<span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-background ${online?"bg-green-500":"bg-muted-foreground"}`}/></div><div className="min-w-0 flex-1"><p className="truncate font-bold">{target.display_name}</p><p className="text-[11px] text-muted-foreground">{target.public_id||"ANVYA member"} · {online?"Active now":formatLastSeen(presence?.last_seen_at)}</p></div><div className="flex items-center gap-2 text-xs font-semibold text-emerald-600"><span className="size-2 animate-pulse rounded-full bg-emerald-500"/>{callState==="incoming"?"Ringing…":callState==="calling"?"Calling…":""}</div><div className="ml-auto flex items-center gap-1"><Button size="icon" variant="ghost" className="rounded-full" title="Audio call" onClick={()=>void startCall("audio")} disabled={callState!=="idle"}><Phone className="size-4"/></Button><Button size="icon" variant="ghost" className="rounded-full" title="Video call" onClick={()=>void startCall("video")} disabled={callState!=="idle"}><Video className="size-4"/></Button><Button size="icon" variant="ghost" className="rounded-full" title="More"><MoreHorizontal className="size-4"/></Button></div></div>
    {(callState!=="idle"||callError)&&<div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4">
    <Card className="w-full max-w-lg overflow-hidden rounded-3xl border-0 shadow-2xl">
     <CardContent className="p-0">
      {callState==="incoming"?<div className="p-7 text-center"><div className="mb-3 flex items-center justify-center gap-2 text-sm font-black text-emerald-600"><span className="size-3 animate-ping rounded-full bg-emerald-500"/><span>INCOMING CALL — RINGING</span></div><div className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-primary/10"><Phone className="size-9 text-primary"/></div><p className="text-xl font-black">{callerName||target?.display_name} is calling</p><p className="mt-1 text-sm text-muted-foreground">{callerType==="video"?"Video call":"Audio call"}</p><div className="mt-6 flex justify-center gap-3"><Button variant="outline" className="rounded-full" onClick={()=>void rejectCall()}>Decline</Button><Button className="rounded-full" onClick={()=>void acceptCall()}><Phone className="mr-2 size-4"/>Accept</Button></div></div>:<div className="relative bg-slate-950 p-3">
       {callType==="video"?<><video ref={remoteVideoRef} autoPlay playsInline className="aspect-video w-full rounded-2xl bg-black object-cover"/><video ref={localVideoRef} autoPlay playsInline muted className="absolute right-6 top-6 h-28 w-40 rounded-xl border-2 border-white/70 bg-black object-cover"/></>:<div className="grid min-h-64 place-items-center text-center text-white"><div><div className="mx-auto grid size-20 place-items-center rounded-full bg-white/10"><Phone className="size-8"/></div><p className="mt-4 font-bold">{callState==="calling"?"Calling":"Connected"}</p><p className="text-sm text-white/70">{target?.display_name}</p></div></div>}
       {callError&&<p className="mt-2 rounded-xl bg-red-500/20 p-2 text-xs text-red-200">{callError}</p>}
       <div className="flex justify-center py-3"><Button variant="destructive" className="rounded-full" onClick={()=>void closeCall(true)}>End call</Button></div>
      </div>}
     </CardContent>
    </Card>
   </div>}
   <div className="flex-1 space-y-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.06),transparent_45%)] px-3 py-5 sm:px-7">{loading&&<p className="text-xs text-muted-foreground">Loading conversation…</p>}{!loading&&messages.length===0&&<div className="py-20 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-muted"><MessageCircle className="size-7 text-muted-foreground"/></div><p className="mt-3 text-sm font-semibold">Say hello 👋</p><p className="text-xs text-muted-foreground">Start the conversation with {target.display_name}.</p></div>}
     {messages.map((m,i)=>{const showDay=i===0||formatDayLabel(messages[i-1].created_at)!==formatDayLabel(m.created_at);return <div key={m.id}>{showDay&&<div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-border"/><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{formatDayLabel(m.created_at)}</span><div className="h-px flex-1 bg-border"/></div>}<div className={`mb-1 flex items-end gap-2 ${m.sender_id===me?"justify-end":"justify-start"}`}>{m.sender_id!==me&&<div className="size-7 shrink-0 overflow-hidden rounded-full bg-muted"><UserCircle2 className="size-full p-1 text-muted-foreground"/></div>}<div className={`group relative max-w-[78%] px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[65%] ${m.sender_id===me?"rounded-[22px] rounded-br-md bg-gradient-to-r from-violet-600 to-blue-600 text-white":"rounded-[22px] rounded-bl-md border bg-card"}`}><p className="whitespace-pre-wrap break-words leading-5">{parseCallLog(m.message)?<CallMessage log={parseCallLog(m.message)!} me={me} onReturn={(kind)=>{if(target)void startCall(kind)}}/>:m.message==="[This message was unsent]"?<span className="italic opacity-70">This message was unsent</span>:m.message}</p><div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${m.sender_id===me?"text-white/70":"text-muted-foreground"}`}><span>{formatMessageTime(m.created_at)}</span>{m.sender_id===me&&<span>{m.read_at?"✓✓":"✓"}</span>}</div>{m.sender_id===me&&m.message!=="[This message was unsent]"&&!parseCallLog(m.message)&&<div className="absolute -top-8 right-0 hidden items-center gap-1 rounded-full border bg-background p-1 text-foreground shadow-md group-hover:flex"><button type="button" className="rounded-full px-2 py-1 text-[11px] font-semibold hover:bg-muted" onClick={()=>editMessage(m)}>Edit</button><button type="button" className="rounded-full px-2 py-1 text-[11px] font-semibold text-destructive hover:bg-muted" onClick={()=>void unsendMessage(m)}>Unsend</button></div>}</div></div></div>})}
    </div>
    <div className="border-t bg-background/95 p-3 backdrop-blur sm:p-4"><div className="flex items-center gap-2 rounded-full border bg-muted/40 p-1.5 shadow-sm"><Input className="h-9 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send()}}} placeholder={`Message ${target.display_name}…`} maxLength={5000}/><Button size="icon" className="size-9 shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-blue-600" onClick={()=>void send()} disabled={sending||!text.trim()}><Send className="size-4"/></Button></div><p className="mt-1 px-3 text-[10px] text-muted-foreground">Press Enter to send</p></div></>}
  </section>
 </div></CardContent></Card>;
}