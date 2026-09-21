import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card,CardContent} from "@/components/ui/card";
import {Bot,ArrowLeft,Send,Loader2,UserCircle2,LifeBuoy} from "lucide-react";

type Msg={id?:string;sender_type:"customer"|"ai"|"admin";message:string;created_at?:string};
export default function IdeasHelp(){
 const [me,setMe]=useState<any>(null),[text,setText]=useState(""),[messages,setMessages]=useState<Msg[]>([]),[conversationId,setConversationId]=useState<string|null>(null),[busy,setBusy]=useState(false);
 const welcome="Hi! I’m the Crazy SEO Team Help Centre AI 👋\nI can help you with Ideas login, profile, profile links, posts, verification, communities and Crazy SEO Team services.\n\nAap apna question simple words mein pooch sakte hain — main step-by-step answer dunga.";
 const fallbackReply="Main aapki help karne ke liye yahan hoon. Apna issue simple words mein bataiye — main step-by-step solution dunga.";
 const sendWithRetry=async(body:any)=>{
  let lastError:any=null;
  for(let attempt=0;attempt<2;attempt++){
   try{
    const {data,error}=await supabase.functions.invoke("help-center-ai",{body});
    if(error) throw error;
    if(data?.error) throw new Error(data.error);
    return data;
   }catch(e){lastError=e; if(attempt===0) await new Promise(r=>setTimeout(r,700));}
  }
  throw lastError;
 };
 useEffect(()=>{supabase.auth.getUser().then(async({data})=>{setMe(data.user||null);const raw=sessionStorage.getItem("ideas_direct_profile");if(raw&&!data.user){try{setMe(JSON.parse(raw))}catch{}}})},[]);
 const send=async()=>{const message=text.trim();if(!message||busy)return;setBusy(true);setMessages(v=>[...v,{sender_type:"customer",message}]);setText("");
 try{
  const data=await sendWithRetry({action:"chat",message,conversation_id:conversationId,email:me?.email,public_id:me?.public_id});
  setConversationId(data.conversation_id||conversationId);
  setMessages(v=>[...v,{sender_type:"ai",message:String(data.reply||"I’m here to help.").replace(/\*\*/g,"").replace(/\*/g,"")}]);
 }catch(e:any){
  setMessages(v=>[...v,{sender_type:"ai",message:fallbackReply}]);
 }
 finally{setBusy(false)}
 };
 return <div className="min-h-screen bg-background"><div className="container mx-auto max-w-4xl px-4 py-8 md:py-12"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Link to="/ideas"><Button variant="ghost"><ArrowLeft className="mr-2 size-4"/>Ideas</Button></Link><Link to="/ideas/profile/me"><Button variant="outline"><UserCircle2 className="mr-2 size-4"/>My Profile</Button></Link></div><Card className="overflow-hidden rounded-[28px]"><div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 p-7 text-white"><div className="flex items-center gap-3"><div className="rounded-2xl bg-white/15 p-3"><LifeBuoy/></div><div><h1 className="text-2xl font-black">Help Centre</h1><p className="text-sm text-white/80">AI support for Ideas, profiles, posts, login, sharing and Crazy SEO Team services.</p></div></div></div><CardContent className="p-4 md:p-6"><div className="min-h-[420px] space-y-3 rounded-2xl border bg-muted/20 p-4">{messages.length===0&&<div className="grid min-h-[360px] place-items-center text-center"><div><Bot className="mx-auto size-12 text-primary"/><h2 className="mt-3 text-xl font-bold">Hi! I’m your Help Centre AI 👋</h2><p className="mt-2 max-w-md whitespace-pre-line text-sm text-muted-foreground">{welcome}</p><div className="mt-4 flex flex-wrap justify-center gap-2">{["How do I share my profile?","I cannot login","How do I create a post?","How does verification work?"].map(q=><Button key={q} size="sm" variant="outline" onClick={()=>setText(q)}>{q}</Button>)}</div></div></div>}{messages.map((m,i)=><div key={m.id||i} className={m.sender_type==="customer"?"flex justify-end":"flex justify-start"}><div className={m.sender_type==="customer"?"max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground":"max-w-[85%] rounded-2xl rounded-bl-md border bg-background px-4 py-3 text-sm"}><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase opacity-70">{m.sender_type==="customer"?"You":"AI Help Centre"}</div><p className="whitespace-pre-wrap leading-6">{m.message}</p></div></div>)}</div><div className="mt-4 flex gap-2"><Input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Type your support question..." disabled={busy}/><Button onClick={send} disabled={busy||!text.trim()}>{busy?<Loader2 className="size-4 animate-spin"/>:<Send className="size-4"/>}<span className="ml-2 hidden sm:inline">Send</span></Button></div><p className="mt-3 text-xs text-muted-foreground">AI answers are automated. Sensitive or unresolved issues can be escalated to a human support member.</p></CardContent></Card></div></div>;
}
