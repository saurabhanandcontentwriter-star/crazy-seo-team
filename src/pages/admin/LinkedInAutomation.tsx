import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Linkedin, Loader2, MessageSquare, RefreshCw, Send, Unplug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Profile = {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  memberUrn?: string | null;
  expiresAt?: string | null;
};

type Status = {
  connected: boolean;
  configured?: boolean;
  tokenExpired?: boolean;
  profile: Profile | null;
};

async function call(action: string, body: Record<string, unknown> = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }

  const { data, error } = await supabase.functions.invoke("linkedin-automation", {
    body: { action, ...body },
  });

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const payload = await context.clone().json();
        if (payload?.error) throw new Error(String(payload.error));
      } catch (e) {
        if (e instanceof Error && e.message) throw e;
      }
    }
    throw error;
  }

  if (data?.error) throw new Error(String(data.error));
  return data;
}

function readCallbackMessage() {
  const params = new URLSearchParams(window.location.search);
  const result = params.get("linkedin");
  if (!result) return null;

  const message = params.get("message");
  window.history.replaceState({}, "", "/admin/crm/linkedin");

  return {
    result,
    message: message || undefined,
  };
}

export default function LinkedInAutomation() {
  const [status, setStatus] = useState<Status>({
    connected: false,
    profile: null,
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [postText, setPostText] = useState("");
  const [lastPostUrn, setLastPostUrn] = useState("");
  const [postUrn, setPostUrn] = useState("");
  const [commentText, setCommentText] = useState("");

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await call("status");
      setStatus({
        connected: Boolean(data?.connected),
        configured: data?.configured,
        tokenExpired: data?.tokenExpired,
        profile: data?.profile ?? null,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load LinkedIn status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const callback = readCallbackMessage();

    if (callback?.result === "connected") {
      toast.success("LinkedIn connected successfully");
    } else if (callback?.result === "error") {
      toast.error(callback.message || "LinkedIn connection failed");
    }

    void loadStatus();
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      const data = await call("connect");
      if (!data?.authUrl) throw new Error("LinkedIn authorization URL was not returned.");
      window.location.assign(String(data.authUrl));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start LinkedIn connection");
      setConnecting(false);
    }
  };

  const publish = async () => {
    const text = postText.trim();
    if (!text) return toast.error("Write something to publish first");

    setPosting(true);
    try {
      const data = await call("post", { text });
      const urn = String(data?.postUrn || "").trim();

      setPostText("");
      if (urn) {
        setLastPostUrn(urn);
        setPostUrn(urn);
      }
      toast.success(urn ? "Post published. Its URN is ready for commenting." : "Post published to LinkedIn");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "LinkedIn post failed");
    } finally {
      setPosting(false);
    }
  };

  const publishComment = async () => {
    const urn = postUrn.trim();
    const text = commentText.trim();

    if (!urn || !text) return toast.error("Enter the post URN and comment");

    setCommenting(true);
    try {
      await call("comment", { postUrn: urn, text });
      setCommentText("");
      toast.success("Comment published to LinkedIn");
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
      setLastPostUrn("");
      setPostUrn("");
      toast.success("LinkedIn disconnected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not disconnect LinkedIn");
    } finally {
      setDisconnecting(false);
    }
  };

  const expired = Boolean(
    status.tokenExpired ||
    (status.profile?.expiresAt &&
      new Date(status.profile.expiresAt).getTime() <= Date.now()),
  );

  return (
    <>
      <Helmet>
        <title>LinkedIn Automation | Crazy SEO Team</title>
        <meta
          name="description"
          content="Connect and manage the Crazy SEO Team admin LinkedIn account."
        />
      </Helmet>

      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A66C2]/10 text-[#0A66C2]">
              <Linkedin size={23} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">LinkedIn Automation</h1>
              <p className="text-sm text-muted-foreground">
                Connect your LinkedIn account and publish posts or comments from the admin panel.
              </p>
            </div>
          </div>

          <Button variant="outline" className="rounded-2xl" onClick={() => void loadStatus()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 animate-spin" size={16} /> : <RefreshCw className="mr-2" size={16} />}
            Refresh
          </Button>
        </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>LinkedIn account</CardTitle>
                <CardDescription>
                  Only the admin user's connected LinkedIn member is used.
                </CardDescription>
              </div>
              <Badge variant={status.connected && !expired ? "default" : "secondary"}>
                {loading ? "Checking…" : status.connected && !expired ? "Connected" : expired ? "Reconnect required" : "Not connected"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {status.connected && status.profile ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {status.profile.picture ? (
                    <img
                      src={status.profile.picture}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Linkedin size={20} />
                    </div>
                  )}

                  <div>
                    <p className="font-semibold">{status.profile.name || "LinkedIn member"}</p>
                    <p className="text-sm text-muted-foreground">
                      {status.profile.email || "LinkedIn account connected"}
                    </p>
                    {status.profile.expiresAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Authorization expires: {new Date(status.profile.expiresAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {expired && (
                    <Button className="rounded-2xl" onClick={connect} disabled={connecting}>
                      {connecting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Linkedin className="mr-2" size={16} />}
                      Reconnect LinkedIn
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => void disconnect()}
                    disabled={disconnecting}
                  >
                    {disconnecting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Unplug className="mr-2" size={16} />}
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="rounded-2xl" onClick={connect} disabled={connecting || loading}>
                {connecting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Linkedin className="mr-2" size={16} />}
                Connect my LinkedIn
              </Button>
            )}
          </CardContent>
        </Card>

        {status.connected && !expired && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Publish a post</CardTitle>
                <CardDescription>
                  Create and publish a post to your connected LinkedIn profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Write your LinkedIn post…"
                  className="min-h-40 rounded-2xl"
                  maxLength={3000}
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{postText.length}/3000</span>
                  <Button className="rounded-2xl" onClick={() => void publish()} disabled={posting}>
                    {posting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Send className="mr-2" size={16} />}
                    Publish post
                  </Button>
                </div>

                {lastPostUrn && (
                  <div className="rounded-2xl border bg-muted/40 p-3">
                    <p className="text-xs font-semibold">Latest post URN</p>
                    <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{lastPostUrn}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Comment on a post</CardTitle>
                <CardDescription>
                  Paste a LinkedIn post URN or use the URN automatically captured from your latest post.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={postUrn}
                  onChange={(e) => setPostUrn(e.target.value)}
                  placeholder="urn:li:share:… or urn:li:ugcPost:…"
                  className="rounded-2xl"
                />
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your comment…"
                  className="min-h-32 rounded-2xl"
                />
                <div className="flex justify-end">
                  <Button
                    className="rounded-2xl"
                    onClick={() => void publishComment()}
                    disabled={commenting || !postUrn.trim() || !commentText.trim()}
                  >
                    {commenting ? <Loader2 className="mr-2 animate-spin" size={16} /> : <MessageSquare className="mr-2" size={16} />}
                    Publish comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && !status.configured && (
          <Card className="rounded-3xl border-destructive/30">
            <CardHeader>
              <CardTitle>LinkedIn is not configured</CardTitle>
              <CardDescription>
                Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to the Supabase Edge Function secrets.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
}
