import { useEffect, useRef, useState } from "react";
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
  Lightbulb,
} from "lucide-react";

type ComposerMode = "post" | "blog" | "question" | "event" | "suggestion";

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
  { value: "suggestion", label: "Suggestion", description: "Share a suggestion or improvement for the community.", icon: Lightbulb },
];

const countWords = (text: string) => text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
const stripToMaxChars = (text: string, max: number) => text.slice(0, max);
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
  const [contentText, setContentText] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventUrl, setEventUrl] = useState("");
  const [location, setLocation] = useState(profile.location || "");
  const draftKey = `anvya-blog-draft-${profile.user_id}`;

  const currentMode = modes.find((item) => item.value === mode)!;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft?.mode !== "blog") return;
      setMode("blog"); setTitle(draft.title || ""); setSubject(draft.subject || "");
      setTags(Array.isArray(draft.tags) ? draft.tags : []); setVisibility(draft.visibility || "public");
      setLocation(draft.location || profile.location || "");
      if (editorRef.current) editorRef.current.innerHTML = draft.content || "";
      toast.success("Blog draft restored.");
    } catch { /* ignore invalid local draft */ }
  }, [draftKey, profile.location]);

  const saveBlogDraft = () => {
    if (mode !== "blog") return;
    const content = editorRef.current?.innerHTML || "";
    if (!title.trim() && !editorRef.current?.innerText?.trim()) {
      toast.error("Add a title or some content before saving the draft."); return;
    }
    localStorage.setItem(draftKey, JSON.stringify({mode:"blog", title:title.trim(), content:sanitizeRichHtml(content), subject, tags, visibility, location:location.trim(), savedAt:new Date().toISOString()}));
    localStorage.setItem("ideas-draft-count", "1");
    window.dispatchEvent(new Event("anvya-draft-changed"));
    toast.success("Blog draft saved on this device.");
  };

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

    if (mode === "post") {
      if (!plainContent) {
        toast.error("Write a caption for your post.");
        return;
      }
      if (plainContent.length > 3000) {
        toast.error("Post caption is limited to 3,000 characters.");
        return;
      }
    } else {
      if (!title.trim() || !plainContent) {
        toast.error(mode === "question" ? "Add a question title and details." : mode === "suggestion" ? "Add a suggestion title and details." : "Add a title and content.");
        return;
      }
      if (title.trim().length > 180) {
        toast.error("Title is limited to 180 characters.");
        return;
      }
      if (mode === "blog" && countWords(plainContent) > 300) {
        toast.error("Blog articles are limited to 300 words.");
        return;
      }
      if (mode !== "blog" && plainContent.length > 10000) {
        toast.error("Content is too long.");
        return;
      }
    }

    if (mode === "event" && !eventStart) { toast.error("Choose an event start time."); return; }
    const eventStartIso = mode === "event" && eventStart ? new Date(eventStart).toISOString() : null;
    const eventEndIso = mode === "event" && eventEnd ? new Date(eventEnd).toISOString() : null;
    if (mode === "event" && eventEndIso && new Date(eventEndIso).getTime() <= new Date(eventStartIso!).getTime()) {
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
      const imageUrl = mode === "blog" ? null : (imageFile ? await uploadImage(user.id, imageFile) : null);
      const normalizedTags = tags.map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean).slice(0, 10);
      const subjectValue = subject.trim() || null;
      const locationValue = location.trim() || null;
      const payload = {
        user_id: user.id,
        profile_id: profile.public_id || user.id,
        display_name: profile.display_name || "ANVYA Member",
        location: locationValue,
        mobile: null,
        show_mobile: false,
        subject: subjectValue,
        tags: normalizedTags,
        title: mode === "post" ? (plainContent.slice(0, 80).trim() || "ANVYA Post") : title.trim(),
        content: richContent,
        image_url: imageUrl,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Laptop/Desktop",
        status: "pending",
        visibility,
        post_type: mode,
        event_start: eventStartIso,
        event_end: eventEndIso,
        event_location: eventLocation.trim() || null,
        event_url: eventUrl.trim() || null,
      };

      const { data, error } = await supabase
        .from("idea_posts")
        .insert(payload)
        .select("id,user_id,display_name,profile_image_url,title,content,post_type,visibility,subject,tags,location,image_url,created_at,status")
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
      if (mode === "blog") { localStorage.removeItem(draftKey); localStorage.setItem("ideas-draft-count", "0"); window.dispatchEvent(new Event("anvya-draft-changed")); }
      onCreated(data);
      setTitle("");
      setContentText("");
      setImageFile(null);
      setTags([]);
      setTagInput("");
      if (editorRef.current) editorRef.current.innerHTML = "";
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Could not publish.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="w-full max-w-full overflow-hidden rounded-3xl border-primary/20 shadow-sm">
      <CardContent className="min-w-0 overflow-x-auto p-4 sm:p-5 md:p-6">
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

        <div className="mt-5 flex min-w-0 gap-2 overflow-x-auto pb-1 [&>button]:min-w-[138px] [&>button]:shrink-0">
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

        <div className="mt-5 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full">{currentMode.label}</Badge>
            {mode === "blog" && <Badge variant="outline" className="rounded-full">Article</Badge>}
            {mode === "question" && <Badge variant="outline" className="rounded-full">Community Discussion</Badge>}
            {mode === "suggestion" && <Badge variant="outline" className="rounded-full">Suggestion</Badge>}
          </div>

          {mode !== "post" && <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={180}
            placeholder={
              mode === "question"
                ? "Ask a clear question..."
                : mode === "suggestion"
                  ? "Write your suggestion..."
                : "Blog title..."
            }
          />}

          {mode !== "post" && (
            <div className="grid min-w-[720px] grid-cols-3 gap-3 overflow-x-auto pb-1">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Subject</label>
                <select className="h-11 w-full rounded-xl border bg-background px-3 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="">Select Subject</option>
                  <option value="Tech">Tech</option><option value="SEO">SEO</option><option value="AI">AI</option><option value="Marketing">Marketing</option><option value="Business">Business</option><option value="Career">Career</option><option value="Education">Education</option><option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Tags</label>
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v=tagInput.trim().replace(/^#/,""); if(v && !tags.includes(v) && tags.length<10) setTags([...tags,v]); setTagInput(""); } }} placeholder="#SEO, #AI, #Google" />
                {tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{tags.map(tag => <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))}>#{tag} ×</Badge>)}</div>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State, Country" />
              </div>
            </div>
          )}


  
          <div className="overflow-hidden rounded-2xl border bg-background">
            <div className="flex flex-wrap items-center gap-1 overflow-x-auto border-b bg-muted/40 p-2">
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
              onInput={(e) => {
                const el = e.currentTarget;
                let text = el.innerText || "";
                if (mode === "post" && text.length > 3000) {
                  text = stripToMaxChars(text, 3000);
                  el.innerText = text;
                  const range = document.createRange();
                  range.selectNodeContents(el);
                  range.collapse(false);
                  const selection = window.getSelection();
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                }
                setContentText(text);
              }}
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
            <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
              <span>{mode === "post" ? "Caption only · image optional · no title" : mode === "blog" ? "Article limit · 300 words" : "Content"}</span>
              <span>
                {mode === "post"
                  ? `${contentText.length}/3000 characters`
                  : mode === "blog"
                    ? `${countWords(contentText)} / 300 words`
                    : `${contentText.length} characters`}
              </span>
            </div>
          </div>


          {mode === "event" && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-3 flex items-center gap-2 font-bold"><CalendarDays className="size-4 text-primary"/> Live event details</div>
              <div className="grid min-w-[560px] grid-cols-2 gap-3 overflow-x-auto pb-1">
                <Input type="datetime-local" value={eventStart} onChange={(e) => setEventStart(e.target.value)} min={new Date(Date.now()+60000).toISOString().slice(0,16)} aria-label="Event start"/>
                <Input type="datetime-local" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} aria-label="Event end"/>
                <Input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Venue / Online"/>
                <Input value={eventUrl} onChange={(e) => setEventUrl(e.target.value)} placeholder="Live / registration URL (https://...)"/>
              </div>
            </div>
          )}
          {mode !== "blog" && <div className="grid min-w-[560px] grid-cols-[1fr_auto] gap-3 overflow-x-auto pb-1">
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
          </div>}

          {mode !== "blog" && imageFile && (
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
                ? "Use headings, lists and links for a blog-style article."
                : mode === "post"
                  ? "Post an image and caption. Maximum 3,000 characters."
                  : "Share an update, idea or visual with your network."}
          </p>
          <div className="flex flex-wrap gap-2 overflow-x-auto">
          {mode === "blog" && <Button type="button" variant="outline" onClick={saveBlogDraft} disabled={busy}><FileText className="mr-2 size-4"/>Save Draft</Button>}
          <Button
            onClick={submit}
            disabled={busy}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600"
          >
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
            {busy ? "Publishing…" : mode === "question" ? "Ask Discussion" : mode === "blog" ? "Publish Blog" : mode === "event" ? "Publish Event" : "Publish Post"}
          </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
