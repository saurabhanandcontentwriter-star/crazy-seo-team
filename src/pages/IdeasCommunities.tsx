import {useEffect,useState} from "react";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Card,CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import {Users,Plus,Globe2,LogIn} from "lucide-react";

export default function IdeasCommunities(){
 const [user,setUser]=useState<any>(null),[items,setItems]=useState<any[]>([]),[open,setOpen]=useState(false),[name,setName]=useState(""),[description,setDescription]=useState("");
 const load=async()=>{const {data:{user}}=await supabase.auth.getUser();setUser(user);const {data}=await supabase.from("idea_communities").select("*").eq("visibility","public").order("created_at",{ascending:false});setItems(data||[])};
 useEffect(()=>{load()},[]);
 const create=async()=>{if(!user)return toast.error("Please sign in first.");const slug=name.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")+"-"+Math.random().toString(36).slice(2,7);const {data,error}=await supabase.from("idea_communities").insert({owner_id:user.id,name:name.trim(),description:description.trim(),slug,visibility:"public"}).select().single();if(error)toast.error(error.message);else{await supabase.from("idea_community_members").insert({community_id:data.id,user_id:user.id,role:"owner"});toast.success("Community created.");setName("");setDescription("");setOpen(false);load()}};
 const join=async(id:string)=>{if(!user)return toast.error("Please sign in first.");const {error}=await supabase.from("idea_community_members").insert({community_id:id,user_id:user.id,role:"member"});if(error)toast.error(error.message);else toast.success("Joined community.")};
 return <div className="min-h-screen bg-background"><div className="container mx-auto max-w-5xl px-4 py-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-black">🌍 Ideas Communities</h1><p className="text-muted-foreground">Create public communities, build leadership, and share ideas worldwide.</p></div><Button onClick={()=>user?setOpen(!open):toast.error("Please sign in first.")}>{user?<><Plus className="mr-2 size-4"/>Create Community</>:<><LogIn className="mr-2 size-4"/>Sign in</>}</Button></div>
 {open&&<Card className="mb-6"><CardContent className="grid gap-4 p-6"><Input placeholder="Community name" value={name} onChange={e=>setName(e.target.value)}/><Textarea placeholder="What is this community about?" value={description} onChange={e=>setDescription(e.target.value)}/><Button onClick={create} disabled={!name.trim()}>Create Public Community</Button></CardContent></Card>}
 <div className="grid gap-4 md:grid-cols-2">{items.map(c=><Card key={c.id}><CardContent className="p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{c.name}</h2><p className="mt-2 text-sm text-muted-foreground">{c.description||"Community for ideas and discussion."}</p></div><Badge><Globe2 className="mr-1 size-3"/>Public</Badge></div><div className="mt-5 flex justify-between"><span className="text-xs text-muted-foreground">/{c.slug}</span><Button size="sm" variant="outline" onClick={()=>join(c.id)}><Users className="mr-2 size-4"/>Join</Button></div></CardContent></Card>)}</div>
 {!items.length&&<Card><CardContent className="p-10 text-center text-muted-foreground">No public communities yet. Create the first one.</CardContent></Card>}</div></div>
}