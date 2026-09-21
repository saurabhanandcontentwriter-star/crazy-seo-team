import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Check, Loader2, X, Search, Clock3, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

type Idea = {
  id: string;
  profile_id: string;
  display_name: string | null;
  location: string | null;
  mobile: string | null;
  subject: string;
  title: string;
  content: string;
  image_url: string | null;
  device_type: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  scheduled_for: string | null;
  ai_detection_score: number | null;
  moderation_score: number | null;
  moderation_reason: string | null;
  moderation_checked_at: string | null;
  moderation_links: any[] | null;
};
type CreatorApplication = { id: string; user_id: string | null; name: string; email: string; creator_types: string[] | null; bio: string | null; website_url: string | null; linkedin_url: string | null; github_url: string | null; medium_url: string | null; reddit_url: string | null; anvya_id: string | null; country: string | null; state: string | null; district: string | null; gender: string | null; date_of_birth: string | null; status: string; created_at: string; };

const sanitizeRichHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const allowed = ["P", "H1", "H2", "H3", "STRONG", "EM", "UL", "OL", "LI", "A", "BR"];
  doc.body.querySelectorAll("*").forEach((el) => {
    if (!allowed.includes(el.tagName)) {
      el.replaceWith(...Array.from(el.childNodes));
      return;
    }
    Array.from(el.attributes).forEach((attr) => {
      if (el.tagName === "A" && attr.name.toLowerCase() === "href" && /^https:\/\//i.test(attr.value)) return;
      el.removeAttribute(attr.name);
    });
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });
  return doc.body.innerHTML;
};

