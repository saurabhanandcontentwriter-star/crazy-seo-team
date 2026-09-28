import {useEffect,useRef,useState} from "react";
import {Link,useNavigate,useParams} from "react-router-dom";
import {supabase} from "@/integrations/supabase/client";
import {slugify} from "@/lib/blog";
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
import {ArrowLeft,LogIn,LogOut,UserPlus,UserCheck,Users,FileText,Activity,HelpCircle,Save,ExternalLink,Loader2,UserCircle2,Camera,ShieldCheck,Upload,Clock3,Bookmark,FileEdit,BarChart3,Moon,Sun,Languages,Globe2,Settings2,MessageCircle,Quote,Facebook,Linkedin,Instagram,Twitter,Mail,Send,Home,Compass,Bell,Plus,Crown,Calendar,Link2,PawPrint,Trash2,Newspaper,Info,ChevronDown} from "lucide-react";

type Profile={experience?:any[];education_details?:any[];projects?:any[];certificates?:any[];medium_url?:string|null;user_id:string;display_name:string;working?:string|null;company?:string|null;education?:string|null;date_of_birth?:string|null;first_name?:string|null;middle_name?:string|null;last_name?:string|null;state?:string|null;country?:string|null;bio:string|null;avatar_url:string|null;cover_url:string|null;location:string|null;website_url:string|null;linkedin_url:string|null;github_url:string|null;instagram_url:string|null;twitter_url:string|null;medium_url?:string|null;public_id?:string|null;reputation_points?:number;level?:number;verified?:boolean;profile_slug?:string|null;is_creator?:boolean;creator_types?:string[]|null;creator_since?:string|null;creator_rules_accepted_at?:string|null};
type Post={id:string;user_id:string;profile_id?:string|null;display_name:string|null;profile_image_url:string|null;title:string;content:string;post_type:string;visibility:string;subject:string;image_url:string|null;created_at:string;status:string;slug?:string|null;tags?:string[]};

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
function ProfileAnvyaNews({posts}:{posts:Post[]}){
 const visiblePosts=posts.slice(0,5);
 const postUrl=(n:Post)=>{
  const existing=String(n.slug||"").trim();
  const fallback=slugify(String(n.title||n.content||"anvya-post").replace(/<[^>]*>/g," ").trim().slice(0,120))||"anvya-post";
  return "/anvya/"+encodeURIComponent(existing||fallback);
 };
 const metaDescription=(content:string)=>{
  const text=String(content||"").replace(/<[^>]*>/g," ").replace(/&nbsp;/gi," ").replace(/\s+/g," ").trim();
  return text.split(" ").filter(Boolean).slice(0,50).join(" ")+(text.split(" ").filter(Boolean).length>50?"…":"");
 };
 return <Card className="rounded-2xl border shadow-sm overflow-hidden">
  <CardContent className="p-0">
   <div className="flex items-center justify-between border-b px-5 py-4">
    <Link to="/anvya" className="flex items-center gap-2 hover:text-primary"><Newspaper className="size-4"/><h3 className="font-black">Anvya News</h3></Link>
    <Link to="/anvya" aria-label="Open ANVYA" className="rounded p-1 hover:bg-muted"><Info className="size-4 text-muted-foreground"/></Link>
   </div>
   <div className="px-5 pt-4 pb-1 text-sm font-bold">Top stories</div>
   <div className="px-5 pb-2">
    {visiblePosts.length?visiblePosts.map((n:Post)=><Link key={n.id} to={postUrl(n)} className="block border-b py-3 last:border-0 hover:bg-muted/40">
      <p className="line-clamp-2 text-[13px] font-semibold leading-5">{n.title||"ANVYA update"}</p>
      <p className="mt-1 line-clamp-4 text-[11px] leading-4 text-muted-foreground">{metaDescription(n.content)}</p>
    </Link>):<p className="py-4 text-xs text-muted-foreground">No posts yet.</p>}
   </div>
   <Link to="/anvya" className="flex items-center gap-1 border-t px-5 py-3 text-xs font-semibold hover:bg-muted/50">Show more posts <ChevronDown className="size-3.5"/></Link>
  </CardContent>
 </Card>;
}