import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ImagePlus,
  Loader2,
  X,
  Send,
  FileText,
  BookOpen,
  MessageCircle,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Heading2,
  Unlink,
  CalendarDays,
} from "lucide-react";

type ComposerMode = "post" | "blog" | "question" | "event";

const modes: Array<{
  value: ComposerMode;
  label: string;
  description: string;
  icon: typeof FileText;
}> = [
  { value: "post", label: "Create Post", description: "Share an update, idea or image.", icon: FileText },
  { value: "blog", label: "Write Blog", description: "Publish a richer article with a cover image.", icon: BookOpen },
  { value: "question", label: "Ask Discussion", description: "Ask the community and start a conversation.", icon: MessageCircle },
  { value: "event", label: "Live Event", description: "Create a live or upcoming community event.", icon: CalendarDays },
];

const sanitizeRichHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,form").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((a) => {
      const name = a.name.toLowerCase();
      if (name.startsWith("on") || ["style", "class", "id"].includes(name)) el.removeAttribute(a.name);
    });
    if (el.tagName.toLowerCase() === "a") {
      const href = el.getAttribute("href") || "";
      if (!/^https:\/\//i.test(href)) el.removeAttribute("href");
      else {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    }
  });
  return doc.body.innerHTML;
};

export default function IdeasInlinePostComposer({
  profile,
  onCreated,
  onClose,
}: {
  profile: any;
  onCreated: (post: any) => void;
  onClose: () => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<ComposerMode>("post");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventUrl, setEventUrl] = useState("");

  const currentMode = modes.find((item) => item.value === mode)!;

  const format = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const addLink = () => {
    const url = window.prompt("Enter HTTPS link");
    if (!url) return;
    if (!/^https:\/\//i.test(url)) {
      toast.error("Only HTTPS links are allowed.");
      return;
    }
    editorRef.current?.focus();
    document.execCommand("createLink", false, url);
  };

  const validateImage = (file: File) =>
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024;

  const uploadImage = async (userId: string, file: File) => {
    if (!validateImage(file)) throw new Error("Use JPG, PNG or WEBP up to 5 MB.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = userId + "/post-" + crypto.randomUUID() + "." + ext;
    const storage = supabase.storage.from("idea-images");
    const upload = await storage.upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (upload.error) throw new Error(upload.error.message || "Image upload failed.");
    const url = storage.getPublicUrl(path).data.publicUrl;
    if (!url) throw new Error("Image URL could not be created.");
    return url;
  };

  const submit = async () => {
    const rawHtml = editorRef.current?.innerHTML || "";
    const richContent = sanitizeRichHtml(rawHtml);
    const plainContent = editorRef.current?.innerText?.trim() || "";

    if (!title.trim() || !plainContent) {
      toast.error(mode === "question" ? "Add a question title and details." : "Add a title and content.");
      return;
    }
    if (title.trim().length > 180 || plainContent.length > 10000) {
      toast.error("Title/content is too long.");
      return;
    }

    if (mode === "event" && !eventStart) { toast.error("Choose an event start time."); return; }
    const eventStartAt = mode === "event" && eventStart ? new Date(eventStart).toISOString() : null;
    const eventEndAt = mode === "event" && eventEnd ? new Date(eventEnd).toISOString() : null;
    if (mode === "event" && eventEndAt && new Date(eventEndAt).getTime() <= new Date(eventStartAt!).getTime()) {
      toast.error("Event end time must be after the start time.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== profile.user_id) {
      toast.error("Please sign in to your own profile first.");
      return;
    }

    setBusy(true);
    try {
      const imageUrl = imageFile ? await uploadImage(user.id, imageFile) : null;
      const subject = mode === "blog" ? "Blog" : mode === "question" ? "Discussion" : "Tech";
      const payload = {
        user_id: user.id,
        profile_id: profile.public_id || user.id,
        display_name: profile.display_name || "ANVYA Member",
        location: profile.location || null,
        mobile: null,
        show_mobile: false,
        subject,
        title: title.trim(),
        content: richContent,
        image_url: imageUrl,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Laptop/Desktop",
        status: "pending",
        visibility,
        post_type: mode,
        event_start: eventStartAt,
        event_end: eventEndAt,
        event_location: eventLocation.trim() || null,
        event_url: eventUrl.trim() || null,
      };

      const { data, error } = await supabase
        .from("idea_posts")
        .insert(payload)
        .select("id,user_id,display_name,profile_image_url,title,content,post_type,visibility,subject,image_url,created_at,status")
        .single();

      if (error) throw error;

      toast.success(
        "🎉 Congratulations!",
        {
          description:
            mode === "blog"
              ? "Your article has been submitted successfully and is now in review."
              : mode === "question"
                ? "Your discussion has been submitted successfully and is now in review."
                : mode === "event"
                  ? "Your event has been submitted successfully and is now in review."
                  : "Your post has been submitted successfully and is now in review.",
          duration: 5000,
        }
      );
      onCreated(data);
      setTitle("");
      setImageFile(null);
      if (editorRef.current) editorRef.current.innerHTML = "";
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Could not publish.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-3xl border-primary/20 shadow-sm">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-black">Create on ANVYA</p>
            <p className="text-xs text-muted-foreground">
              Choose a format — like a social post, blog article, or Quora-style discussion.
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-3">
          {modes.map((item) => {
            const Icon = item.icon;
            const active = mode === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setMode(item.value)}
                className={
                  "rounded-2xl border p-3 text-left transition " +
                  (active
                    ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                    : "border-border hover:bg-muted/50")
                }
              >
                <div className="flex items-center gap-2">
                  <Icon className={"size-4 " + (active ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{item.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full">{currentMode.label}</Badge>
            {mode === "blog" && <Badge variant="outline" className="rounded-full">Article + Cover Image</Badge>}
            {mode === "question" && <Badge variant="outline" className="rounded-full">Community Discussion</Badge>}
          </div>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={180}
            placeholder={
              mode === "question"
                ? "Ask a clear question..."
                : mode === "blog"
                  ? "Blog title..."
                  : "Post title..."
            }
          />

          <div className="overflow-hidden rounded-2xl border bg-background">
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => format("formatBlock", "h2")} title="Heading">
                <Heading2 className="size-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => format("bold")} title="Bold">
                <Bold className="size-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => format("italic")} title="Italic">
                <Italic className="size-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => format("insertUnorderedList")} title="Bulleted list">
                <List className="size-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => format("insertOrderedList")} title="Numbered list">
                <ListOrdered className="size-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={addLink} title="Add link">
                <Link2 className="size-4" />
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => format("unlink")} title="Remove link">
                <Unlink className="size-4" />
              </Button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder={
                mode === "question"
                  ? "Explain your question and what you want the community to discuss..."
                  : mode === "blog"
                    ? "Write your blog with headings, paragraphs, lists and links..."
                    : "Share something with your network..."
              }
              className="min-h-48 p-4 text-sm leading-7 outline-none [&:empty]:before:pointer-events-none [&:empty]:before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)] [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-bold [&_a]:text-primary [&_a]:underline [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6"
            />
          </div>


          {mode === "event" && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-3 flex items-center gap-2 font-bold"><CalendarDays className="size-4 text-primary"/> Live event details</div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input type="datetime-local" value={eventStart} onChange={(e) => setEventStart(e.target.value)} min={new Date(Date.now()+60000).toISOString().slice(0,16)} aria-label="Event start"/>
                <Input type="datetime-local" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} aria-label="Event end"/>
                <Input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Venue / Online"/>
                <Input value={eventUrl} onChange={(e) => setEventUrl(e.target.value)} placeholder="Live / registration URL (https://...)"/>
              </div>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-3 transition hover:border-primary/50 hover:bg-muted/30">
              <ImagePlus className="size-5 text-primary" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Add image</p>
                <p className="truncate text-xs text-muted-foreground">
                  {imageFile ? imageFile.name : "JPG, PNG or WEBP • max 5 MB"}
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && !validateImage(file)) {
                    toast.error("Use JPG, PNG or WEBP up to 5 MB.");
                    return;
                  }
                  setImageFile(file);
                }}
              />
            </label>
            <select
              className="h-16 rounded-2xl border bg-background px-4 text-sm"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              aria-label="Visibility"
            >
              <option value="public">🌍 Public</option>
              <option value="friends">👥 Friends only</option>
            </select>
          </div>

          {imageFile && (
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/20 p-3 text-xs">
              <span className="truncate">Image ready: {imageFile.name}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => setImageFile(null)}>
                Remove
              </Button>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {mode === "question"
              ? "Ask clearly, add context and invite useful answers."
              : mode === "blog"
                ? "Use headings, lists, links and a cover image for a blog-style article."
                : "Share an update, idea or visual with your network."}
          </p>
          <Button
            onClick={submit}
            disabled={busy}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600"
          >
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
            {busy ? "Publishing…" : mode === "question" ? "Ask Discussion" : mode === "blog" ? "Publish Blog" : mode === "event" ? "Publish Event" : "Publish Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