export default function IdeasAdmin() {
  const [rows, setRows] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [creatorApps, setCreatorApps] = useState<CreatorApplication[]>([]);
  const [creatorBusy, setCreatorBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("idea_posts")
      .select("id,profile_id,display_name,location,mobile,subject,title,content,image_url,device_type,status,rejection_reason,created_at,scheduled_for,ai_detection_score,moderation_score,moderation_reason,moderation_checked_at,moderation_links")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) toast.error(error.message);
    else setRows((data as Idea[]) || []);
    const ca = await supabase.from("creator_applications").select("*").order("created_at", { ascending: false });
    if (ca.error) toast.error(`Creator applications: ${ca.error.message}`);
    setCreatorApps((ca.data || []) as CreatorApplication[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reviewCreator = async (app: CreatorApplication, status: "approved" | "rejected") => {
    setCreatorBusy(app.id);
    const { error } = await supabase.from("creator_applications").update({ status, updated_at: new Date().toISOString() }).eq("id", app.id);
    if (error) { toast.error(error.message); setCreatorBusy(null); return; }
    if (status === "approved" && app.user_id) {
      const { error: profileError } = await supabase.from("idea_profiles").update({
        is_creator: true,
        creator_types: app.creator_types || [],
        creator_since: new Date().toISOString().slice(0, 10),
        creator_rules_accepted_at: new Date().toISOString(),
      }).eq("user_id", app.user_id);
      if (profileError) { toast.error(`Application approved, but creator profile could not be activated: ${profileError.message}`); }
      else toast.success("Creator approved and profile activated.");
    } else if (status === "approved") toast.success("Creator approved. No linked Ideas account was found, so profile activation is pending account link.");
    else toast.success("Creator application rejected.");
    await load();
    setCreatorBusy(null);
  };

  const counts = {
    all: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };

  const filtered = useMemo(() => rows.filter((r) => {
    const matchesStatus = filter === "all" || r.status === filter;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [r.title, r.content, r.display_name, r.subject, r.profile_id]
      .some((v) => (v || "").toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  }), [rows, filter, query]);

  const review = async (row: Idea, status: "approved" | "rejected") => {
    if (status === "approved" && !row.moderation_checked_at) {
      toast.error("Run/complete the content detector check before approval.");
      return;
    }
    if (status === "rejected" && !reason[row.id]?.trim()) {
      toast.error("Add rejection reason.");
      return;
    }
    setBusy(row.id);
    const nextReason = status === "rejected"
      ? reason[row.id].trim()
      : "Approved after content detector review.";
    const { error } = await supabase
      .from("idea_posts")
      .update({
        status,
        rejection_reason: status === "rejected" ? nextReason : null,
        moderation_decision: status,
        moderation_reason: nextReason,
        moderation_checked_at: row.moderation_checked_at || new Date().toISOString(),
      })
      .eq("id", row.id);
    if (error) toast.error(error.message);
    else {
      toast.success(status === "approved" ? "Idea approved and published." : "Idea rejected.");
      await load();
    }
    setBusy(null);
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-[24px] border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
              <ShieldCheck size={18} /> Ideas Content Moderation
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-tight">SEO Blog Style Moderation</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every community post is displayed as a complete article for content-detector review before approval.
            </p>
          </div>
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
      </Card>

      <Card className="rounded-[24px] border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary"><ShieldCheck size={18} /> Creator Applications</div>
            <h2 className="mt-1 text-2xl font-black">Creator Approval Queue</h2>
            <p className="mt-1 text-sm text-muted-foreground">Review creator subjects and approve or reject applications. Approved linked users become Creator profiles.</p>
          </div>
          <Badge variant="secondary">{creatorApps.filter(a => a.status === "pending").length} pending</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {creatorApps.length === 0 ? <div className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">No creator applications yet.</div> :
            creatorApps.map(a => <div key={a.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black">{a.name}</span>
                <Badge variant={a.status === "approved" ? "default" : a.status === "rejected" ? "destructive" : "outline"}>{a.status}</Badge>
                <span className="text-xs text-muted-foreground">{a.email}</span>
                <span className="ml-auto text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">{(a.creator_types || []).map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
              {a.bio && <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{a.bio}</p>}
              {a.website_url && <a href={a.website_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary underline">Portfolio ↗</a>}<div className="mt-3 grid gap-2 text-sm md:grid-cols-2"><p><b>Location:</b> {[a.district,a.state,a.country].filter(Boolean).join(", ") || "Not shared"}</p><p><b>Gender:</b> {a.gender || "Not shared"}</p><p><b>Date of birth:</b> {a.date_of_birth ? new Date(a.date_of_birth + "T00:00:00").toLocaleDateString() : "Not shared"}</p><p><b>ANVYA ID:</b> {a.anvya_id || "Not shared"}</p></div><div className="mt-3 flex flex-wrap gap-3 text-sm">{a.linkedin_url && <a href={a.linkedin_url} target="_blank" rel="noreferrer" className="text-primary underline">LinkedIn ↗</a>}{a.github_url && <a href={a.github_url} target="_blank" rel="noreferrer" className="text-primary underline">GitHub ↗</a>}{a.medium_url && <a href={a.medium_url} target="_blank" rel="noreferrer" className="text-primary underline">Medium ↗</a>}{a.reddit_url && <a href={a.reddit_url} target="_blank" rel="noreferrer" className="text-primary underline">Reddit ↗</a>}</div>
              {a.status === "pending" && <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => reviewCreator(a, "approved")} disabled={creatorBusy === a.id}><Check className="mr-2 size-4" />Accept / Approve Creator</Button>
                <Button variant="destructive" onClick={() => reviewCreator(a, "rejected")} disabled={creatorBusy === a.id}><X className="mr-2 size-4" />Reject Creator</Button>
              </div>}
            </div>)
          }
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["all", "All Ideas", counts.all, Clock3],
          ["pending", "Pending", counts.pending, Clock3],
          ["approved", "Approved", counts.approved, CheckCircle2],
          ["rejected", "Rejected", counts.rejected, XCircle],
        ].map(([key, label, count, Icon]: any) => (
          <button key={key} onClick={() => setFilter(key)} className={filter === key ? "rounded-2xl border border-primary bg-primary/5 p-4 text-left" : "rounded-2xl border p-4 text-left hover:border-primary/40"}>
            <Icon size={18} className="text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-black">{count}</p>
          </button>
        ))}
      </div>

      <Card className="rounded-[24px] border p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, content, user, subject or profile..." className="rounded-2xl pl-9" />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-5">
          {filtered.map((r) => (
            <Card key={r.id} className="overflow-hidden rounded-[24px] bg-background shadow-sm">
              <article className="mx-auto max-w-5xl">
                <div className="border-b bg-muted/20 px-5 py-4 md:px-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">{r.display_name || `Profile ${r.profile_id}`}</span>
                    <Badge variant="outline">{r.subject}</Badge>
                    <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "outline"}>{r.status}</Badge>
                    {r.ai_detection_score != null && <Badge variant="secondary">AI-style {Math.round(r.ai_detection_score)}%</Badge>}
                  </div>
                </div>

                {r.image_url && <img src={r.image_url} alt={r.title} className="max-h-[460px] w-full object-cover" />}

                <div className="px-5 py-7 md:px-10 md:py-10">
                  <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">{r.title}</h1>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{r.location || "Location not shared"}</span>
                    {r.device_type && <span>• {r.device_type}</span>}
                    <span>• {new Date(r.created_at).toLocaleString()}</span>
                    {r.scheduled_for && <span>• Scheduled: {new Date(r.scheduled_for).toLocaleString()}</span>}
                  </div>

                  <div
                    className="rich-content mt-7 max-w-none border-t pt-6 text-[15px] leading-8 text-foreground/90 [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-black [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_p]:my-4 [&_strong]:font-bold [&_em]:italic [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-7 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-7 [&_li]:my-1 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(r.content) }}
                  />

                  <div className="mt-8 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border bg-muted/20 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Content Detector</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">AI-style: {r.ai_detection_score != null ? `${Math.round(r.ai_detection_score)}%` : "Not checked"}</Badge>
                        <Badge variant="outline">Moderation: {r.moderation_score != null ? `${Math.round(r.moderation_score)}%` : "Not checked"}</Badge>
                        <Badge variant="outline">{r.moderation_checked_at ? "Checked" : "Pending check"}</Badge>
                      </div>
                      {r.moderation_reason && <p className="mt-2 text-xs leading-5 text-muted-foreground">{r.moderation_reason}</p>}
                    </div>
                    {r.moderation_links?.length ? (
                      <div className="rounded-2xl border bg-muted/20 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Link / Topic Check</p>
                        <div className="mt-2 space-y-2">
                          {r.moderation_links.slice(0, 4).map((link: any) => (
                            <div key={link.url} className="text-xs">
                              <a href={link.url} target="_blank" rel="noreferrer" className="break-all font-semibold text-primary underline">{link.url}</a>
                              <div className="mt-0.5 text-muted-foreground">{link.reason || "Checked"}{typeof link.match === "number" ? ` • keyword match ${Math.round(link.match * 100)}%` : ""}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {r.status === "rejected" && r.rejection_reason && (
                    <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
                      <b>Rejection reason:</b> {r.rejection_reason}
                    </div>
                  )}

                  {r.status === "pending" && (
                    <div className="mt-7 border-t pt-5">
                      <Textarea
                        placeholder="Rejection reason (required for reject)"
                        value={reason[r.id] || ""}
                        onChange={(e) => setReason((v) => ({ ...v, [r.id]: e.target.value }))}
                        className="min-h-24 rounded-2xl"
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button onClick={() => review(r, "approved")} disabled={busy === r.id || !r.moderation_checked_at}>
                          <Check className="mr-2 size-4" />Approve after detector check
                        </Button>
                        <Button variant="destructive" onClick={() => review(r, "rejected")} disabled={busy === r.id}>
                          <X className="mr-2 size-4" />Reject
                        </Button>
                        {!r.moderation_checked_at && <span className="self-center text-xs font-semibold text-amber-600">Detector check required before approval</span>}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="rounded-[24px]"><div className="py-12 text-center text-muted-foreground">No ideas found.</div></Card>}
        </div>
      )}
    </div>
  );
}
