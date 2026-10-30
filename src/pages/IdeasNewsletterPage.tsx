import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ArrowLeft, Users, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Newsletter = { id:string; name:string; slug:string; tagline:string; logo_url:string|null; cover_url:string|null; owner_user_id:string; created_at:string };
type Issue = { id:string; title:string; slug:string; content:string; seo_title:string|null; meta_description:string|null; published_at:string };

export default function IdeasNewsletterPage() {
  const { slug = "" } = useParams();
  const [newsletter,setNewsletter] = useState<Newsletter|null>(null);
  const [loading,setLoading] = useState(true);
  const [subscriberCount,setSubscriberCount] = useState(0);
  const [error,setError] = useState("");
  const [me,setMe] = useState<string|null>(null);
  const [issues,setIssues] = useState<Issue[]>([]);
  const [showEditor,setShowEditor] = useState(false);
  const [issueTitle,setIssueTitle] = useState("");
  const [issueContent,setIssueContent] = useState("");
  const [issueSeoTitle,setIssueSeoTitle] = useState("");
  const [issueDescription,setIssueDescription] = useState("");
  const [savingIssue,setSavingIssue] = useState(false);
  useEffect(() => {
    let alive=true;
    (async()=>{
      setLoading(true);setError("");
      const {data,error:queryError}=await (supabase as any).from("anvya_newsletters").select("*").eq("slug",slug).maybeSingle();
      if(!alive)return;
      if(queryError){setError("Newsletter database is not ready yet. Apply the ANVYA newsletter migration first.");setLoading(false);return;}
      if(!data){setNewsletter(null);setLoading(false);return;}
      setNewsletter(data as Newsletter);
      const [{count},issueResult,{data:{user}}]=await Promise.all([(supabase as any).from("anvya_newsletter_subscriptions").select("id",{count:"exact",head:true}).eq("newsletter_id",data.id),(supabase as any).from("anvya_newsletter_issues").select("id,title,slug,content,seo_title,meta_description,published_at").eq("newsletter_id",data.id).eq("status","published").order("published_at",{ascending:false}),supabase.auth.getUser()]);
      if(alive){setSubscriberCount(count||0);setIssues((issueResult.data||[]) as Issue[]);setMe(user?.id||null)}
      setLoading(false);
    })();
    return()=>{alive=false};
  },[slug]);
  return <main className="min-h-screen bg-background">
    <Helmet><title>{newsletter?newsletter.name+" | ANVYA Newsletter":"ANVYA Newsletter"}</title><meta name="description" content={newsletter?.tagline||"Discover newsletters and articles on ANVYA."}/><meta property="og:type" content="website"/>{newsletter&&<><meta property="og:title" content={newsletter.name}/><meta property="og:description" content={newsletter.tagline}/>{newsletter.cover_url&&<meta property="og:image" content={newsletter.cover_url}/>}</>}</Helmet>
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/anvya" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4"/> Back to ANVYA</Link>
      {loading?<div className="py-20 text-center text-muted-foreground">Loading newsletter…</div>:error?<div role="alert" className="mt-8 rounded-xl border p-5">{error}</div>:!newsletter?<div className="py-20 text-center"><BookOpen className="mx-auto size-10 text-muted-foreground"/><h1 className="mt-3 text-2xl font-bold">Newsletter not found</h1><p className="mt-2 text-muted-foreground">This newsletter may have been removed or the URL is incorrect.</p></div>:<>
        {newsletter.cover_url&&<img src={newsletter.cover_url} alt="" className="mt-6 h-48 w-full rounded-2xl object-cover sm:h-64"/>}
        <section className="mt-6 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {newsletter.logo_url?<img src={newsletter.logo_url} alt="" className="size-20 rounded-2xl border object-cover"/>:<div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10"><BookOpen className="size-8 text-primary"/></div>}
            <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-widest text-primary">ANVYA Newsletter</p><h1 className="mt-1 text-3xl font-black">{newsletter.name}</h1><p className="mt-2 text-muted-foreground">{newsletter.tagline}</p><p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground"><Users className="size-4"/>{subscriberCount} subscribers</p></div>
          </div>
        </section>
        <section className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Latest issues</h2>{me===newsletter.owner_user_id&&<Button onClick={()=>setShowEditor(v=>!v)}><BookOpen className="mr-2 size-4"/> {showEditor?"Close editor":"Write an Issue"}</Button>}</div>{showEditor&&me===newsletter.owner_user_id&&<div className="mt-4 space-y-3 rounded-2xl border bg-card p-5"><h3 className="font-bold">Publish to {newsletter.name}</h3><Input value={issueTitle} onChange={e=>setIssueTitle(e.target.value.slice(0,180))} placeholder="Issue/article title" maxLength={180}/><Input value={issueSeoTitle} onChange={e=>setIssueSeoTitle(e.target.value.slice(0,70))} placeholder="SEO title (optional)" maxLength={70}/><Textarea value={issueDescription} onChange={e=>setIssueDescription(e.target.value.slice(0,160))} placeholder="Meta description (optional)" maxLength={160} rows={2}/><Textarea value={issueContent} onChange={e=>setIssueContent(e.target.value)} placeholder="Write your newsletter issue here…" rows={10}/><Button disabled={savingIssue||!issueTitle.trim()||!issueContent.trim()} onClick={async()=>{setSavingIssue(true);try{const base=issueTitle.trim().toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90)||"issue";const slug=base+"-"+Date.now().toString(36);const {data,error:saveError}=await (supabase as any).from("anvya_newsletter_issues").insert({newsletter_id:newsletter.id,title:issueTitle.trim(),slug,content:issueContent.trim(),seo_title:issueSeoTitle.trim()||issueTitle.trim(),meta_description:issueDescription.trim()||issueContent.trim().slice(0,155),status:"published"}).select("id,title,slug,content,seo_title,meta_description,published_at").single();if(saveError)throw saveError;setIssues(v=>[data as Issue,...v]);setIssueTitle("");setIssueContent("");setIssueSeoTitle("");setIssueDescription("");setShowEditor(false);toast.success("Newsletter issue published.")}catch(e:any){toast.error(e?.message||"Could not publish issue. Check database migration and permissions.")}finally{setSavingIssue(false)}}}>{savingIssue?<Loader2 className="mr-2 size-4 animate-spin"/>:<Send className="mr-2 size-4"/>}{savingIssue?"Publishing…":"Publish Issue"}</Button></div>}{issues.length?<div className="mt-4 space-y-3">{issues.map(issue=><article key={issue.id} className="rounded-xl border p-5"><h3 className="text-lg font-bold">{issue.title}</h3><p className="mt-1 text-xs text-muted-foreground">{new Date(issue.published_at).toLocaleDateString()}</p><div className="mt-3 whitespace-pre-wrap text-sm leading-7">{issue.content}</div></article>)}</div>:<div className="mt-3 rounded-xl border p-5 text-sm text-muted-foreground">No issues published yet. {me===newsletter.owner_user_id?"Use “Write an Issue” to publish your first one.":"Check back for the first issue."}</div>}</section>
      </>}
    </div>
  </main>;
}
