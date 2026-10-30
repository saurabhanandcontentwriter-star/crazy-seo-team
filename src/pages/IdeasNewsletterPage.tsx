import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ArrowLeft, Users } from "lucide-react";

type Newsletter = { id:string; name:string; slug:string; tagline:string; logo_url:string|null; cover_url:string|null; owner_user_id:string; created_at:string };

export default function IdeasNewsletterPage() {
  const { slug = "" } = useParams();
  const [newsletter,setNewsletter] = useState<Newsletter|null>(null);
  const [loading,setLoading] = useState(true);
  const [subscriberCount,setSubscriberCount] = useState(0);
  const [error,setError] = useState("");
  useEffect(() => {
    let alive=true;
    (async()=>{
      setLoading(true);setError("");
      const {data,error:queryError}=await supabase.from("anvya_newsletters").select("*").eq("slug",slug).maybeSingle();
      if(!alive)return;
      if(queryError){setError("Newsletter database is not ready yet. Apply the ANVYA newsletter migration first.");setLoading(false);return;}
      if(!data){setNewsletter(null);setLoading(false);return;}
      setNewsletter(data as Newsletter);
      const {count}=await supabase.from("anvya_newsletter_subscriptions").select("id",{count:"exact",head:true}).eq("newsletter_id",data.id);
      if(alive)setSubscriberCount(count||0);
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
        <section className="mt-8"><h2 className="text-xl font-bold">Latest issues</h2><div className="mt-3 rounded-xl border p-5 text-sm text-muted-foreground">This publication page is ready. Article-to-newsletter publishing and subscriber actions will appear here once the newsletter write API and Firebase identity verification are connected.</div></section>
      </>}
    </div>
  </main>;
}
