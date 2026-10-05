import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Linkedin, Loader2, MessageSquare, Send, Unplug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Profile = { name?: string | null; email?: string | null; picture?: string | null; memberUrn?: string | null; expiresAt?: string | null };
type Status = { connected: boolean; profile: Profile | null };

async function call(action: string, body: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("linkedin-automation", {
    body: { action, ...body },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function LinkedInAutomation() {
  const [status, setStatus] = useState<Status>({ connected: false, profile: null });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [postText, setPostText] = useState("");
  const [postUrn, setPostUrn] = useState("");
  const [commentText, setCommentText] = useState("");

  const loadStatus = async () => {
    try {
      const data = await call("status");
      setStatus(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load LinkedIn status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const params = new URLSearchParams(window.location.search);
    const result = params.get("linkedin");
    if (result === "connected") {
      toast.success("LinkedIn connected successfully");
      window.history.replaceState({}, "", "/admin/linkedin");
      loadStatus();
    } else if (result === "error") {
      const message = params.get("message");
      toast.error(message ? decodeURIComponent(message) : "LinkedIn connection failed");
      window.history.replaceState({}, "", "/admin/linkedin");
    }
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      const data = await call("connect");
      if (!data.authUrl) throw new Error("LinkedIn authorization URL was not returned");
      window.location.assign(data.authUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start LinkedIn connection");
      setConnecting(false);
    }
  };

  const publish = async () => {
    if (!postText.trim()) return toast.error("Write something to publish first");
    setPosting(true);
    try {
      await call("post", { text: postText.trim() });
      toast.success("Post published to LinkedIn");
      setPostText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "LinkedIn post failed");
    } finally {
      setPosting(false);
    }
  };

  const publishComment = async () => {
    if (!postUrn.trim() || !commentText.trim()) return toast.error("Enter the post URN and comment");
    setCommenting(true);
    try {
      await call("comment", { postUrn: postUrn.trim(), text: commentText.trim() });
      toast.success("Comment published to LinkedIn");
      setCommentText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "LinkedIn comment failed");
    } finally {
      setCommenting(false);
    }
  };

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      await call("disconnect");
      setStatus({ connected: false, profile: null });
      toast.success("LinkedIn disconnected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not disconnect LinkedIn");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <>
      <Helmet><title>LinkedIn Automation | Crazy SEO Team</title></Helmet>
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2]"><Linkedin size={23} /></div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">LinkedIn Automation</h1>
              <p className="text-sm text-muted-foreground">Manage your own Saurabh Anand LinkedIn account from Crazy SEO Team.</p>
            </div>
          </div>
        </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>My LinkedIn account</CardTitle>
                <CardDescription>Only your connected LinkedIn member is used. No customer accounts are supported.</CardDescription>
              </div>
              <Badge variant={status.connected ? "default" : "secondary"}>{loading ? "Checking…" : status.connected ? "Connected" : "Not connected"}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {status.connected && status.profile ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {status.profile.picture ? <img src={status.profile.picture} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Linkedin size={20} /></div>}
                  <div><p className="font-semibold">{status.profile.name || "Saurabh Anand"}</p><p className="text-sm text-muted-foreground">{status.profile.email || "LinkedIn member connected"}</p></div>
                </div>
                <Button variant="outline" className="rounded-2xl" onClick={disconnect} disabled={disconnecting}>
                  {disconnecting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Unplug className="mr-2" size={16} />} Disconnect
                </Button>
              </div>
            ) : (
              <Button className="rounded-2xl" onClick={connect} disabled={connecting || loading}>
                {connecting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Linkedin className="mr-2" size={16} />} Connect my LinkedIn
              </Button>
            )}
          </CardContent>
        </Card>

        {status.connected && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-3xl">
              <CardHeader><CardTitle>Publish a post</CardTitle><CardDescription>Create and publish a post to your LinkedIn profile.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <Textarea value={postText} onChange={e => setPostText(e.target.value)} placeholder="Write your LinkedIn post…" className="min-h-40 rounded-2xl" maxLength={3000} />
                <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{postText.length}/3000</span><Button className="rounded-2xl" onClick={publish} disabled={posting}>{posting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Send className="mr-2" size={16} />} Publish post</Button></div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader><CardTitle>Comment on a post</CardTitle><CardDescription>Use a LinkedIn post URN and publish your comment.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <Input value={postUrn} onChange={e => setPostUrn(e.target.value)} placeholder="urn:li:share:… or urn:li:ugcPost:…" className="rounded-2xl" />
                <Textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write your comment…" className="min-h-32 rounded-2xl" />
                <div className="flex justify-end"><Button className="rounded-2xl" onClick={publishComment} disabled={commenting}>{commenting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <MessageSquare className="mr-2" size={16} />} Publish comment</Button></div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
